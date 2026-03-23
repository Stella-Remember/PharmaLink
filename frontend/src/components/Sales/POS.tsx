// src/components/Sales/POS.tsx
import React, { useState, useEffect, useRef } from 'react';

// ── Insurance providers — one fixed rate each ────────────────────────────────
const PROVIDERS = [
  { id: 'RSSB',  name: 'RSSB',            fullName: 'Rwanda Social Security Board',     coverage: 85 },
  { id: 'CBHI',  name: 'CBHI',            fullName: 'Community Based Health Insurance', coverage: 85 },
  { id: 'PRIME', name: 'Prime Insurance', fullName: 'Prime Insurance Ltd',              coverage: 80 },
];



interface InventoryItem {
  id: string; medicineName?: string; name?: string;
  unitPrice?: number; sellingPrice?: number;
  quantity: number; category?: string; medicineType?: string;
}
interface CartItem { id: string; medicineName: string; unitPrice: number; quantity: number; total: number; }
interface PaymentLine { method: 'CASH' | 'MOMO' | 'CARD' | 'INSURANCE'; amount: number; }
interface InsuranceDetails {
  providerId: string; planCode: string; planName: string;
  patientName: string; policyNumber: string;
  coveragePercent: number; coveredAmount: number; patientCopay: number;
}

// ── Receipt printer ──────────────────────────────────────────────────────────
const printReceipt = (data: any) => {
  const win = window.open('', '_blank', 'width=420,height=800');
  if (!win) return;
  const ins = data.insurance;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:12px;width:300px;margin:0 auto;padding:12px}.center{text-align:center}.bold{font-weight:bold}.title{font-size:16px;font-weight:900}.divider{border-top:1px dashed #000;margin:6px 0}.row{display:flex;justify-content:space-between;margin:2px 0}.big{font-size:14px;font-weight:900}.claim{border:2px solid #000;padding:8px;margin-top:8px}.hl{background:#f5f5f5;padding:3px;font-weight:bold}@media print{body{width:100%}}</style>
</head><body>
<div class="center"><div class="title">${data.pharmacyName || 'PharmaLink'}</div><div>Pharmacy Receipt</div></div>
<div class="divider"></div>
<div class="row"><span>Invoice:</span><span class="bold">${data.invoiceNumber}</span></div>
<div class="row"><span>Date:</span><span>${new Date().toLocaleString()}</span></div>
<div class="row"><span>Cashier:</span><span>${data.pharmacist}</span></div>
<div class="divider"></div>
<div class="bold">ITEMS</div>
${data.items.map((i: any) => `<div style="margin:3px 0"><div>${i.medicineName}</div><div class="row"><span>${i.quantity} x ${i.unitPrice.toLocaleString()} RWF</span><span class="bold">${i.total.toLocaleString()} RWF</span></div></div>`).join('')}
<div class="divider"></div>
<div class="big row"><span>TOTAL</span><span>${data.total.toLocaleString()} RWF</span></div>
<div class="divider"></div>
<div class="bold">PAYMENT</div>
${data.paymentLines.map((l: any) => `<div class="row"><span>${l.method}</span><span class="bold">${l.amount.toLocaleString()} RWF</span></div>`).join('')}
${ins ? `<div class="claim">
<div class="bold center">INSURANCE CLAIM — ${ins.providerId}</div>
<div style="font-size:10px;text-align:center;margin-bottom:4px">${ins.planName}</div>
<div class="divider"></div>
<div class="row"><span>Patient:</span><span class="bold">${ins.patientName}</span></div>
<div class="row"><span>Policy #:</span><span>${ins.policyNumber}</span></div>
<div class="divider"></div>
<div class="row"><span>Total Bill:</span><span>${data.total.toLocaleString()} RWF</span></div>
<div class="row"><span>Insurance (${ins.coveragePercent}%):</span><span class="bold">${ins.coveredAmount.toLocaleString()} RWF</span></div>
<div class="row hl"><span>Patient Co-pay:</span><span class="bold">${ins.patientCopay.toLocaleString()} RWF</span></div>
</div>` : ''}
<div class="divider"></div>
<div class="center">Thank you!</div>
</body></html>`);
  win.document.close();
  setTimeout(() => { win.print(); win.close(); }, 400);
};

// ── OTP Modal ────────────────────────────────────────────────────────────────
const OTPModal: React.FC<{
  isOpen: boolean;
  phone: string;
  onVerified: () => void;
  onCancel: () => void;
}> = ({ isOpen, phone, onVerified, onCancel }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const DEMO_OTP = '123456';

  useEffect(() => {
    if (isOpen && !sent) sendOTP();
  }, [isOpen]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const sendOTP = async () => {
    setSending(true); setError('');
    await new Promise(r => setTimeout(r, 1200));
    setSent(true); setSending(false); setCountdown(60);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleInput = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val;
    setOtp(next); setError('');
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
    if (next.every(d => d) && next.join('').length === 6) verify(next.join(''));
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const verify = async (code: string) => {
    setVerifying(true); setError('');
    await new Promise(r => setTimeout(r, 800));
    if (code === DEMO_OTP) {
      onVerified();
    } else {
      setError('Incorrect code. Try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    setVerifying(false);
  };

  const maskedPhone = phone.replace(/(\+\d{3})\d{6}(\d{3})/, '$1••••••$2');

  if (!isOpen) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:70}}>
      <div style={{background:'#fff',borderRadius:16,padding:32,width:360,boxShadow:'0 20px 60px rgba(0,0,0,0.15)'}}>
        {/* Icon */}
        <div style={{display:'flex',justifyContent:'center',marginBottom:20}}>
          <div style={{width:56,height:56,borderRadius:'50%',background:'#EBF8F5',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2A9D8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/>
            </svg>
          </div>
        </div>

        <h3 style={{textAlign:'center',fontSize:18,fontWeight:700,color:'#1a2235',margin:'0 0 6px'}}>SMS Verification</h3>
        <p style={{textAlign:'center',fontSize:13,color:'#6b7280',margin:'0 0 24px',lineHeight:1.5}}>
          {sending ? 'Sending code…' : `Code sent to ${maskedPhone}`}
        </p>

        {/* OTP inputs */}
        <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:16}}>
          {otp.map((d, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
              style={{
                width:44, height:52, textAlign:'center', fontSize:22, fontWeight:700,
                border:`2px solid ${d ? '#2A9D8F' : '#E5E7EB'}`,
                borderRadius:10, outline:'none', color:'#1a2235',
                background: d ? '#EBF8F5' : '#F9FAFB',
                transition:'all 0.15s'
              }}
            />
          ))}
        </div>

        {verifying && (
          <div style={{textAlign:'center',color:'#6b7280',fontSize:13,marginBottom:12,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            <div style={{width:14,height:14,border:'2px solid #2A9D8F',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.7s linear infinite'}} />
            Verifying…
          </div>
        )}

        {error && <p style={{textAlign:'center',color:'#EF4444',fontSize:13,marginBottom:12}}>{error}</p>}

        <div style={{textAlign:'center',marginBottom:20}}>
          {countdown > 0 ? (
            <span style={{fontSize:12,color:'#9CA3AF'}}>Resend code in {countdown}s</span>
          ) : (
            <button onClick={sendOTP} style={{fontSize:12,color:'#2A9D8F',background:'none',border:'none',cursor:'pointer',fontWeight:600}}>
              Resend code
            </button>
          )}
        </div>

        <div style={{display:'flex',gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:'11px 0',border:'1.5px solid #E5E7EB',borderRadius:10,background:'#fff',color:'#6b7280',fontWeight:600,cursor:'pointer',fontSize:14}}>
            Cancel
          </button>
          <button
            onClick={() => otp.every(d => d) && verify(otp.join(''))}
            disabled={!otp.every(d => d) || verifying}
            style={{flex:2,padding:'11px 0',border:'none',borderRadius:10,background: otp.every(d=>d) && !verifying ? '#2A9D8F' : '#E5E7EB',color: otp.every(d=>d) && !verifying ? '#fff' : '#9CA3AF',fontWeight:700,cursor: otp.every(d=>d) && !verifying ? 'pointer':'not-allowed',fontSize:14,transition:'all 0.15s'}}>
            Confirm
          </button>
        </div>

        <p style={{textAlign:'center',fontSize:11,color:'#d1d5db',marginTop:14}}>Demo code: 123456</p>

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  );
};

// ── Insurance Flow Modal ─────────────────────────────────────────────────────
const InsuranceModal: React.FC<{
  isOpen: boolean;
  total: number;
  onComplete: (ins: InsuranceDetails) => void;
  onCancel: () => void;
}> = ({ isOpen, total, onComplete, onCancel }) => {
  const [step, setStep] = useState<'provider' | 'patient'>('provider');
  const [selectedProvider, setSelectedProvider] = useState<typeof PROVIDERS[0] | null>(null);
  const [policyNumber, setPolicyNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [otpOpen, setOtpOpen] = useState(false);

  useEffect(() => {
    if (isOpen) { setStep('provider'); setSelectedProvider(null); setPolicyNumber(''); setPatientName(''); }
  }, [isOpen]);

  const covered = selectedProvider ? Math.round(total * selectedProvider.coverage / 100) : 0;
  const copay = total - covered;

  if (!isOpen) return null;

  const s: Record<string, React.CSSProperties> = {
    overlay: { position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:60 },
    modal: { background:'#fff',borderRadius:20,width:'100%',maxWidth:480,boxShadow:'0 24px 64px rgba(0,0,0,0.12)',overflow:'hidden' },
    header: { background:'#1a2235',padding:'20px 24px' },
    body: { padding:'24px' },
    label: { fontSize:11,fontWeight:700,textTransform:'uppercase' as const,letterSpacing:1,color:'#6b7280',display:'block',marginBottom:6 },
    input: { width:'100%',padding:'11px 14px',border:'1.5px solid #E5E7EB',borderRadius:10,fontSize:14,color:'#1a2235',outline:'none',boxSizing:'border-box' as const,background:'#FAFAFA' },
    btn: { padding:'12px 20px',borderRadius:10,fontWeight:700,fontSize:14,cursor:'pointer',transition:'all 0.15s',border:'none' },
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',letterSpacing:2,textTransform:'uppercase',fontWeight:600}}>Insurance Payment</div>
              <div style={{fontSize:28,fontWeight:800,color:'#fff',marginTop:2}}>{total.toLocaleString()} <span style={{fontSize:14,color:'rgba(255,255,255,0.4)'}}>RWF</span></div>
            </div>
            {selectedProvider && (
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>Patient pays</div>
                <div style={{fontSize:22,fontWeight:800,color:'#2A9D8F'}}>{copay.toLocaleString()} <span style={{fontSize:12}}>RWF</span></div>
              </div>
            )}
          </div>
          {/* Step indicators */}
          <div style={{display:'flex',gap:6,marginTop:16}}>
            {['provider','patient'].map((st, i) => (
              <div key={st} style={{height:3,flex:1,borderRadius:4,background: (step === 'provider' && i === 0) || step === 'patient' ? '#2A9D8F' : 'rgba(255,255,255,0.15)',transition:'background 0.3s'}} />
            ))}
          </div>
        </div>

        <div style={s.body}>
          {/* STEP 1: Choose provider */}
          {step === 'provider' && (
            <div>
              <p style={{fontSize:13,fontWeight:600,color:'#374151',marginBottom:14}}>Select Insurance Provider</p>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {PROVIDERS.map(p => {
                  const sel = selectedProvider?.id === p.id;
                  const pCovered = Math.round(total * p.coverage / 100);
                  const pCopay = total - pCovered;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProvider(p)}
                      style={{width:'100%',padding:'14px 16px',border:`1.5px solid ${sel ? '#2A9D8F' : '#E5E7EB'}`,borderRadius:12,background: sel ? '#EBF8F5' : '#FAFAFA',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',textAlign:'left',transition:'all 0.15s'}}
                    >
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color: sel ? '#2A9D8F' : '#1a2235'}}>{p.name}</div>
                        <div style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>{p.fullName}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:12,fontWeight:700,background: sel ? '#2A9D8F' : '#E5E7EB',color: sel ? '#fff' : '#6b7280',padding:'3px 10px',borderRadius:20,marginBottom:4}}>{p.coverage}% covered</div>
                        <div style={{fontSize:11,color:'#9CA3AF'}}>Co-pay: {pCopay.toLocaleString()} RWF</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{display:'flex',gap:10,marginTop:20}}>
                <button onClick={onCancel} style={{...s.btn,flex:1,background:'#F3F4F6',color:'#6b7280'}}>Cancel</button>
                <button
                  onClick={() => selectedProvider && setStep('patient')}
                  disabled={!selectedProvider}
                  style={{...s.btn,flex:2,background: selectedProvider ? '#2A9D8F' : '#E5E7EB',color: selectedProvider ? '#fff' : '#9CA3AF',cursor: selectedProvider ? 'pointer' : 'not-allowed'}}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Patient details — simple inputs, no lookup */}
          {step === 'patient' && (
            <div>
              <button onClick={() => setStep('provider')} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#2A9D8F',background:'none',border:'none',cursor:'pointer',marginBottom:16,fontWeight:600}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                {selectedProvider?.name} — {selectedProvider?.coverage}% coverage
              </button>

              <div style={{marginBottom:14}}>
                <label style={s.label}>Policy / Member Number *</label>
                <input
                  style={s.input}
                  value={policyNumber}
                  placeholder="e.g. RSSB-001234"
                  onChange={e => setPolicyNumber(e.target.value)}
                />
              </div>

              <div style={{marginBottom:20}}>
                <label style={s.label}>Patient Full Name *</label>
                <input
                  style={s.input}
                  value={patientName}
                  placeholder="Full name as on insurance card"
                  onChange={e => setPatientName(e.target.value)}
                />
              </div>

              {/* Coverage summary */}
              <div style={{padding:'14px 16px',background:'#F9FAFB',border:'1px solid #E5E7EB',borderRadius:12,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:20,textAlign:'center'}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:'#1a2235'}}>{total.toLocaleString()}</div>
                  <div style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>Total (RWF)</div>
                </div>
                <div style={{borderLeft:'1px solid #E5E7EB',borderRight:'1px solid #E5E7EB'}}>
                  <div style={{fontSize:15,fontWeight:700,color:'#2A9D8F'}}>{covered.toLocaleString()}</div>
                  <div style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>Insurance ({selectedProvider?.coverage}%)</div>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:'#F59E0B'}}>{copay.toLocaleString()}</div>
                  <div style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>Co-pay</div>
                </div>
              </div>

              <div style={{display:'flex',gap:10}}>
                <button onClick={() => setStep('provider')} style={{...s.btn,flex:1,background:'#F3F4F6',color:'#6b7280'}}>Back</button>
                <button
                  onClick={() => patientName && policyNumber && setOtpOpen(true)}
                  disabled={!patientName || !policyNumber}
                  style={{...s.btn,flex:2,background: patientName && policyNumber ? '#2A9D8F' : '#E5E7EB',color: patientName && policyNumber ? '#fff' : '#9CA3AF',cursor: patientName && policyNumber ? 'pointer' : 'not-allowed'}}>
                  Send OTP & Confirm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <OTPModal
        isOpen={otpOpen}
        phone="+250700000000"
        onVerified={() => {
          setOtpOpen(false);
          onComplete({
            providerId: selectedProvider!.id,
            planCode: selectedProvider!.id,
            planName: selectedProvider!.name,
            patientName,
            policyNumber,
            coveragePercent: selectedProvider!.coverage,
            coveredAmount: covered,
            patientCopay: copay,
          });
        }}
        onCancel={() => setOtpOpen(false)}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
};

// ── Payment Modal ────────────────────────────────────────────────────────────
const METHODS = ['CASH', 'MOMO', 'CARD', 'INSURANCE'] as const;


const PaymentModal: React.FC<{
  isOpen: boolean; onClose: () => void;
  onComplete: (lines: PaymentLine[], ins?: InsuranceDetails) => void;
  total: number; isProcessing: boolean;
}> = ({ isOpen, onClose, onComplete, total, isProcessing }) => {
  const [method, setMethod] = useState<typeof METHODS[number]>('CASH');
  const [cashAmount, setCashAmount] = useState(total);
  const [numVal, setNumVal] = useState(String(total));
  const [insOpen, setInsOpen] = useState(false);
  const [insDetails, setInsDetails] = useState<InsuranceDetails | null>(null);

  useEffect(() => {
    if (isOpen) { setMethod('CASH'); setCashAmount(total); setNumVal(String(total)); setInsDetails(null); }
  }, [isOpen, total]);

  const change = method === 'CASH' ? Math.max(0, cashAmount - total) : 0;
  const canPay = method === 'INSURANCE' ? !!insDetails : true;

  const numpad = (k: string) => {
    let v = numVal;
    if (k === 'DEL') v = v.length > 1 ? v.slice(0, -1) : '0';
    else if (k.startsWith('+')) v = String((parseFloat(v) || 0) + parseInt(k.slice(1)));
    else v = v === '0' ? k : v + k;
    setNumVal(v); setCashAmount(parseFloat(v) || 0);
  };

  const handlePay = () => {
    if (!canPay) return;
    if (method === 'INSURANCE' && insDetails) {
      const lines: PaymentLine[] = [
        { method: 'INSURANCE', amount: insDetails.coveredAmount },
        ...(insDetails.patientCopay > 0 ? [{ method: 'CASH' as const, amount: insDetails.patientCopay }] : []),
      ];
      onComplete(lines, insDetails);
    } else {
      onComplete([{ method, amount: total }]);
    }
  };

  if (!isOpen) return null;

  const s: Record<string, React.CSSProperties> = {
    overlay: { position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:16 },
    modal: { background:'#fff',borderRadius:20,width:'100%',maxWidth:620,boxShadow:'0 24px 64px rgba(0,0,0,0.15)',overflow:'hidden' },
    header: { background:'#1a2235',padding:'20px 28px',display:'flex',justifyContent:'space-between',alignItems:'center' },
    body: { padding:'24px 28px' },
    methodBtn: { flex:1,padding:'12px 8px',border:'1.5px solid #E5E7EB',borderRadius:12,background:'#FAFAFA',cursor:'pointer',fontSize:12,fontWeight:600,color:'#374151',display:'flex',flexDirection:'column' as const,alignItems:'center',gap:4,transition:'all 0.15s' },
    numBtn: { height:52,borderRadius:12,fontWeight:600,fontSize:16,cursor:'pointer',border:'1.5px solid #E5E7EB',background:'#FAFAFA',color:'#1a2235',transition:'all 0.1s' },
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',letterSpacing:2,textTransform:'uppercase',fontWeight:600}}>Total Amount</div>
            <div style={{fontSize:32,fontWeight:800,color:'#fff',marginTop:2}}>{total.toLocaleString()} <span style={{fontSize:16,color:'rgba(255,255,255,0.4)'}}>RWF</span></div>
          </div>
          {method === 'CASH' && change > 0 && (
            <div style={{textAlign:'right',background:'rgba(42,157,143,0.15)',padding:'10px 16px',borderRadius:12}}>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>Change</div>
              <div style={{fontSize:22,fontWeight:800,color:'#2A9D8F'}}>{change.toLocaleString()} RWF</div>
            </div>
          )}
          {method === 'INSURANCE' && insDetails && (
            <div style={{textAlign:'right',background:'rgba(42,157,143,0.15)',padding:'10px 16px',borderRadius:12}}>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>Patient pays</div>
              <div style={{fontSize:22,fontWeight:800,color:'#2A9D8F'}}>{insDetails.patientCopay.toLocaleString()} RWF</div>
            </div>
          )}
        </div>

        <div style={s.body}>
          {/* Method selector */}
          <div style={{display:'flex',gap:10,marginBottom:24}}>
            {METHODS.map(m => (
              <button key={m} onClick={() => { setMethod(m); if (m !== 'INSURANCE') setInsDetails(null); }}
                style={{...s.methodBtn, borderColor: method === m ? '#2A9D8F' : '#E5E7EB', background: method === m ? '#EBF8F5' : '#FAFAFA', color: method === m ? '#2A9D8F' : '#374151'}}>
                <span>{m === 'MOMO' ? 'Mobile Money' : m === 'CASH' ? 'Cash' : m === 'CARD' ? 'Card' : 'Insurance'}</span>
              </button>
            ))}
          </div>

          {/* Cash numpad */}
          {(method === 'CASH' || method === 'MOMO' || method === 'CARD') && (
            <div style={{background:'#F9FAFB',border:'1.5px solid #E5E7EB',borderRadius:16,overflow:'hidden'}}>
              {/* Display */}
              <div style={{padding:'16px 20px 12px',borderBottom:'1px solid #E5E7EB',background:'#1a2235'}}>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontWeight:600,letterSpacing:1,textTransform:'uppercase',marginBottom:4}}>Amount Received</div>
                <div style={{fontSize:36,fontWeight:800,color:'#fff',letterSpacing:-1}}>
                  {(parseFloat(numVal)||0).toLocaleString()}
                  <span style={{fontSize:15,fontWeight:500,color:'rgba(255,255,255,0.35)',marginLeft:6}}>RWF</span>
                </div>
                {change > 0 && (
                  <div style={{marginTop:6,fontSize:13,color:'#2A9D8F',fontWeight:700}}>
                    Change: {change.toLocaleString()} RWF
                  </div>
                )}
              </div>
              {/* Keys */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'#E5E7EB'}}>
                {['1','2','3','+500','4','5','6','+1000','7','8','9','+5000','0','00','DEL','+10000'].map(k => (
                  <button key={k} onClick={() => numpad(k)}
                    style={{
                      height:52, fontWeight:700, fontSize: k.startsWith('+') ? 12 : 18,
                      cursor:'pointer', border:'none', transition:'background 0.1s',
                      background: k==='DEL' ? '#FEE2E2' : k.startsWith('+') ? '#EBF8F5' : '#fff',
                      color: k==='DEL' ? '#EF4444' : k.startsWith('+') ? '#2A9D8F' : '#1a2235',
                    }}>
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Insurance */}
          {method === 'INSURANCE' && (
            <div>
              {insDetails ? (
                <div style={{padding:'20px',background:'#EBF8F5',borderRadius:16,border:'1.5px solid #2A9D8F'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                    <div>
                      <div style={{fontSize:12,color:'#2A9D8F',fontWeight:700,letterSpacing:0.5}}>{insDetails.planName}</div>
                      <div style={{fontSize:18,fontWeight:800,color:'#1a2235',marginTop:4}}>{insDetails.patientName}</div>
                      <div style={{fontSize:12,color:'#6b7280',marginTop:2}}>Policy: {insDetails.policyNumber}</div>
                    </div>
                    <button onClick={() => { setInsDetails(null); setInsOpen(true); }}
                      style={{fontSize:12,color:'#2A9D8F',background:'none',border:'1.5px solid #2A9D8F',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontWeight:600}}>
                      Change
                    </button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,textAlign:'center',borderTop:'1px solid rgba(42,157,143,0.2)',paddingTop:14}}>
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:'#1a2235'}}>{total.toLocaleString()}</div>
                      <div style={{fontSize:11,color:'#6b7280'}}>Total</div>
                    </div>
                    <div style={{borderLeft:'1px dashed rgba(42,157,143,0.3)',borderRight:'1px dashed rgba(42,157,143,0.3)'}}>
                      <div style={{fontSize:15,fontWeight:700,color:'#2A9D8F'}}>{insDetails.coveredAmount.toLocaleString()}</div>
                      <div style={{fontSize:11,color:'#6b7280'}}>Insurance ({insDetails.coveragePercent}%)</div>
                    </div>
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:'#F59E0B'}}>{insDetails.patientCopay.toLocaleString()}</div>
                      <div style={{fontSize:11,color:'#6b7280'}}>Patient Co-pay</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{textAlign:'center',padding:'40px 24px',background:'#F9FAFB',borderRadius:16,border:'2px dashed #E5E7EB'}}>
                  <div style={{fontSize:40,marginBottom:10}}>🏥</div>
                  <div style={{fontSize:16,fontWeight:700,color:'#1a2235',marginBottom:6}}>Insurance Payment</div>
                  <div style={{fontSize:13,color:'#9CA3AF',marginBottom:20}}>Select provider, plan, and verify patient identity</div>
                  <button onClick={() => setInsOpen(true)}
                    style={{padding:'12px 28px',background:'#2A9D8F',color:'#fff',border:'none',borderRadius:12,fontWeight:700,fontSize:14,cursor:'pointer'}}>
                    Set Up Insurance →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{display:'flex',gap:12,marginTop:24}}>
            <button onClick={onClose}
              style={{flex:1,padding:'14px',border:'1.5px solid #E5E7EB',borderRadius:12,background:'#fff',color:'#6b7280',fontWeight:700,fontSize:14,cursor:'pointer'}}>
              Cancel
            </button>
            <button
              onClick={handlePay}
              disabled={!canPay || isProcessing}
              style={{flex:2,padding:'14px',border:'none',borderRadius:12,background: canPay && !isProcessing ? '#2A9D8F' : '#E5E7EB',color: canPay && !isProcessing ? '#fff' : '#9CA3AF',fontWeight:800,fontSize:15,cursor: canPay && !isProcessing ? 'pointer' : 'not-allowed',transition:'all 0.15s'}}>
              {isProcessing ? 'Processing…' : `Confirm Payment — ${total.toLocaleString()} RWF`}
            </button>
          </div>
        </div>
      </div>

      <InsuranceModal
        isOpen={insOpen}
        total={total}
        onComplete={(ins) => { setInsDetails(ins); setInsOpen(false); }}
        onCancel={() => setInsOpen(false)}
      />
    </div>
  );
};

// ── Main POS ─────────────────────────────────────────────────────────────────
const POS: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [payOpen, setPayOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [lastReceipt, setLastReceipt] = useState<any>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchInv(); searchRef.current?.focus(); }, []);

  const fetchInv = async () => {
    try {
      const r = await fetch('http://localhost:3001/api/inventory', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const d = await r.json();
      setInventory(Array.isArray(d) ? d : []);
    } catch { setError('Failed to load inventory'); }
  };

  const getName = (i: InventoryItem) => i.medicineName || i.name || 'Unknown';
  const getPrice = (i: InventoryItem) => i.sellingPrice || i.unitPrice || 0;
  const cats = [...new Set(inventory.map(i => i.category).filter(Boolean))];

  const filtered = inventory.filter(i => {
    const n = getName(i).toLowerCase();
    return n.includes(search.toLowerCase())
      && (catFilter === 'all' || i.category === catFilter)
      && (typeFilter === 'all' || (i.medicineType || 'GENERIC') === typeFilter)
      && i.quantity > 0;
  });

  const addToCart = (item: InventoryItem) => {
    const ex = cart.find(c => c.id === item.id);
    if ((ex?.quantity || 0) + 1 > item.quantity) { setError(`Only ${item.quantity} in stock`); return; }
    setError('');
    if (ex) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1, total: (c.quantity + 1) * c.unitPrice } : c));
    } else {
      setCart([...cart, { id: item.id, medicineName: getName(item), unitPrice: getPrice(item), quantity: 1, total: getPrice(item) }]);
    }
  };

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) { setCart(cart.filter(c => c.id !== id)); return; }
    const inv = inventory.find(i => i.id === id);
    if (inv && qty > inv.quantity) { setError(`Max: ${inv.quantity}`); return; }
    setError('');
    setCart(cart.map(c => c.id === id ? { ...c, quantity: qty, total: qty * c.unitPrice } : c));
  };

  const total = cart.reduce((s, c) => s + c.total, 0);

  const handlePay = async (paymentLines: PaymentLine[], insDetails?: InsuranceDetails) => {
    setProcessing(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: cart.map(c => ({ inventoryId: c.id, quantity: c.quantity, unitPrice: c.unitPrice, total: c.total })),
          totalAmount: total,
          paymentMethod: paymentLines.map(l => l.method).join('+'),
          paymentLines,
          ...(insDetails && {
            patientName: insDetails.patientName,
            insuranceProvider: insDetails.planName,
            providerId: insDetails.providerId,
            planCode: insDetails.planCode,
            policyNumber: insDetails.policyNumber,
            insuranceCoveredAmount: insDetails.coveredAmount,
            patientCopayAmount: insDetails.patientCopay,
            coveragePercent: insDetails.coveragePercent,
          }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sale failed');

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const receipt = {
        invoiceNumber: data.invoiceNumber || `INV-${Date.now()}`,
        items: cart, total, paymentLines,
        pharmacist: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Pharmacist',
        insurance: insDetails,
        pharmacyName: JSON.parse(localStorage.getItem('pharmacy') || '{}').name || 'PharmaLink',
      };
      setLastReceipt(receipt);
      setCart([]); setPayOpen(false); fetchInv();
      setTimeout(() => printReceipt(receipt), 300);
    } catch (err: any) {
      setError(err.message || 'Sale failed');
    } finally { setProcessing(false); }
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const bg = '#F4F6F9';
  const white = '#ffffff';
  const border = '#E5E7EB';
  const text = '#1a2235';
  const muted = '#6b7280';
  const green = '#2A9D8F';
  const navy = '#1a2235';

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:bg,fontFamily:"'Inter',-apple-system,sans-serif"}}>

      {/* ── Left: Drug Grid ── */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* Topbar */}
        <div style={{background:white,borderBottom:`1px solid ${border}`,padding:'12px 20px',display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
          <input
            ref={searchRef}
            type="text"
            placeholder="🔍  Search medicines..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{flex:1,minWidth:180,padding:'10px 16px',border:`1.5px solid ${border}`,borderRadius:12,fontSize:14,color:text,outline:'none',background:'#FAFAFA'}}
          />
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            style={{padding:'10px 14px',border:`1.5px solid ${border}`,borderRadius:12,fontSize:13,color:text,background:white,outline:'none'}}
          >
            <option value="all">All Categories</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div style={{display:'flex',borderRadius:12,overflow:'hidden',border:`1.5px solid ${border}`}}>
            {[['all','All'],['GENERIC','Generic'],['PATENTED','Patent']].map(([v,l]) => (
              <button key={v} onClick={() => setTypeFilter(v)}
                style={{padding:'9px 16px',fontSize:13,fontWeight:600,background: typeFilter===v ? navy : white,color: typeFilter===v ? '#fff' : muted,border:'none',cursor:'pointer',transition:'all 0.15s'}}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{background:'#FEF3C7',borderBottom:'1px solid #FDE68A',color:'#92400E',padding:'10px 20px',fontSize:13,display:'flex',justifyContent:'space-between'}}>
            <span>{error}</span>
            <button onClick={() => setError('')} style={{fontWeight:700,background:'none',border:'none',cursor:'pointer',color:'#92400E'}}>×</button>
          </div>
        )}

        {/* Grid */}
        <div style={{flex:1,overflowY:'auto',padding:'20px'}}>
          {filtered.length === 0 ? (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',color:'#CBD5E1'}}>
              
              <div style={{fontSize:14}}>No medicines found</div>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))',gap:12}}>
              {filtered.map(item => {
                const inCart = cart.find(c => c.id === item.id);
                const isPatented = (item.medicineType || 'GENERIC') === 'PATENTED';
                const lowStock = item.quantity <= 10;
                return (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    style={{
                      textAlign:'left',padding:'14px',borderRadius:14,
                      border:`2px solid ${inCart ? green : border}`,
                      background: inCart ? '#EBF8F5' : white,
                      cursor:'pointer',transition:'all 0.15s',
                      boxShadow: inCart ? `0 0 0 3px rgba(42,157,143,0.12)` : '0 1px 3px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                      <span style={{fontSize:11,padding:'3px 9px',borderRadius:20,fontWeight:700,background: isPatented ? '#EEF2FF' : '#E0FDF4',color: isPatented ? '#6366F1' : '#059669'}}>
                        {isPatented ? 'Patent' : 'Generic'}
                      </span>
                      {inCart && (
                        <span style={{fontSize:12,fontWeight:800,background:green,color:'#fff',padding:'2px 8px',borderRadius:20}}>×{inCart.quantity}</span>
                      )}
                    </div>
                    <div style={{fontWeight:700,fontSize:14,color:text,lineHeight:1.3,marginBottom:2}}>{getName(item)}</div>
                    {item.category && <div style={{fontSize:11,color:muted,marginBottom:8}}>{item.category}</div>}
                    <div style={{fontWeight:800,fontSize:15,color:navy}}>{getPrice(item).toLocaleString()} <span style={{fontSize:11,fontWeight:400,color:muted}}>RWF</span></div>
                    <div style={{fontSize:11,marginTop:4,color: lowStock ? '#F59E0B' : '#CBD5E1',fontWeight: lowStock ? 700 : 400}}>
                      {lowStock ? '⚠ ' : ''}Stock: {item.quantity}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Cart ── */}
      <div style={{width:300,flexShrink:0,display:'flex',flexDirection:'column',borderLeft:`1px solid ${border}`,background:white}}>
        <div style={{padding:'16px 18px',background:navy,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontWeight:700,fontSize:15,color:'#fff'}}>Current Sale</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:2}}>{cart.length} item(s)</div>
          </div>
          {cart.length > 0 && (
            <button onClick={() => setCart([])}
              style={{fontSize:11,color:'#F87171',border:'1px solid rgba(248,113,113,0.3)',padding:'5px 10px',borderRadius:8,background:'none',cursor:'pointer',fontWeight:600}}>
              Clear all
            </button>
          )}
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'12px'}}>
          {cart.length === 0 ? (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',color:'#CBD5E1'}}>
              
              <div style={{fontSize:13}}>Cart is empty</div>
            </div>
          ) : cart.map(item => (
            <div key={item.id} style={{padding:'12px',border:`1px solid ${border}`,borderRadius:12,marginBottom:8,background:'#FAFAFA'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:700,color:text,flex:1,marginRight:8,lineHeight:1.3}}>{item.medicineName}</span>
                <button onClick={() => setCart(cart.filter(c => c.id !== item.id))}
                  style={{color:'#CBD5E1',background:'none',border:'none',cursor:'pointer',fontSize:18,lineHeight:1,padding:0}}>×</button>
              </div>
              <div style={{fontSize:11,color:muted,marginBottom:8}}>{item.unitPrice.toLocaleString()} RWF each</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{display:'flex',border:`1px solid ${border}`,borderRadius:8,overflow:'hidden'}}>
                  <button onClick={() => updateQty(item.id, item.quantity - 1)}
                    style={{width:32,height:32,fontWeight:700,fontSize:16,border:'none',background:'#F3F4F6',color:muted,cursor:'pointer'}}>−</button>
                  <span style={{padding:'0 12px',display:'flex',alignItems:'center',fontSize:14,fontWeight:700,color:text}}>{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)}
                    style={{width:32,height:32,fontWeight:700,fontSize:16,border:'none',background:'#F3F4F6',color:muted,cursor:'pointer'}}>+</button>
                </div>
                <span style={{fontWeight:800,fontSize:14,color:text}}>{item.total.toLocaleString()} <span style={{fontSize:11,fontWeight:400,color:muted}}>RWF</span></span>
              </div>
            </div>
          ))}
        </div>

        <div style={{borderTop:`1px solid ${border}`,padding:'16px 18px',background:white}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:14}}>
            <span style={{fontSize:14,color:muted}}>Total</span>
            <div>
              <span style={{fontSize:26,fontWeight:800,color:text}}>{total.toLocaleString()}</span>
              <span style={{fontSize:13,color:muted,marginLeft:4}}>RWF</span>
            </div>
          </div>
          <button
            onClick={() => cart.length > 0 && setPayOpen(true)}
            disabled={cart.length === 0}
            style={{width:'100%',padding:'14px',background: cart.length > 0 ? green : '#E5E7EB',color: cart.length > 0 ? '#fff' : '#9CA3AF',border:'none',borderRadius:12,fontWeight:800,fontSize:15,cursor: cart.length > 0 ? 'pointer' : 'not-allowed',transition:'all 0.15s',boxShadow: cart.length > 0 ? '0 4px 14px rgba(42,157,143,0.3)' : 'none'}}>
            {cart.length > 0 ? `Pay — ${total.toLocaleString()} RWF` : 'Add items to cart'}
          </button>
          {lastReceipt && (
            <div style={{marginTop:10,padding:'10px 12px',background:'#EBF8F5',border:'1px solid #A7F3D0',borderRadius:10}}>
              <div style={{fontSize:12,fontWeight:700,color:green}}>{lastReceipt.invoiceNumber}</div>
              <div style={{fontSize:11,color:muted}}>{lastReceipt.total.toLocaleString()} RWF — completed</div>
              <button onClick={() => printReceipt(lastReceipt)} style={{fontSize:11,color:green,background:'none',border:'none',cursor:'pointer',textDecoration:'underline',padding:0,marginTop:2}}>
                Reprint receipt
              </button>
            </div>
          )}
        </div>
      </div>

      <PaymentModal
        isOpen={payOpen}
        onClose={() => setPayOpen(false)}
        onComplete={handlePay}
        total={total}
        isProcessing={processing}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg) } } * { box-sizing: border-box; }`}</style>
    </div>
  );
};

export default POS;