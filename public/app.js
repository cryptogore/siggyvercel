import { getGreeting } from "/public/greetings.js";

/* STATE */
let sessions = JSON.parse(localStorage.getItem("siggy_sessions")) || [];
let currentSession = null;

const messages = document.getElementById("messages");
const historyDiv = document.getElementById("history");
const archiveDiv = document.getElementById("archive");
const menu = document.getElementById("menu");

/* SAVE */
function save(){
  localStorage.setItem("siggy_sessions", JSON.stringify(sessions));
}

/* ================= SIDEBAR ================= */

function renderSidebar(){
  historyDiv.innerHTML = "";
  archiveDiv.innerHTML = "";

  sessions.filter(c=>!c.archived)
    .forEach(chat => createItem(chat, historyDiv));

  sessions.filter(c=>c.archived)
    .forEach(chat => createItem(chat, archiveDiv));
}

function createItem(chat, container){

  let div = document.createElement("div");
  div.className = "history-item";

  let title = document.createElement("span");
  title.className = "chat-title";
  title.textContent = chat.title;

  let btn = document.createElement("span");
  btn.className = "menu-btn";
  btn.textContent = "⋯";

  /* CLICK CHAT */
  title.onclick = () => loadSession(chat.id);

  /* MENU FIX (INI YANG BIKIN ERROR LU TADI) */
  btn.onclick = (e)=>{
    e.stopPropagation();
    openMenu(e, chat.id);
  };

  div.appendChild(title);
  div.appendChild(btn);
  container.appendChild(div);
}

/* ================= MENU ================= */

function openMenu(e, id){

  menu.style.display = "flex";
  menu.style.left = e.pageX + "px";
  menu.style.top = e.pageY + "px";

  menu.innerHTML = "";

  let rename = document.createElement("div");
  rename.textContent = "Rename";
  rename.onclick = () => renameChat(id);

  let archive = document.createElement("div");
  archive.textContent = "Archive";
  archive.onclick = () => archiveChat(id);

  let del = document.createElement("div");
  del.textContent = "Delete";
  del.onclick = () => deleteChat(id);

  menu.appendChild(rename);
  menu.appendChild(archive);
  menu.appendChild(del);
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

function loadSession(id){

  currentSession = id;

  let chat = sessions.find(c=>c.id===id);
  if(!chat) return;

  /* SUPER CEPAT */
  messages.innerHTML = chat.messages.map(m=>`
    <div class="message ${m.type}">
      <div class="bubble">${m.text}</div>
    </div>
  `).join("");
}

/* ================= MESSAGE ================= */

function addMessage(text, type, saveMsg=true){

  let div = document.createElement("div");
  div.className = `message ${type}`;

  div.innerHTML = `<div class="bubble">${text}</div>`;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;

  if(saveMsg){
    let chat = sessions.find(c=>c.id===currentSession);
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

  let div = document.createElement("div");
  div.className = "message bot";

  let bubble = document.createElement("div");
  bubble.className = "bubble";

  div.appendChild(bubble);
  messages.appendChild(div);

  let i = 0;

  function typing(){
    if(i < text.length){
      bubble.innerHTML += text[i];
      i++;
      messages.scrollTop = messages.scrollHeight;
      setTimeout(typing, 8);
    }
  }

  typing();

  let chat = sessions.find(c=>c.id===currentSession);
  chat.messages.push({text, type:"bot"});
  save();
}

/* ================= SEND ================= */

async function sendMessage(){

  let input = document.getElementById("msg");
  let text = input.value.trim();
  if(!text) return;

  addMessage(text, "user");
  input.value = "";

  let loading = document.createElement("div");
  loading.className = "message bot";
  loading.innerHTML = `<div class="bubble">...</div>`;
  messages.appendChild(loading);

  try{

    let res = await fetch("/api/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message:text})
    });

    let data = await res.json();

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

/* CLOSE MENU */
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
