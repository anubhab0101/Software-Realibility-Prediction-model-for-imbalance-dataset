import { WebSocketServer, WebSocket } from "ws";
import { storage } from "../storage";
import { BlockchainService } from "./blockchain-service";
import { randomUUID } from "crypto";

interface FederatedNode {
  id: string;
  socket: WebSocket;
  publicKey: string;
  stakeAmount: number;
  status: "online" | "offline" | "training" | "validating";
}

export class FederatedService {
  private nodes: Map<string, FederatedNode> = new Map();
  private activeJobs: Map<string, any> = new Map();

  constructor(
    private wss: any, // WebSocketServer or mock
    private blockchain: BlockchainService
  ) {
    if (this.wss && typeof this.wss.on === 'function') {
      this.setupWebSocketHandlers();
    }
  }

  private setupWebSocketHandlers() {
    if (this.wss && typeof this.wss.on === 'function') {
      this.wss.on("connection", (ws: any) => {
        ws.on("message", async (message: any) => {
          try {
            const data = JSON.parse(message.toString());
            await this.handleNodeMessage(ws, data);
          } catch (error) {
            ws.send(JSON.stringify({ error: "Invalid message format" }));
          }
        });

        ws.on("close", () => {
          this.handleNodeDisconnection(ws);
        });
      });
    }
  }

  async registerNode(nodeInfo: any): Promise<string> {
    const nodeId = randomUUID();
    const keys = await this.blockchain.generateNodeKeys();
    
    const node = await storage.createFederatedNode({
      nodeId,
      publicKey: keys.publicKey,
      status: "offline",
      lastSeen: new Date(),
      reputation: 0,
      computeCapacity: nodeInfo.computeCapacity || {},
      blockchainAddress: nodeInfo.blockchainAddress || "",
      stakeAmount: nodeInfo.stakeAmount || 0
    });

    return nodeId;
  }

  async startFederatedJob(jobId: string, jobConfig: any) {
    const job = await storage.getFederatedJob(jobId);
    if (!job) {
      throw new Error("Federated job not found");
    }

    const availableNodes = Array.from(this.nodes.values())
      .filter(node => node.status === "online" && node.stakeAmount >= (jobConfig.minStake || 0));

    if (availableNodes.length < (jobConfig.minNodes || 2)) {
      await storage.updateFederatedJob(jobId, { status: "insufficient_nodes" });
      return;
    }

    // Select nodes for participation
    const selectedNodes = availableNodes.slice(0, jobConfig.maxNodes || 10);
    
    await storage.updateFederatedJob(jobId, {
      status: "active",
      participatingNodes: selectedNodes.map(n => ({ nodeId: n.id, publicKey: n.publicKey }))
    });

    this.activeJobs.set(jobId, {
      ...jobConfig,
      nodes: selectedNodes,
      currentRound: 0,
      globalModel: null
    });

    // Notify selected nodes
    selectedNodes.forEach(node => {
      node.socket.send(JSON.stringify({
        type: "federated_job_start",
        jobId,
        config: jobConfig
      }));
    });

    // Start first training round
    await this.startTrainingRound(jobId);
  }

  private async startTrainingRound(jobId: string) {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    job.currentRound++;
    
    // Send global model to all participating nodes
    job.nodes.forEach((node: FederatedNode) => {
      node.socket.send(JSON.stringify({
        type: "training_round_start",
        jobId,
        round: job.currentRound,
        globalModel: job.globalModel
      }));
      node.status = "training";
    });

    await storage.updateFederatedJob(jobId, {
      rounds: job.currentRound
    });
  }

  private async handleNodeMessage(ws: WebSocket, data: any) {
    switch (data.type) {
      case "node_register":
        await this.handleNodeRegistration(ws, data);
        break;
      case "model_update":
        await this.handleModelUpdate(ws, data);
        break;
      case "training_complete":
        await this.handleTrainingComplete(ws, data);
        break;
    }
  }

  private async handleNodeRegistration(ws: WebSocket, data: any) {
    const { nodeId, publicKey, stakeAmount } = data;
    
    // Verify node stake
    const isValidStake = await this.blockchain.verifyNodeStake(nodeId, stakeAmount);
    if (!isValidStake) {
      ws.send(JSON.stringify({ error: "Insufficient stake" }));
      return;
    }

    const node: FederatedNode = {
      id: nodeId,
      socket: ws,
      publicKey,
      stakeAmount,
      status: "online"
    };

    this.nodes.set(nodeId, node);
    
    await storage.updateFederatedNode(nodeId, {
      status: "online",
      lastSeen: new Date()
    });

    ws.send(JSON.stringify({ type: "registration_success", nodeId }));
  }

  private async handleModelUpdate(ws: WebSocket, data: any) {
    const { jobId, nodeId, modelUpdate, signature } = data;
    
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Verify signature
    const isValidSignature = await this.blockchain.verifySignature(
      modelUpdate,
      signature,
      node.publicKey
    );

    if (!isValidSignature) {
      ws.send(JSON.stringify({ error: "Invalid signature" }));
      return;
    }

    // Record update on blockchain
    const blockHash = await this.blockchain.recordFederatedUpdate(nodeId, modelUpdate);
    
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.modelUpdates = job.modelUpdates || [];
      job.modelUpdates.push({
        nodeId,
        update: modelUpdate,
        blockHash,
        timestamp: new Date()
      });

      // Check if all nodes have submitted updates
      if (job.modelUpdates.length === job.nodes.length) {
        await this.aggregateModels(jobId);
      }
    }
  }

  private async handleTrainingComplete(ws: WebSocket, data: any) {
    const { jobId, nodeId } = data;
    const node = this.nodes.get(nodeId);
    if (node) {
      node.status = "online";
    }
  }

  private async aggregateModels(jobId: string) {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    // Perform federated averaging (simplified)
    const aggregatedModel = this.federatedAverage(job.modelUpdates.map((u: any) => u.update));
    
    job.globalModel = aggregatedModel;
    job.modelUpdates = [];

    await storage.updateFederatedJob(jobId, {
      globalModel: aggregatedModel,
      aggregationResults: {
        round: job.currentRound,
        participatingNodes: job.modelUpdates.length,
        timestamp: new Date()
      }
    });

    // Check if we should continue training
    if (job.currentRound < job.maxRounds) {
      setTimeout(() => this.startTrainingRound(jobId), 5000);
    } else {
      // Job complete
      await storage.updateFederatedJob(jobId, { status: "completed" });
      this.activeJobs.delete(jobId);
    }
  }

  private federatedAverage(modelUpdates: any[]): any {
    // Simplified federated averaging implementation
    if (modelUpdates.length === 0) return null;
    
    // In a real implementation, this would perform weighted averaging of model parameters
    return {
      type: "averaged_model",
      participants: modelUpdates.length,
      timestamp: new Date(),
      // Placeholder for actual model parameters
      parameters: "averaged_parameters"
    };
  }

  private handleNodeDisconnection(ws: WebSocket) {
    for (const [nodeId, node] of this.nodes.entries()) {
      if (node.socket === ws) {
        node.status = "offline";
        storage.updateFederatedNode(nodeId, {
          status: "offline",
          lastSeen: new Date()
        });
        break;
      }
    }
  }

  isHealthy(): boolean {
    return this.wss.clients.size >= 0; // Always healthy if WebSocket server is running
  }
}
