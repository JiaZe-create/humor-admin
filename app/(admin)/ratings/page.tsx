import Link from 'next/link';
import {requireAdmin} from '@/lib/auth';
import {pageNumber} from '@/lib/data';
import {Title,Pager,DateLabel} from '@/app/components';
export default async function Ratings({searchParams}:{searchParams:Promise<{page?:string;value?:string}>}) {
 const {db}=await requireAdmin();const params=await searchParams;const page=pageNumber(params.page);const value=['1','-1'].includes(params.value??'')?params.value:'';
 let query=db.from('caption_votes').select('id,user_id,generation_id,value,created_at',{count:'exact'}).order('created_at',{ascending:false}).order('id');if(value)query=query.eq('value',Number(value));
 const {data,count,error}=await query.range((page-1)*25,page*25-1);if(error)throw new Error('Ratings could not load.');
 return <><Title label="AUDIENCE SIGNALS" title="Every reaction counts." description="Read individual ballots. Vote totals remain controlled by the database."/><div className="toolbar"><Link href="/ratings">All ratings</Link><Link href="/ratings?value=1">↑ Upvotes</Link><Link href="/ratings?value=-1">↓ Downvotes</Link></div><section className="panel table-wrap"><table><thead><tr><th>Rating</th><th>Voter ID</th><th>Media</th><th>Created (UTC)</th></tr></thead><tbody>{data?.map(v=><tr key={v.id}><td><span className={v.value===1?'positive':'negative'}>{v.value===1?'↑ Upvote':'↓ Downvote'}</span></td><td><code>{v.user_id}</code></td><td><Link href={`/media/${v.generation_id}`}>Open caption ↗</Link></td><td><DateLabel value={v.created_at}/></td></tr>)}</tbody></table>{!data?.length&&<p className="empty">No ratings match this filter.</p>}<Pager page={page} count={count??0} base={`/ratings?value=${value}`}/></section></>;
}
