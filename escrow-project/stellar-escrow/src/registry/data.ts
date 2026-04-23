export interface Escrow {
  id: string;
  title: string;
  description: string;
  freelancer: string;
  client: string;
  amount: string;
  status: 'funded' | 'submitted' | 'released';
  txHash: string;
  timestamp: number;
  fee?: string;
  sequence?: string;
  xdr?: string;
}

// PERMANENT PROJECT REGISTRY (Numeric IDs for Contract Compatibility)
// Tied to: GBCZT2JMQPV3FZS35W7ECVOTTSEOBOPWW4BYCX3WOVHXICWXVZTS7IXY
export const registryData: Escrow[] = [
  {
    id: "101",
    title: "Technical Whitepaper Polish",
    description: "Structural refactoring and grammar enhancement for a decentralized finance whitepaper. Ensuring perfect semantic clarity for a global audience with deep technical explanations.",
    freelancer: "GDZPR6JIXAPBDGK7GQTAJ2EGPTL2W5MRFKJICVGIG3LCNJ7I6QWY4UFK",
    client: "GBCZT2JMQPV3FZS35W7ECVOTTSEOBOPWW4BYCX3WOVHXICWXVZTS7IXY",
    amount: "150 XLM",
    status: "funded",
    txHash: "4b72ed41ea3c47fe90ec5cb49341b3da61971490216698949826a7605d8f76380",
    timestamp: 1713876000000,
    fee: "0.266",
    sequence: "9379731833094160",
    xdr: "AAAAAgAAAAD...[AUDIT_PROOF]"
  },
  {
    id: "102",
    title: "Soroban Contract Security Audit",
    description: "Deep-dive logic verification for an automated escrow system. Identifying edge-cases in gas consumption and state storage for high-performance blockchain operations.",
    freelancer: "GBCZT2JMQPV3FZS35W7ECVOTTSEOBOPWW4BYCX3WOVHXICWXVZTS7IXY",
    client: "GDZPR6JIXAPBDGK7GQTAJ2EGPTL2W5MRFKJICVGIG3LCNJ7I6QWY4UFK",
    amount: "500 XLM",
    status: "funded",
    txHash: "d33bccd24072223933c09f874558e8b61971490216698949826a7605d8f76380",
    timestamp: 1713886000000,
    fee: "0.450",
    sequence: "9379731833094200",
    xdr: "AAAAAgAAAAD...[SECURITY_PROOF]"
  },
  {
    id: "103",
    title: "UI/UX Accessibility Sprint",
    description: "Implementing WCAG 2.1 compliance for a blockchain dashboard. Focus on screen-reader compatibility and high-contrast color palettes for inclusive user experiences.",
    freelancer: "GBCZT2JMQPV3FZS35W7ECVOTTSEOBOPWW4BYCX3WOVHXICWXVZTS7IXY",
    client: "GBCZT2JMQPV3FZS35W7ECVOTTSEOBOPWW4BYCX3WOVHXICWXVZTS7IXY",
    amount: "275 XLM",
    status: "submitted",
    txHash: "e55bccd24072223933c09f874558e8b61971490216698949826a7605d8f76380",
    timestamp: 1713896000000,
    fee: "0.210",
    sequence: "9379731833094300",
    xdr: "AAAAAgAAAAD...[DESIGN_PROOF]"
  },
  {
    id: "104",
    title: "Global Translation: LatAm Market",
    description: "Expert semantic translation of 200+ UI components from English to Spanish. Ensuring regional context for Latin American users in the financial sector.",
    freelancer: "GDZPR6JIXAPBDGK7GQTAJ2EGPTL2W5MRFKJICVGIG3LCNJ7I6QWY4UFK",
    client: "GBCZT2JMQPV3FZS35W7ECVOTTSEOBOPWW4BYCX3WOVHXICWXVZTS7IXY",
    amount: "80 XLM",
    status: "released",
    txHash: "f11bccd24072223933c09f874558e8b61971490216698949826a7605d8f76380",
    timestamp: 1713906000000,
    fee: "0.150",
    sequence: "9379731833094400",
    xdr: "AAAAAgAAAAD...[GLOBAL_PROOF]"
  },
  {
    id: "105",
    title: "Smart Contract Optimization",
    description: "Refactoring existing Soroban logic to reduce WASM size and minimize resource fees for high-frequency trading scenarios.",
    freelancer: "GBCZT2JMQPV3FZS35W7ECVOTTSEOBOPWW4BYCX3WOVHXICWXVZTS7IXY",
    client: "GDZPR6JIXAPBDGK7GQTAJ2EGPTL2W5MRFKJICVGIG3LCNJ7I6QWY4UFK",
    amount: "320 XLM",
    status: "funded",
    txHash: "a11bccd24072223933c09f874558e8b61971490216698949826a7605d8f76390",
    timestamp: 1713916000000,
    fee: "0.300",
    sequence: "9379731833094500",
    xdr: "AAAAAgAAAAD...[OPTIM_PROOF]"
  },
  {
    id: "106",
    title: "Market Analysis: Stellar Lumens",
    description: "Weekly price movement analysis and volume metrics for the XLM/USDC pair. Identifying liquidity trends across primary DEX providers.",
    freelancer: "GDZPR6JIXAPBDGK7GQTAJ2EGPTL2W5MRFKJICVGIG3LCNJ7I6QWY4UFK",
    client: "GBCZT2JMQPV3FZS35W7ECVOTTSEOBOPWW4BYCX3WOVHXICWXVZTS7IXY",
    amount: "45 XLM",
    status: "funded",
    txHash: "b22bccd24072223933c09f874558e8b61971490216698949826a7605d8f76400",
    timestamp: 1713926000000,
    fee: "0.100",
    sequence: "9379731833094600",
    xdr: "AAAAAgAAAAD...[MARKET_PROOF]"
  },
  {
    id: "107",
    title: "Logo Vectorization Sprint",
    description: "Converting hand-drawn brand concepts into high-fidelity SVG assets. Ensuring perfect scalability for both mobile and large-format printing.",
    freelancer: "GBCZT2JMQPV3FZS35W7ECVOTTSEOBOPWW4BYCX3WOVHXICWXVZTS7IXY",
    client: "GDZPR6JIXAPBDGK7GQTAJ2EGPTL2W5MRFKJICVGIG3LCNJ7I6QWY4UFK",
    amount: "95 XLM",
    status: "funded",
    txHash: "c33bccd24072223933c09f874558e8b61971490216698949826a7605d8f76410",
    timestamp: 1713936000000,
    fee: "0.120",
    sequence: "9379731833094700",
    xdr: "AAAAAgAAAAD...[LOGO_PROOF]"
  },
  {
    id: "108",
    title: "Data Pipeline Automation",
    description: "Writing specialized scripts to automate the extraction and formatting of on-chain ledger data into a client-facing reporting dashboard.",
    freelancer: "GBCZT2JMQPV3FZS35W7ECVOTTSEOBOPWW4BYCX3WOVHXICWXVZTS7IXY",
    client: "GBCZT2JMQPV3FZS35W7ECVOTTSEOBOPWW4BYCX3WOVHXICWXVZTS7IXY",
    amount: "400 XLM",
    status: "submitted",
    txHash: "d44bccd24072223933c09f874558e8b61971490216698949826a7605d8f76420",
    timestamp: 1713946000000,
    fee: "0.350",
    sequence: "9379731833094800",
    xdr: "AAAAAgAAAAD...[DATA_PROOF]"
  }
];
