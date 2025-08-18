import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface QuantumVizProps {
  experiments?: any[];
}

export default function QuantumViz({ experiments = [] }: QuantumVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw quantum circuit visualization
    drawQuantumCircuit(ctx, canvas.width, canvas.height);
  }, [experiments]);

  const drawQuantumCircuit = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const qubits = 4;
    const gateWidth = 40;
    const gateHeight = 30;
    const spacing = 60;
    const startX = 50;
    const startY = 50;

    // Set styles
    ctx.strokeStyle = '#3b82f6';
    ctx.fillStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.font = '12px monospace';

    // Draw qubit lines
    for (let i = 0; i < qubits; i++) {
      const y = startY + i * spacing;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(width - 50, y);
      ctx.stroke();

      // Label qubits
      ctx.fillText(`|q${i}⟩`, 10, y + 5);
    }

    // Draw quantum gates
    const gates = [
      { type: 'H', qubit: 0, x: 120 },
      { type: 'CNOT', qubit: [0, 1], x: 200 },
      { type: 'RY', qubit: 1, x: 280 },
      { type: 'CNOT', qubit: [1, 2], x: 360 },
      { type: 'H', qubit: 2, x: 440 },
      { type: 'M', qubit: 3, x: 520 },
    ];

    gates.forEach(gate => {
      if (gate.type === 'CNOT' && Array.isArray(gate.qubit)) {
        // Draw CNOT gate
        const [control, target] = gate.qubit;
        const controlY = startY + control * spacing;
        const targetY = startY + target * spacing;

        // Control qubit (filled circle)
        ctx.beginPath();
        ctx.arc(gate.x, controlY, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Target qubit (circle with cross)
        ctx.beginPath();
        ctx.arc(gate.x, targetY, 15, 0, 2 * Math.PI);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(gate.x - 10, targetY);
        ctx.lineTo(gate.x + 10, targetY);
        ctx.moveTo(gate.x, targetY - 10);
        ctx.lineTo(gate.x, targetY + 10);
        ctx.stroke();

        // Connection line
        ctx.beginPath();
        ctx.moveTo(gate.x, controlY);
        ctx.lineTo(gate.x, targetY);
        ctx.stroke();
      } else if (typeof gate.qubit === 'number') {
        // Draw single-qubit gate
        const y = startY + gate.qubit * spacing;
        
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(gate.x - gateWidth/2, y - gateHeight/2, gateWidth, gateHeight);
        
        ctx.strokeStyle = '#3b82f6';
        ctx.strokeRect(gate.x - gateWidth/2, y - gateHeight/2, gateWidth, gateHeight);
        
        ctx.fillStyle = '#1f2937';
        ctx.textAlign = 'center';
        ctx.fillText(gate.type, gate.x, y + 4);
        ctx.textAlign = 'left';
      }
    });

    // Draw measurement results (if any experiments completed)
    const completedExperiments = experiments.filter(exp => exp.status === 'completed');
    if (completedExperiments.length > 0) {
      ctx.fillStyle = '#10b981';
      ctx.fillText('Measurement Results:', startX, height - 40);
      
      // Simulate measurement outcomes
      const outcomes = ['00', '01', '10', '11'];
      const probabilities = [0.4, 0.3, 0.2, 0.1];
      
      outcomes.forEach((outcome, i) => {
        const barHeight = probabilities[i] * 60;
        const barX = startX + 200 + i * 50;
        const barY = height - 40;
        
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(barX, barY - barHeight, 30, barHeight);
        
        ctx.fillStyle = '#1f2937';
        ctx.fillText(outcome, barX + 5, barY + 15);
        ctx.fillText(`${(probabilities[i] * 100).toFixed(1)}%`, barX, barY - barHeight - 5);
      });
    }
  };

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        className="w-full h-64 border rounded-lg bg-white"
        style={{ minHeight: '250px' }}
      />
      
      {experiments.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Active Experiments:</span>
            <span className="ml-2 font-medium">
              {experiments.filter(exp => exp.status === 'running').length}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Completed:</span>
            <span className="ml-2 font-medium">
              {experiments.filter(exp => exp.status === 'completed').length}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Avg Qubits:</span>
            <span className="ml-2 font-medium">
              {experiments.length > 0 
                ? (experiments.reduce((sum, exp) => sum + (exp.qubits || 0), 0) / experiments.length).toFixed(1)
                : '0'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Success Rate:</span>
            <span className="ml-2 font-medium">
              {experiments.length > 0 
                ? ((experiments.filter(exp => exp.status === 'completed').length / experiments.length) * 100).toFixed(1)
                : '0'}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
