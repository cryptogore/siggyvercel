const messages = document.getElementById("messages");

/* MESSAGE RENDER */
function addMessage(text,type){

let div=document.createElement("div")
div.className=`message ${type}`

div.innerHTML = type==="user"
? `<div class="bubble">${text}</div>`
: `<div class="bubble">${text}</div>`

messages.appendChild(div)
messages.scrollTop = messages.scrollHeight
}

/* GREETING FROM BACKEND */
async function loadGreeting(){
try{
const res = await fetch("/api/greeting")
const data = await res.json()
addMessage(data.greeting,"bot")
}catch{
addMessage("Siggy waking up...","bot")
}
}

/* SEND MESSAGE */
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
addMessage("⚠ Siggy cannot respond","bot")
}

}

/* EVENTS */
document.getElementById("send").onclick = sendMessage

document.getElementById("msg").addEventListener("keydown",(e)=>{
if(e.key==="Enter"){
e.preventDefault()
sendMessage()
}
})

document.getElementById("newChatBtn").onclick = ()=>{
messages.innerHTML=""
loadGreeting()
}

/* INIT */
loadGreeting()
