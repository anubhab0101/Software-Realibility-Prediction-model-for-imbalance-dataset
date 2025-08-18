import { useEffect, useState, useRef } from "react";

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface UseWebSocketOptions {
  url: string;
  protocols?: string | string[];
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (message: string) => void;
  shouldReconnect?: (closeEvent: CloseEvent) => boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export type ConnectionStatus = 'Connecting' | 'Connected' | 'Disconnected' | 'Error';

export function useWebSocket(options: UseWebSocketOptions) {
  const {
    url,
    protocols,
    onOpen,
    onClose,
    onError,
    onMessage,
    shouldReconnect = () => true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('Disconnected');
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('Connecting');

    try {
      const ws = new WebSocket(url, protocols);
      websocketRef.current = ws;

      ws.onopen = (event) => {
        setConnectionStatus('Connected');
        reconnectAttemptsRef.current = 0;
        onOpen?.(event);
      };

      ws.onclose = (event) => {
        setConnectionStatus('Disconnected');
        onClose?.(event);

        // Attempt to reconnect if conditions are met
        if (
          shouldReconnect(event) &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (event) => {
        setConnectionStatus('Error');
        onError?.(event);
      };

      ws.onmessage = (event) => {
        setLastMessage(event.data);
        onMessage?.(event.data);
      };
    } catch (error) {
      setConnectionStatus('Error');
      console.error('WebSocket connection error:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    setConnectionStatus('Disconnected');
  };

  const sendMessage = (message: string | object) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      const messageString = typeof message === 'string' ? message : JSON.stringify(message);
      websocketRef.current.send(messageString);
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [url]);

  return {
    connectionStatus,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
  };
}

// Utility hook for monitoring real-time updates
export function useMonitoringWebSocket() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  const { connectionStatus, sendMessage } = useWebSocket({
    url: `ws://${window.location.host}`,
    onMessage: (message) => {
      try {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'monitoring_metric':
            setMetrics(prev => [data.payload, ...prev.slice(0, 99)]);
            break;
          case 'system_alert':
            setAlerts(prev => [data.payload, ...prev.slice(0, 19)]);
            break;
          case 'model_training_complete':
          case 'quantum_experiment_complete':
          case 'federated_round_complete':
            // Handle training completion notifications
            setAlerts(prev => [{
              type: 'success',
              message: data.message || 'Operation completed successfully',
              timestamp: new Date(),
            }, ...prev.slice(0, 19)]);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    },
  });

  // Subscribe to monitoring updates on connection
  useEffect(() => {
    if (connectionStatus === 'Connected') {
      sendMessage({
        type: 'subscribe_monitoring',
        timestamp: Date.now(),
      });
    }
  }, [connectionStatus]);

  return {
    connectionStatus,
    metrics,
    alerts,
    sendMessage,
  };
}

// Utility hook for federated learning coordination
export function useFederatedWebSocket(nodeId?: string) {
  const [nodeStatus, setNodeStatus] = useState<string>('offline');
  const [jobUpdates, setJobUpdates] = useState<any[]>([]);

  const { connectionStatus, sendMessage } = useWebSocket({
    url: `ws://${window.location.host}`,
    onMessage: (message) => {
      try {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'federated_job_start':
          case 'training_round_start':
          case 'aggregation_complete':
            setJobUpdates(prev => [data, ...prev.slice(0, 49)]);
            break;
          case 'node_status_update':
            if (data.nodeId === nodeId) {
              setNodeStatus(data.status);
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing federated WebSocket message:', error);
      }
    },
  });

  const registerNode = (nodeInfo: any) => {
    sendMessage({
      type: 'federated_node_register',
      nodeInfo,
      timestamp: Date.now(),
    });
  };

  const submitModelUpdate = (jobId: string, modelUpdate: any, signature: string) => {
    sendMessage({
      type: 'model_update',
      jobId,
      nodeId,
      modelUpdate,
      signature,
      timestamp: Date.now(),
    });
  };

  return {
    connectionStatus,
    nodeStatus,
    jobUpdates,
    registerNode,
    submitModelUpdate,
    sendMessage,
  };
}
