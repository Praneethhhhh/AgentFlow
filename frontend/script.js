const input = document.querySelector("#input");
const chatContainer = document.querySelector("#chatcontainer");
const askBtn = document.querySelector("#ask");

input.addEventListener("keyup", handleEnter);
askBtn.addEventListener("click", handleAsk);

const loading = document.createElement("div");
loading.className = "my-6 animate-pulse ";
loading.textContent = "Thinking....";

async function handleEnter(e) {
  if (e.key === "Enter") {
    const text = input?.value.trim();
    if (!text) {
      return;
    }
    await generate(text);
    const res = await callServer(text);
    console.log(res);
    generateResponse(res);
  }
}

async function handleAsk(e) {
  const text = input?.value.trim();
  if (!text) {
    return;
  }
  await generate(text);

  const res = await callServer(text);
  console.log(res);
  generateResponse(res);
}

async function generate(text) {
  const msg = document.createElement("div");
  msg.className = `my-6 bg-neutral-800 p-3 rounded-xl ml-auto max-w-fit`;
  msg.textContent = text;
  chatContainer.appendChild(msg);
  input.value = "";

  chatContainer.appendChild(loading);

  const res = await callServer(text);
} // user msg

async function generateResponse(text) {
  const msg = document.createElement("div");
  msg.className = `my-6 p-3 mr-auto max-w-fit`;
  msg.textContent = text;

  loading.remove();
  chatContainer.appendChild(msg);
  // input.value = "";

  // const res = await callServer(text);
} // ai msg

async function callServer(userInput) {
  const response = await fetch("http://localhost:3005/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ message: userInput }),
  });

  if (!response.ok) {
    throw new Error("error generating response ");
  }

  const result = await response.json();
  return result.message;
}
