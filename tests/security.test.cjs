const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, mocks) {
 const exports = {};
 const code = ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,FormData,crypto,require:(name)=>{if(name in mocks)return mocks[name];throw new Error(`Unexpected import ${name}`);}});
 return exports;
}
function fixture(user, profile, dbError=null) {
 let reads=0;
 const db={auth:{getUser:async()=>({data:{user},error:null})},from:()=>{reads++;return {select:()=>({eq:()=>({single:async()=>({data:profile,error:dbError})})})}}};
 const auth=load('lib/auth.ts',{'server-only':{},'next/navigation':{redirect:(url)=>{throw new Error(`REDIRECT ${url}`)}},'./supabase/server':{createClient:async()=>db}});
 return {...auth,reads:()=>reads};
}
const google={id:'user-a',app_metadata:{provider:'google'}};
test('anonymous users are denied before profile access',async()=>{const f=fixture(null,null);await assert.rejects(f.requireAdmin(),/REDIRECT \/login$/);assert.equal(f.reads(),0)});
test('non-Google users are denied even with an admin flag',async()=>{const f=fixture({...google,app_metadata:{provider:'email'}},{is_superadmin:true});await assert.rejects(f.requireAdmin(),/error=google/);assert.equal(f.reads(),0)});
for(const flag of [false,null,undefined,'true'])test(`flag ${String(flag)} does not authorize`,async()=>{await assert.rejects(fixture(google,{is_superadmin:flag}).requireAdmin(),/error=access/)});
test('database errors fail closed',async()=>{await assert.rejects(fixture(google,{is_superadmin:true},{message:'unavailable'}).requireAdmin(),/error=access/)});
test('Google user with a true database flag is allowed',async()=>{assert.equal((await fixture(google,{is_superadmin:true}).requireAdmin()).user.id,'user-a')});
test('save and delete authorize before any data access',async()=>{
 let checks=0;
 const actions=load('app/actions.ts',{'next/navigation':{},'next/cache':{},'@/lib/auth':{requireAdmin:async()=>{checks++;throw new Error('DENIED')}},'@/lib/supabase/server':{},'@/lib/validation':{}});
 await assert.rejects(actions.saveMedia(null,{},new FormData()),/DENIED/);
 await assert.rejects(actions.deleteMedia('bad-id',{},new FormData()),/DENIED/);
 assert.equal(checks,2);
});
const {parseMedia}=load('lib/validation.ts',{});
function form(extra={}){const f=new FormData();for(const [k,v]of Object.entries({scene:'A cat at a meeting',prompt:'Write a dry caption about a cat',style:'dry',model:'source-model',status:'complete',caption:'This could have been a meow.',...extra}))f.set(k,v);return f;}
test('empty completed captions are rejected',()=>assert.throws(()=>parseMedia(form({caption:''})),/Completed media/));
test('oversized captions and unknown statuses are rejected',()=>{assert.throws(()=>parseMedia(form({caption:'x'.repeat(401)})),/Completed media/);assert.throws(()=>parseMedia(form({status:'published'})),/valid status/)});
test('valid content is accepted and protected fields are excluded',()=>{const value=parseMedia(form({upvotes:'100',is_superadmin:'true',user_id:'someone-else'}));assert.equal(value.caption,'This could have been a meow.');assert.equal(value.upvotes,undefined);assert.equal(value.is_superadmin,undefined);assert.equal(value.user_id,undefined)});
const resourcesModule=load('lib/resources.ts',{});
const {resourceFor,parseResource}=resourcesModule;
test('resource lookup denies prototype keys and arbitrary tables',()=>{assert.equal(resourceFor('__proto__'),undefined);assert.equal(resourceFor('profiles'),undefined);assert.equal(resourceFor('constructor'),undefined)});
test('resource validation rejects malformed domains, emails, weights and references',()=>{
 for(const [key,values] of [['allowed-signup-domains',{domain:'https://columbia.edu'}],['whitelisted-emails',{email:'bad@'}],['prompt-chain-mix',{weight:'Infinity'}],['prompt-chain-mix',{weight:'-1'}],['llm-models',{name:'model',model_key:'key',provider_id:'bad'}]]){const f=new FormData();for(const [k,v] of Object.entries(values))f.set(k,v);assert.throws(()=>parseResource(resourceFor(key),f));}
});
test('resource validation normalizes allowlists and ignores injected protected fields',()=>{const f=new FormData();f.set('domain','Columbia.EDU');f.set('enabled','on');f.set('id','attacker');f.set('is_superadmin','true');const v=parseResource(resourceFor('allowed-signup-domains'),f);assert.equal(v.domain,'columbia.edu');assert.equal(v.enabled,true);assert.equal(v.id,undefined);assert.equal(v.is_superadmin,undefined)});
test('resource actions authorize before parsing or querying',async()=>{let checks=0;const a=load('app/resource-actions.ts',{'next/navigation':{},'next/cache':{},'@/lib/resources':resourcesModule,'@/lib/auth':{requireAdmin:async()=>{checks++;throw new Error('DENIED')}}});await assert.rejects(a.saveResource('terms',null,{},new FormData()),/DENIED/);await assert.rejects(a.deleteResource('terms','bad',{},new FormData()),/DENIED/);assert.equal(checks,2)});
test('read-only and mix creation/deletion cannot be bypassed through server actions',async()=>{const a=load('app/resource-actions.ts',{'next/navigation':{},'next/cache':{},'@/lib/resources':resourcesModule,'@/lib/auth':{requireAdmin:async()=>({db:{from:()=>{throw new Error('Unexpected DB mutation')}}})}});for(const key of ['prompt-chains','prompt-chain-steps','generation-requests','llm-responses','prompt-chain-mix','profiles','__proto__']){assert.match((await a.saveResource(key,null,{},new FormData())).error,/not allowed/);assert.match((await a.deleteResource(key,'00000000-0000-0000-0000-000000000000',{},new FormData())).error,/not allowed/);}});
