const app = document.getElementById("app");

app.innerHTML = `
<div class="main">
  <div id="messages"></div>
  <input id="msg" placeholder="Ask Siggy..." />
  <button id="send">Send</button>
</div>
`;

const messages = document.getElementById("messages");

function addMessage(text, type){
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.textContent = (type === "user" ? "You: " : "Siggy: ") + text;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

async function loadGreeting(){
  try{
    const res = await fetch("/api/greeting");
    const data = await res.json();
    addMessage(data.greeting, "bot");
  }catch{
    addMessage("Siggy is waking up...", "bot");
  }
}

async function sendMessage(){
  const input = document.getElementById("msg");
  const text = input.value.trim();
  if(!text) return;

  addMessage(text, "user");
  input.value = "";

  try{
    const res = await fetch("/api/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message:text})
    });

    const data = await res.json();
    addMessage(data.response, "bot");

  }catch{
    addMessage("⚠ server error", "bot");
  }
}

document.getElementById("send").onclick = sendMessage;

document.getElementById("msg").addEventListener("keydown",(e)=>{
  if(e.key==="Enter"){
    e.preventDefault();
    sendMessage();
  }
});

loadGreeting();