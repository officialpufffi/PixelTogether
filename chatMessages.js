document.addEventListener('DOMContentLoaded', async () => {
    const chatMessages = document.getElementById('chatbox-messages');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');

    const ws = new WebSocket(`ws://localhost:8080`);
    
    ws.addEventListener('open', () => {
        console.log('WebSocket connected');
    });
    
    ws.addEventListener('message', (event) => {
        const message = JSON.parse(event.data);
        if (message.text && message.isUser !== undefined) {
            addMessage(message.text, message.isUser);
        }
    });

    function addMessage(message, isUser = false) {
        const messageElement = document.createElement('div');
        messageElement.style.margin = '5px 0';
        messageElement.style.padding = '5px 10px';
        messageElement.style.borderRadius = '10px';
        messageElement.style.maxWidth = '80%';
        messageElement.style.wordWrap = 'break-word';
        messageElement.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
        messageElement.style.backgroundColor = isUser ? '#007BFF' : '#555';
        messageElement.style.color = 'white';
        messageElement.textContent = message;

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendButton.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message, true);
            ws.send(JSON.stringify({ text: message, isUser: false }));
            chatInput.value = '';
        }
    });

    chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });

    fetch('palette.json')
        .then(response => response.json())
        .then(palette => applyChatboxStyles(palette.chatboxColors));

    function applyChatboxStyles(colors) {
        const chatbox = document.getElementById('chatbox');
        const header = document.getElementById('chatbox-header');
        const messages = document.getElementById('chatbox-messages');
        const input = document.getElementById('chatInput');
        const button = document.getElementById('sendButton');

        chatbox.style.backgroundColor = `#${colors.backgroundColor}`;
        chatbox.style.borderColor = `#${colors.borderColor}`;
        header.style.color = `#${colors.headerColor}`;
        messages.style.backgroundColor = `#${colors.messagesBackgroundColor}`;
        messages.style.color = `#${colors.textColor}`;
        input.style.backgroundColor = `#${colors.inputBackgroundColor}`;
        input.style.borderColor = `#${colors.inputBorderColor}`;
        input.style.color = `#${colors.textColor}`;
        button.style.backgroundColor = `#${colors.buttonColor}`;
        button.style.color = `#${colors.buttonTextColor}`;

        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = `#${colors.buttonHoverColor}`;
        });
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = `#${colors.buttonColor}`;
        });
    }
});
