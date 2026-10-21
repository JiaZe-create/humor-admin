import 'server-only';
import { requireAdmin } from './auth';
export type Media = {id:string;user_id:string;scene:string;prompt:string;style:string;model:string;status:string;caption:string|null;created_at:string;upvotes:number;downvotes:number;score:number;estimated_cost_usd:number|null};
export const columns='id,user_id,scene,prompt,style,model,status,caption,created_at,upvotes,downvotes,score,estimated_cost_usd';
export function pageNumber(value?:string) { const n=Number(value); return Number.isInteger(n)&&n>0?Math.min(n,100000):1; }
export async function dashboard() {
 const {db}=await requireAdmin();
 const count=(table:string)=>db.from(table).select('id',{count:'exact',head:true});
 const [profiles,media,votes,up,failed,complete,unvoted,recent,top]=await Promise.all([
 count('profiles'),count('generations'),count('caption_votes'),db.from('caption_votes').select('id',{count:'exact',head:true}).eq('value',1),
 db.from('generations').select('id',{count:'exact',head:true}).eq('status','failed'),
 db.from('generations').select('id',{count:'exact',head:true}).eq('status','complete'),
 db.from('generations').select('id',{count:'exact',head:true}).eq('status','complete').eq('upvotes',0).eq('downvotes',0),
 db.from('generations').select(columns).order('created_at',{ascending:false}).limit(200),
 db.from('generations').select(columns).eq('status','complete').order('score',{ascending:false}).limit(3)
 ]);
 if([profiles,media,votes,up,failed,complete,unvoted,recent,top].some(r=>r.error)) throw new Error('Dashboard data could not load.');
 return {profiles:profiles.count??0,media:media.count??0,votes:votes.count??0,up:up.count??0,failed:failed.count??0,complete:complete.count??0,unvoted:unvoted.count??0,recent:(recent.data??[]) as Media[],top:(top.data??[]) as Media[]};
}
