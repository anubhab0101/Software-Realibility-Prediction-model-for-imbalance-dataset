import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import multer from "multer";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { 
  insertDatasetSchema, insertModelSchema, insertQuantumExperimentSchema,
  insertRlAgentSchema, insertNlpAnalysisSchema
} from "@shared/schema";
import { z } from "zod";
import { MLService } from "./services/ml-service";
import { RLService } from "./services/rl-service";
import { BlockchainService } from "./services/blockchain-service";
import { NLPService } from "./services/nlp-service";
import { CodeAnalysisService } from "./services/code-analysis-service";

// Ensure uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
// Configure multer for file uploads
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize WebSocket server for real-time updates (temporarily disabled)
  // const wss = new WebSocketServer({ server: httpServer });
  const wss = { clients: new Set() } as any; // Mock for now
  
  // Initialize services
  const mlService = new MLService();
  const rlService = new RLService();
  const blockchainService = new BlockchainService();
  const nlpService = new NLPService();
  const codeAnalysisService = new CodeAnalysisService();

  // Gemini-powered ML advice endpoint
  app.post("/api/ml/gemini-advice", async (req, res) => {
    try {
      const { stats, question } = req.body;
      if (!stats) return res.status(400).json({ error: "Missing stats" });
      const result = await mlService.getGeminiAdvice(stats, question);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Gemini advice failed" });
    }
  });

  // WebSocket connection handling (temporarily disabled)
  /*
  wss.on("connection", (ws) => {
    console.log("New WebSocket connection established");
    
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle real-time commands
        switch (data.type) {
          case "subscribe_monitoring":
            // Subscribe to monitoring updates
            break;
          case "federated_node_register":
            await federatedService.registerNode(data.nodeInfo);
            break;
        }
      } catch (error) {
        ws.send(JSON.stringify({ error: "Invalid message format" }));
      }
    });
  });
  */

  // Dataset routes
  app.get("/api/datasets", async (req, res) => {
    try {
      const datasets = await storage.getAllDatasets();
      res.json(datasets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch datasets" });
    }
  });

  app.get("/api/datasets/:id", async (req, res) => {
    try {
      const dataset = await storage.getDataset(req.params.id);
      if (!dataset) {
        return res.status(404).json({ error: "Dataset not found" });
      }
      res.json(dataset);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dataset" });
    }
  });

  app.post("/api/datasets/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { name, description } = req.body;
      const analysis = await mlService.analyzeDataset(req.file.path) as any;
      
      const dataset = await storage.createDataset({
        name: name || req.file.originalname,
        description: description || "",
        filePath: req.file.path,
        uploadedBy: null, // TODO: Add user authentication
        rowCount: analysis.rowCount,
        columnCount: analysis.columnCount,
        features: analysis.features,
        targetColumn: analysis.suggestedTarget,
        dataQuality: analysis.quality,
        preprocessingSteps: []
      });

      res.json(dataset);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: "Failed to upload dataset" });
    }
  });

  // Model training routes
  app.get("/api/models", async (req, res) => {
    try {
      const models = await storage.getAllModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch models" });
    }
  });

  app.post("/api/models/train", async (req, res) => {
    try {
      const modelData = insertModelSchema.parse(req.body);
      const model = await storage.createModel(modelData);
      
      // Start training asynchronously
      mlService.trainModel(model.id, modelData)
        .then(async (results: any) => {
          await storage.updateModel(model.id, {
            trainingStatus: "completed",
            ...results
          });
          // Broadcast update via WebSocket
          wss.clients.forEach((client: any) => {
            client.send(JSON.stringify({
              type: "model_training_complete",
              modelId: model.id,
              results
            }));
          });
        })
        .catch(async (error) => {
          await storage.updateModel(model.id, {
            trainingStatus: "failed"
          });
        });

      res.json(model);
    } catch (error) {
      res.status(400).json({ error: "Invalid model configuration" });
    }
  });

  app.get("/api/models/:id/explain", async (req, res) => {
    try {
      const explanation = await mlService.explainModel(req.params.id);
      res.json(explanation);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate explanation" });
    }
  });

  // Quantum ML routes
  app.get("/api/quantum/experiments", async (req, res) => {
    try {
      const experiments = await storage.getAllQuantumExperiments();
      res.json(experiments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quantum experiments" });
    }
  });

  

  // Reinforcement Learning routes
  app.get("/api/rl/agents", async (req, res) => {
    try {
      const agents = await storage.getAllRlAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch RL agents" });
    }
  });

  app.post("/api/rl/agents", async (req, res) => {
    try {
      const agentData = insertRlAgentSchema.parse(req.body);
      const agent = await storage.createRlAgent(agentData);
      
      // Start RL training asynchronously
      rlService.trainAgent(agent.id, agentData);
      
      res.json(agent);
    } catch (error) {
      res.status(400).json({ error: "Invalid RL agent configuration" });
    }
  });

  // NLP Analysis routes
  app.post("/api/nlp/analyze", async (req, res) => {
    try {
      const { documentId, documentType, content } = req.body;
      const analysis = await nlpService.analyzeDocument(content, documentType);
      
      const nlpAnalysis = await storage.createNlpAnalysis({
        documentId,
        documentType,
        content,
        ...(typeof analysis === "object" && analysis !== null ? analysis : {})
      });
      
      res.json(nlpAnalysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze document" });
    }
  });

  // Code prediction routes
  app.post("/api/code-predict", upload.single("file"), async (req, res) => {
    try {
      const { type, url, code } = req.body;
      
      let result;
      
      if (type === "file" && req.file) {
        // File upload analysis
        result = await codeAnalysisService.analyzeCodeFile(req.file.path, req.file.originalname);
      } else if (type === "github" && url) {
        // GitHub repository analysis
        result = await codeAnalysisService.analyzeGithubRepository(url);
      } else if (type === "snippet" && code) {
        // Code snippet analysis
        const language = req.body.language || "javascript";
        result = await codeAnalysisService.analyzeCodeSnippet(code, language);
      } else {
        return res.status(400).json({ error: "Invalid request type or missing data" });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Code prediction error:', error);
      res.status(500).json({ error: "Failed to analyze code" });
    }
  });

  app.get("/api/predictions", async (req, res) => {
    try {
      // Return prediction history (would come from database in full implementation)
      const mockHistory = [
        {
          id: "1",
          fileName: "example.py",
          type: "file",
          language: "python",
          performanceMetrics: { overallScore: 75 },
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: "2",
          fileName: "react-app",
          type: "github",
          language: "javascript",
          performanceMetrics: { overallScore: 82 },
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ];
      
      res.json(mockHistory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prediction history" });
    }
  });

  app.get("/api/predictions/:id", async (req, res) => {
    try {
      // Return specific prediction (mock implementation)
      const mockPrediction = {
        id: req.params.id,
        fileName: "example.js",
        type: "file",
        language: "javascript",
        performanceMetrics: { overallScore: 68 },
        timestamp: new Date().toISOString()
      };
      
      res.json(mockPrediction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prediction" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        ml: mlService.isHealthy(),
        rl: rlService.isHealthy(),
        blockchain: blockchainService.isHealthy(),
        nlp: nlpService.isHealthy()
      }
    });
  });

  return httpServer;
}

