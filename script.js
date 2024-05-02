body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f5f3e9;
    color: #4a4a4a;
    margin: 0;
    padding: 0;
}

header {
    background-color: #e8e1c9;
    padding: 20px;
    text-align: center;
}

h1 {
    color: #8c6e5b;
    font-size: 2.5em;
}

nav ul {
    list-style-type: none;
    padding: 0;
}

nav ul li {
    display: inline;
    margin-right: 10px;
}

nav ul li a {
    color: #8c6e5b;
    text-decoration: none;
    font-weight: bold;
}

main {
    padding: 20px;
}

article {
    background-color: #ffffff;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0px 0px 10px #d9d9d9;
}

h2, h3 {
    color: #8c6e5b;
}

footer {
    background-color: #e8e1c9;
    color: #8c6e5b;
    padding: 10px;
    text-align: center;
}
function sendMessage() {
    var input = document.getElementById('chat-input');
    var message = input.value.trim();

    if (message) {
        var messagesContainer = document.getElementById('messages');
        var msgElement = document.createElement('p');
        msgElement.textContent = message;
        messagesContainer.appendChild(msgElement);

        input.value = ''; // 清空输入框
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // 滚动到底部
    }
}
document.querySelector('#chat-input button').addEventListener('click', sendMessage);
