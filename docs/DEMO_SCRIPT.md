# RailAED — ~2.5-minute demo script

Live demo: **https://railaed-uae.vercel.app**

This is the script for the submission video. It's tight on purpose — judges watch
dozens of these and you want every second to land.

## Setup before recording

1. Hit `https://railaed-uae.vercel.app/api/health` — owner USDC balance should be > 2.
   If not: `curl -X POST https://railaed-uae.vercel.app/api/seed/fund -d '{"amount":"5"}' -H "content-type: application/json"`
2. (Local only) `rm -f .railaed-state.json` to get the seed contractors back to defaults.
   On the live deploy the state file is read/written under the function's
   temp dir and resets between invocations — that's fine for the demo.
3. Open three browser tabs:
   - `https://railaed-uae.vercel.app/` (landing)
   - `https://railaed-uae.vercel.app/send` (sender flow)
   - `https://railaed-uae.vercel.app/payroll` (employer flow)
4. Open the Arc explorer in a fourth tab: `https://testnet.arcscan.app`
   (so you can paste in the tx hash at the end).

---

## Script

### 0:00 — Landing (~10 s)
> "RailAED is a UAE-first remittance app on Circle's Arc blockchain.
> Sender pays in AED. Recipient gets USDC in two seconds, fees in USDC,
> finality in USDC. Most importantly — every quote is honest."

[Hover the three stats: ~2 sec, 0.30 % fee, Arc chain 5042002.]

### 0:10 — Sign in (~15 s)
[Click *Sign in* in the header.]

> "Type an email. RailAED provisions you a Circle developer-controlled wallet
> on Arc, scoped to that email, and gives you a one-tap faucet so you can fund
> yourself with 5 USDC from the treasury."

[Enter an email. The header chip flips to *0 USDC · 0x9906…008a*. Tap the chip → modal opens → tap *Fund +5 USDC*. Watch the chip update to 5 USDC.]

> "That's a real testnet wallet, that's a real on-chain transfer from the treasury,
> and that's the same wallet that's going to send the remittance below."

### 0:25 — Send flow (~45 s)
> "Now let's send 500 dirhams from Dubai to a recipient in India — from our
> own wallet, not the platform's."

[Type `500` in the AED field. India is selected by default.]

> "The quote locks instantly. Recipient gets 135.74 USDC,
> which is about 11,293 rupees. We charge 0.30 %."

[Scroll to the honesty-score table.]

> "Here's the live comparison. Al Ansari, LuLu, Western Union, Remitly, Wise —
> the same 500 AED, what each rail actually delivers. RailAED is on top.
> Saves the sender about 22 dirhams versus the industry average."

[Type a recipient phone. Click *Send now*.]

> "Behind the scenes, the backend provisioned a Circle developer-controlled wallet
> on Arc for the recipient, transferred USDC from *my* wallet — not the platform's —
> and signed a HMAC-protected claim link. Total time on-chain: about three seconds.
> You can see the funding source echoed in the success card."

[Success view appears with the claim link + the WhatsApp button. Activity feed below shows the send appear in real time, sourced from Circle's `listTransactions`.]

### 1:10 — Recipient claim (~25 s)
[Click *Open as recipient*.]

> "This is what the recipient sees from the WhatsApp link. The wallet balance is
> read live from Arc — 1.36 USDC, plus the local-currency conversion. The wallet
> address links straight to ArcScan, fully auditable."

[Hover the Confirmed badge.]

> "No app install. No seed phrase. The recipient just sees money."

### 1:35 — Payroll (~30 s)
[Switch to the `/payroll` tab.]

> "Same rails, different shape: global payroll. Three contractors — India,
> Spain, Nigeria — pre-loaded. Each will be paid in USDC into their own
> Circle wallet."

[Click *Run payroll*.]

> "One click, three parallel Circle transactions. All on Arc, all in seconds.
> Each contractor address is a real wallet on a real chain — payroll history is
> verifiable, not just a CSV in our database."

### 2:05 — Streaming payroll (~25 s)
[Flip the toggle at the top of `/payroll` from *Monthly batch* to *Live stream*. Click *Start streaming*.]

> "Same contractors, paid per second worked. Each row ticks up live, and every
> few seconds we settle the accrued amount on-chain — a real USDC transfer on
> Arc. Watch the on-chain tx counter climb."

[Let it run ~15 s so the "On-chain txs" stat reaches double digits, then click a contractor's *ArcScan* link to show the stream of incoming transfers.]

> "In one minute this fires dozens of real on-chain transactions — the exact
> workload Circle Nanopayments batches gas-free in production. The per-second
> transfer here is the honest testnet stand-in; the production swap is a single
> client. No traditional payroll rail can pay by the second."

[Click *Stop stream*.]

### 2:30 — Wrap (~5 s)
> "RailAED. UAE to anywhere, in seconds, on Arc."

[Cut.]

---

## Tips
- Keep cursor speed slow over the honesty-score table — judges need a beat to read it.
- If your AED quote shows zero, you didn't seed `RAILAED_CLAIM_SECRET` or `open.er-api.com`
  is rate-limiting — restart `npm run dev`.
- Don't skip the "saves 22 dirhams" badge — it's the most repeatable hook in the demo.
