'use client';
import {useActionState} from 'react';
import {saveResource,deleteResource} from './resource-actions';
import type {Field} from '@/lib/resources';
export function ResourceForm({resourceKey,id,fields,values={},options={}}:{resourceKey:string;id:string|null;fields:Field[];values?:Record<string,unknown>;options?:Record<string,{id:string;name:string}[]>}){
 const [state,action,pending]=useActionState(saveResource.bind(null,resourceKey,id),{});
 return <form action={action} className="panel editor">{fields.map(f=><label key={f.name}>{f.label}{f.required?' *':''}{f.type==='checkbox'?<input name={f.name} type="checkbox" defaultChecked={values[f.name]===true||(!id&&values[f.name]===undefined)}/>:f.relation?<select name={f.name} required={f.required} defaultValue={String(values[f.name]??'')}><option value="">Select {f.label.toLowerCase()}</option>{(options[f.name]??[]).map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select>:f.type==='textarea'?<textarea name={f.name} required={f.required} maxLength={f.max} defaultValue={String(values[f.name]??'')}/>:<input name={f.name} type={f.type==='number'?'number':f.type==='email'?'email':'text'} step={f.type==='number'?'any':undefined} min={f.min} max={f.type==='number'?f.max:undefined} maxLength={f.type!=='number'?f.max:undefined} required={f.required} defaultValue={String(values[f.name]??'')}/>}</label>)}{state.error&&<p role="alert" className="notice">{state.error}</p>}<button disabled={pending}>{pending?'Saving…':id?'Save changes':'Create record'}</button></form>;
}
export function ResourceDelete({resourceKey,id}:{resourceKey:string;id:string}){
 const [state,action,pending]=useActionState(deleteResource.bind(null,resourceKey,id),{});
 return <form action={action} className="panel danger"><h2>Delete record</h2><p>This permanently deletes this record. Referenced providers and models cannot be deleted until their related records are updated.</p><label>Type DELETE to confirm<input name="confirmation" required pattern="DELETE" autoComplete="off"/></label>{state.error&&<p role="alert">{state.error}</p>}<button disabled={pending}>{pending?'Deleting…':'Delete permanently'}</button></form>;
}
