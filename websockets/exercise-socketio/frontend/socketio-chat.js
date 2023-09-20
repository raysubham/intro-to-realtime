// a global called "io" is being loaded separately

const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");
let allChat = [];

const ws = io("http://localhost:8080");

ws.on("connect", (socket) => {
  presence.innerText = "🟢";
});

ws.on("disconnect", (socket) => {
  presence.innerText = "🔴";
});

ws.on("get:msgs", (data) => {
  allChat = data.msgs;
  render();
});

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  ws.emit("post:msgs", {
    user,
    text,
  });
}

function render() {
  const html = allChat.map(({ user, text }) => template(user, text));
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;
