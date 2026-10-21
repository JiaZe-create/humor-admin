# Backstage — Humor Admin (Week 6)

A separate Next.js admin application for the existing Humor Lab Supabase database.

## Implementation

- Google sign-in using the existing Supabase authentication provider.
- Fail-closed, fresh `profiles.is_superadmin === true` checks in Proxy, every protected page/data function, and every content mutation.
- Dashboard: exact community/media/ballot totals, approval rate, unvoted captions, failed generations, top captions, and explicitly labeled recent-200 activity/divisiveness samples.
- Paginated read-only profiles and individual ratings; upvote/downvote filtering.
- Media scene search, status filters, create/import AI-generated captions, edit, and confirmed permanent deletion.
- Uses a user-scoped publishable/anon Supabase client. No service-role key.
- Responsive UI, input validation, error states, and pending submit controls.

## Current status (2026-10-21)

Source prepared for the new `JiaZe-create/humor-admin` GitHub repository. NOT deployed; no Vercel project has been created.
The database SQL has NOT been applied. It is based on the existing repository's Assignment 4 SQL, not a live schema inspection.

Access blockers:
1. The Vercel connection cannot access team `humor-project4` (`team_V4v39xG3vskfMYgXbDWpdY1l`). API returned 403 requesting team consent. CLI has no existing credentials.
2. Supabase database inspection failed with password authentication errors for both `postgres` and `supabase_read_only_user`, despite the project reporting ACTIVE_HEALTHY.
3. Resolved: the user created `JiaZe-create/humor-admin`; repository access is verified.

No existing rating-app code or production database data was changed.

## Setup after access is restored

1. Inspect the live schema, RLS, grants, triggers, and advisors for Supabase project `dmqvghurutqgwfnlmflj`. Compare with `supabase/admin-setup.sql` before applying it transactionally.
2. Sign in using the intended Google account. In Supabase SQL Editor, identify its exact auth UUID, then set only that profile's `is_superadmin` to true. The SQL file contains the bootstrap queries. Do not grant the first arbitrary visitor admin access.
3. Create a separate GitHub repository `humor-admin`; commit these sources and the lockfile. Do not upload `.env.local`, `.next`, or `node_modules`.
4. Create the `humor-admin` Vercel project under `humor-project4`, connected to the new repository.
5. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Vercel for production and preview. These should refer to the same database as the rating app. No AI API key is needed: the admin form imports AI-generated content and records its model/prompt.
6. Add the admin production and intended commit-specific deployment URLs ending in `/auth/callback` to Supabase's redirect URL allowlist. Keep the existing rating app Site URL and redirect URLs. Supabase handles Google's provider callback, so the existing Google client can be reused.
7. Deploy, then turn off Vercel Deployment Protection for the admin app and confirm it is off for the rating app. Application-level Google and superadmin gates must remain enabled.
8. Verify the flows below before submission.

## Run locally

Copy `.env.example` to `.env.local` and fill in the publishable/anon key locally. Then:

```sh
npm ci
npm run dev
```

Build and focused security tests:

```sh
npm run build
node --test tests/security.test.cjs
```

## Verification

- Production build and TypeScript: PASS on Next.js 16.3.5.
- 12 focused tests: PASS. Covers anonymous access, non-Google identity, false/missing/string role values, database failure, valid admin identity, mutation authorization before data access, invalid media, and ignoring protected input fields.
- Local production HTTP checks: login returns 200; seven admin/unknown routes redirect anonymous requests to `/login`. Tested with placeholder public configuration, not a live login.
- These tests mock the authentication boundary. They do not prove live RLS or Google OAuth works.
- Live database CRUD, real Google OAuth, normal-user denial, role revocation, RLS self-promotion denial, deletion/count consistency, and browser visual QA remain unverified because the required account/database access is blocked.

Before submission, test logged-out access to every route and direct mutation; a normal Google user must be denied; an administrator must be able to read all three tables and create/edit/delete a disposable caption. Verify changing the admin flag to false immediately denies future access. Attempt changing `is_superadmin` as an ordinary user through the Data API and confirm permission denial. Check ratings/owner workflows in the original app remain intact.

The creation form first inserts a pending draft, then publishes/updates it. If the second request fails, the UI explains that the draft remains and should be edited instead of resubmitted. Existing generation quotas are retained. Deleting media also deletes its ratings through the existing foreign key; the UI explicitly warns of this.

## Feedback and submission

No actual Product Manager or Feedback Group feedback was supplied. Do not claim feedback implementation without obtaining it; this is 50% of the assignment.
The existing app remains `JiaZe-create/Hello-World`. Its observed HEAD is `a9f90c6e4284a9775dcd3ed245f121f3381fc20c`, with a successful Vercel GitHub status pointing to:
https://vercel.com/humor-project4/hello-world/9kG8cpfQ8iCR1PWjFNsmobYTf5nx
That is the deployment dashboard, NOT a submission URL. Retrieve and verify its immutable `.vercel.app` URL after restoring Vercel access. Submit that URL and the new admin app's latest commit-specific URL. Neither submission was made in this session.
