class WebSocketClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    connect() {
        this.socket = new WebSocket('ws://localhost:3000');
        
        this.socket.onopen = () => {
            this.isConnected = true;
            this.addMessage('Connected to server', 'received');
        };

        this.socket.onmessage = (event) => {
            this.addMessage(`Server: ${event.data}`, 'received');
        };

        this.socket.onclose = () => {
            this.isConnected = false;
            this.addMessage('Disconnected from server', 'received');
        };
    }

    sendMessage(message) {
        if (this.isConnected && this.socket) {
            this.socket.send(message);
            this.addMessage(`You: ${message}`, 'sent');
        } else {
            this.addMessage('Not connected to server', 'received');
        }
    }

    addMessage(text, type) {
        const messagesDiv = document.getElementById('websocket-messages');
        if (messagesDiv) {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${type}`;
            messageElement.textContent = text;
            messagesDiv.appendChild(messageElement);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }
}

const wsClient = new WebSocketClient();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Test middleware endpoint
    testMiddleware();
    
    // Initialize WebSocket connection
    setTimeout(() => wsClient.connect(), 1000);
});

async function testMiddleware() {
    try {
        const response = await fetch('/api/add?a=2&b=3');
        const data = await response.json();
        console.log('Middleware test result:', data);
    } catch (error) {
        console.log('Middleware test failed (server might be offline)');
    }
}

function sendWebSocketMessage() {
    const input = document.getElementById('websocket-input');
    if (input && input.value.trim()) {
        wsClient.sendMessage(input.value.trim());
        input.value = '';
    }
}