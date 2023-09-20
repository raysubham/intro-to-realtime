const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");
let allChat = [];

// listen for events on the form
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

const ws = new WebSocket("ws://localhost:8080", ["json"]);

ws.addEventListener("open", (e) => {
  presence.innerText = "🟢";
});

ws.addEventListener("close", (e) => {
  presence.innerText = "🔴";
});

ws.addEventListener("message", (ev) => {
  const data = JSON.parse(ev.data);
  allChat = data.msgs;
  render();
});

async function postNewMsg(user, text) {
  ws.send(JSON.stringify({ user, text }));
}

function render() {
  const html = allChat.map(({ user, text }) => template(user, text));
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;
