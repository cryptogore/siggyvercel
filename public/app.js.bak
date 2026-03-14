/* GREETINGS (fallback) */
const greetings=[
"yo traveler 👋 I'm Siggy — mystical oracle cat of Ritual.",
"psst... hey explorer 🐾 Siggy here.",
"welcome wanderer ✨ Ritual world is wide."
]

function randomGreeting(){
return greetings[Math.floor(Math.random()*greetings.length)]
}

/* STATE */
let sessions=JSON.parse(localStorage.getItem("siggy_sessions"))||[]
let currentSession=null

const messages=document.getElementById("messages")
const historyDiv=document.getElementById("history")
const archiveDiv=document.getElementById("archive")

function save(){
localStorage.setItem("siggy_sessions",JSON.stringify(sessions))
}

/* SIDEBAR */
function renderSidebar(){
historyDiv.innerHTML=""
archiveDiv.innerHTML=""

sessions.filter(c=>!c.archived)
.forEach(chat=>createItem(chat,historyDiv))

sessions.filter(c=>c.archived)
.forEach(chat=>createItem(chat,archiveDiv))
}

function createItem(chat,container){
let div=document.createElement("div")
div.className="history-item"

div.innerHTML=`
<span class="chat-title">${chat.title}</span>
<span class="menu-btn">⋯</span>`

div.querySelector(".chat-title").onclick=()=>loadSession(chat.id)
div.querySelector(".menu-btn").onclick=(e)=>{
e.stopPropagation()
openMenu(e,chat.id)
}

container.appendChild(div)
}

/* MENU */
function openMenu(e,id){
const menu=document.getElementById("menu")

menu.style.display="flex"
menu.style.left=e.pageX+"px"
menu.style.top=e.pageY+"px"

menu.innerHTML=`
<div onclick="renameChat('${id}')">Rename</div>
<div onclick="archiveChat('${id}')">Archive</div>
<div onclick="deleteChat('${id}')">Delete</div>`
}

window.renameChat=(id)=>{
let name=prompt("Rename chat")
if(!name)return
sessions.find(c=>c.id===id).title=name
save();renderSidebar()
}

window.archiveChat=(id)=>{
sessions.find(c=>c.id===id).archived=true
save();renderSidebar()
}

window.deleteChat=(id)=>{
sessions=sessions.filter(c=>c.id!==id)
save();renderSidebar()
}

/* CHAT */
function newChat(){
const chat={
id:"chat_"+Date.now(),
title:"New Chat",
messages:[],
archived:false
}

sessions.push(chat)
currentSession=chat.id
save();renderSidebar()

messages.innerHTML=""
loadGreeting()
}

function loadSession(id){
currentSession=id
messages.innerHTML=""

let chat=sessions.find(c=>c.id===id)
chat.messages.forEach(m=>addMessage(m.text,m.type,false))
}

function addMessage(text,type,saveMsg=true){
let div=document.createElement("div")
div.className=`message ${type}`

div.innerHTML=type==="user"
? `<div class="bubble">${text}</div>`
: `<div class="bubble">${marked.parse(text)}</div>`

messages.appendChild(div)

if(saveMsg){
let chat=sessions.find(c=>c.id===currentSession)
chat.messages.push({text,type})
save()
}
}

/* API */
async function loadGreeting(){
try{
const res=await fetch("/api/greeting")
const data=await res.json()
addMessage(data.greeting,"bot")
}catch{
addMessage(randomGreeting(),"bot")
}
}

async function sendMessage(){
let input=document.getElementById("msg")
let text=input.value.trim()
if(!text)return

addMessage(text,"user")
input.value=""

try{
let res=await fetch("/api/chat",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({message:text})
})

let data=await res.json()
addMessage(data.response,"bot")

}catch{
addMessage("⚠ error","bot")
}
}

/* EVENTS */
document.getElementById("send").onclick=sendMessage
document.getElementById("newChatBtn").onclick=newChat
document.getElementById("archiveToggle").onclick=()=>{
archiveDiv.style.display=
archiveDiv.style.display==="block"?"none":"block"
}

document.getElementById("msg").addEventListener("keydown",(e)=>{
if(e.key==="Enter"){
e.preventDefault()
sendMessage()
}
})

document.body.onclick=()=>{
document.getElementById("menu").style.display="none"
}

/* INIT */
document.addEventListener("DOMContentLoaded",()=>{
renderSidebar()

if(sessions.length===0){
newChat()
}else{
loadSession(sessions[sessions.length-1].id)
}
})
