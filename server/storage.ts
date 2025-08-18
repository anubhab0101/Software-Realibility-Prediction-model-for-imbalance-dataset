import { 
  type User, type InsertUser, type Dataset, type InsertDataset,
  type Model, type InsertModel, type QuantumExperiment, type InsertQuantumExperiment,
  type RlAgent, type InsertRlAgent, type FederatedNode, type InsertFederatedNode,
  type FederatedJob, type InsertFederatedJob, type NlpAnalysis, type InsertNlpAnalysis,
  type MonitoringMetric, type InsertMonitoringMetric
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Dataset operations
  getDataset(id: string): Promise<Dataset | undefined>;
  getAllDatasets(): Promise<Dataset[]>;
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  updateDataset(id: string, updates: Partial<Dataset>): Promise<Dataset>;
  
  // Model operations
  getModel(id: string): Promise<Model | undefined>;
  getAllModels(): Promise<Model[]>;
  getModelsByDataset(datasetId: string): Promise<Model[]>;
  createModel(model: InsertModel): Promise<Model>;
  updateModel(id: string, updates: Partial<Model>): Promise<Model>;
  
  // Quantum experiment operations
  getQuantumExperiment(id: string): Promise<QuantumExperiment | undefined>;
  getAllQuantumExperiments(): Promise<QuantumExperiment[]>;
  createQuantumExperiment(experiment: InsertQuantumExperiment): Promise<QuantumExperiment>;
  updateQuantumExperiment(id: string, updates: Partial<QuantumExperiment>): Promise<QuantumExperiment>;
  
  // RL agent operations
  getRlAgent(id: string): Promise<RlAgent | undefined>;
  getAllRlAgents(): Promise<RlAgent[]>;
  createRlAgent(agent: InsertRlAgent): Promise<RlAgent>;
  updateRlAgent(id: string, updates: Partial<RlAgent>): Promise<RlAgent>;
  
  // Federated learning operations
  getFederatedNode(id: string): Promise<FederatedNode | undefined>;
  getAllFederatedNodes(): Promise<FederatedNode[]>;
  createFederatedNode(node: InsertFederatedNode): Promise<FederatedNode>;
  updateFederatedNode(id: string, updates: Partial<FederatedNode>): Promise<FederatedNode>;
  
  getFederatedJob(id: string): Promise<FederatedJob | undefined>;
  getAllFederatedJobs(): Promise<FederatedJob[]>;
  createFederatedJob(job: InsertFederatedJob): Promise<FederatedJob>;
  updateFederatedJob(id: string, updates: Partial<FederatedJob>): Promise<FederatedJob>;
  
  // NLP analysis operations
  getNlpAnalysis(id: string): Promise<NlpAnalysis | undefined>;
  getAllNlpAnalysis(): Promise<NlpAnalysis[]>;
  createNlpAnalysis(analysis: InsertNlpAnalysis): Promise<NlpAnalysis>;
  
  // Monitoring operations
  addMonitoringMetric(metric: InsertMonitoringMetric): Promise<MonitoringMetric>;
  getMonitoringMetrics(source?: string, hours?: number): Promise<MonitoringMetric[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private datasets: Map<string, Dataset> = new Map();
  private models: Map<string, Model> = new Map();
  private quantumExperiments: Map<string, QuantumExperiment> = new Map();
  private rlAgents: Map<string, RlAgent> = new Map();
  private federatedNodes: Map<string, FederatedNode> = new Map();
  private federatedJobs: Map<string, FederatedJob> = new Map();
  private nlpAnalysis: Map<string, NlpAnalysis> = new Map();
  private monitoringMetrics: Map<string, MonitoringMetric> = new Map();

  constructor() {
    // Initialize with sample NASA dataset
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    const sampleDataset: Dataset = {
      id: "nasa-sample-1",
      name: "NASA Software Defect Dataset",
      description: "Sample NASA software metrics with defect prediction data including time-series components",
      filePath: "/data/nasa_defect_dataset.csv",
      uploadedBy: null,
      uploadedAt: new Date(),
      rowCount: 1000,
      columnCount: 21,
      features: {
        "loc": "Lines of Code",
        "cyclomatic_complexity": "Cyclomatic Complexity",
        "essential_complexity": "Essential Complexity",
        "design_complexity": "Design Complexity",
        "total_operators": "Total Operators",
        "total_operands": "Total Operands",
        "halstead_length": "Halstead Length",
        "halstead_vocabulary": "Halstead Vocabulary",
        "halstead_volume": "Halstead Volume",
        "halstead_difficulty": "Halstead Difficulty",
        "halstead_effort": "Halstead Effort",
        "defects": "Number of Defects (Target)"
      },
      targetColumn: "defects",
      dataQuality: {
        missingValues: 0.02,
        imbalanceRatio: 0.15,
        outliers: 0.05
      },
      preprocessingSteps: []
    };
    this.datasets.set(sampleDataset.id, sampleDataset);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Dataset operations
  async getDataset(id: string): Promise<Dataset | undefined> {
    return this.datasets.get(id);
  }

  async getAllDatasets(): Promise<Dataset[]> {
    return Array.from(this.datasets.values());
  }

  async createDataset(insertDataset: InsertDataset): Promise<Dataset> {
    const id = randomUUID();
    const dataset: Dataset = { ...insertDataset, id, uploadedAt: new Date() };
    this.datasets.set(id, dataset);
    return dataset;
  }

  async updateDataset(id: string, updates: Partial<Dataset>): Promise<Dataset> {
    const existing = this.datasets.get(id);
    if (!existing) throw new Error("Dataset not found");
    const updated = { ...existing, ...updates };
    this.datasets.set(id, updated);
    return updated;
  }

  // Model operations
  async getModel(id: string): Promise<Model | undefined> {
    return this.models.get(id);
  }

  async getAllModels(): Promise<Model[]> {
    return Array.from(this.models.values());
  }

  async getModelsByDataset(datasetId: string): Promise<Model[]> {
    return Array.from(this.models.values()).filter(model => model.datasetId === datasetId);
  }

  async createModel(insertModel: InsertModel): Promise<Model> {
    const id = randomUUID();
    const model: Model = { ...insertModel, id, createdAt: new Date() };
    this.models.set(id, model);
    return model;
  }

  async updateModel(id: string, updates: Partial<Model>): Promise<Model> {
    const existing = this.models.get(id);
    if (!existing) throw new Error("Model not found");
    const updated = { ...existing, ...updates };
    this.models.set(id, updated);
    return updated;
  }

  // Quantum experiment operations
  async getQuantumExperiment(id: string): Promise<QuantumExperiment | undefined> {
    return this.quantumExperiments.get(id);
  }

  async getAllQuantumExperiments(): Promise<QuantumExperiment[]> {
    return Array.from(this.quantumExperiments.values());
  }

  async createQuantumExperiment(insertExperiment: InsertQuantumExperiment): Promise<QuantumExperiment> {
    const id = randomUUID();
    const experiment: QuantumExperiment = { ...insertExperiment, id, createdAt: new Date() };
    this.quantumExperiments.set(id, experiment);
    return experiment;
  }

  async updateQuantumExperiment(id: string, updates: Partial<QuantumExperiment>): Promise<QuantumExperiment> {
    const existing = this.quantumExperiments.get(id);
    if (!existing) throw new Error("Quantum experiment not found");
    const updated = { ...existing, ...updates };
    this.quantumExperiments.set(id, updated);
    return updated;
  }

  // RL agent operations
  async getRlAgent(id: string): Promise<RlAgent | undefined> {
    return this.rlAgents.get(id);
  }

  async getAllRlAgents(): Promise<RlAgent[]> {
    return Array.from(this.rlAgents.values());
  }

  async createRlAgent(insertAgent: InsertRlAgent): Promise<RlAgent> {
    const id = randomUUID();
    const agent: RlAgent = { ...insertAgent, id, createdAt: new Date() };
    this.rlAgents.set(id, agent);
    return agent;
  }

  async updateRlAgent(id: string, updates: Partial<RlAgent>): Promise<RlAgent> {
    const existing = this.rlAgents.get(id);
    if (!existing) throw new Error("RL agent not found");
    const updated = { ...existing, ...updates };
    this.rlAgents.set(id, updated);
    return updated;
  }

  // Federated learning operations
  async getFederatedNode(id: string): Promise<FederatedNode | undefined> {
    return this.federatedNodes.get(id);
  }

  async getAllFederatedNodes(): Promise<FederatedNode[]> {
    return Array.from(this.federatedNodes.values());
  }

  async createFederatedNode(insertNode: InsertFederatedNode): Promise<FederatedNode> {
    const id = randomUUID();
    const node: FederatedNode = { ...insertNode, id };
    this.federatedNodes.set(id, node);
    return node;
  }

  async updateFederatedNode(id: string, updates: Partial<FederatedNode>): Promise<FederatedNode> {
    const existing = this.federatedNodes.get(id);
    if (!existing) throw new Error("Federated node not found");
    const updated = { ...existing, ...updates };
    this.federatedNodes.set(id, updated);
    return updated;
  }

  async getFederatedJob(id: string): Promise<FederatedJob | undefined> {
    return this.federatedJobs.get(id);
  }

  async getAllFederatedJobs(): Promise<FederatedJob[]> {
    return Array.from(this.federatedJobs.values());
  }

  async createFederatedJob(insertJob: InsertFederatedJob): Promise<FederatedJob> {
    const id = randomUUID();
    const job: FederatedJob = { ...insertJob, id, createdAt: new Date() };
    this.federatedJobs.set(id, job);
    return job;
  }

  async updateFederatedJob(id: string, updates: Partial<FederatedJob>): Promise<FederatedJob> {
    const existing = this.federatedJobs.get(id);
    if (!existing) throw new Error("Federated job not found");
    const updated = { ...existing, ...updates };
    this.federatedJobs.set(id, updated);
    return updated;
  }

  // NLP analysis operations
  async getNlpAnalysis(id: string): Promise<NlpAnalysis | undefined> {
    return this.nlpAnalysis.get(id);
  }

  async getAllNlpAnalysis(): Promise<NlpAnalysis[]> {
    return Array.from(this.nlpAnalysis.values());
  }

  async createNlpAnalysis(insertAnalysis: InsertNlpAnalysis): Promise<NlpAnalysis> {
    const id = randomUUID();
    const analysis: NlpAnalysis = { ...insertAnalysis, id, processedAt: new Date() };
    this.nlpAnalysis.set(id, analysis);
    return analysis;
  }

  // Monitoring operations
  async addMonitoringMetric(insertMetric: InsertMonitoringMetric): Promise<MonitoringMetric> {
    const id = randomUUID();
    const metric: MonitoringMetric = { ...insertMetric, id, timestamp: new Date() };
    this.monitoringMetrics.set(id, metric);
    return metric;
  }

  async getMonitoringMetrics(source?: string, hours?: number): Promise<MonitoringMetric[]> {
    let metrics = Array.from(this.monitoringMetrics.values());
    
    if (source) {
      metrics = metrics.filter(metric => metric.source === source);
    }
    
    if (hours) {
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
      metrics = metrics.filter(metric => metric.timestamp! > cutoff);
    }
    
    return metrics.sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime());
  }
}

export const storage = new MemStorage();
