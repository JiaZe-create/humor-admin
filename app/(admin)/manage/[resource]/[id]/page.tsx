import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireAdmin} from '@/lib/auth';
import {resourceFor,ID} from '@/lib/resources';
import {Title} from '@/app/components';
import {ResourceForm,ResourceDelete} from '@/app/resource-form';
export default async function ResourceDetail({params,searchParams}:{params:Promise<{resource:string;id:string}>;searchParams:Promise<{saved?:string}>}){
 const {db}=await requireAdmin();const {resource,id}=await params;const r=resourceFor(resource);if(!r)notFound();
 const isNew=id==='new';if((isNew&&r.mode!=='crud')||(!isNew&&!ID.test(id)))notFound();
 let values:Record<string,unknown>={};
 if(!isNew){const {data,error}=await db.from(r.table).select('*').eq('id',id).maybeSingle();if(error)throw new Error('Record could not load.');if(!data||(r.responseOnly&&data.caption===null))notFound();values=data;}
 const options:Record<string,{id:string;name:string}[]>={};
 await Promise.all(r.fields.filter(f=>f.relation).map(async f=>{const related=resourceFor(f.relation!)!;const {data,error}=await db.from(related.table).select('id,name').order('name').limit(1000);if(error)throw new Error('Related records could not load.');options[f.name]=(data??[]) as {id:string;name:string}[];}));
 const s=await searchParams;
 return <><Title label="ADMIN COLLECTIONS" title={`${isNew?'Create · ':''}${r.title}`} description={r.description}/><p><Link className="record-link" href={`/manage/${resource}`}>← Back to {r.title.toLowerCase()}</Link></p>{s.saved==='1'&&<p role="status" className="success">Changes saved.</p>}{!isNew&&<section className="panel editor"><h2>Record details</h2><dl className="record-details">{Object.entries(values).map(([key,value])=><div key={key}><dt>{key.replaceAll('_',' ')}</dt><dd>{typeof value==='boolean'?(value?'Yes':'No'):String(value??'—')}</dd></div>)}</dl>{resource==='prompt-chains'&&<Link className="record-link" href="/manage/prompt-chain-steps">View prompt chain steps →</Link>}{r.table==='generations'&&<Link className="record-link" href={`/media/${id}`}>View AI media →</Link>}</section>}{r.mode!=='read'&&<ResourceForm resourceKey={resource} id={isNew?null:id} fields={r.fields} values={values} options={options}/>} {!isNew&&r.mode==='crud'&&<ResourceDelete resourceKey={resource} id={id}/>}</>;
}
