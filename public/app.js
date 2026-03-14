const messages = document.getElementById("messages");

/* ADD MESSAGE */
function addMessage(text,type){

let div=document.createElement("div")
div.className=`message ${type}`

div.innerHTML=`<div class="bubble">${text}</div>`

messages.appendChild(div)
messages.scrollTop=messages.scrollHeight
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
}

/* GREETING */
async function loadGreeting(){
try{
const res=await fetch("/api/greeting")
const data=await res.json()
addMessage(data.greeting,"bot")
}catch{
addMessage("Siggy waking up...","bot")
}
}

/* SEND */
async function sendMessage(){

let input=document.getElementById("msg")
let text=input.value.trim()
if(!text)return

addMessage(text,"user")
input.value=""

/* LOADING */
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

document.getElementById("newChatBtn").onclick=()=>{
messages.innerHTML=""
loadGreeting()
}

/* INIT */
loadGreeting()
