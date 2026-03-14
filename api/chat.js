import axios from "axios";
import fs from "fs";
import path from "path";

export default async function handler(req,res){

if(req.method !== "POST"){
return res.status(405).json({error:"Method not allowed"})
}

try{

const {message} = req.body;

const base = process.cwd();

/* LOAD FILES */

const promptBase = fs.readFileSync(
path.join(base,"data/siggy_prompt.txt"),
"utf-8"
);

const dataset = fs.readFileSync(
path.join(base,"data/dataset_qa.txt"),
"utf-8"
);

const docs = fs.readFileSync(
path.join(base,"data/ritual_docs_full.txt"),
"utf-8"
);

/* LIMIT SIZE */
const trimmedDocs = docs.slice(0,2000);

/* PROMPT */

const prompt = `
${promptBase}

KNOWLEDGE:
${dataset}

DOCS:
${trimmedDocs}

User: ${message}
Siggy:
`;

/* CALL MODEL */

const response = await axios.post(
  "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
  {
    model: "qwen-plus",
    input: { prompt }
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
      "Content-Type": "application/json"
    }
  }
);

/* RESPONSE */

const reply = response.data?.output?.text || "Hmm... error.";

res.status(200).json({ response: reply });

}catch(err){

console.log(err.message);

res.status(500).json({
response:"Siggy crashed 🧠⚡"
});

}

}