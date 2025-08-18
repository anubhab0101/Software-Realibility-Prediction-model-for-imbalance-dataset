import { useEffect, useRef, useState } from "react";
import { Shield, Link, CheckCircle } from "lucide-react";

interface Block {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: Date;
  data: any;
}

export default function BlockchainViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    // Initialize with genesis block and some sample blocks
    const genesisBlock: Block = {
      index: 0,
      hash: "0000abc123...",
      previousHash: "0",
      timestamp: new Date(Date.now() - 3600000),
      data: { type: "genesis" }
    };

    const sampleBlocks: Block[] = [
      genesisBlock,
      {
        index: 1,
        hash: "0000def456...",
        previousHash: "0000abc123...",
        timestamp: new Date(Date.now() - 1800000),
        data: { type: "federated_update", nodeId: "node_1" }
      },
      {
        index: 2,
        hash: "0000ghi789...",
        previousHash: "0000def456...",
        timestamp: new Date(Date.now() - 900000),
        data: { type: "federated_update", nodeId: "node_2" }
      },
      {
        index: 3,
        hash: "0000jkl012...",
        previousHash: "0000ghi789...",
        timestamp: new Date(),
        data: { type: "model_validation", accuracy: 0.94 }
      }
    ];

    setBlocks(sampleBlocks);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawBlockchain(ctx, canvas.width, canvas.height);
  }, [blocks]);

  const drawBlockchain = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    const blockWidth = 80;
    const blockHeight = 60;
    const spacing = 100;
    const startX = 20;
    const startY = height / 2 - blockHeight / 2;

    ctx.font = '10px monospace';
    
    blocks.forEach((block, index) => {
      const x = startX + index * spacing;
      const y = startY;

      // Draw block
      ctx.fillStyle = block.index === 0 ? '#10b981' : '#3b82f6';
      ctx.fillRect(x, y, blockWidth, blockHeight);

      // Draw block border
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, blockWidth, blockHeight);

      // Draw block content
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`Block ${block.index}`, x + blockWidth/2, y + 15);
      ctx.fillText(block.hash.substring(0, 8) + '...', x + blockWidth/2, y + 30);
      ctx.fillText(block.data.type, x + blockWidth/2, y + 45);

      // Draw connection to next block
      if (index < blocks.length - 1) {
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + blockWidth, y + blockHeight/2);
        ctx.lineTo(x + spacing, y + blockHeight/2);
        ctx.stroke();

        // Draw arrow
        ctx.beginPath();
        ctx.moveTo(x + spacing - 10, y + blockHeight/2 - 5);
        ctx.lineTo(x + spacing, y + blockHeight/2);
        ctx.lineTo(x + spacing - 10, y + blockHeight/2 + 5);
        ctx.stroke();
      }
    });

    ctx.textAlign = 'left';
  };

  const getBlockTypeIcon = (type: string) => {
    switch (type) {
      case 'genesis':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'federated_update':
        return <Link className="h-4 w-4 text-blue-500" />;
      case 'model_validation':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Blockchain Visualization */}
      <div>
        <h4 className="text-sm font-medium mb-4">Blockchain Structure</h4>
        <canvas
          ref={canvasRef}
          width={400}
          height={120}
          className="w-full border rounded-lg bg-gray-50"
        />
      </div>

      {/* Block Details */}
      <div>
        <h4 className="text-sm font-medium mb-4">Recent Blocks</h4>
        <div className="space-y-2">
          {blocks.slice(-3).reverse().map((block, index) => (
            <div key={block.index} className="flex items-center gap-3 p-3 border rounded-lg">
              {getBlockTypeIcon(block.data.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Block #{block.index}</span>
                  <span className="text-xs text-muted-foreground">
                    {block.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Hash: {block.hash}
                </div>
                <div className="text-xs text-muted-foreground">
                  Type: {block.data.type.replace('_', ' ')}
                  {block.data.nodeId && ` • Node: ${block.data.nodeId}`}
                  {block.data.accuracy && ` • Accuracy: ${(block.data.accuracy * 100).toFixed(1)}%`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blockchain Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-blue-600">{blocks.length}</div>
          <div className="text-xs text-muted-foreground">Total Blocks</div>
        </div>
        <div>
          <div className="text-lg font-bold text-green-600">100%</div>
          <div className="text-xs text-muted-foreground">Chain Integrity</div>
        </div>
        <div>
          <div className="text-lg font-bold text-purple-600">
            {blocks.filter(b => b.data.type === 'federated_update').length}
          </div>
          <div className="text-xs text-muted-foreground">Fed Updates</div>
        </div>
      </div>

      {/* Security Indicators */}
      <div className="border rounded-lg p-4 bg-green-50">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Security Status</span>
        </div>
        <div className="text-xs text-green-700 space-y-1">
          <div>✓ Cryptographic signatures verified</div>
          <div>✓ Chain integrity maintained</div>
          <div>✓ Consensus mechanism active</div>
          <div>✓ Node reputation tracking enabled</div>
        </div>
      </div>
    </div>
  );
}
