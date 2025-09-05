
import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { storage } from "../storage";
import { fileURLToPath } from "url";

export class MLService {
  private pythonPath: string;

  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || (process.platform === "win32" ? "python" : "python3");
  }

  async analyzeDataset(filePath: string) {
    try {
      const moduleDir = path.dirname(fileURLToPath(import.meta.url));
      const backendPath = path.join(moduleDir, "../../ml_backend.py");

      const result = await new Promise<any>((resolve, reject) => {
        const processRef = spawn(this.pythonPath, [
          backendPath,
          "analyze_dataset",
          filePath,
        ]);

        let output = "";
        let errorOutput = "";

        processRef.stdout.on("data", (data) => {
          output += data.toString();
        });

        processRef.stderr.on("data", (data) => {
          errorOutput += data.toString();
        });

        processRef.on("close", (code) => {
          if (code === 0) {
            try {
              const parsed = JSON.parse(output);
              resolve(parsed);
            } catch {
              reject(new Error("Failed to parse analysis results"));
            }
          } else {
            reject(new Error(errorOutput || output || "Python analysis failed"));
          }
        });
      });

      if (result && !result.error) {
        return result;
      }

      // Fall back to Node-based CSV analysis if Python returns an error payload
      return await this.analyzeCsvWithNode(filePath);
    } catch (_err) {
      // Fall back to Node-based CSV analysis if Python is not available
      return await this.analyzeCsvWithNode(filePath);
    }
  }

  private async analyzeCsvWithNode(filePath: string) {
    const content = await fs.readFile(filePath, "utf8");
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      return {
        rowCount: 0,
        columnCount: 0,
        features: {},
        suggestedTarget: undefined,
        quality: { missingValues: 0, imbalanceRatio: 0.5, outliers: 0 },
        numericColumns: [],
        categoricalColumns: [],
      };
    }

    const header = this.safeSplitCsvLine(lines[0]);
    const dataRows = lines.slice(1).map((l) => this.safeSplitCsvLine(l));

    const columnCount = header.length;
    const rowCount = dataRows.length;

    // Determine numeric vs categorical columns
    const isNumeric: boolean[] = header.map((_h, colIdx) => {
      let numericSamples = 0;
      let checked = 0;
      for (let r = 0; r < Math.min(rowCount, 100); r++) {
        const cell = (dataRows[r] ?? [])[colIdx] ?? "";
        const val = parseFloat(cell);
        if (!Number.isNaN(val) && cell.trim() !== "") numericSamples++;
        checked++;
      }
      return checked > 0 && numericSamples / checked >= 0.6;
    });

    const numericColumns = header.filter((_, i) => isNumeric[i]);
    const categoricalColumns = header.filter((_, i) => !isNumeric[i]);

    // Feature descriptions
    const features: Record<string, string> = {};
    for (const col of header) {
      features[col] = col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }

    // Suggested target
    const targetKeywords = ["defect", "bug", "issue", "fault", "error"];
    const lowerToOriginal: Record<string, string> = Object.fromEntries(
      header.map((h) => [h.toLowerCase(), h])
    );
    let suggestedTarget = header[header.length - 1];
    for (const col of header) {
      const lower = col.toLowerCase();
      if (targetKeywords.some((k) => lower.includes(k))) {
        suggestedTarget = col;
        break;
      }
    }

    // Missing values ratio
    let totalCells = rowCount * columnCount;
    let missingCells = 0;
    for (const row of dataRows) {
      for (let i = 0; i < columnCount; i++) {
        const cell = row[i] ?? "";
        if (cell.trim() === "") missingCells++;
      }
    }
    const missingValues = totalCells > 0 ? missingCells / totalCells : 0;

    // Outlier percentage (approximate using IQR per numeric column)
    let outlierCount = 0;
    let numericValueColumns = 0;
    for (let c = 0; c < columnCount; c++) {
      if (!isNumeric[c]) continue;
      numericValueColumns++;
      const values: number[] = [];
      for (const row of dataRows) {
        const val = parseFloat(row[c] ?? "");
        if (!Number.isNaN(val)) values.push(val);
      }
      values.sort((a, b) => a - b);
      if (values.length < 4) continue;
      const q1 = this.quantile(values, 0.25);
      const q3 = this.quantile(values, 0.75);
      const iqr = q3 - q1;
      const lower = q1 - 1.5 * iqr;
      const upper = q3 + 1.5 * iqr;
      for (const v of values) {
        if (v < lower || v > upper) outlierCount++;
      }
    }
    const outliers =
      numericValueColumns > 0 && rowCount > 0
        ? outlierCount / (rowCount * numericValueColumns)
        : 0;

    // Compute imbalance ratio when possible (binary labels)
    let imbalanceRatio = 0.5;
    if (suggestedTarget) {
      const targetIdx = header.indexOf(suggestedTarget);
      if (targetIdx !== -1) {
        const labels: string[] = [];
        for (const row of dataRows) {
          const cell = (row[targetIdx] ?? "").trim();
          if (cell !== "") labels.push(cell);
        }
        const unique = Array.from(new Set(labels));
        if (unique.length === 2) {
          const counts: Record<string, number> = {};
          for (const y of labels) counts[y] = (counts[y] || 0) + 1;
          const values = Object.values(counts).sort((a, b) => a - b);
          if (values.length === 2 && values[1] > 0) {
            imbalanceRatio = values[0] / values[1];
          }
        }
      }
    }

    return {
      rowCount,
      columnCount,
      features,
      suggestedTarget,
      quality: {
        missingValues,
        imbalanceRatio,
        outliers,
      },
      numericColumns,
      categoricalColumns,
    };
  }

  private safeSplitCsvLine(line: string): string[] {
    // Very simple CSV split handling commas within quotes
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result.map((c) => c.trim());
  }

  private quantile(sortedValues: number[], q: number): number {
    const pos = (sortedValues.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sortedValues[base + 1] !== undefined) {
      return sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base]);
    } else {
      return sortedValues[base];
    }
  }

  async trainModel(modelId: string, modelConfig: any) {
    try {
      const moduleDir = path.dirname(fileURLToPath(import.meta.url));
      const backendPath = path.join(moduleDir, "../../ml_backend.py");
      const result = await new Promise<any>((resolve, reject) => {
        const processRef = spawn(this.pythonPath, [
          backendPath,
          "train_model",
          JSON.stringify({ modelId, ...modelConfig })
        ]);

        let output = "";
        let errorOutput = "";

        processRef.stdout.on("data", (data) => { output += data.toString(); });
        processRef.stderr.on("data", (data) => { errorOutput += data.toString(); });

        processRef.on("close", (code) => {
          if (code === 0) {
            const text = output.trim();
            try {
              resolve(JSON.parse(text));
              return;
            } catch {
              const start = text.lastIndexOf("{");
              const end = text.lastIndexOf("}");
              if (start !== -1 && end !== -1 && end > start) {
                try {
                  resolve(JSON.parse(text.slice(start, end + 1)));
                  return;
                } catch {}
              }
              reject(new Error("Failed to parse training results"));
            }
          } else {
            reject(new Error(errorOutput || output || "Python training failed"));
          }
        });
      });

      if (!result || result.error) {
        return await this.trainWithNodeBaseline(modelId, modelConfig);
      }
      return result;
    } catch {
      return await this.trainWithNodeBaseline(modelId, modelConfig);
    }
  }

  private async trainWithNodeBaseline(modelId: string, modelConfig: any) {
    try {
      const dataset = await storage.getDataset(modelConfig.datasetId);
      const filePath = dataset?.filePath;
      if (!filePath) {
        return { modelPath: null, accuracy: 0, precision: 0, recall: 0, f1Score: 0, mcc: 0, confusionMatrix: [[0,0],[0,0]], featureImportance: {} };
      }

      const csv = await fs.readFile(filePath, "utf8");
      const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const header = this.safeSplitCsvLine(lines[0]);
      const rows = lines.slice(1).map((l) => this.safeSplitCsvLine(l));
      const targetKeywords = ["defect", "bug", "issue", "fault", "error"];
      let targetIdx = header.length - 1;
      for (let i = 0; i < header.length; i++) {
        if (targetKeywords.some((k) => header[i].toLowerCase().includes(k))) { targetIdx = i; break; }
      }

      const labels = rows.map((r) => (r[targetIdx] ?? "").toString());
      const counts: Record<string, number> = {};
      for (const y of labels) counts[y] = (counts[y] || 0) + 1;
      const [majorityLabel, correct] = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0] ?? ["",0];
      const total = labels.length || 1;
      const accuracy = (correct as number) / total;

      let tp=0, fp=0, tn=0, fn=0;
      for (const y of labels) {
        const pred = majorityLabel;
        if (pred === majorityLabel && y === majorityLabel) tp++;
        else if (pred === majorityLabel && y !== majorityLabel) fp++;
        else if (pred !== majorityLabel && y !== majorityLabel) tn++;
        else fn++;
      }
      const precision = tp+fp>0 ? tp/(tp+fp) : 0;
      const recall = tp+fn>0 ? tp/(tp+fn) : 0;
      const f1Score = precision+recall>0 ? (2*precision*recall)/(precision+recall) : 0;
      const mccDen = Math.sqrt((tp+fp)*(tp+fn)*(tn+fp)*(tn+fn));
      const mcc = mccDen>0 ? ((tp*tn - fp*fn)/mccDen) : 0;

      const featureImportance: Record<string, number> = {};
      header.forEach((col, idx) => { if (idx !== targetIdx) featureImportance[col] = 0; });

      const modelsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../models");
      await fs.mkdir(modelsDir, { recursive: true }).catch(() => {});
      const modelPath = path.join(modelsDir, `${modelId}.json`);
      await fs.writeFile(modelPath, JSON.stringify({ type: "baseline-majority", target: header[targetIdx], majorityLabel, createdAt: new Date().toISOString() }, null, 2));

      return { modelPath, accuracy, precision, recall, f1Score, mcc, confusionMatrix: [[tp, fp],[fn, tn]], featureImportance };
    } catch {
      return { modelPath: null, accuracy: 0, precision: 0, recall: 0, f1Score: 0, mcc: 0, confusionMatrix: [[0,0],[0,0]], featureImportance: {} };
    }
  }

  async explainModel(modelId: string) {
    return new Promise((resolve, reject) => {
      const moduleDir = path.dirname(fileURLToPath(import.meta.url));
      const backendPath = path.join(moduleDir, "../../ml_backend.py");
      const process = spawn(this.pythonPath, [
        backendPath,
        "explain_model",
        modelId
      ]);

      let output = "";
      let errorOutput = "";

      process.stdout.on("data", (data) => {
        output += data.toString();
      });

      process.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      process.on("close", (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (error) {
            reject(new Error("Failed to parse explanation results"));
          }
        } else {
          reject(new Error(`Explanation failed: ${errorOutput || output}`));
        }
      });
    });
  }
}