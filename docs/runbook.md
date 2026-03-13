# Non-Technical Admin Runbook

## Daily tasks
1. Open `/admin/leads` and check `new` leads.
2. Contact lead by preferred method.
3. Update status to `contacted` or `consult-booked`.

## Weekly tasks
1. Open `/admin/settings` and verify phone/email/booking links.
2. Add or review at least one testimonial.
3. Publish one resource article.

## Lead status workflow
1. `new` -> just submitted
2. `contacted` -> first follow-up done
3. `consult-booked` -> discovery call scheduled
4. `closed-won` -> became a client
5. `closed-lost` -> not moving forward

## WhatsApp usage
- Public pages include click-to-chat WhatsApp links.
- Update WhatsApp number in `/admin/settings`.

## If contact form stops working
1. Check `/admin` login works.
2. Confirm Supabase env keys are still valid.
3. Verify Turnstile and Resend keys in Cloudflare env vars.
