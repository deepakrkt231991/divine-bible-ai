import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const VALID_MODEL = "gemini-1.5-flash";
const cache = new Map<string, {r:string;t:number}>();
const TTL = 5*60*1000;
const reqs:number[] = [];

function canReq(){const n=Date.now();while(reqs[0]&&reqs[0]<n-6e4)reqs.shift();return reqs.length<12;}
function sleep(ms:number){return new Promise(r=>setTimeout(r,ms));}
function cKey(p:string){return p.slice(0,200);}
function get(p:string){const c=cache.get(cKey(p));if(c&&Date.now()-c.t<TTL)return c.r;if(c)cache.delete(cKey(p));return null;}
function set(p:string,r:string){cache.set(cKey(p),{r,t:Date.now()});}

let model:GenerativeModel|null=null;

export function initGemini(){
  if(!GEMINI_API_KEY){console.warn("⚠️ No GEMINI_API_KEY");return false;}
  try{
    model=new GoogleGenerativeAI(GEMINI_API_KEY).getGenerativeModel({model:VALID_MODEL,generationConfig:{temperature:0.3,topK:40,topP:0.95,maxOutputTokens:2048}});
    console.log("✅ Gemini:",VALID_MODEL);return true;
  }catch(e){console.error("❌ Gemini init:",e);return false;}
}

export async function askGemini(prompt:string,opt:{useCache?:boolean;maxRetries?:number}={}):Promise<string>{
  const{useCache=true,maxRetries=3}=opt;
  if(useCache){const c=get(prompt);if(c)return c;}
  if(!canReq()){await sleep(6e4);if(!canReq())return"⚠️ Too many requests. Wait 1 min.";}
  if(!model&&!initGemini())return"❌ Gemini not configured.";
  let err:any;
  for(let i=1;i<=maxRetries;i++){
    try{
      reqs.push(Date.now());
      const res=await model!.generateContent(prompt);
      const text=(await res.response).text();
      if(useCache)set(prompt,text);
      return text;
    }catch(e:any){
      err=e;
      if(e.message?.includes("429")){await sleep(2e3*i*2);continue;}
      if(e.message?.includes("400"))return"❌ Invalid request.";
      if(e.message?.includes("401"))return"🔑 Invalid API key.";
      if(e.message?.includes("403"))return"⚠️ API access denied.";
      if(i<maxRetries){await sleep(2e3*i);continue;}
    }
  }
  return`Sorry, error.${err?.message?" "+err.message:""}`;
}

export async function askGeminiAboutBible(book:string,ch:number,q:string,opt:{lang?:string;verses?:boolean}={}):Promise<string>{
  const{lang="hin-hindi",verses=true}=opt;
  let scripture:string;
  try{
    const{loadForGemini}=await import("./bible-loader");
    scripture=await loadForGemini(book,ch,{includeVerseNumbers:verses,format:"markdown",lang});
  }catch{return`❌ Could not load ${book} ${ch}.`;}
  if(!scripture||scripture.startsWith("Error:"))return scripture||`❌ Could not load ${book} ${ch}.`;
  const prompt=`You are a Bible study assistant.\n\n📖 Scripture: ${book.toUpperCase()} ${ch}\n${scripture}\n\n❓ Question: ${q}\n\nInstructions:\n1. Answer based ONLY on scripture\n2. Cite verse numbers\n3. Same language as question\n4. Keep answers clear\n5. If cannot answer, say so politely\n\nResponse:`;
  return await askGemini(prompt,{useCache:true});
}

export function clearCache(){cache.clear();}
export function isReady(){return !!model&&!!GEMINI_API_KEY;}
export{VALID_MODEL as VALID_MODEL_NAME,initGemini};
