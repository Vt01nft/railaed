# RailAED — 2-minute demo script

This is the script for the submission video. It's tight on purpose — judges watch
dozens of these and you want every second to land.

## Setup before recording

1. `npm run dev`
2. `curl http://localhost:3000/api/health` — owner USDC balance should be > 2.
   If not: `curl -X POST http://localhost:3000/api/seed/fund -d '{"amount":"5"}' -H "content-type: application/json"`
3. `rm -f .railaed-state.json` to get the seed contractors back to defaults.
4. Open three browser tabs:
   - `http://localhost:3000/` (landing)
   - `http://localhost:3000/send` (sender flow)
   - `http://localhost:3000/payroll` (employer flow)
5. Open the Arc explorer in a fourth tab: `https://testnet.arcscan.app`
   (so you can paste in the tx hash at the end).

---

## Script

### 0:00 — Landing (~10 s)
> "RailAED is a UAE-first remittance app on Circle's Arc blockchain.
> Sender pays in AED. Recipient gets USDC in two seconds, fees in USDC,
> finality in USDC. Most importantly — every quote is honest."

[Hover the three stats: ~2 sec, 0.30 % fee, Arc chain 5042002.]

### 0:10 — Send flow (~50 s)
> "Let's send 500 dirhams from Dubai to a recipient in India."

[Type `500` in the AED field. India is selected by default.]

> "The quote locks instantly. Recipient gets 135.74 USDC,
> which is about 11,293 rupees. We charge 0.30 %."

[Scroll to the honesty-score table.]

> "Here's the live comparison. Al Ansari, LuLu, Western Union, Remitly, Wise —
> the same 500 AED, what each rail actually delivers. RailAED is on top.
> Saves the sender about 22 dirhams versus the industry average."

[Type a recipient phone. Click *Send now*.]

> "Behind the scenes, the backend provisioned a Circle developer-controlled wallet
> on Arc, transferred USDC from the platform treasury, and signed a HMAC-protected
> claim link. Total time on-chain: about three seconds."

[Success view appears with the claim link + the WhatsApp button.]

### 1:00 — Recipient claim (~25 s)
[Click *Open as recipient*.]

> "This is what the recipient sees from the WhatsApp link. The wallet balance is
> read live from Arc — 1.36 USDC, plus the local-currency conversion. The wallet
> address links straight to ArcScan, fully auditable."

[Hover the Confirmed badge.]

> "No app install. No seed phrase. The recipient just sees money."

### 1:25 — Payroll (~30 s)
[Switch to the `/payroll` tab.]

> "Same rails, different shape: global payroll. Three contractors — India,
> Philippines, Pakistan — pre-loaded. Each will be paid in USDC into their own
> Circle wallet."

[Click *Run payroll*.]

> "One click, three parallel Circle transactions. All on Arc, all in seconds.
> Each contractor address is a real wallet on a real chain — payroll history is
> verifiable, not just a CSV in our database."

### 1:55 — Wrap (~5 s)
> "RailAED. UAE to anywhere, in seconds, on Arc."

[Cut.]

---

## Tips
- Keep cursor speed slow over the honesty-score table — judges need a beat to read it.
- If your AED quote shows zero, you didn't seed `RAILAED_CLAIM_SECRET` or `open.er-api.com`
  is rate-limiting — restart `npm run dev`.
- Don't skip the "saves 22 dirhams" badge — it's the most repeatable hook in the demo.
