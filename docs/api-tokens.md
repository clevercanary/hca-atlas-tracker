# API tokens

Scripts and agents (e.g. Claude Code) can't sign in with Google, and a copied
session cookie expires minutes after the browser stops refreshing it. An API
token lets them call the tracker's API as you instead.

## What a token can do

- **Acts as you.** Only your email is taken from the token. Your role and
  atlas access are looked up on every request, so a role change applies to the
  token immediately, and disabling your account stops it working.
- **Read-only.** A token can call any `GET` route, plus
  `POST /api/atlases/{atlasId}/files/{fileId}/presigned-url`, which only signs
  a download URL. Every other method returns `403`.
- **Expires after 30 days.** After that, create a new one.

## Getting a token

1. Ask an admin to enable API tokens for your account (see
   [Granting the permission](#granting-the-permission)). You must be a content
   admin.
2. Open `/api-token` in the tracker. It isn't linked from the navigation.
3. Click **Create token**, then copy it. It's shown only once: reloading the
   page discards it, and creating another doesn't invalidate the first.

## Using a token

Store the token outside your code, e.g. as `HCA_TRACKER_API_TOKEN` in a
gitignored `.env` file, and send it in an `Authorization` header:

```bash
curl -H "Authorization: Bearer $HCA_TRACKER_API_TOKEN" \
  https://<tracker-host>/api/atlases
```

For an agent, have it run scripts that read the token from the environment, so
the agent itself never sees the token.

A request with an `Authorization` header is authenticated by that header
alone, never by a session cookie sent alongside it. On a `401`, the token is
malformed, expired, or belongs to a user who is no longer active: create a new
one on `/api-token`.

## Revoking tokens

Tokens aren't stored, so a single token can't be revoked. To revoke tokens
before they expire, rotate `NEXTAUTH_SECRET`. That revokes **every** API token
and also signs everyone out of the tracker.

To cut off one person's access without that, disable their account. Their
tokens then stop working at once, because the user is looked up on every
request.

Other changes don't revoke tokens:

- **Changing their role** only narrows what their tokens can read to what the
  new role allows. A user demoted to stakeholder can still read every route a
  stakeholder can, such as `/api/atlases`.
- **Turning off `can_issue_api_tokens`** stops them creating new tokens, but
  tokens they already have keep working until they expire.

## Granting the permission

Issuing tokens needs both the `CONTENT_ADMIN` role and the
`can_issue_api_tokens` flag on the user. There's no UI for the flag yet, so set
it in SQL:

```sql
UPDATE hat.users SET can_issue_api_tokens = true WHERE email = '<email>';
```

## How it works

- `app/services/api-tokens.ts` issues and verifies tokens. It's the only module
  that touches `next-auth/jwt`. Tokens are encrypted JWTs made with NextAuth's
  `encode` / `decode`, keyed by `NEXTAUTH_SECRET`. They use their own salt
  (`"hat-api-token"`), so a session cookie can't be used as an API token or the
  reverse, and they carry a `scope: "api-read"` claim.
- `app/utils/api-handler.ts` reads the `Authorization` header in
  `loadProvidedUserProfile`. `handler` and `handleByMethod` verify the token on
  every route, including ones that need no authentication, and refuse non-GET
  methods unless the route includes the `bearerAllowed` middleware.
- `POST /api/me/api-token` issues tokens. It only issues a token for the
  signed-in user, and it refuses requests made with an API token, so a token
  can't be used to create its own replacements.
- If NextAuth is upgraded to v5 or replaced, only `api-tokens.ts` needs
  reimplementing (e.g. directly on `jose`), and existing tokens will need to be
  re-created.
