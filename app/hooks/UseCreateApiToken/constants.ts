/**
 * Shown when the endpoint answers 201 but its body doesn't carry the token. A
 * token was issued by then but can't be shown, so the message says to create
 * another; the unseen one simply expires unused.
 */
export const UNREADABLE_API_TOKEN_MESSAGE =
  "A token was created, but it couldn't be read. Create another one.";
