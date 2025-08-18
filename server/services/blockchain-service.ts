import crypto from "crypto";
import { storage } from "../storage";

interface Block {
  index: number;
  timestamp: Date;
  data: any;
  previousHash: string;
  nonce: number;
  hash: string;
}

export class BlockchainService {
  private chain: Block[] = [];
  private difficulty = 2;

  constructor() {
    this.createGenesisBlock();
  }

  private createGenesisBlock() {
    const genesisBlock: Block = {
      index: 0,
      timestamp: new Date(),
      data: "Genesis Block",
      previousHash: "0",
      nonce: 0,
      hash: ""
    };
    genesisBlock.hash = this.calculateHash(genesisBlock);
    this.chain.push(genesisBlock);
  }

  private calculateHash(block: Block): string {
    return crypto
      .createHash("sha256")
      .update(
        block.index +
        block.timestamp.toISOString() +
        JSON.stringify(block.data) +
        block.previousHash +
        block.nonce
      )
      .digest("hex");
  }

  private mineBlock(block: Block): void {
    const target = Array(this.difficulty + 1).join("0");
    
    while (block.hash.substring(0, this.difficulty) !== target) {
      block.nonce++;
      block.hash = this.calculateHash(block);
    }
  }

  async addBlock(data: any): Promise<Block> {
    const previousBlock = this.chain[this.chain.length - 1];
    const newBlock: Block = {
      index: previousBlock.index + 1,
      timestamp: new Date(),
      data,
      previousHash: previousBlock.hash,
      nonce: 0,
      hash: ""
    };

    this.mineBlock(newBlock);
    this.chain.push(newBlock);
    return newBlock;
  }

  async validateChain(): Promise<boolean> {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== this.calculateHash(currentBlock)) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  async recordFederatedUpdate(nodeId: string, modelUpdate: any): Promise<string> {
    const block = await this.addBlock({
      type: "federated_update",
      nodeId,
      modelUpdate,
      timestamp: new Date()
    });
    return block.hash;
  }

  async verifyNodeStake(nodeId: string, stakeAmount: number): Promise<boolean> {
    // Simplified stake verification
    const node = await storage.getFederatedNode(nodeId);
    return node ? node.stakeAmount >= stakeAmount : false;
  }

  async generateNodeKeys(): Promise<{ publicKey: string; privateKey: string }> {
    const keyPair = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
    });

    return {
      publicKey: keyPair.publicKey.export({ type: "spki", format: "pem" }) as string,
      privateKey: keyPair.privateKey.export({ type: "pkcs8", format: "pem" }) as string
    };
  }

  async signData(data: any, privateKey: string): Promise<string> {
    const sign = crypto.createSign("SHA256");
    sign.update(JSON.stringify(data));
    return sign.sign(privateKey, "hex");
  }

  async verifySignature(data: any, signature: string, publicKey: string): Promise<boolean> {
    try {
      const verify = crypto.createVerify("SHA256");
      verify.update(JSON.stringify(data));
      return verify.verify(publicKey, signature, "hex");
    } catch (error) {
      return false;
    }
  }

  getChainLength(): number {
    return this.chain.length;
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  isHealthy(): boolean {
    return this.chain.length > 0 && this.validateChain();
  }
}
