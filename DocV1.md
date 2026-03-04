📅 DAILY TASK BREAKDOWN (SYNCED)
🔹 DEC 20 — FOUNDATION & ALIGNMENT DAY
🧠 Findy (Web3 + FE)
Verify deployed contracts on Moonbase:

TreasuryVault

SliqIDRegistry

MockFxOracle

Export final ABIs

Write short internal note:

Which functions frontend may call

Which functions are backend-only

Share contract addresses with backend

🧩 BACKEND
Finalize DB schema:

users

fiat_balances

crypto_balances_cache

transactions

reservoirs

Set up backend wallet:

operator wallet

reservoir crypto wallet

Confirm Privy integration plan (SDK chosen)

✅ Sync check: both agree who calls which contract functions.

🔹 DEC 21 — USER + SLIQID IDENTITY
🧠 Findy
Frontend:

SliqID registration UI

Resolve SliqID → address

Enforce: no send without resolved SliqID

🧩 BACKEND
POST /api/register-sliq

Store:

user

sliqId

wallet address (Privy or external)

Prevent duplicate SliqIDs

✅ Sync check: SliqID resolves both on-chain and in DB.

🔹 DEC 22 — PRIVY + WALLET OWNERSHIP
🧠 Findy
Integrate Privy on frontend:

Web2 signup

Wallet creation

Display wallet address in UI

🧩 BACKEND
Privy server-side config

Persist Privy wallet address

Map Privy wallet ↔ user ↔ sliqId

✅ Sync check: Web2 user has a real EOA address.

🔹 DEC 23 — CRYPTO BALANCE READS
🧠 Findy
Dashboard:

Read crypto balances from TreasuryVault

Display per token

Remove any fiat-token assumptions from UI

🧩 BACKEND
Chain listener:

PaymentRouted

Update crypto_balances_cache

GET /api/crypto-balances/:sliqId

✅ Sync check: balances update after on-chain tx.

🔹 DEC 24 — SEND: CRYPTO → CRYPTO
🧠 Findy
Send flow (crypto only):

Amount

Token

Recipient SliqID

If Web3:

approve + routePayment

If Web2:

call backend /api/send

🧩 BACKEND
/api/send

If Web2, sign tx via Privy

Call routePayment

Store tx record

Update status via events

✅ Sync check: Web2 and Web3 sends both work.


❌ DEC 25 — OFF

🔹 DEC 26 — FIAT LEDGER + RESERVOIRS
🧠 Findy
Dashboard:

Show fiat balances (read-only)

Clearly label “Off-chain”

Fiat send UI (no contract calls)

🧩 BACKEND
Initialize fiat_balances

Initialize reservoir balances

Implement FX utility (rates only, no chain)

Validation:

sufficient fiat before crypto credit

✅ Sync check: fiat balances exist independently of chain.

🔹 DEC 27 — FIAT → CRYPTO FLOW
🧠 Findy
Send fiat → crypto UI:

Input fiat amount

Show crypto equivalent

Submit to backend only

🧩 BACKEND
/api/fiat-to-crypto

Debit fiat ledger

Send crypto from reservoir wallet

Call routePayment

Record transaction

✅ Sync check: fiat debits → crypto credits on-chain.

🔹 DEC 28 — CRYPTO → FIAT FLOW
🧠 Findy
Withdraw UI:

Select crypto

Show fiat equivalent

Confirm withdrawal

🧩 BACKEND
Receive crypto into TreasuryVault

Credit fiat ledger

Update reservoir balances

Mark tx complete

✅ Sync check: crypto leaves user → fiat credited.

🔹 DEC 29 — PURCHASE (FIAT-ONLY)
🧠 Findy
Purchase UI:

Data bundle list

Uses fiat balance only

Success + failure states

🧩 BACKEND
/api/purchase

Debit fiat ledger

Mock aggregator success

Record fulfillment

Retry + idempotency

✅ Sync check: purchase does not touch chain.

🔹 DEC 30 — FULL FLOW QA + STAGING
🧠 Findy
Test flows:

Web2 signup

Receive crypto

Fiat → crypto

Crypto → crypto

Crypto → fiat

UI polish

🧩 BACKEND
Seed demo users

Deploy backend

Monitor logs + events

✅ Sync check: demo runs end-to-end without explanation.

🔹 DEC 31 — FREEZE & FUNDING READINESS
🧠 Findy
Record demo video

Prepare UI walkthrough

🧩 BACKEND
Final DB snapshot

Health checks

Disable risky endpoints

✅ Outcome:
A real hybrid fintech MVP, not a hack.


