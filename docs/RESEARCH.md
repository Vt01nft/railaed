# RailAED - Research Dossier

**Hackathon:** [Stablecoin Commerce Stack Challenge](https://challenges.ignyte.ae/competition/4B436318-C737-F111-9A49-6045BD14D400) (Ignyte × Circle × Arc, 3-month virtual program)
**Track:** Track 1 - Best Cross-Border Payments & Remittances Experience (UAE → Global)
**Prizes:** 5,000 USDC (1st), 3,000 USDC (2nd)
**Research date:** 2026-05-20
**Status legend:** `[V]` = verified from primary docs/source. `[I]` = inferred or cross-referenced, needs check. `[?]` = couldn't fully verify, see linked URL.

---

## 1. Arc Blockchain (Circle's L1)

Arc is Circle's purpose-built, EVM-compatible Layer-1 designed as the settlement layer for stablecoin finance.

| Item | Value | Source |
|---|---|---|
| Status | **Public testnet** (mainnet planned **summer 2026**) | `[V]` [Circle press release - Arc Public Testnet](https://www.circle.com/pressroom/circle-launches-arc-public-testnet); [Phemex on whitepaper](https://phemex.com/news/article/circle-unveils-arc-blockchain-whitepaper-mainnet-launch-set-for-summer-2026-82817) |
| Testnet launch date | **October 28, 2025** | `[V]` Circle press release above |
| Testnet activity | 244.1M txs as of May 5, 2026 | `[I]` per search snippet |
| **Testnet Chain ID** | **`5042002`** | `[V]` [docs.arc.io connect-to-arc](https://docs.arc.io/arc/references/connect-to-arc) |
| **Mainnet Chain ID** | Not yet published | `[V]` docs page lists no mainnet entry |
| Primary RPC (HTTP) | `https://rpc.testnet.arc.network` | `[V]` same doc |
| Primary RPC (WSS) | `wss://rpc.testnet.arc.network` | `[V]` |
| Alt RPCs | Blockdaemon, dRPC, QuickNode (all `*.testnet.arc.network`) | `[V]` |
| Block explorer | `https://testnet.arcscan.app` | `[V]` |
| Faucet | `https://faucet.circle.com` (testnet USDC + EURC) | `[V]` |
| Consensus | **Malachite** (high-perf Tendermint BFT, written in Rust by Informal Systems for Circle) | `[V]` [docs.arc.io system-overview](https://docs.arc.io/arc/concepts/system-overview); [circlefin/malachite repo](https://github.com/circlefin/malachite) |
| Execution layer | **Reth** (Rust Ethereum client) | `[V]` system-overview |
| Finality | **Deterministic, sub-second** (benchmarked < 350 ms with 20 validators); **no reorg risk** | `[V]` system-overview |
| Throughput | **3,000+ TPS** benchmark | `[V]` |
| EVM hard fork target | **Prague** (latest) | `[V]` [docs.arc.io evm-compatibility](https://docs.arc.io/arc/references/evm-compatibility) |
| Validator model | **Proof-of-Authority** - permissioned set of regulated institutions | `[V]` system-overview |
| **Gas/fee token** | **USDC (18-decimal denomination)** - there is no separate gas token; fees paid in USDC | `[V]` evm-compatibility + connect-to-arc |
| Fee model | EWMA-smoothed base fee (EIP-1559-inspired but bounded/stable) | `[V]` |
| Notable EVM diffs | `SELFDESTRUCT` disabled at deploy; `PREV_RANDAO` always returns 0; EIP-4844 blobs disabled; block timestamps in seconds (multiple blocks may share); `PARENT_BEACON_BLOCK_ROOT` returns parent exec-payload hash | `[V]` evm-compatibility |
| Privacy feature | **ArcaneVM** - confidential Solidity execution, **status: planned, not live** | `[V]` system-overview |

### Key Arc testnet contract addresses (Domain ID 26)
Source: `[V]` [docs.arc.io contract-addresses](https://docs.arc.io/arc/references/contract-addresses)

| Contract | Address |
|---|---|
| USDC | `0x3600000000000000000000000000000000000000` |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |
| USYC (tokenised T-bill) | `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C` |
| CCTP V2 TokenMessenger | `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA` |
| CCTP V2 MessageTransmitter | `0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275` |
| Gateway Wallet | `0x0077777d7EBA4688BDeF3E311b846F25870A19B9` |
| Gateway Minter | `0x0022222ABE238Cc2C7Bb1f21003F0a260052475B` |
| StableFX `FxEscrow` | `0x867650F5eAe8df91445971f14d89fd84F0C9a9f8` |
| Permit2 | `0x000000000022D473030F116dDEE9F6B43aC78BA3` |
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` |

### How to connect / deploy
1. Add network to MetaMask: RPC `https://rpc.testnet.arc.network`, chain ID `5042002`, symbol `USDC`, explorer `https://testnet.arcscan.app`. `[V]`
2. Fund via `https://faucet.circle.com`. `[V]`
3. Standard Hardhat/Foundry/Reth tooling works (Prague-compatible). Tooling integrations: Alchemy, Chainlink, Thirdweb, MetaMask, Claude Agent SDK. `[I]` per [arc.io blog](https://www.arc.io/blog/circle-launches-arc-public-testnet)
4. Sample apps live under [github.com/circlefin](https://github.com/circlefin): `arc-node`, `arc-p2p-payments`, `arc-escrow`, `arc-prediction-markets`. `[V]`

> **Conflict to flag:** mainnet timing - multiple sources say "summer 2026" (whitepaper) but Circle has not given a firm date. Assume **testnet-only for the demo**.

---

## 2. Circle Wallets (Programmable Wallets)

Circle's wallet-as-a-service offering, designed so non-crypto users never see seed phrases.

### Wallet models `[V]` [developers.circle.com/wallets](https://developers.circle.com/wallets)
- **Developer-Controlled Wallets** - Circle/your backend signs. Best for payouts, automation, server-initiated treasury moves. Good fit for the **payroll / treasury** side of RailAED.
- **User-Controlled Wallets** - end-user holds a key share (MPC). Standard product, requires SDK on the client.
- **Modular Wallets** - **ERC-4337 smart accounts with passkey signing** and **gas sponsorship via paymaster**. The newest, best UX for consumer onboarding. Documented in `circlefin/skills/plugins/circle/skills/use-modular-wallets`. `[V]`

### SDKs `[V]`
- Web SDK (browser, TypeScript)
- iOS SDK (Swift) - see `circlefin/w3s-ios-sample-app-wallets`
- Android SDK
- Node.js / REST (server)
- **No official React Native SDK** per current docs - use Web SDK in a WebView or call REST from a RN bridge. `[I]`

### Auth options `[V]` ([Create User Wallets with Social Login](https://developers.circle.com/wallets/user-controlled/create-user-wallets-with-social-login))
- **Passkeys** (Modular Wallets, WebAuthn)
- **Google / Apple / Facebook OAuth** (social login)
- **Email OTP**
- **PIN** with MPC key custody

### Pricing `[?]` [Circle developer fee schedule](https://help.circle.com/s/article/Developer-platform-fee-schedule?language=en_US)
- Public snippets indicate: **first 1,000 monthly active wallets are free** (no rebate needed); active wallets holding ≥ 10 USDC accrue a $0.01/wallet rebate; Gas Station charges = sponsored gas + 5% fee.
- **Free tier is sufficient for a hackathon demo.** Verify before production at the fee schedule URL.

### Arc support
- Arc is referenced throughout Wallets docs and skills (e.g., `arc-p2p-payments` uses Modular Wallets on Arc Testnet). `[V]`
- **Verdict:** Circle Wallets work on Arc Testnet today.

### Integration outline (Next.js 16 App Router)
1. Backend (`/app/api/wallet/route.ts`): create developer-controlled wallet set, `POST` to `https://api.circle.com/v1/w3s/...` with `X-Entity-Secret-Ciphertext`.
2. Frontend: `import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk"`, init with `appId` + `userToken` + `encryptionKey`.
3. Modular Wallets: install `@circle-fin/modular-wallets-core`, register passkey, create SCA owner.
4. Sign+send tx via SDK; gas sponsored by Paymaster.

---

## 3. CCTP V2 + Bridge Kit

### CCTP V2 - what V2 adds over V1
Source: `[V]` [Circle CCTP V2 blog](https://www.circle.com/blog/cctp-v2-the-future-of-cross-chain), [V2 whitepaper PDF](https://6778953.fs1.hubspotusercontent-na1.net/hubfs/6778953/PDFs/Whitepapers/CCTPV2_White_Paper.pdf)
- **Fast Transfer** - Circle fronts liquidity to mint on destination *before* source finality. **~8–20 seconds** vs. **15–19 min** standard. Opt-in, pays a small fee.
- **Hooks** - bundle a destination-chain action (swap, deposit, payout) with the mint via a single call. Critical for one-tap UX.
- V1 is being deprecated; V2 is canonical. `[V]` [CCTP V1 deprecation post](https://www.circle.com/blog/cctp-version-updates)

### Supported chains (mainnet, as of CCTP V2 supported-chains page) `[V]`
[developers.circle.com/cctp/concepts/supported-chains-and-domains](https://developers.circle.com/cctp/concepts/supported-chains-and-domains)
25 mainnets: Ethereum (0), Avalanche (1), OP (2), Arbitrum (3), Solana (5), Base (6), Polygon (7), Unichain (10), Linea (11), Codex (12), Sonic (13), World Chain (14), Monad (15), Sei (16), BNB (17), XDC (18), HyperEVM (19), Ink (21), Plume (22), Starknet (25), Stellar (27), EDGE (28), Injective (29), Morph (30), Pharos (31).
**Arc** is on the list as **Testnet, domain `26`** - not yet mainnet (mainnet would launch with Arc mainnet). `[V]`

### Bridge Kit `[V]` [Circle blog](https://www.circle.com/blog/introducing-bridge-kit-build-crosschain-apps-faster), [docs.arc.io/app-kit/bridge](https://docs.arc.io/app-kit/bridge)
- npm package: `@circle-fin/bridge-kit` (plus adapter packages)
- Adapters: `@circle-fin/adapter-viem-v2`, `@circle-fin/adapter-ethers-v6`, `@circle-fin/adapter-solana-kit`, `@circle-fin/adapter-circle-wallets`
- One call: `kit.bridge({ from, to, amount })` - handles approve → burn → attestation poll → mint.
- Built-in **monetization** - devs can configure a per-transfer fee that accrues to them. `[V]` (crypto.news + Circle blog)
- **Open access, no sign-up.** `[V]`
- When to use vs. raw CCTP: **always use Bridge Kit** unless you need custom Hooks orchestration that the SDK doesn't expose.

---

## 4. Circle Gateway

A **unified cross-chain USDC balance** + sub-500ms minting. Distinct from CCTP (point-to-point) and Wallets (account abstraction).

### What it is `[V]` [developers.circle.com/gateway](https://developers.circle.com/gateway), [Gateway Technical Guide](https://developers.circle.com/gateway/concepts/technical-guide)
- Deposit USDC into a **GatewayWallet** contract on any supported chain (non-custodial).
- Circle's offchain Gateway System tracks balances across all chains as **one logical pool**.
- Need to spend on chain X? Sign a **BurnIntent** (EIP-712) → POST `/v1/transfer` → get **Attestation** → call **GatewayMinter** on chain X. End-to-end: **< 500 ms**.
- 7-day **trustless withdrawal** path if Circle service is unavailable.
- Audited by ChainSecurity and OtterSec. `[V]`

### vs. CCTP, vs. Wallets
- **CCTP** = move USDC chain A → chain B *now* (burn + mint, 8-20s fast). Stateless.
- **Gateway** = deposit once, *front-load finality*, then spend instantly from a unified balance later. Stateful (offchain ledger).
- **Wallets** = the user-facing custody/UX layer. Orthogonal - Gateway/CCTP operate on USDC owned by any wallet.

### API surface `[V]` technical guide
- `POST /v1/transfer` - submit signed burn intent(s), get attestation. Up to 16 intents per request.
- `GET /v1/balances` - query unified balance.
- `GET /v1/deposits` - pending unfinalized deposits.
- On-chain: `deposit`, `depositFor`, `depositWithPermit`, `depositWithAuthorization`, `addDelegate`, `initiateWithdrawal`, `withdraw`.

### Eligibility
- **Permissionless** - no sign-up needed to integrate. `[V]`
- Works on Arc testnet (contracts deployed, see section 1). `[V]`

### Use cases for RailAED
- **Treasury routing**: pool inbound AED-funded USDC from multiple liquidity sources into a single balance, then mint instantly on the destination chain when a recipient claims.
- **Bulk payroll**: with `BurnIntentSet`, sign 16 freelancer payouts on different chains in one EIP-712 signature.

---

## 5. Nanopayments

### What it is `[V]` [circle.com/nanopayments](https://www.circle.com/nanopayments), [Circle blog 2026-05-08](https://www.circle.com/blog/circle-nanopayments-launches-on-testnet-as-the-core-primitive-for-agentic-economic-activity)
- Launched **on testnet May 8, 2026** (~2 weeks before this research).
- Gas-free USDC transfers as small as **$0.000001**, max **$1M**.
- Mechanism: off-chain **EIP-3009 signed authorisations** → Circle Nanopayments API validates and updates a Gateway-backed ledger instantly → batched on-chain settlement.
- Powered by Circle Gateway under the hood.
- Permissionless; requires a funded Gateway balance.

### Chain support `[V]` (search snippet from Circle docs)
Arbitrum, **Arc**, Avalanche, Base, Ethereum, HyperEVM, Optimism, Polygon PoS, Sei, Sonic, Unichain, World Chain - **testnet only** at present.

### Useful for RailAED?
- **Direct fit for remittance/payroll? No** - it's framed for AI-agent M2M payments and pay-per-use.
- **Stretch fit (high "wow" value):** **streaming payroll** - pay a freelancer $0.001/second of work logged. Sub-cent throughput + instant settlement = a credible demo of the future of work that no other payroll tool can do. **Differentiator candidate.**

### Status
- **Testnet, permissionless.** No waitlist. Useable today in a hackathon demo. `[V]`

---

## 6. StableFX (gated)

### What it is `[V]` [circle.com/stablefx](https://www.circle.com/stablefx), [Circle blog](https://www.circle.com/blog/introducing-circle-stablefx-and-circle-partner-stablecoins), [StableFX Technical Guide](https://developers.circle.com/stablefx/concepts/technical-guide)
- Institutional 24/7 stablecoin FX engine on Arc.
- **Off-chain RFQ + on-chain settlement** via `FxEscrow` (address in §1) using Permit2.
- Three settlement tenors: instant (30 min), hourly, daily.
- Maker quotes in < 500 ms.

### Currency-pair coverage `[V]` Circle blog
Partner stablecoins announced (designed to interoperate via StableFX):
- **BRLA** (Brazilian Real), **KRW1** (Korean Won), **PHPC** (Philippine Peso), **MXNB** (Mexican Peso), **JPYC** (Japanese Yen), **QCAD** (Canadian Dollar), **ZARU** (South African Rand), **AUDF** (Australian Dollar), plus USDC and EURC.
- **AED, INR, PKR, EGP, BDT, NPR, LKR are NOT yet on the partner stablecoin list.** `[V]` Major gap for a UAE remittance product.
- **PHPC (Philippine Peso) is the only one of our target corridors covered.** `[V]`

### How it helps "pay-in-AED → settle-USDC → payout-INR/PHP/PKR"
- For **PHP**: StableFX swaps USDC ↔ PHPC on Arc, then PHPC is bridged/off-ramped locally.
- For **INR/PKR/EGP/BDT/NPR/LKR**: no on-Arc FX leg available today - must use a 3rd-party off-ramp partner (see §10).
- The "AED in" leg is the bigger problem: there is **no AED stablecoin in StableFX today**. AE Coin exists (CBUAE-licensed, RAKBank-backed) but isn't a StableFX partner. `[V]` ([CCN on RAKBank](https://www.ccn.com/news/crypto/rakbank-wins-aed-approval-digital-dirham-aed-stablecoin/))

### How to request access `[V]`
- Form: `https://www.circle.com/join-stablefx`
- Email: `customer-support@circle.com`, subject line **"Circle Hackathon - USYC or StableFX testnet request"** (per hackathon instructions).
- Approval flow: KYB → TEST API key (Arc testnet) → eventually LIVE.
- "Institutional gating" exists, but **hackathon path is documented** and Circle has approved hackathon participants for testnet in past events (e.g., ETHGlobal HackMoney 2026 - `arctan(x)` won using StableFX). `[V]` [HackMoney 2026 winners](https://www.arc.io/blog/meet-the-arc-track-winners-from-the-hackmoney-2026-hackathon-and-what-we-learned)

### Penalty for not getting access?
- **No explicit penalty**, but using more Circle products = higher "integration quality" score. Submit the request **immediately** (today). If denied/delayed, fall back to a simulated FX oracle for the demo with code paths wired so StableFX can drop in.

---

## 7. UAE Remittance Market

### Size
- UAE = **3rd-largest global sender of remittances**. `[V]` [Visa report](https://ae.visamiddleeast.com/en_AE/about-visa/newsroom/press-releases/prl-10092025.html)
- **~$44B annual outbound** corridor, ~9M expats. `[V]` [AGBI on Circle UAE talks](https://www.agbi.com/banking-finance/2025/06/stablecoin-issuer-circle-targets-uaes-47bn-remittance-corridor/)
- 50% of exchange-house outbound goes to **India + Pakistan + Philippines** (~$39.7B in 2022 data; ~$47.5B more recent). `[I]` per search summary
- UAE-Pakistan alone = Middle East's largest corridor at **~$24B/yr**. `[I]` (Tazapay 2026 guide)

### Average cost (sending $200 from UAE to India) `[V]` [World Bank corridor data](https://remittanceprices.worldbank.org/corridor/United-Arab-Emirates/India)
- **Average total cost: 3.72%** ($5.93 fee + 0.75% FX margin).
- Cheapest banks: Emirates NBD (0.77%), DirectRemit (1.11%).
- Cheapest MTOs: Remitly (1.04%), Western Union (1.59%), **Al Ansari Exchange (1.83%)**.
- Outliers: Dubai Islamic Bank 11.68%, ADCB 21.06%.
- **Speed**: most ≤ 2 days; Remitly / WU offer < 1 hr.
- Sub-$200 average cost: **4.6%** (lower for digital). `[V]`

### Fixed-fee model (post 2025 increases)
- Exchange houses now charge **AED 22 + 5% VAT** per transaction to India/Philippines. `[V]` [Gulf News](https://gulfnews.com/amp/story/business/banking/uaes-15-remittance-fee-hike-will-more-residents-switch-to-digital-when-sending-money-1.1712291315289)
- Pakistan: AED 22 charged to exchange house but **reimbursed by State Bank of Pakistan** - customer pays nothing. `[V]`
- 15% fee hike at exchange houses **already pushing users to digital**. `[V]` Visa: nearly 2 in 3 UAE residents now prefer digital remittance apps.

### Top pain points expats face `[V]` [Visa newsroom](https://ae.visamiddleeast.com/en_AE/about-visa/newsroom/press-releases/prl-10092025.html), [Khaleej Times](https://www.khaleejtimes.com/business/finance/uae-expats-increasingly-drive-shift-to-digital-remittances)
1. **High fees** - 32% of senders cite this as #1 pain.
2. **Opaque FX rates** (provider-favourable margins).
3. **Long queues** at physical exchange houses.
4. **Speed** - bank transfers still take 1–3 business days.
5. **Beneficiary friction** - recipient often must visit a branch to collect cash (esp. PKR, EGP, NPR corridors).

### AED on-ramp / off-ramp realities
- **Banks** (Emirates NBD, ADCB, DIB, FAB) - wire transfers + remit-specific products (DirectRemit). Account required.
- **Exchange houses** - Al Ansari, LuLu Exchange/LuLu Money, UAE Exchange, GCC Exchange, Sharaf Exchange. Physical and increasingly digital apps. Strong agent network in destination countries.
- **Crypto on-ramp**: licensed UAE crypto firms (BitOasis, Rain, CoinMENA, Binance UAE) allow AED → USDC/USDT. VARA-licensed.
- **AED stablecoin**: **AE Coin** (issued by AED Stablecoin LLC, in partnership with **RAKBank** and Fuze) is the first CBUAE-licensed dirham stablecoin (full license Dec 11, 2024). `[V]` [Mondaq](https://www.mondaq.com/fin-tech/1577210/uaes-groundbreaking-approval-of-ae-coin-a-new-era-for-dirham-backed-stablecoins). **Tether** also announced an AED stablecoin via Phoenix Group / Green Acorn. `[V]`

---

## 8. UAE Regulatory Landscape

### Federal - CBUAE Payment Token Services Regulation (PTSR) `[V]` [CBUAE Rulebook](https://rulebook.centralbank.ae/en/rulebook/payment-token-services-regulation), [Regulation Tomorrow analysis](https://www.regulationtomorrow.com/dubai-and-saudi/cbuae-payment-token-services-regulation/)
- Issued **June 7, 2024**, in force **July 6, 2024**, one-year transition **ended June 2025**.
- Defines three services: **Issuance, Conversion, Custody & Transfer**.
- **Dirham Payment Token** (AED-pegged) - **full CBUAE license required**.
- **Foreign Payment Token** (e.g., USDC) - **registration with CBUAE required** to be used as means of payment within UAE.
- Issuer reserves: **100% in liquid HQLA, ≥ 50% as cash in UAE banks**; **par redemption within 1 business day**.
- **USDC for AED payment-acceptance**: Circle would need (or partner with someone who has) PTSR registration. As of May 2026, **USDC is widely traded/held in UAE but its use as a domestic payment means is regulated**. For **outbound remittance** (the RailAED use case), this is generally OK because settlement happens off-shore in USDC and the AED leg goes through licensed banks / exchange houses, not via "paying with USDC in UAE." `[I]` Verify with legal before any production launch.

### Dubai - VARA `[V]` [Pinsent Masons](https://www.pinsentmasons.com/out-law/news/dubais-move-oversee-stablecoins-bring-certainty-regulatory-grey-area), [CoinEdition March 2025](https://coinedition.com/dubai-releases-updated-guidelines-for-rwa-and-stablecoin-issuance/)
- **March 2025**: VARA issued FRVA/ARVA guidelines. Fiat-pegged stablecoins (USDC equivalents) = **Category 1 FRVA**, require **full VARA license + whitepaper approval**.
- One-year transition until **Sept 2026** for crypto firms targeting UAE users to license/partner/exit.
- **Retail USDC use** is allowed via VARA-licensed VASPs.

### ADGM (Abu Dhabi Global Market)
- FSRA has had a Digital Asset framework since 2018; updated for stablecoins. **Circle has in-principle approval** from ADGM as a money-services provider. `[V]` AGBI.
- ADGM is the more enterprise/institutional-friendly regulator; consider for RailAED's company entity post-hackathon.

### Federal Decree-Law No. 6 of 2025 ("CB Law 2025") `[V]` [Databird analysis](https://www.databirdjournal.com/posts/uaes-federal-decree-law-no-6-of-2025-the-end-of-the-just-code-defense-for-defi-and-the-dawn-of-comprehensive-crypto-regulation)
- Effective Sept 8, 2025. Ends the "just code" defence for DeFi protocols touching UAE. Establishes **Digital Dirham (CBDC)** as legal tender.
- Implication for RailAED: any production product must be operated by a licensed entity; can't hide behind smart-contract autonomy.

### FATF Travel Rule `[V]` [Alketbi Law](https://alketbilaw.com/news/uae-crypto-travel-rule-compliance-latest-updates-f/), [Aston VIP](https://aston.ae/uae-travel-rule-compliance-for-crypto-firms/)
- UAE enforces Travel Rule on all licensed VASPs (VARA + ADGM).
- Threshold lowered to **USD 250** in many jurisdictions per FATF Feb 2025 update.
- Required data: sender/recipient names, account details, wallet addresses, amounts. **5-year retention.**
- For RailAED: every cross-border USDC transfer ≥ $250 must include originator/beneficiary data attached out-of-band (e.g., via Notabene, Sumsub, TRP).

### Permissible for a testnet hackathon demo
- **Yes, unambiguously.** Testnet USDC, no real customer funds, educational/demo positioning. No license needed.
- For production: minimum stack = **VARA license OR partnership with a VARA-licensed VASP** + **PTSR registration for any AED-stablecoin or USDC-as-payment leg** + **FATF Travel Rule provider integration** + **AML/KYC vendor** (Sumsub, Onfido).

---

## 9. Competitive Landscape

### Stablecoin-native remittance players
| Player | Notes | Source |
|---|---|---|
| **Sling Money** (recently rebranded **Morse**) | 145+ countries, USDP + EURC + USDC, real-time payments in 75+ countries, FCA-approved Dec 2025, MiCA-licensed via Netherlands | `[V]` [Sling Money blog](https://sling.money/blog/sling-money-launches-in-the-u-s-unlocking-instant-global-transfers-for-millions); [CoinDesk Dec 2025](https://www.coindesk.com/policy/2025/12/24/sling-money-receives-approval-to-offer-crypto-services-in-uk-as-stablecoin-payments-gain-popularity) |
| **Bitnob** | Africa-focused, USDT + BTC, Lightning rails to NGN/KES/GHS/ZAR | `[?]` not strongly returned in search; verify at [bitnob.com](https://bitnob.com) |
| **MoneyGram + Stellar** | USDC over Stellar, off-ramps via agents | `[I]` |
| **Strike** | Bitcoin Lightning remit (USA→PHP/AFR); not USDC | `[I]` |
| **Bitso Business** | Powers Felix Pago and others - 10% of US-MX remit corridor on stablecoins | `[V]` [Stellar case study](https://stellar.org/case-studies/felix-bitso) |
| **Felix Pago** | WhatsApp-native US→LATAM remit via USDC+Bitso; **$3B volume**, 30% MoM growth since Stripe partnership | `[V]` [Stripe customer page](https://stripe.com/customers/felix) |
| **CrossFi** | Stablecoin payment card / app; consumer | `[?]` couldn't verify recent UAE activity |
| **Beam** | Stablecoin remit (SE Asia focus); details unclear | `[?]` |
| **TransFi** | UAE-active stablecoin cross-border B2B | `[V]` [TransFi UAE blog](https://www.transfi.com/blog/stablecoin-payments-in-uae-powering-web3-startups-in-a-global-crypto-hub) |
| **Fasset** | UAE-based Islamic-finance stablecoin app | `[V]` [fasset.com](https://www.fasset.com/) |

### Traditional UAE remittance players
- **LuLu Exchange / LuLu Money** - strong digital app, agent network across Asia
- **Al Ansari Exchange** - largest UAE exchange house, listed on DFM, ~1.83% on UAE→IN
- **UAE Exchange** (Unimoni)
- **Western Union** - global brand, 1.59% on UAE→IN
- **MoneyGram** - 2.48%; using Stellar for USDC settlement under the hood
- **Wise** (TransferWise) - digital-first, ~AED 18 fixed fee, 64% of transfers under 20 sec
- **Remitly** - top-rated by Monito 2025, 1.04% on UAE→IN
- **Emirates NBD / DirectRemit** - cheapest at 0.77%, requires a bank account

### Gaps a hackathon MVP can credibly fill
1. **No UAE-resident-focused stablecoin remit product** - Sling/Felix are US/LATAM-centric. The UAE expat audience (Indians, Pakistanis, Filipinos, Egyptians, Bangladeshis) is underserved by crypto-native UX.
2. **No multi-corridor payroll product for UAE-based SMEs paying global contractors** - Deel/Rise focus on US/EU employers. UAE SMEs with 5–50 global contractors have no clean stablecoin solution.
3. **No product unifies sender-side simplicity (no crypto knowledge) with recipient-side flexibility (claim to bank, mobile money, UPI, or hold as USDC).**
4. **Streaming payroll for freelancers** - nobody offers per-second salary streaming for hourly contractors. Nanopayments + Arc enables this.
5. **AED-anchored UX** - every quote, dashboard, and confirmation in dirhams (not USD). Trivial but missing.

### Wow features that differentiate
- **One-tap "send WhatsApp link"** - recipient claims via phone number + passkey (no app install).
- **Real-time FX honesty score** - compare RailAED's USDC route vs. Al Ansari/Wise/WU live (use the World Bank API).
- **Per-second streaming payroll** - Nanopayments demo on Arc.
- **AED-denominated UI with on-chain proof** - every transaction has a [testnet.arcscan.app](https://testnet.arcscan.app) link.

---

## 10. Recipient-side cash-out (2026)

| Corridor | Off-ramp routes | Credibility |
|---|---|---|
| **India (INR)** | **Coinbase USDC→INR launched April 2026** (institutional + retail); CoinDCX (P2P + INR pairs); WazirX (regulatory caveats); Onramp.money; Mudrex; Binance P2P. Most reliable for MVP: integrate **CoinDCX API** or **Onramp.money widget**. UPI is the killer rail. | `[V]` [CryptoTimes Apr 2026 Coinbase India](https://www.cryptotimes.io/2026/04/22/coinbase-strengthens-india-presence-with-usdc-inr-launch/) |
| **Philippines (PHP)** | **PDAX** (BSP-licensed), Coins.ph, Binance P2P, GCash via stablecoin partners. **PHPC** stablecoin available on Arc via StableFX → swap to PHPC → off-ramp via Coins.ph. | `[V]` [Stablecoin emerging markets playbook](https://tazapay.com/guides/stablecoins-cross-border-payments-emerging-markets) |
| **Pakistan (PKR)** | Pakistan opened a **regulatory sandbox Q4 2025** with 3 stablecoin remit providers approved. Binance P2P dominant; informal channels common; **Sarmaaya** and others emerging. JazzCash / Easypaisa for mobile money rails. | `[V]` Tazapay |
| **Egypt (EGP)** | Binance P2P, OKX P2P, local P2P; Egyptian Pound has FX controls so off-ramping is messy. **Recommend cash pickup partner** (Western Union API integration) for production. | `[I]` |
| **Bangladesh (BDT)** | **Crypto largely restricted**. Informal P2P via Remitano/Paxful using USDT. **bKash** mobile wallet is the rail. For MVP, simulate or partner with a remit aggregator. | `[V]` Tazapay |
| **Nepal (NPR) / Sri Lanka (LKR)** | Crypto restricted in both. P2P informal. Use mobile money (eSewa, Khalti / eZ Cash). | `[I]` |
| **Generic** | **MoonPay sell-USDC** to Visa cards in many countries (incl. India, Egypt); **Onramp.money** (India, PH, PK, EG); **Coinbase** (where available). | `[V]` |

### Credible MVP demo UX (testnet, no real off-ramp wired)
1. Recipient clicks WhatsApp link → opens RailAED claim page.
2. Page shows **"You received 250 USDC ≈ ₹20,820"** with live mid-market FX.
3. Three claim options:
    - **Bank account** (collect IBAN/IFSC/SWIFT, log to backend; "demo: simulated off-ramp via Onramp.money API key").
    - **Mobile money** (UPI ID / bKash / GCash number; simulated payout).
    - **Hold as USDC** on Arc (creates a Modular Wallet via Circle Wallets for them - real on-chain transfer to a new SCA).
4. For the judge demo: pre-populate the Coinbase USDC→INR off-ramp screenshot to show production path, but use the **"Hold as USDC"** path live to demonstrate real on-chain settlement.

---

## 11. Reference: Arc sample apps and templates

All under [github.com/circlefin](https://github.com/circlefin). `[V]`

| Repo | What it shows | Why useful for RailAED |
|---|---|---|
| [`arc-p2p-payments`](https://github.com/circlefin/arc-p2p-payments) | Next.js + Modular Wallets + passkeys + Supabase, **gasless P2P on Arc** | **Best fork candidate.** Exact tech stack we want. |
| [`arc-escrow`](https://github.com/circlefin/arc-escrow) | End-to-end escrow on Arc | Pattern for payroll milestone release |
| [`arc-prediction-markets`](https://github.com/circlefin/arc-prediction-markets) | UMA + Arc | Less relevant |
| [`arc-node`](https://github.com/circlefin/arc-node) | Rust Arc node | Reference only |
| [`circle-bridge-kit-transfer`](https://github.com/circlefin/circle-bridge-kit-transfer) | Cross-chain transfers via Bridge Kit | **Direct copy for CCTP leg** |
| [`stablecoin-evm`](https://github.com/circlefin/stablecoin-evm) | USDC smart contracts | Reference |
| [`evm-cctp-contracts`](https://github.com/circlefin/evm-cctp-contracts) | CCTP V2 contracts | Reference for raw CCTP if needed |
| [`circle-cctp-fulfiller-repayment`](https://github.com/circlefin/circle-cctp-fulfiller-repayment) | Pre-fund + later-settle pattern | Useful for treasury/working-capital flow |
| [`w3s-ios-sample-app-wallets`](https://github.com/circlefin/w3s-ios-sample-app-wallets) | iOS Wallets sample | If native iOS later |
| [`skills`](https://github.com/circlefin/skills) | Claude Code skills for Circle products | **Install these locally**, the assistant will use them |
| [`malachite`](https://github.com/circlefin/malachite) | Consensus engine | Background reading only |

**Recommendation:** Start from **`arc-p2p-payments`** as the spine. Replace P2P send logic with: (a) sender flow with AED on-ramp simulation, (b) recipient claim flow with multi-corridor options, (c) employer payroll dashboard. Layer in **`circle-bridge-kit-transfer`** patterns for CCTP. Add Gateway via `@circle-fin/unified-balance-kit`. Add StableFX once API key arrives.

---

## 12. Judging criteria & past Circle hackathon winners

### Required deliverables (Stablecoin Commerce Stack Challenge)
Per the challenge page and standard Circle hackathon practice `[V]` + `[I]`:
1. **Functional MVP** deployed on Arc testnet.
2. **Architecture diagram** showing all Circle products used and data flow.
3. **Video demo** (≤ 5 min typical) demonstrating an end-to-end USDC transaction via Arc + Circle infra, with explorer verification.
4. **Public GitHub repo** with full setup docs (README, env vars, run commands).
5. **Live demo URL** (Vercel preview).
6. **Circle Product Feedback** section - what worked, what didn't, what's missing. (Judges weight this heavily - Circle's PMs read it.)
7. State the **specific track** entered (here: **Track 1: Cross-Border Payments & Remittances**).
8. Per related hackathons, demos should show **real per-action pricing**, **transaction frequency data** (50+ on-chain txs), and an explanation of why the model would fail with traditional gas. `[I]` from search snippet.

### Patterns from HackMoney 2026 Arc Track winners `[V]` [arc.io blog](https://www.arc.io/blog/meet-the-arc-track-winners-from-the-hackmoney-2026-hackathon-and-what-we-learned)

| Winner | Track | Stack | Why it won |
|---|---|---|---|
| **arctan(x)** | Chain-Abstracted USDC Apps | Arc + Circle Wallets + Gateway + Bridge Kit + StableFX | Used **5 Circle products together**; institutional FX DEX |
| **Text-to-Chain** | (same) | Dev-Controlled Wallets on Arc + CCTP | **SMS as the interface** - dramatic UX simplification |
| **ArcFlow** | Global Payouts & Treasury | Arc + Gateway + USDC | Self-paying treasury - invests idle payroll into yield then pays |
| **Versus** | Agentic Commerce on RWAs | Circle Wallets + Arc + Gateway | AI agents earning + trading creator tokens |

**Honorable mentions** all shared a theme: take a **boring real business problem** (escrow, payroll, POS, charity, construction milestones) and replace its rails with stablecoin infra, **hiding the chain entirely from end users**.

### Judging criteria (extracted) `[V]`
- **Technical execution** - does it work end-to-end?
- **Product utility** - solves a real problem?
- **Integration quality** - number and depth of Circle products integrated.
- **Polish** - invisible-chain UX, mobile-friendly.

### Tactical takeaways for RailAED
1. **Integrate 4+ Circle products** (Wallets, CCTP/Bridge Kit, Gateway, Nanopayments; StableFX if access granted).
2. **Hide the chain entirely** - never show a hex address in the main UI. Use passkeys, phone numbers, email.
3. **Solve a boring problem really well** - remittance is boring; that's the point.
4. **Write a strong Circle Product Feedback section** with at least 3 concrete pain points or feature requests.

---

## 13. Recommended architecture (RailAED)

### Stack
| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 App Router** on **Vercel Fluid Compute** | Server Actions, RSC, streaming, sponsored runtime; matches `arc-p2p-payments` |
| Styling | **Tailwind CSS + shadcn/ui** | Matches Circle sample; fast |
| Auth (consumer) | **Circle Modular Wallets** (passkey) + **Google OAuth** fallback | Zero-crypto-knowledge onboarding |
| Auth (employer) | Clerk via Vercel Marketplace OR Circle Modular Wallet with email OTP | Workspace-level access control |
| DB | **Supabase** (Postgres) - RLS for multi-tenant payroll | Matches sample; free tier |
| Backend payments | **Circle REST API** (developer-controlled wallets) | For server-initiated treasury & payroll |
| Cross-chain | **Bridge Kit** (`@circle-fin/bridge-kit`) + adapter-viem-v2 | One-call CCTP V2 |
| Treasury | **Circle Gateway** (`@circle-fin/unified-balance-kit`) | Unified balance across Arc + Base + Ethereum |
| Streaming payroll | **Circle Nanopayments** API | Per-second contractor pay (wow factor) |
| FX | **Circle StableFX** (if access granted) for USDC↔PHPC; **Wise / Onramp.money API** for INR/PKR/EGP (simulated for demo) | Multi-corridor coverage |
| Compliance hooks | Sumsub (KYC), Notabene-stub for Travel Rule | Production-ready scaffolding |
| AI features | **Vercel AI Gateway** + Claude (for "smart receipt" parser, FX explainer) | Optional wow |
| Observability | Vercel logs + custom tx-log table | Show 50+ on-chain txs |
| Deployment | **Vercel** (preview + production) | Demo URL required |

### Sender flow (consumer remittance)
```
1. Sender opens RailAED → "Send money home"
2. Modular Wallet created via passkey (Circle Wallets, gas sponsored)
3. KYC: Sumsub web SDK (sandbox mode for demo)
4. Enter recipient: phone number + country (e.g. +91 for India)
5. Enter amount in AED: "1,000 AED → ₹20,820 (rate: 20.82)"
       compared live to Al Ansari (₹20,680), Wise (₹20,740), WU (₹20,610)
6. AED on-ramp (DEMO: simulated; PROD: BitOasis/Rain partner API → AED to USDC)
7. USDC minted into sender's Modular Wallet on Arc
8. CCTP V2 Fast Transfer via Bridge Kit → if recipient prefers a non-Arc chain,
   bridge in ~8-20s. Otherwise keep on Arc for sub-sec settlement.
9. Generate one-time claim link → WhatsApp deep link to recipient
10. Sender sees Arc explorer link as proof
```

### Recipient flow
```
1. Recipient taps WhatsApp link
2. Mini-app opens → "You received 250 USDC ≈ ₹20,820"
3. Three claim options:
    a. Bank → UPI/IMPS (DEMO: simulated via Onramp.money; PROD: real off-ramp)
    b. Mobile money (GCash / bKash / Easypaisa) - same
    c. Hold as USDC → creates Circle Modular Wallet for them (passkey on their device)
4. If "Hold", real USDC transfer on Arc with explorer proof
5. Confirmation + savings summary: "You saved AED 12 vs Al Ansari"
```

### Payroll flow (employer dashboard)
```
1. Employer signs in (email OTP, dev-controlled wallet on backend)
2. Upload contractor CSV: name, email, country, monthly amount (AED or USD)
3. RailAED uses Gateway: USDC pooled across Arc + Base (treasury)
4. On payday: sign one EIP-712 BurnIntentSet covering up to 16 contractors
5. Gateway mints USDC on each contractor's preferred chain in <500ms each
6. Each contractor receives notification + claim link (same as recipient flow)
7. Dashboard shows: total paid, savings vs SWIFT (typically 3-7%), Arc explorer txs
```

### Three "wow" features for the judge demo
1. **Streaming payroll via Nanopayments.** Toggle on a contractor's profile: *"Pay per second worked"*. Their dashboard ticks up in real time as their work timer runs. Demonstrate 1,000+ Nanopayment txs in 5 minutes. **No other remit/payroll product can do this today.** This directly targets the hackathon's "50+ on-chain txs" + "explain why traditional gas would fail" criteria.

2. **"Honesty score" - live competitive FX widget.** On the send screen, RailAED shows the user's quote vs. **live** Al Ansari, Western Union, Remitly, and Wise quotes (scraped or via affiliate APIs). Always highlight the savings. Builds extreme trust with a UAE expat audience that has been burned by hidden FX margins.

3. **WhatsApp-native recipient with passkey custody.** Recipient never installs an app, never sees a seed phrase, never sees a hex address. One tap on a WhatsApp link → passkey on their phone → either off-ramp or keep USDC. The "send money home as easily as a WhatsApp voice note" pitch lands hard with judges familiar with the corridor.

### Circle products integrated (count: 5)
1. **Arc** - settlement chain
2. **Circle Wallets** (Modular for consumers, Developer-Controlled for treasury)
3. **CCTP V2** via **Bridge Kit** (for non-Arc destinations)
4. **Circle Gateway** (treasury + bulk payroll)
5. **Nanopayments** (streaming payroll wow feature)
6. **StableFX** (if access - for PHPC corridor)

### Architecture diagram (text)
```
        ┌──────────────────────────────────────────────────────────┐
        │  RailAED Frontend (Next.js 16 on Vercel, Modular Wallet) │
        └──────────────┬───────────────────────────────┬───────────┘
                       │                               │
       ┌───────────────▼────────────────┐   ┌──────────▼───────────┐
       │  Sender flow (passkey, AED)    │   │ Employer dashboard   │
       └───────────────┬────────────────┘   └──────────┬───────────┘
                       │                               │
         ┌─────────────▼─────────────┐    ┌────────────▼───────────┐
         │ AED→USDC on-ramp (sim)    │    │ Treasury (Gateway)     │
         │  BitOasis / Rain (prod)   │    │ Multi-chain USDC pool  │
         └─────────────┬─────────────┘    └────────────┬───────────┘
                       │                               │
                       ▼                               ▼
        ┌──────────────────────────────────────────────────────────┐
        │              Arc Testnet (chain ID 5042002)              │
        │   USDC settlement / Nanopayments streaming ledger        │
        └─────────┬────────────────┬──────────────┬────────────────┘
                  │ CCTP V2        │ Gateway      │ StableFX
                  │ Bridge Kit     │ unified bal  │ (PHPC swap)
                  ▼                ▼              ▼
        ┌────────────────────────────────────────────────────────┐
        │  Recipient claim page (WhatsApp deep link)             │
        │   → Bank/UPI (sim)  → Mobile money (sim)  → Hold USDC  │
        └────────────────────────────────────────────────────────┘
```

### Critical "Circle Product Feedback" notes to capture during build
- StableFX onboarding latency (KYB → API key turnaround).
- Whether AED partner stablecoin is on roadmap.
- Gateway unified-balance-kit DX (vs. raw API).
- Nanopayments DX for use cases beyond AI agents.
- Bridge Kit error handling on attestation timeouts.
- Modular Wallets passkey recovery story (lost device).

---

## Open questions / known unknowns

1. **Mainnet timing.** Arc mainnet "summer 2026" but not firm. Demo must work on testnet end-to-end and we should *not* depend on mainnet.
2. **StableFX hackathon access.** Submit `customer-support@circle.com` request with subject "Circle Hackathon - USYC or StableFX testnet request" **immediately** - every day of delay matters.
3. **AED stablecoin in StableFX.** Not currently a partner. May need to integrate AE Coin directly off the Gateway/StableFX path; check AE Coin docs once they exist.
4. **Bangladesh / Pakistan crypto status.** Pakistan sandbox is promising but limited; Bangladesh remains restrictive. Treat as "demo with simulated off-ramp partner."
5. **Circle Wallets exact free-tier limits.** Need to confirm at [Circle developer fee schedule](https://help.circle.com/s/article/Developer-platform-fee-schedule?language=en_US) - free for first 1,000 MAW per public snippets, but hackathon volume is well under that.
6. **Hackathon judging weight.** Get clarification on whether Circle Product Feedback is weighted (HackMoney suggests yes); if so, allocate writing time.

---

*End of research dossier.*
