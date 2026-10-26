'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireAdmin} from '@/lib/auth';
import {resourceFor,parseResource,ID} from '@/lib/resources';
export type ResourceState={error?:string};
function failure(code?:string){return code==='23505'?'A record with that value already exists.':code==='23503'?'This record references a missing record or is still used elsewhere. Update the related records first.':code==='23514'?'A field does not meet the database constraints.':'The change could not be saved. Refresh and try again.';}
export async function saveResource(key:string,id:string|null,_state:ResourceState,form:FormData):Promise<ResourceState>{
 const {db}=await requireAdmin();
 const r=resourceFor(key);
 if(!r||r.mode==='read'||(!id&&r.mode!=='crud')||(id&&!ID.test(id)))return {error:'This operation is not allowed.'};
 let values;try{values=parseResource(r,form);}catch(e){return {error:e instanceof Error?e.message:'Invalid fields.'};}
 const result=id?await db.from(r.table).update(values).eq('id',id).select('id').single():await db.from(r.table).insert(values).select('id').single();
 if(result.error||!result.data)return {error:failure(result.error?.code)};
 revalidatePath('/manage','layout');redirect(`/manage/${key}/${result.data.id}?saved=1`);
}
export async function deleteResource(key:string,id:string,_state:ResourceState,form:FormData):Promise<ResourceState>{
 const {db}=await requireAdmin();
 const r=resourceFor(key);
 if(!r||r.mode!=='crud'||!ID.test(id))return {error:'This operation is not allowed.'};
 if(form.get('confirmation')!=='DELETE')return {error:'Type DELETE to confirm permanent deletion.'};
 const result=await db.from(r.table).delete().eq('id',id).select('id').single();
 if(result.error||!result.data)return {error:failure(result.error?.code)};
 revalidatePath('/manage','layout');redirect(`/manage/${key}?deleted=1`);
}
