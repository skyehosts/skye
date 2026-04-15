# Security

## Purpose

A living record of known security threats the product surface is exposed to and the mitigations currently in place. Each entry states the threat, the mitigations we've deployed, and items we've consciously deferred.

The goal is to make deferred work **visible** rather than forgotten: phase 1 often ships the highest-value/lowest-effort mitigations, with stronger controls planned as the product matures.

## Entry template

```
### <threat name>

**Threat**: one-sentence summary of what an attacker could do and what harm it causes.

**Affected surface**: endpoints, pages, or flows where this applies.

**Phase 1 mitigations** (deployed):
- bullet list

**Deferred** (documented, not yet implemented):
- bullet list with rationale
```

---

## Threats

### Email enumeration via /auth/check-email

**Threat**: The `/auth/check-email` endpoint returns `{exists: boolean}` to support the "Log in or sign up" modal's single-email-first UX. An attacker can enumerate which emails have accounts, enabling targeted phishing, credential stuffing with known-valid accounts, and recon.

**Affected surface**: `POST /auth/check-email` (unauthenticated, `@IgnoreBearerAuthentication()`).

**Phase 1 mitigations** (deployed):

- **Per-IP rate limit**: `express-rate-limit` applied via `AuthModule.configure(consumer)` to `POST /auth/check-email` — 30 requests per minute per IP, returning 429 beyond that. Low enough to block scripted enumeration, high enough not to disrupt real users on shared NATs.
- **Constant DB work**: the service always calls `accountService.findByEmail(email)` regardless of validity or prior lookups. No fast-path for cached misses.
- **Identical response shape**: status code, headers, and body structure are the same for existing vs non-existing emails — only the boolean payload differs. No status-code-based oracle.
- **No sensitive logging**: `logger.debug` only; no Sentry capture (no error path).

**Deferred** (documented, not yet implemented):

- **CAPTCHA / bot protection** (e.g. hCaptcha, Cloudflare Turnstile): deferred because it introduces real-user friction. Revisit once we see real abuse patterns, or before going live to production traffic.
- **Synthetic timing floor**: pad all responses to a fixed minimum (e.g. 200ms) to eliminate any residual timing side-channel between hit/miss. Not added in phase 1 because the DB call dominates and the oracle is already usable via the boolean response, so a timing floor adds latency without materially increasing attacker cost.
- **Account lockout on repeated enumeration from a single IP**: relies on hitting the rate limit cap; more aggressive temporary IP bans could be layered on later.
- **Alerting** on sustained 429s from a single IP/ASN — would route to whatever observability stack we stand up post-MVP.

The same guidance applies to `/auth/login` and `/auth/sign-up`, which similarly leak account existence via error messages. Phase 1 accepts this because those endpoints are less attractive for pure enumeration (they require valid password attempts). Rate limiting the broader auth surface is a natural next step.
