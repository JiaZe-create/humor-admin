import {notFound} from 'next/navigation';
import {requireAdmin} from '@/lib/auth';
import {columns,type Media} from '@/lib/data';
import {UUID} from '@/lib/validation';
import {Title} from '@/app/components';
import MediaForm from '@/app/media-form';
export default async function EditMedia({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{saved?:string}>}) {
 const {db}=await requireAdmin();const {id}=await params;if(!UUID.test(id))notFound();
 const {data,error}=await db.from('generations').select(columns).eq('id',id).maybeSingle();if(error)throw new Error('Could not load caption.');if(!data)notFound();
 const {saved}=await searchParams;
 return <><Title label="CONTENT LIBRARY / EDIT" title="Refine the punchline." description={`Media ID: ${id}`}/>{saved&&<p role="status" className="success">Changes saved.</p>}<MediaForm media={data as Media}/></>;
}
