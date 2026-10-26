import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireAdmin} from '@/lib/auth';
import {resourceFor} from '@/lib/resources';
import {pageNumber} from '@/lib/data';
import {Title,Pager} from '@/app/components';
export default async function ResourceList({params,searchParams}:{params:Promise<{resource:string}>;searchParams:Promise<{q?:string;page?:string;deleted?:string}>}){
 const {db}=await requireAdmin();const {resource}=await params;const r=resourceFor(resource);if(!r)notFound();
 const s=await searchParams;const q=(s.q??'').trim().slice(0,150);const page=pageNumber(s.page);
 let query=db.from(r.table).select(['id',...r.columns].join(','),{count:'exact'}).order('created_at',{ascending:false}).order('id').range((page-1)*25,page*25-1);
 if(q)query=query.ilike(r.search,`%${q.replace(/[\\%_]/g,'\\$&')}%`);
 if(r.responseOnly)query=query.not('caption','is',null);
 const {data,error,count}=await query;
 return <><Title label="ADMIN COLLECTIONS" title={r.title} description={r.description}/><div className="toolbar"><form><label className="sr-only" htmlFor="search">Search {r.title}</label><input id="search" name="q" placeholder={`Search ${r.search.replaceAll('_',' ')}`} defaultValue={q}/><button>Search</button><Link className="button secondary" href={`/manage/${resource}`}>Reset</Link></form>{r.mode==='crud'&&<Link className="button" href={`/manage/${resource}/new`}>+ Create record</Link>}</div>{s.deleted==='1'&&<p role="status" className="success">Record deleted.</p>}{error?<p role="alert" className="notice">Records could not load. Refresh and try again.</p>:<section className="panel"><div className="table-wrap"><table><thead><tr>{r.columns.map(c=><th key={c}>{c.replaceAll('_',' ')}</th>)}<th>Details</th></tr></thead><tbody>{((data??[]) as unknown as Record<string,unknown>[]).map(row=><tr key={String(row.id)}>{r.columns.map(c=><td className="resource-cell" key={c}>{typeof row[c]==='boolean'?(row[c]?'Yes':'No'):String(row[c]??'—')}</td>)}<td><Link className="record-link" href={`/manage/${resource}/${row.id}`}>{r.mode==='read'?'View':'View / edit'} →</Link></td></tr>)}</tbody></table></div>{!data?.length&&<p className="empty">{q?'No records match your search.':'No records yet.'}</p>}<Pager page={page} count={count??0} base={`/manage/${resource}?q=${encodeURIComponent(q)}`}/></section>}</>;
}
