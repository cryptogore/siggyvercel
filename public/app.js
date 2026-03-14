import { getGreeting } from "./greetings.js";

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

container.appendChild(div)
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

save()
renderSidebar()

messages.innerHTML=""

addMessage(getGreeting(),"bot")
}

function loadSession(id){
currentSession=id
messages.innerHTML=""

let chat=sessions.find(c=>c.id===id)
if(!chat)return

messages.innerHTML = chat.messages.map(m=>`
<div class="message ${m.type}">
  <div class="bubble">${m.text}</div>
</div>
`).join("")
}

/* MESSAGE */
function addMessage(text,type,saveMsg=true){

let div=document.createElement("div")
div.className=`message ${type}`

div.innerHTML=`<div class="bubble">${text}</div>`

messages.appendChild(div)
messages.scrollTop=messages.scrollHeight

if(saveMsg){
let chat=sessions.find(c=>c.id===currentSession)
chat.messages.push({text,type})

if(chat.messages.length===1){
chat.title=text.substring(0,30)
}

save()
renderSidebar()
}
}

/* TYPING EFFECT */
function typeMessage(text){

let div=document.createElement("div")
div.className="message bot"

let bubble=document.createElement("div")
bubble.className="bubble"

div.appendChild(bubble)
messages.appendChild(div)

let i=0

function typing(){
if(i<text.length){
bubble.innerHTML += text[i]
i++
messages.scrollTop=messages.scrollHeight
setTimeout(typing,8)
}
}

typing()

/* SAVE */
let chat=sessions.find(c=>c.id===currentSession)
chat.messages.push({text,type:"bot"})
save()
}

/* SEND */
async function sendMessage(){

let input=document.getElementById("msg")
let text=input.value.trim()
if(!text)return

addMessage(text,"user")
input.value=""

/* loading */
let loading=document.createElement("div")
loading.className="message bot"
loading.innerHTML=`<div class="bubble">...</div>`
messages.appendChild(loading)

try{

let res=await fetch("/api/chat",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({message:text})
})

let data=await res.json()

loading.remove()

typeMessage(data.response)

}catch{
loading.remove()
addMessage("⚠ error","bot")
}
}

/* EVENTS */
document.getElementById("send").onclick=sendMessage

document.getElementById("msg").addEventListener("keydown",(e)=>{
if(e.key==="Enter"){
e.preventDefault()
sendMessage()
}
})

document.getElementById("newChatBtn").onclick=newChat

document.getElementById("archiveToggle").onclick=()=>{
archiveDiv.style.display=
archiveDiv.style.display==="block"?"none":"block"
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
