export class GameWebSocket {
  private ws: WebSocket | null = null;
  private playerId: string;
  private onMessage: (data: any) => void;

  constructor(playerId: string, onMessage: (data: any) => void) {
    this.playerId = playerId;
    this.onMessage = onMessage;
  }

  connect() {
    this.ws = new WebSocket(`ws://localhost:8000/ws/${this.playerId}`);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.onMessage(data);
    };

    this.ws.onclose = () => {
      console.log('WebSocket отключен, переподключение через 3 секунды...');
      setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket ошибка:', error);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}