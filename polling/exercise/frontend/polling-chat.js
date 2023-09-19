const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");

const BACKOFF = 5000;
let failedTries = 0;

// let's store all current messages here
let allChat = [];

// the interval to poll at in milliseconds
const INTERVAL = 3000;

// a submit listener on the form in the HTML
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const res = await fetch("/poll", {
    method: "POST",
    body: JSON.stringify({
      user,
      text,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res?.msg?.length) {
    allChat = res?.msg;
  }
}

async function getNewMsgs() {
  let json;
  try {
    const response = await fetch("/poll");
    json = await response.json();

    if (!response.ok) {
      throw new Error("Not good response");
    } else {
      failedTries = 0;
    }
  } catch (error) {
    // Backoff code
    console.error("polling error", error);
    failedTries++;
  } finally {
    if (json?.msg?.length) {
      allChat = json?.msg;
      render();
      // setTimeout(getNewMsgs, INTERVAL); // SetTimeout works good, but for pause/unpause tab, it is better to leverage requestAnimationFrame
    }
  }
}

function render() {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficent. yes, it's fine for this example
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

// // make the first request
// getNewMsgs();

let timeToNextAnimation = 0;

const rafTimer = async (time) => {
  console.log(time);
  if (timeToNextAnimation <= time) {
    await getNewMsgs();
    timeToNextAnimation = time + INTERVAL + failedTries * BACKOFF;
  }
  window.requestAnimationFrame(rafTimer);
};

// Make the first request
window.requestAnimationFrame(rafTimer);
