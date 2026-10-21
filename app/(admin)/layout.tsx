import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { signOut } from '@/app/actions';
export const dynamic = 'force-dynamic';
export default async function AdminLayout({children}:{children:React.ReactNode}) {
 const {user} = await requireAdmin();
 return <div className="shell"><aside><Link className="brand" href="/">b<span>Backstage</span></Link><p className="eyebrow">THE HUMOR CONTROL ROOM</p><nav aria-label="Admin navigation"><Link href="/">◈ Overview</Link><Link href="/media">▤ AI media</Link><Link href="/profiles">◉ Profiles</Link><Link href="/ratings">↕ Ratings</Link></nav><div className="account"><span className="badge">Superadmin</span><p>{user.email}</p><form action={signOut}><button className="secondary">Sign out</button></form></div></aside><main><header><span>WORKSPACE / HUMOR LAB</span><span className="badge">Private workspace</span></header>{children}</main></div>;
}
