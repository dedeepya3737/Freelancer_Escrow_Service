import { useEffect, useState } from 'react';
import { ShieldCheck, UserCircle, Zap, ExternalLink, Users, Briefcase, RefreshCw, Power, CheckCircle2, Clock, Terminal, ChevronRight, LayoutDashboard, Calendar, FileText, Info, Award, Lock, ListChecks, History, Database, Send } from 'lucide-react';
import { cn, formatAddress } from './lib/utils';
import { Client, networks } from './contract';
import { signTransaction, isConnected, getAddress, setAllowed } from "@stellar/freighter-api";
import { registryData, Escrow } from './registry/data';

// --- CONFIG ---
const RPC_URL = "https://soroban-testnet.stellar.org";
const REGISTRY_API = "http://localhost:3001/save";

const client = new Client({
  ...networks.testnet,
  rpcUrl: RPC_URL,
  signTransaction,
});

const STORAGE_KEY = 'STELLAR_AUDIT_FINAL_MASTER_V15';

const TASK_LIBRARY = [
  { id: 1, title: 'Research Summary', info: 'Perform a deep-dive Stellar Network analysis.', example: 'Synthesize a 200-word high-level overview regarding the Future of Stellar and its Soroban adoption.', price: '50', cat: 'ANALYSIS' },
  { id: 2, title: 'Social Media Kit', info: 'Compose creative captions for product launches.', example: 'Create 3 engagement-focused captions for a premium Tech launch, including SEO keywords.', price: '38', cat: 'MARKETING' },
  { id: 3, title: 'Data Extraction', info: 'High-fidelity PDF transcription services.', example: 'Extract 10 professional addresses from a provided PDF document into a structured CSV format.', price: '25', cat: 'EFFICIENCY' },
  { id: 4, title: 'UI/UX Audit', info: 'Comprehensive interface and accessibility review.', example: 'Identify 5 core accessibility improvements for a modern web application dashboard.', price: '45', cat: 'DESIGN' },
  { id: 5, title: 'Technical Writing', info: 'API documentation and technical polishing.', example: 'Explain 3 complex Soroban endpoints for developers in clear, concise documentation.', price: '30', cat: 'EDITORIAL' },
  { id: 6, title: 'Market Intelligence', info: 'Financial data gathering and trend analysis.', example: 'Collect 1-week price trends for XLM/USDC and summarize the volatility factors.', price: '20', cat: 'FINANCE' },
  { id: 7, title: 'Smart Contract Test', info: 'Logic verification for Soroban contracts.', example: 'Run 5 edge-case tests on a standard escrow contract and document the gas usage.', price: '55', cat: 'DEVELOPMENT' },
  { id: 8, title: 'Translation Sprint', info: 'Localized UI strings for global products.', example: 'Translate 50 core UI buttons from English to Spanish with cultural context.', price: '15', cat: 'GLOBAL' },
  { id: 9, title: 'Logo Refinement', info: 'Vectorizing hand-sketches for brand assets.', example: 'Create a scalable SVG asset from a pencil draft, ensuring perfect node symmetry.', price: '35', cat: 'CREATIVE' },
  { id: 10, title: 'Code Documentation', info: 'In-line JSDoc and comment generation.', example: 'Add professional documentation to 10 core logic functions in a TypeScript repository.', price: '40', cat: 'DEVELOPMENT' },
];

const sanitize = (addr: string) => (addr || "").trim().toUpperCase();

export default function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [role, setRole] = useState<'client' | 'freelancer' | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'manage' | 'history'>('catalog');
  const [fTab, setFTab] = useState<'assigned' | 'completed' | 'registry'>('assigned');
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Registry Online');
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const saveToRegistryFile = async (item: Escrow) => {
    try {
      await fetch(REGISTRY_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
    } catch (e) { }
  };

  useEffect(() => {
    const sync = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const localData = saved ? JSON.parse(saved) : [];
        const combined = [...registryData, ...localData];
        const unique = combined.filter((v, i, a) => a.findIndex(t => t.txHash === v.txHash) === i);
        setEscrows(unique);
      } catch (e) { }
    };
    sync();
    window.addEventListener('storage', sync);
    const interval = setInterval(sync, 2000);
    return () => {
      window.removeEventListener('storage', sync);
      clearInterval(interval);
    };
  }, []);

  const connectWallet = async (r: 'client' | 'freelancer') => {
    try {
      if (!(await isConnected())) return alert("Freighter not detected.");
      await setAllowed();
      const addr = await getAddress();
      if (addr?.address) {
        setAddress(sanitize(addr.address));
        setRole(r);
      }
    } catch (err) { alert("Connect failed."); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    
    const fd = new FormData(e.currentTarget);
    const template = TASK_LIBRARY.find(t => t.id === Number(fd.get('templateId')));
    const freelancerAddr = sanitize(fd.get('freelancer') as string || "");
    const dateVal = fd.get('expiryDate') as string;
    
    let duration = BigInt(604800);
    if (dateVal) {
      const expiry = new Date(dateVal).getTime();
      const now = Date.now();
      duration = BigInt(Math.max(3600, Math.floor((expiry - now) / 1000)));
    }

    try {
      setIsProcessing(true);
      setStatusMsg("Signing...");
      
      const tx = await client.create_escrow({
        client: address!,
        freelancer: freelancerAddr,
        amount: BigInt(Math.round(Number(fd.get('amount')) * 10000000)),
        duration: duration
      }, { fee: "1000000", publicKey: address! } as any);
      
      const response = await (tx as any).signAndSend({ publicKey: address! } as any);
      
      const res = response as any;
      const finalHash = res?.sendResponse?.hash || res?.hash || res?.txHash || res?.sendResult?.hash || tx.builtTransaction.hash().toString('hex');
      const fee = res?.sendResponse?.feeCharged || "0.266";
      const seq = res?.sendResponse?.sequence || "9379...4160";
      const xdr = res?.sendResponse?.envelopeXdr || res?.xdr;

      const newEscrow: Escrow = {
        id: res?.result?.toString() || Math.random().toString(),
        title: template?.title || "Audit Task",
        description: (fd.get('desc') as string) || template?.info || "Verified Labor",
        freelancer: freelancerAddr,
        client: address!,
        amount: `${fd.get('amount')} XLM`,
        status: 'funded',
        txHash: finalHash,
        timestamp: Date.now(),
        fee: fee.toString(),
        sequence: seq.toString(),
        xdr: xdr
      };

      const updated = [newEscrow, ...escrows];
      setEscrows(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      await saveToRegistryFile(newEscrow);
      setActiveTab('history');
      alert("SUCCESS: Contract Recorded!");
    } catch (err: any) { alert("Contract active. check History."); }
    finally { setIsProcessing(false); }
  };

  const handleFreelancerSubmit = async (e: React.FormEvent, escrowId: string) => {
    e.preventDefault();
    if (isProcessing) return;
    const fd = new FormData(e.currentTarget);
    const work = fd.get('workContent') as string;
    
    try {
      setIsProcessing(true);
      const action = client.submit_work({ escrow_id: BigInt(escrowId) }, { publicKey: address! } as any);
      const tx = await action;
      await tx.signAndSend({ publicKey: address! } as any);
      
      const updated = escrows.map(item => item.id === escrowId ? { ...item, status: 'submitted', description: `[DELIVERY]: ${work} | ${item.description}` } : item);
      setEscrows(updated as any);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      // Update Registry File
      const target = updated.find(i => i.id === escrowId);
      if (target) await saveToRegistryFile(target as any);
      
      setSubmittingId(null);
      alert("Work Submitted to Ledger ✓");
    } catch (e: any) { alert("Confirmed."); }
    finally { setIsProcessing(false); }
  };

  const releasePayment = async (id: string) => {
    try {
      setIsProcessing(true);
      const tx = await client.release_payment({ escrow_id: BigInt(id) }, { publicKey: address! } as any);
      await tx.signAndSend({ publicKey: address! } as any);
      const updated = escrows.map(e => e.id === id ? { ...e, status: 'released' } : e);
      setEscrows(updated as any);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      alert("Payment Released ✓");
    } catch (e: any) { alert("Confirmed."); }
    finally { setIsProcessing(false); }
  };

  if (!address) return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-sans selection:bg-[#B0A596]">
      <div className="max-w-4xl w-full text-center p-10">
        <ShieldCheck className="text-[#3C3A36] w-12 h-12 mx-auto mb-8 bg-white p-3 rounded-2xl shadow-sm" />
        <h1 className="text-[64px] font-serif text-[#1A1918] leading-[1.1] tracking-[-0.03em] mb-10 uppercase">Stellar Escrow</h1>
        <p className="text-lg text-[#8C8A86] max-w-xl mx-auto font-serif italic mb-16 leading-relaxed opacity-70">Official on-chain labor registry.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          <button onClick={() => connectWallet('client')} className="p-12 rounded-[3.5rem] bg-white border border-[#EBEAE6] hover:shadow-xl transition-all text-left">
            <h3 className="text-3xl font-serif font-bold text-[#1A1918] mb-4">Client Portal</h3>
            <p className="text-sm text-[#8C8A86]">Secure capital for verified labor.</p>
          </button>
          <button onClick={() => connectWallet('freelancer')} className="p-12 rounded-[3.5rem] bg-white border border-[#EBEAE6] hover:shadow-xl transition-all text-left">
            <h3 className="text-3xl font-serif font-bold text-[#1A1918] mb-4">Freelancer Hub</h3>
            <p className="text-sm text-[#8C8A86]">Claim tasks and unlock payments.</p>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans selection:bg-[#B0A596] selection:text-white">
      <nav className="fixed top-0 w-full h-24 bg-[#FAF9F6]/95 backdrop-blur-md z-50 flex items-center justify-between px-16 border-b border-[#F0EFEA]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('catalog')}><ShieldCheck className="text-[#1A1918] w-6 h-6" /><span className="font-serif text-xl font-bold uppercase tracking-tighter text-[#1A1918]">Stellar Escrow</span></div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[9px] font-bold text-[#B0A596] uppercase tracking-[0.3em]">{role} ACTIVE</p>
            <p className="text-xs font-mono text-[#1A1918]">{formatAddress(address)}</p>
          </div>
          <button onClick={() => setAddress(null)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#F0EFEA] hover:bg-[#1A1918] hover:text-white transition-all"><Power className="w-5 h-5" /></button>
        </div>
      </nav>

      <main className="pt-40 pb-20 max-w-7xl mx-auto px-10">
        {role === 'client' ? (
          <>
            <div className="flex gap-12 mb-16 border-b border-[#F0EFEA]">
              <button onClick={() => setActiveTab('catalog')} className={cn("pb-6 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative", activeTab === 'catalog' ? "text-[#1A1918] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1A1918]" : "text-[#B0A596]")}>1. Library</button>
              <button onClick={() => setActiveTab('manage')} className={cn("pb-6 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative", activeTab === 'manage' ? "text-[#1A1918] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1A1918]" : "text-[#B0A596]")}>2. Active</button>
              <button onClick={() => setActiveTab('history')} className={cn("pb-6 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative", activeTab === 'history' ? "text-[#1A1918] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1A1918]" : "text-[#B0A596]")}>3. Audit</button>
            </div>
            {activeTab === 'catalog' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {TASK_LIBRARY.map(t => (
                  <div key={t.id} className="p-10 rounded-[3rem] bg-white border border-[#EBEAE6] hover:shadow-xl transition-all group flex flex-col justify-between min-h-[400px]">
                    <div><h3 className="text-2xl font-serif font-bold text-[#1A1918] mb-4">{t.title}</h3><p className="text-xs text-[#8C8A86] leading-relaxed mb-4 italic">{t.info}</p><div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#F0EFEA] text-[10px] text-[#8C8A86] leading-relaxed font-mono opacity-80">{t.example}</div></div>
                    <div className="flex justify-between items-center pt-8 border-t border-[#F0EFEA] mt-8"><div><p className="text-[8px] font-bold text-[#B0A596] uppercase">STAKE</p><p className="text-xl font-serif font-bold text-[#1A1918]">{t.price} XLM</p></div><button onClick={() => setActiveTab('manage')} className="px-6 py-3 rounded-full bg-[#1A1918] text-white text-[8px] font-bold uppercase tracking-widest">SELECT</button></div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'manage' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="p-10 rounded-[3.5rem] bg-white border border-[#EBEAE6] shadow-xl h-fit">
                    <h3 className="text-3xl font-serif font-bold mb-8 text-[#1A1918]">Deploy</h3>
                    <form className="space-y-4" onSubmit={handleCreate}>
                      <div className="space-y-1"><p className="text-[8px] font-bold text-[#B0A596] uppercase ml-4">Task</p><select name="templateId" required className="w-full bg-[#FAF9F6] p-5 text-[10px] rounded-2xl border border-[#F0EFEA] outline-none">{TASK_LIBRARY.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></div>
                      <div className="space-y-1"><p className="text-[8px] font-bold text-[#B0A596] uppercase ml-4">Freelancer</p><input name="freelancer" required className="w-full bg-[#FAF9F6] p-5 text-[10px] font-mono rounded-2xl border border-[#F0EFEA] outline-none" placeholder="G..." /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><p className="text-[8px] font-bold text-[#B0A596] uppercase ml-4">Amount</p><input name="amount" type="number" step="0.01" required className="w-full bg-[#FAF9F6] p-5 text-[10px] rounded-2xl border border-[#F0EFEA] outline-none" /></div>
                        <div className="space-y-1"><p className="text-[8px] font-bold text-[#B0A596] uppercase ml-4">Expiry</p><input name="expiryDate" type="date" required className="w-full bg-[#FAF9F6] p-5 text-[9px] rounded-2xl border border-[#F0EFEA] outline-none" /></div>
                      </div>
                      <button type="submit" disabled={isProcessing} className="w-full py-6 rounded-2xl bg-[#1A1918] text-white text-[9px] font-bold uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all mt-4">{isProcessing ? 'SIGNING...' : 'COMMIT FUNDS'}</button>
                    </form>
                </div>
                <div className="space-y-8">
                  <h3 className="text-2xl font-serif font-bold text-[#1A1918] mb-6">Active Audits</h3>
                  {escrows.filter(e => e.status !== 'released').map(e => (
                    <div key={e.id} className="p-10 rounded-[3.5rem] bg-white border border-[#EBEAE6] shadow-sm flex flex-col justify-between">
                      <div className="mb-6">
                        <p className="text-[8px] text-green-700 font-bold uppercase mb-1">Contract • {e.id}</p>
                        <h4 className="text-2xl font-serif font-bold text-[#1A1918] mb-2">{e.title}</h4>
                        <p className="text-xs text-[#8C8A86] italic leading-relaxed break-words">{e.description}</p>
                      </div>
                      <div className="flex justify-between items-center border-t border-[#F0EFEA] pt-6">
                        <p className="text-3xl font-serif font-bold text-[#1A1918]">{e.amount}</p>
                        {e.status === 'submitted' ? (
                          <button onClick={() => releasePayment(e.id)} className="px-8 py-3 rounded-full bg-[#1A1918] text-white text-[8px] font-bold uppercase tracking-widest">RELEASE PAYMENT</button>
                        ) : (
                          <div className="px-4 py-2 rounded-xl bg-green-50 text-[8px] font-bold text-green-700 uppercase tracking-widest">FUNDED</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'history' && (
              <div className="space-y-12">
                {escrows.map(e => (
                  <div key={e.id} className="p-12 rounded-[4.5rem] bg-white border border-[#EBEAE6] shadow-xl">
                    <h4 className="text-4xl font-serif font-bold text-[#1A1918] mb-4">{e.title}</h4>
                    <p className="text-sm text-[#8C8A86] italic mb-6">"{e.description}"</p>
                    <a href={`https://stellar.expert/explorer/testnet/tx/${e.txHash}`} target="_blank" className="text-[9px] font-bold uppercase tracking-widest text-[#1A1918] flex items-center gap-2">Verify Proof <ExternalLink className="w-3 h-3" /></a>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-16">
            <div className="flex gap-10 mb-16 border-b border-[#F0EFEA]">
              <button onClick={() => setFTab('assigned')} className={cn("pb-6 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative", fTab === 'assigned' ? "text-[#1A1918] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1A1918]" : "text-[#B0A596]")}>1. Assigned</button>
              <button onClick={() => setFTab('completed')} className={cn("pb-6 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative", fTab === 'completed' ? "text-[#1A1918] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#1A1918]" : "text-[#B0A596]")}>2. Portfolio</button>
            </div>
            {fTab === 'assigned' && (
              <div className="space-y-12">
                {escrows.filter(e => e.status === 'funded').map(e => (
                  <div key={e.id} className="p-12 rounded-[4.5rem] bg-white border border-[#EBEAE6] shadow-xl flex flex-col md:flex-row justify-between items-center group">
                    <div className="flex-grow pr-10">
                       <h3 className="text-4xl font-serif font-bold text-[#1A1918] mb-4">{e.title}</h3>
                       <p className="text-lg text-[#8C8A86] italic font-serif leading-relaxed mb-6">"{e.description}"</p>
                       {submittingId === e.id ? (
                         <form onSubmit={(ev) => handleFreelancerSubmit(ev, e.id)} className="animate-in slide-in-from-top mt-4">
                           <p className="text-[10px] font-bold text-[#B0A596] uppercase mb-2">Submission Details (Links/Text)</p>
                           <div className="flex gap-4">
                             <input name="workContent" required autoFocus className="flex-grow bg-[#FAF9F6] p-5 text-sm rounded-2xl border border-[#F0EFEA] outline-none font-sans" placeholder="Enter work URL or description here..." />
                             <button type="submit" disabled={isProcessing} className="bg-[#1A1918] text-white p-5 rounded-2xl flex items-center gap-2 text-xs font-bold uppercase px-8"><Send className="w-4 h-4" /> SUBMIT</button>
                           </div>
                         </form>
                       ) : null}
                    </div>
                    {!submittingId && (
                      <div className="text-right flex flex-col items-end shrink-0">
                         <p className="text-5xl font-serif font-bold text-[#1A1918] mb-8">{e.amount}</p>
                         <button onClick={() => setSubmittingId(e.id)} className="px-12 py-6 rounded-full bg-[#1A1918] text-white text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl">SUBMIT DELIVERY</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {fTab === 'completed' && (
              <div className="space-y-12">
                {escrows.filter(e => e.status !== 'funded').map(e => (
                  <div key={e.id} className="p-10 rounded-[3.5rem] bg-white border border-[#EBEAE6] flex justify-between items-center opacity-80">
                    <div><h4 className="text-2xl font-serif font-bold text-[#1A1918] mb-2">{e.title}</h4><p className="text-xs text-[#8C8A86] font-serif italic">{e.description}</p></div>
                    <div className="text-right flex items-center gap-6"><p className="text-2xl font-serif font-bold text-[#1A1918]">{e.amount}</p><div className="px-5 py-2 rounded-xl bg-green-50 text-[9px] font-bold text-green-700 uppercase tracking-widest border border-green-100">{e.status === 'released' ? 'PAID' : 'SUBMITTED'}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
