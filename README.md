# Backstage — Humor Admin

Separate Next.js admin application for `JiaZe-create/Hello-World`, sharing Supabase project `dmqvghurutqgwfnlmflj`.

## October 26 assignment

- Read profiles, ratings, AI media, prompt chains and ordered steps.
- Read and update prompt chain mix weights and availability.
- Create, read, update and delete terms, AI generation examples, LLM models, LLM providers, signup domains and whitelisted email addresses.
- Read generation requests and saved LLM responses from the existing `generations` records, including prompts, outputs, status and token usage.
- Search, pagination, record details, relationship selectors, validation, pending states, duplicate/reference error handling and typed deletion confirmation.
- Existing media creation, editing and deletion retained.
- No image-upload feature exists in either app; image CRUD is not applicable.

All admin pages and actions require a current Google identity and a fresh `profiles.is_superadmin === true` lookup. The database independently enforces superadmin access through RLS. Ordinary users cannot promote themselves. The app uses a user-scoped publishable/anon client, never a service-role key.

## Configuration scope

The additive `supabase/admin-collections.sql` migration was applied on October 26, 2026. The three chain templates document the existing dry, chaotic and wholesome prompts in the rating app's source. No synthetic request or response history is inserted.

Mix weights, model/provider metadata, example records and allowlist records are editable administration data. The existing rating app continues to use its user-selected tone and environment-configured model. Allowlist CRUD does not install an Auth hook, restrict existing Google sign-ins or grant administrator privileges. Runtime integration of those settings is outside this assignment's requested read/update/CRUD operations.

## Run and verify

Copy `.env.example` to `.env.local` and supply the project URL and publishable/anon key. Never commit credentials.

```sh
npm ci
npm run build
npm run lint
npm test
```

Validation on October 26:

- Production build and TypeScript passed.
- 17 tests passed, including authorization before mutations, read-only resource enforcement, field allowlisting, malformed values and protected fields.
- Live transactional database checks passed: authorized CRUD on all six editable collections, mix updates, chain and step reads, nonadmin read/write denial, anonymous grants and self-promotion prevention. Test changes were rolled back.
- All nine added tables have RLS; read-only chains and steps have SELECT grants only, and mix updates are limited to weight/enabled.
- Real interactive Google OAuth and signed-in browser CRUD still require an administrator session; SQL tests do not substitute for that browser check.

The older `supabase/admin-setup.sql` documents the original setup already present in the live database. Do not rerun migrations blindly. The collection migration should be applied only once.

## Deployment

Repository: `JiaZe-create/humor-admin`, branch `main`, Vercel project `humor-admin`, team `humor-project4`.
Rating app: `JiaZe-create/Hello-World`, Vercel project `hello-world`.
Deployment protection was verified off on both projects on October 26. Application-level Google and superadmin gates remain required. Obtain commit-specific deployment URLs from Vercel for submission; dashboard and branch aliases are not commit-specific links.
