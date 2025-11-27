class Assistant {
    constructor() {
        this.messages = [
            "Welcome! I'm your project assistant.",
            "This project analyzes ChatGPT's efficiency across different domains.",
            "We use MongoDB, Node.js, and the ChatGPT API for evaluation.",
            "Check out the Results section for detailed analysis charts.",
            "The project includes real-time WebSocket communication."
        ];
        this.currentMessageIndex = 0;
        this.isAnimating = false;
    }

    updateMessage(message) {
        const assistantText = document.getElementById('assistant-text');
        this.typeWriter(assistantText, message);
    }

    typeWriter(element, text, speed = 50) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        element.innerHTML = '';
        let i = 0;
        
        const typing = setInterval(() => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(typing);
                this.isAnimating = false;
                // Auto-rotate messages after a delay
                setTimeout(() => this.rotateMessage(), 5000);
            }
        }, speed);
    }

    rotateMessage() {
        this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messages.length;
        this.updateMessage(this.messages[this.currentMessageIndex]);
    }
}

const assistant = new Assistant();

function updateAssistant(message) {
    assistant.updateMessage(message);
}

// Initialize assistant
document.addEventListener('DOMContentLoaded', () => {
    assistant.updateMessage(assistant.messages[0]);
});