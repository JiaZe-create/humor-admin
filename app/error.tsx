 'use client';
export default function ErrorPage({reset}:{reset:()=>void}) {return <main className="login"><section className="panel"><h1>We couldn’t load this view.</h1><p>No data was displayed. Check the database connection and try again.</p><button onClick={reset}>Try again</button><a href="/login">Return to sign in</a></section></main>}
