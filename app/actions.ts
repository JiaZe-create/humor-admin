 'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireAdmin} from '@/lib/auth';
import {createClient} from '@/lib/supabase/server';
import {parseMedia,UUID} from '@/lib/validation';
export type FormState={error?:string};
export async function signOut() {const db=await createClient();await db.auth.signOut();redirect('/login');}
export async function saveMedia(id:string|null,_previous:FormState,form:FormData):Promise<FormState> {
 const {db,user}=await requireAdmin();
 let values;try{values=parseMedia(form);}catch(error){return {error:error instanceof Error?error.message:'Invalid input.'};}
 if(id&&!UUID.test(id))return {error:'Invalid media ID.'};
 let target=id;
 if(!target) {
   target=crypto.randomUUID();
   const {scene,prompt,style,model}=values;
   const result=await db.from('generations').insert({id:target,user_id:user.id,scene,prompt,style,model});
   if(result.error)return {error:result.error.code==='P0001'?result.error.message:'Could not create media. Check the database setup and try again.'};
 }
 const {data,error}=await db.from('generations').update(values).eq('id',target).select('id').single();
 if(error||!data)return {error:id?'Changes could not be saved. Refresh and try again.':'A pending draft was created, but publication failed. Return to AI media to edit that draft; do not resubmit.'};
 revalidatePath('/','layout');redirect(`/media/${target}?saved=1`);
}
export async function deleteMedia(id:string,_previous:FormState,form:FormData):Promise<FormState> {
 const {db}=await requireAdmin();
 if(!UUID.test(id)||form.get('confirmation')!=='DELETE')return {error:'Type DELETE to confirm.'};
 const {data,error}=await db.from('generations').delete().eq('id',id).select('id').single();
 if(error||!data)return {error:'Deletion failed or this caption no longer exists. Refresh to check.'};
 revalidatePath('/','layout');redirect('/media');
}
