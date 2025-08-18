import { apiRequest } from "./queryClient";

export interface DatasetUpload {
  file: File;
  name: string;
  description: string;
}

export interface ModelTrainingConfig {
  name: string;
  algorithm: string;
  datasetId: string;
  hyperparameters: Record<string, any>;
}

export interface QuantumExperimentConfig {
  name: string;
  algorithm: string;
  qubits: number;
  circuits: Record<string, any>;
}

export interface RLAgentConfig {
  name: string;
  algorithm: string;
  environment: string;
  hyperparameters: Record<string, any>;
}

export interface FederatedJobConfig {
  name: string;
  modelType: string;
  minNodes: number;
  maxRounds: number;
  minStake: number;
}

export interface NLPAnalysisRequest {
  documentId: string;
  documentType: string;
  content: string;
}

export class MLResearchAPI {
  // Dataset operations
  static async uploadDataset(data: DatasetUpload) {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("name", data.name);
    formData.append("description", data.description);

    const response = await fetch("/api/datasets/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload dataset");
    }

    return response.json();
  }

  static async getDatasets() {
    const response = await apiRequest("GET", "/api/datasets");
    return response.json();
  }

  static async getDataset(id: string) {
    const response = await apiRequest("GET", `/api/datasets/${id}`);
    return response.json();
  }

  // Model operations
  static async trainModel(config: ModelTrainingConfig) {
    const response = await apiRequest("POST", "/api/models/train", config);
    return response.json();
  }

  static async getModels() {
    const response = await apiRequest("GET", "/api/models");
    return response.json();
  }

  static async getModelExplanation(modelId: string) {
    const response = await apiRequest("GET", `/api/models/${modelId}/explain`);
    return response.json();
  }

  // Quantum ML operations
  static async createQuantumExperiment(config: QuantumExperimentConfig) {
    const response = await apiRequest("POST", "/api/quantum/experiments", config);
    return response.json();
  }

  static async getQuantumExperiments() {
    const response = await apiRequest("GET", "/api/quantum/experiments");
    return response.json();
  }

  // RL operations
  static async createRLAgent(config: RLAgentConfig) {
    const response = await apiRequest("POST", "/api/rl/agents", config);
    return response.json();
  }

  static async getRLAgents() {
    const response = await apiRequest("GET", "/api/rl/agents");
    return response.json();
  }

  // Federated learning operations
  static async createFederatedJob(config: FederatedJobConfig) {
    const response = await apiRequest("POST", "/api/federated/jobs", config);
    return response.json();
  }

  static async getFederatedJobs() {
    const response = await apiRequest("GET", "/api/federated/jobs");
    return response.json();
  }

  static async getFederatedNodes() {
    const response = await apiRequest("GET", "/api/federated/nodes");
    return response.json();
  }

  // NLP operations
  static async analyzeDocument(request: NLPAnalysisRequest) {
    const response = await apiRequest("POST", "/api/nlp/analyze", request);
    return response.json();
  }

  // Monitoring operations
  static async getMonitoringMetrics(source?: string, hours?: number) {
    const params = new URLSearchParams();
    if (source) params.append("source", source);
    if (hours) params.append("hours", hours.toString());
    
    const url = `/api/monitoring/metrics${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiRequest("GET", url);
    return response.json();
  }

  static async getSystemHealth() {
    const response = await apiRequest("GET", "/api/health");
    return response.json();
  }
}

// Export individual functions for direct use
export const {
  uploadDataset,
  getDatasets,
  getDataset,
  trainModel,
  getModels,
  getModelExplanation,
  createQuantumExperiment,
  getQuantumExperiments,
  createRLAgent,
  getRLAgents,
  createFederatedJob,
  getFederatedJobs,
  getFederatedNodes,
  analyzeDocument,
  getMonitoringMetrics,
  getSystemHealth,
} = MLResearchAPI;
