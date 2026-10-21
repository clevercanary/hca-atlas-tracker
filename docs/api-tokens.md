# API tokens

Scripts and agents (e.g. Claude Code) can't sign in with Google, and a copied
session cookie expires minutes after the browser stops refreshing it. An API
token lets them call the tracker's API as you instead.

## What a token can do

- **Acts as you.** The token identifies your account by its ID and email. Your
  role and atlas access are looked up on every request, so a role change
  applies to the token immediately, and disabling your account or changing
  your email stops it working.
- **`GET` on any route, plus a short list of writes.** Besides `GET`, a token
  can call only:
  - `POST /api/atlases/{atlasId}/files/{fileId}/presigned-url`, which signs a
    download URL.
  - `PUT /api/atlases/{atlasId}/component-atlases/{componentAtlasId}/source-datasets`,
    which sets an integrated object's source datasets (see
    [Syncing an integrated object's source datasets](#syncing-an-integrated-objects-source-datasets)).

  Every other method returns `403`, except that a method the route doesn't
  handle at all can return `405` instead. Your role still applies, so these
  need you to be a content admin, or the integration lead of the atlas.

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
malformed, expired, or belongs to a user who is no longer active or whose email
has changed: create a new one on `/api-token`.

### Syncing an integrated object's source datasets

A `PUT` sets the full list of source datasets linked to an integrated object.
It takes source dataset IDs (the `id` from
`GET /api/atlases/{atlasId}/source-datasets`), and returns the IDs it linked
and unlinked:

```bash
curl -X PUT \
  -H "Authorization: Bearer $HCA_TRACKER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sourceDatasetIds": ["<source dataset id>", "<source dataset id>"]}' \
  https://<tracker-host>/api/atlases/<atlas id>/component-atlases/<integrated object id>/source-datasets
# {"added":["<source dataset id>"],"removed":["<source dataset id>"]}
```

- Links to the atlas's source datasets that aren't in the list are removed,
  including ones added by hand in the UI. An empty list removes them all.
  Duplicate IDs are ignored.
- Only the versions of source datasets that are on the atlas are considered.
  Links to other versions are left as they are and aren't reported, so if the
  integrated object is linked to an older version of a listed dataset, the
  atlas's version is linked as well and reported under `added`.
- If any ID isn't a source dataset on the atlas, it returns `404` and changes
  nothing. An archived or non-latest integrated object returns `400`.
- Sending the same request again returns empty `added` and `removed`.

## Revoking tokens

Tokens aren't stored, so a single token can't be revoked. To revoke tokens
before they expire, rotate `NEXTAUTH_SECRET`. That revokes **every** API token
and also signs everyone out of the tracker.

To cut off one person's tokens without that, either:

- **Disable their account**, which also blocks them from the tracker.
- **Change their email** on `/team/[userId]`. A token is tied to the account's
  ID and to the email it had when the token was created, so it stops working
  once they differ. Changing it back makes the old tokens valid again.

Both take effect at once, because the user is looked up on every request.

Other changes don't revoke tokens:

- **Changing their role** only narrows what their tokens can do to what the
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
  reverse. They carry a `scope: "api-read"` claim and the user's `userId` and
  `email`. There's only one scope, and despite its name it covers the writes
  listed above; it isn't renamed because that would invalidate existing
  tokens.
- `app/utils/api-handler.ts` reads the `Authorization` header in
  `loadProvidedUserProfile`, looks the user up by `userId`, and rejects the
  token unless the user is active and still has the token's `email`. (Emails
  alone can move between accounts: an admin can edit them, and signing in
  with an unknown email registers a new account.) `handler` and `handleByMethod` verify the token on
  every route, including ones that need no authentication, and refuse non-GET
  methods unless the route includes the `bearerAllowed` middleware.
- `POST /api/me/api-token` issues tokens. It only issues a token for the
  signed-in user, and it refuses requests made with an API token, so a token
  can't be used to create its own replacements.
- If NextAuth is upgraded to v5 or replaced, only `api-tokens.ts` needs
  reimplementing (e.g. directly on `jose`), and existing tokens will need to be
  re-created.
