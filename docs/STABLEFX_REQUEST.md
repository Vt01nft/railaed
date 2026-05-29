# StableFX Access Request — RailAED

> **Send to:** `customer-support@circle.com`
> **Subject:** `Circle Hackathon - USYC or StableFX testnet request`
> **From:** vt01nfts@gmail.com (Circle Developer Account)
>
> Also complete the access form linked from the hackathon page: https://challenges.ignyte.ae/competition/4B436318-C737-F111-9A49-6045BD14D400

---

## Outcome (2026-05-29)

Sent the request below. Circle Customer Care replied, asked for project details
(Arc wallet address, links, use case), then declined: allowlisted access is
"limited to a select group of developers" and our submission "does not qualify
for access at this stage." Notably the exchange was handled entirely as a **USYC**
allowlisting request — the **StableFX** ask was never addressed separately, despite
a follow-up clarifying that StableFX (not USYC) is what RailAED needs.

**Result:** shipping the `StableFXClient` seam (`lib/stablefx.ts`) — `MockStableFXClient`
by default, `LiveStableFXClient` behind `STABLEFX_ENABLED`, with the rate labelled
"simulated" in the UI. The real rail is a one-flag swap if access is granted later.
This matches the hackathon brief, which doesn't penalise conceptual/architecture-level
integrations when access isn't available.

---

## Email body (copy + paste, edit anything in `[brackets]`)

```
Subject: Circle Hackathon - USYC or StableFX testnet request

Hi Circle team,

I'm building "RailAED" for the Stablecoin Commerce Stack Challenge run by Ignyte (Track 1: Best Cross-Border Payments & Remittances Experience, UAE → Global). My Circle Developer Account email is vt01nfts@gmail.com.

I'd like to request testnet access to StableFX so I can demo FX-aware multi-currency routing for the UAE-expat-outbound remittance corridor.

Project summary:
- A pay-in-AED, settle-in-USDC, payout-in-INR/PHP/PKR/EGP remittance flow on Arc testnet.
- Sender opens an account via Circle Modular Wallets (passkey, no seed phrase).
- The app quotes the recipient amount transparently using a live FX rate; settlement is in USDC on Arc with sub-second finality and USDC-denominated gas.
- Recipient receives a WhatsApp-link claim flow with a passkey-gated wallet — no app install, no hex addresses.
- Employer/payroll mode supports bulk batches and (stretch) per-second streaming payroll via Nanopayments on Arc.

How StableFX would be used:
- AED → USD conversion at the quote/initiation step (today simulated, swap-in via StableFX FxEscrow if access is granted).
- Multi-currency payout routing for destination corridors that may add stablecoin pairs over the hackathon window.
- Demonstrating to judges that the FX leg is handled by Circle-native rails rather than off-chain rate scraping.

Stack: Next.js 16 on Vercel, Circle Modular Wallets, USDC on Arc testnet (chain 5042002), CCTP V2 + Bridge Kit, Circle Gateway for treasury routing, Nanopayments for streaming-payroll mode. Wallet set already provisioned under my account.

If StableFX access for this hackathon isn't possible, I'll build a clean shim that mirrors the StableFX interface so it drops in if/when granted — but it would strengthen the demo materially to have the real rails.

Happy to share more detail or jump on a quick call. Thanks!

— [your name]
[github / linkedin if you want]
```

## Access-form answers (likely fields)

If the form asks the typical questions, here are pre-written answers — adjust to whatever the form actually asks:

- **Full name:** [your name]
- **Email:** vt01nfts@gmail.com
- **Company / project name:** RailAED
- **Project URL / GitHub:** Source: https://github.com/Vt01nft/railaed · Live: https://railaed-uae.vercel.app
- **Use case:** Cross-border remittance and global payroll flows for the UAE-expat outbound corridor. AED is converted to USDC on Arc, then routed to the recipient's preferred destination currency. StableFX provides the FX-aware leg of the swap, replacing the off-chain rate oracle in the conceptual MVP.
- **Which Circle products are you using?** USDC (on Arc), Circle Modular Wallets, CCTP V2 + Bridge Kit, Circle Gateway, Nanopayments, StableFX (requested).
- **Why StableFX specifically?** It's the only Circle-native rail that handles AED→USD and onward stablecoin-pair routing in a single composable primitive on Arc. Without it the demo must rely on an off-chain rate, which weakens the "everything on Circle rails" story for judges.
- **Volume estimate:** Testnet only — peak ~$10k USDC equivalent across the hackathon demos.
- **Geography:** UAE sender, recipients across India, Pakistan, Philippines, Egypt, Bangladesh.
- **Production timeline:** This submission is testnet-only for educational/demo purposes per the hackathon brief. Production timeline contingent on VARA / CBUAE PTSR licensing path, not part of this submission.
- **Hackathon:** Yes — Stablecoin Commerce Stack Challenge, Ignyte, Track 1.

## What to do if access doesn't come through

The hackathon brief explicitly says teams will not be penalized for conceptual or architecture-level integrations if access isn't granted. Build a `StableFXClient` interface in our codebase with two implementations:

1. `MockStableFXClient` — returns AED→USD using a hard-coded or oracle-fetched rate; used by default in dev/demo.
2. `LiveStableFXClient` — wired to the real FxEscrow contract once access lands.

Document the swap path in the README so judges can see we designed for it.
