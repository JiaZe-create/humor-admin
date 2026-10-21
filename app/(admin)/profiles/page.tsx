import {requireAdmin} from '@/lib/auth';
import {pageNumber} from '@/lib/data';
import {Title,Pager,DateLabel} from '@/app/components';
export default async function Profiles({searchParams}:{searchParams:Promise<{page?:string}>}) {
 const {db}=await requireAdmin();const page=pageNumber((await searchParams).page);
 const {data,count,error}=await db.from('profiles').select('id,first_name,last_name,created_at,is_superadmin',{count:'exact'}).order('created_at',{ascending:false}).order('id').range((page-1)*25,page*25-1);
 if(error)throw new Error('Profiles could not load.');
 return <><Title label="PEOPLE" title="The community." description="Read registered profiles and identify administrative access."/><section className="panel table-wrap"><table><thead><tr><th>Profile</th><th>User ID</th><th>Access</th><th>Joined (UTC)</th></tr></thead><tbody>{data?.map(p=><tr key={p.id}><td><b>{[p.first_name,p.last_name].filter(Boolean).join(' ')||'Unnamed profile'}</b></td><td><code>{p.id}</code></td><td><span className="badge">{p.is_superadmin?'Superadmin':'Member'}</span></td><td><DateLabel value={p.created_at}/></td></tr>)}</tbody></table>{!data?.length&&<p className="empty">No profiles on this page.</p>}<Pager page={page} count={count??0} base="/profiles"/></section></>;
}
