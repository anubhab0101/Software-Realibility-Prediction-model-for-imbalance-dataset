import { spawn } from "child_process";
import path from "path";

export class NLPService {
  private pythonPath: string;

  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || "python";
  }

  async analyzeDocument(content: string, documentType: string) {
    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, [
        path.join(__dirname, "../../ml_backend.py"),
        "nlp_analyze",
        JSON.stringify({ content, documentType })
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
            reject(new Error("Failed to parse NLP analysis results"));
          }
        } else {
          reject(new Error(`NLP analysis failed: ${errorOutput}`));
        }
      });
    });
  }

  async extractFeatures(documents: string[]) {
    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, [
        path.join(__dirname, "../../ml_backend.py"),
        "nlp_extract_features",
        JSON.stringify({ documents })
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
            reject(new Error("Failed to parse feature extraction results"));
          }
        } else {
          reject(new Error(`Feature extraction failed: ${errorOutput}`));
        }
      });
    });
  }

  async generateEmbeddings(text: string) {
    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, [
        path.join(__dirname, "../../ml_backend.py"),
        "nlp_embeddings",
        JSON.stringify({ text })
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
            reject(new Error("Failed to parse embedding results"));
          }
        } else {
          reject(new Error(`Embedding generation failed: ${errorOutput}`));
        }
      });
    });
  }

  isHealthy(): boolean {
    return true; // TODO: Add NLP model health checks
  }
}
