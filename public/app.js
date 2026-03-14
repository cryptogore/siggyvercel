import { getGreeting } from "./greetings.js";

/* ================= STATE ================= */

let sessions = JSON.parse(localStorage.getItem("siggy_sessions")) || [];
let currentSession = null;

const messages = document.getElementById("messages");
const historyDiv = document.getElementById("history");
const archiveDiv = document.getElementById("archive");
const menu = document.getElementById("menu");

function save(){
  localStorage.setItem("siggy_sessions", JSON.stringify(sessions));
}

/* ================= SIDEBAR ================= */

function renderSidebar(){

  historyDiv.innerHTML = "";
  archiveDiv.innerHTML = "";

  sessions.forEach(chat=>{
    const item = createItem(chat);

    if(chat.archived){
      archiveDiv.appendChild(item);
    }else{
      historyDiv.appendChild(item);
    }
  });
}

function createItem(chat){

  const div = document.createElement("div");
  div.className = "history-item";

  const title = document.createElement("span");
  title.textContent = chat.title;

  const btn = document.createElement("span");
  btn.textContent = "⋯";
  btn.className = "menu-btn";

  /* ⚡ INSTANT CLICK */
  div.onclick = () => loadSession(chat.id);

  /* MENU */
  btn.onclick = (e)=>{
    e.stopPropagation();
    openMenu(e, chat.id);
  };

  div.appendChild(title);
  div.appendChild(btn);

  return div;
}

/* ================= MENU ================= */

function openMenu(e, id){

  menu.style.display = "flex";
  menu.style.left = e.pageX + "px";
  menu.style.top = e.pageY + "px";

  menu.innerHTML = `
    <div data-act="rename">Rename</div>
    <div data-act="archive">Archive</div>
    <div data-act="delete">Delete</div>
  `;

  menu.onclick = (ev)=>{
    const act = ev.target.dataset.act;
    if(!act) return;

    if(act==="rename") renameChat(id);
    if(act==="archive") archiveChat(id);
    if(act==="delete") deleteChat(id);

    menu.style.display = "none";
  };
}

function renameChat(id){
  let name = prompt("Rename chat:");
  if(!name) return;

  let chat = sessions.find(c=>c.id===id);
  chat.title = name;

  save();
  renderSidebar();
}

function archiveChat(id){
  let chat = sessions.find(c=>c.id===id);
  chat.archived = true;

  save();
  renderSidebar();
}

function deleteChat(id){
  sessions = sessions.filter(c=>c.id!==id);

  save();
  renderSidebar();
}

/* ================= CHAT ================= */

function newChat(){

  const chat = {
    id: "chat_" + Date.now(),
    title: "New Chat",
    messages: [],
    archived: false
  };

  sessions.push(chat);
  currentSession = chat.id;

  save();
  renderSidebar();

  messages.innerHTML = "";

  addMessage(getGreeting(), "bot");
}

/* ⚡ ULTRA FAST LOAD */
function loadSession(id){

  if(currentSession === id) return;

  currentSession = id;

  const chat = sessions.find(c=>c.id===id);
  if(!chat) return;

  messages.innerHTML = "";

  const frag = document.createDocumentFragment();

  for(let i=0;i<chat.messages.length;i++){

    const m = chat.messages[i];

    const div = document.createElement("div");
    div.className = `message ${m.type}`;
    div.innerHTML = `<div class="bubble">${m.text}</div>`;

    frag.appendChild(div);
  }

  messages.appendChild(frag);

  messages.scrollTop = messages.scrollHeight;
}

/* ================= MESSAGE ================= */

function addMessage(text, type, saveMsg=true){

  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.innerHTML = `<div class="bubble">${text}</div>`;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;

  if(saveMsg){
    const chat = sessions.find(c=>c.id===currentSession);
    chat.messages.push({text, type});

    if(chat.messages.length === 1){
      chat.title = text.slice(0,30);
    }

    save();
    renderSidebar();
  }
}

/* ================= TYPING ================= */

function typeMessage(text){

  const div = document.createElement("div");
  div.className = "message bot";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  div.appendChild(bubble);
  messages.appendChild(div);

  let i = 0;

  function typing(){
    if(i < text.length){
      bubble.innerHTML += text[i];
      i++;
      messages.scrollTop = messages.scrollHeight;
      setTimeout(typing, 6);
    }
  }

  typing();

  const chat = sessions.find(c=>c.id===currentSession);
  chat.messages.push({text, type:"bot"});
  save();
}

/* ================= SEND ================= */

async function sendMessage(){

  const input = document.getElementById("msg");
  const text = input.value.trim();
  if(!text) return;

  addMessage(text, "user");
  input.value = "";

  const loading = document.createElement("div");
  loading.className = "message bot";
  loading.innerHTML = `<div class="bubble">...</div>`;
  messages.appendChild(loading);

  try{

    const res = await fetch("/api/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message:text})
    });

    const data = await res.json();

    loading.remove();
    typeMessage(data.response);

  }catch{
    loading.remove();
    addMessage("⚠ error", "bot");
  }
}

/* ================= EVENTS ================= */

document.getElementById("send").onclick = sendMessage;

document.getElementById("msg").addEventListener("keydown",(e)=>{
  if(e.key==="Enter"){
    e.preventDefault();
    sendMessage();
  }
});

document.getElementById("newChatBtn").onclick = newChat;

document.getElementById("archiveToggle").onclick = ()=>{
  archiveDiv.style.display =
    archiveDiv.style.display === "block" ? "none" : "block";
};

document.body.onclick = ()=>{
  menu.style.display = "none";
};

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded",()=>{

  renderSidebar();

  if(sessions.length === 0){
    newChat();
  }else{
    loadSession(sessions[sessions.length-1].id);
  }

});
