import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import multer from "multer";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { 
  insertDatasetSchema, insertModelSchema, insertQuantumExperimentSchema,
  insertRlAgentSchema, insertFederatedJobSchema, insertNlpAnalysisSchema
} from "@shared/schema";
import { z } from "zod";
import { MLService } from "./services/ml-service";
import { QuantumService } from "./services/quantum-service";
import { RLService } from "./services/rl-service";
import { BlockchainService } from "./services/blockchain-service";
import { NLPService } from "./services/nlp-service";
import { FederatedService } from "./services/federated-service";

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
  const quantumService = new QuantumService();
  const rlService = new RLService();
  const blockchainService = new BlockchainService();
  const nlpService = new NLPService();
  const federatedService = new FederatedService(wss, blockchainService);

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

  app.post("/api/quantum/experiments", async (req, res) => {
    try {
      const experimentData = insertQuantumExperimentSchema.parse(req.body);
      const experiment = await storage.createQuantumExperiment(experimentData);
      
      // Execute quantum experiment asynchronously
      quantumService.runExperiment(experiment.id, experimentData)
        .then(async (results) => {
          // Assert results is an object with executionTime
          const typedResults = results as { executionTime?: number; [key: string]: any };
          await storage.updateQuantumExperiment(experiment.id, {
            status: "completed",
            results: typedResults,
            executionTime: typedResults.executionTime
          });
        })
        .catch(async (error) => {
          await storage.updateQuantumExperiment(experiment.id, {
            status: "failed"
          });
        });

      res.json(experiment);
    } catch (error) {
      res.status(400).json({ error: "Invalid quantum experiment configuration" });
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

  // Federated Learning routes
  app.get("/api/federated/nodes", async (req, res) => {
    try {
      const nodes = await storage.getAllFederatedNodes();
      res.json(nodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch federated nodes" });
    }
  });

  app.get("/api/federated/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllFederatedJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch federated jobs" });
    }
  });

  app.post("/api/federated/jobs", async (req, res) => {
    try {
      const jobData = insertFederatedJobSchema.parse(req.body);
      const job = await storage.createFederatedJob(jobData);
      
      // Start federated learning job
      federatedService.startFederatedJob(job.id, jobData);
      
      res.json(job);
    } catch (error) {
      res.status(400).json({ error: "Invalid federated job configuration" });
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

  // Monitoring routes
  app.get("/api/monitoring/metrics", async (req, res) => {
    try {
      const { source, hours } = req.query;
      const metrics = await storage.getMonitoringMetrics(
        source as string,
        hours ? parseInt(hours as string) : undefined
      );
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monitoring metrics" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        ml: mlService.isHealthy(),
        quantum: quantumService.isHealthy(),
        rl: rlService.isHealthy(),
        blockchain: blockchainService.isHealthy(),
        nlp: nlpService.isHealthy(),
        federated: federatedService.isHealthy()
      }
    });
  });

  return httpServer;
}
