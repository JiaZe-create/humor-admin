export type Field = {name:string; label:string; type?:'text'|'textarea'|'number'|'checkbox'|'email'|'domain'|'uuid'; required?:boolean; max?:number; min?:number; relation?:string};
export type Resource = {table:string; title:string; description:string; mode:'read'|'edit'|'crud'; fields:Field[]; columns:string[]; search:string; responseOnly?:boolean};
const text=(name:string,label:string,max=200,required=true):Field=>({name,label,max,required});
const area=(name:string,label:string,max=6000,required=true):Field=>({name,label,type:'textarea',max,required});
const enabled:Field={name:'enabled',label:'Enabled',type:'checkbox'};
const ref=(name:string,label:string,relation:string,required=true):Field=>({name,label,type:'uuid',relation,required});
export const resources:Record<string,Resource>={
 'prompt-chains':{table:'prompt_chains',title:'Prompt chains',description:'Documented caption workflows. Open a chain to inspect its instructions.',mode:'read',search:'name',columns:['name','description','created_at'],fields:[]},
 'prompt-chain-steps':{table:'prompt_chain_steps',title:'Prompt chain steps',description:'Ordered instructions and model references for each chain.',mode:'read',search:'name',columns:['name','chain_id','step_order','prompt_template','model_id'],fields:[]},
 'prompt-chain-mix':{table:'prompt_chain_mix',title:'Prompt chain mix',description:'Manage saved chain weights and availability. The caption app currently uses the tone selected by its user; these weights are configuration for future automatic selection.',mode:'edit',search:'name',columns:['name','chain_id','weight','enabled'],fields:[{name:'weight',label:'Relative weight',type:'number',min:0,max:100000,required:true},enabled]},
 terms:{table:'terms',title:'Terms',description:'Maintain the vocabulary and definitions used by your team.',mode:'crud',search:'term',columns:['term','definition','created_at'],fields:[text('term','Term'),area('definition','Definition',4000)]},
 'generation-requests':{table:'generations',title:'Generation requests',description:'Real requests from the caption app, including pending and failed requests.',mode:'read',search:'scene',columns:['scene','status','style','model','created_at'],fields:[]},
 'generation-examples':{table:'ai_generation_examples',title:'AI generation examples',description:'Curate prompt and output examples for future generation workflows.',mode:'crud',search:'title',columns:['title','prompt','output','model_id'],fields:[text('title','Title'),area('prompt','Example prompt'),area('output','Example output'),ref('model_id','Model','llm-models',false)]},
 'llm-models':{table:'llm_models',title:'LLM models',description:'Manage model metadata. API credentials stay in deployment settings.',mode:'crud',search:'name',columns:['name','model_key','provider_id','enabled'],fields:[text('name','Display name'),text('model_key','Model identifier'),ref('provider_id','Provider','llm-providers'),enabled]},
 'llm-providers':{table:'llm_providers',title:'LLM providers',description:'Manage provider names and descriptions.',mode:'crud',search:'name',columns:['name','description','enabled'],fields:[text('name','Provider name'),area('description','Description',2000,false),enabled]},
 'llm-responses':{table:'generations',title:'LLM responses',description:'Actual saved model outputs and token usage. Requests without an output appear under Generation requests.',mode:'read',search:'caption',responseOnly:true,columns:['caption','model','status','input_tokens','output_tokens','created_at'],fields:[]},
 'allowed-signup-domains':{table:'allowed_signup_domains',title:'Allowed signup domains',description:'Manage the domain allowlist. These records do not change the existing Google sign-in policy or grant superadmin access.',mode:'crud',search:'domain',columns:['domain','enabled','created_at'],fields:[{name:'domain',label:'Domain (e.g. columbia.edu)',type:'domain',max:253,required:true},enabled]},
 'whitelisted-emails':{table:'whitelisted_email_addresses',title:'Whitelisted email addresses',description:'Manage individual email allowlist records. These records do not grant superadmin access or change the existing sign-in policy.',mode:'crud',search:'email',columns:['email','enabled','created_at'],fields:[{name:'email',label:'Email address',type:'email',max:254,required:true},enabled]},
};
export function resourceFor(key:string):Resource|undefined {return Object.hasOwn(resources,key)?resources[key]:undefined;}
export const ID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function parseResource(resource:Resource,form:FormData) {
 const values:Record<string,string|number|boolean|null>={};
 for(const f of resource.fields){
  if(f.type==='checkbox'){values[f.name]=form.get(f.name)==='on';continue;}
  const entry=form.get(f.name); if(entry!==null&&typeof entry!=='string')throw new Error(`${f.label} must be text.`);
  let value=String(entry??'').trim();
  if(!value){if(f.required)throw new Error(`${f.label} is required.`);values[f.name]=null;continue;}
  if(f.type==='number'){const number=Number(value);if(!Number.isFinite(number)||number<(f.min??0)||number>(f.max??100000))throw new Error(`${f.label} must be between ${f.min??0} and ${f.max??100000}.`);values[f.name]=number;continue;}
  if(value.length>(f.max??6000))throw new Error(`${f.label} is too long.`);
  if(f.type==='uuid'&&!ID.test(value))throw new Error(`Choose a valid ${f.label.toLowerCase()}.`);
  if(f.type==='email'||f.type==='domain')value=value.toLowerCase();
  if(f.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw new Error('Enter a valid email address.');
  if(f.type==='domain'&&!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(value))throw new Error('Enter only a domain, without @, a URL, or a path.');
  values[f.name]=value;
 }
 return values;
}
