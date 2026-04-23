# Stellar Freelance Escrow

## Project Title
**Trustless Escrow Smart Contract**

## Project Description
The Stellar Freelance Escrow is a professional, Soroban-based smart contract platform built on the Stellar blockchain. It enables secure, trustless payments between clients and freelancers. By locking funds in a digital "referee" contract, we ensure that freelancers are guaranteed payment upon work approval, while clients are protected by a conditional release mechanism and an automated refund system for missed deadlines.

This platform removes the need for expensive intermediaries and provides 100% transparency through blockchain-verified transaction proofs.

## Project Vision
Our vision is to empower the global freelance economy with elite, decentralized financial tools that promote:

- **Absolute Trust**: Eliminate "payment anxiety" for freelancers by securing funds on-chain before work begins.
- **Client Security**: Protect clients from non-delivery with automated refund mechanisms and conditional approval.
- **Global Accessibility**: Leverage the Stellar network's speed and low fees to make professional escrow services available to everyone, everywhere.
- **Radical Transparency**: Every job milestone is etched into the blockchain, providing an immutable audit log of work and payment.

## Key Features

### 1. **Secure Escrow Creation**
- Clients can lock funds for a specific freelancer with a defined deadline.
- Funds are held by the contract, not by any individual, ensuring neutrality.

### 2. **Signal Completion**
- Freelancers can officially "Submit Work" on-chain, triggering a notification for the client to review.

### 3. **Conditional Release**
- Funds are only released to the freelancer's wallet once the client provides cryptographic approval.

### 4. **Automated Safety Valve (Refunds)**
- If a freelancer fails to submit work before the deadline, the client can instantly reclaim their funds.

### 5. **Blockchain Verification**
- Every action generates a unique transaction hash, linkable to official Stellar explorers for real-time auditing.

## Technical Specifications

- **Blockchain**: Stellar (Soroban Smart Contracts)
- **Language**: Rust
- **Frontend**: Vite + React (Subtle & Neat Aesthetic)
- **Wallet Integration**: Freighter Wallet

## Getting Started

### Prerequisites
- Rust toolchain (wasm32 target)
- Soroban CLI
- Freighter Browser Extension (set to Testnet)

### Building the Contract
```bash
cd contracts/hello-world
cargo build --target wasm32-unknown-unknown --release
```

### Running the Frontend
```bash
cd stellar-escrow
npm install
npm run dev
```

## License
MIT License
