import axios from "axios";
import fs from "fs";
import path from "path";

let cached = null;

export default async function handler(req,res){

if(req.method!=="POST"){
return res.status(405).json({error:"Method not allowed"})
}

try{

const {message}=req.body;

/* CACHE FILE */
if(!cached){

const base=process.cwd();

const promptBase=fs.readFileSync(
path.join(base,"data/siggy_prompt.txt"),"utf-8"
);

const dataset=fs.readFileSync(
path.join(base,"data/dataset_qa.txt"),"utf-8"
);

const docs=fs.readFileSync(
path.join(base,"data/ritual_docs_full.txt"),"utf-8"
);

cached={
promptBase,
dataset: dataset.slice(0,1000),
docs: docs.slice(0,1200)
};

}

const {promptBase,dataset,docs}=cached;

/* PROMPT */
const prompt=`
${promptBase}

Context:
${dataset}

Docs:
${docs}

User: ${message}
Siggy:
`;

/* FAST MODEL */
const response=await axios.post(
"https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
{
model:"qwen-turbo",
input:{prompt}
},
{
headers:{
Authorization:`Bearer ${process.env.DASHSCOPE_API_KEY}`,
"Content-Type":"application/json"
}
}
);

const reply=response.data?.output?.text||"Hmm...";

res.status(200).json({response:reply});

}catch(err){
console.log(err.message);
res.status(500).json({response:"Siggy glitch ⚡"});
}

}
