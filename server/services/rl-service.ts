import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "../storage";

export class RLService {
  private pythonPath: string;
  private trainingProcesses: Map<string, any> = new Map();

  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || (process.platform === "win32" ? "python" : "python3");
  }

  async trainAgent(agentId: string, config: any) {
    const moduleDir = path.dirname(fileURLToPath(import.meta.url));
    const backendPath = path.join(moduleDir, "../../ml_backend.py");
    const process = spawn(this.pythonPath, [
      backendPath,
      "train_rl_agent",
      JSON.stringify({ agentId, ...config })
    ]);

    this.trainingProcesses.set(agentId, process);

    let output = "";
    let errorOutput = "";

    process.stdout.on("data", async (data) => {
      const chunk = data.toString();
      output += chunk;
      
      // Parse progress updates
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('PROGRESS:')) {
          try {
            const progress = JSON.parse(line.substring(9));
            await storage.updateRlAgent(agentId, {
              trainingProgress: progress,
              status: "training"
            });
          } catch (error) {
            console.error("Failed to parse RL progress:", error);
          }
        }
      }
    });

    process.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    process.on("close", async (code) => {
      this.trainingProcesses.delete(agentId);
      
      if (code === 0) {
        try {
          const result = JSON.parse(output.split('FINAL_RESULT:')[1] || '{}');
          await storage.updateRlAgent(agentId, {
            status: "completed",
            performance: result.performance,
            modelPath: result.modelPath
          });
        } catch (error) {
          await storage.updateRlAgent(agentId, {
            status: "failed"
          });
        }
      } else {
        await storage.updateRlAgent(agentId, {
          status: "failed"
        });
      }
    });
  }

  async stopTraining(agentId: string) {
    const process = this.trainingProcesses.get(agentId);
    if (process) {
      process.kill();
      this.trainingProcesses.delete(agentId);
      await storage.updateRlAgent(agentId, {
        status: "stopped"
      });
    }
  }

  async getAgentPerformance(agentId: string) {
    return new Promise((resolve, reject) => {
      const moduleDir = path.dirname(fileURLToPath(import.meta.url));
      const backendPath = path.join(moduleDir, "../../ml_backend.py");
      const process = spawn(this.pythonPath, [
        backendPath,
        "get_rl_performance",
        agentId
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
            reject(new Error("Failed to parse performance results"));
          }
        } else {
          reject(new Error(`Performance query failed: ${errorOutput || output}`));
        }
      });
    });
  }

  isHealthy(): boolean {
    return true; // TODO: Add RL environment health checks
  }
}
