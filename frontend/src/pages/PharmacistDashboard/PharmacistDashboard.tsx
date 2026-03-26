// src/pages/PharmacistDashboard/PharmacistDashboard.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import { inventoryAPI } from '../../api/inventory';
import { salesAPI } from '../../api/sales';
import { claimsAPI } from '../../api/claims';

interface SaleRow { id: string; invoiceNumber: string; total: number; createdAt: string; items: any[]; }
interface LowStockItem { id: string; medicineName?: string; name?: string; quantity: number; reorderLevel: number; }

const PharmacistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalMedicines: 0, lowStockCount: 0, todaySales: 0, pendingClaims: 0 });
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [recentSales, setRecentSales] = useState<SaleRow[]>([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, salesRes, claimsRes] = await Promise.allSettled([
        inventoryAPI.getAll(), salesAPI.getAll(), claimsAPI.getAll(),
      ]);
      if (invRes.status === 'fulfilled') {
        const meds = Array.isArray(invRes.value.data) ? invRes.value.data : [];
        const low = meds.filter((m: any) => m.quantity <= m.reorderLevel);
        setStats(s => ({ ...s, totalMedicines: meds.length, lowStockCount: low.length }));
        setLowStockItems(low.slice(0, 6));
      }
      if (salesRes.status === 'fulfilled') {
        const sales = Array.isArray(salesRes.value.data) ? salesRes.value.data : [];
        const today = new Date().toDateString();
        const todayTotal = sales.filter((s: any) => new Date(s.createdAt).toDateString() === today).reduce((sum: number, s: any) => sum + (s.total || 0), 0);
        setStats(s => ({ ...s, todaySales: todayTotal }));
        setRecentSales(sales.slice(0, 6));
      }
      if (claimsRes.status === 'fulfilled') {
        const claims = Array.isArray(claimsRes.value.data) ? claimsRes.value.data : [];
        setStats(s => ({ ...s, pendingClaims: claims.filter((c: any) => c.status === 'PENDING').length }));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const cards = [
    { label: 'Total Medicines', value: stats.totalMedicines.toLocaleString(), sub: 'items in stock', top: '#4F7CAC', val: '#4F7CAC' },
    { label: 'Low Stock', value: stats.lowStockCount.toString(), sub: stats.lowStockCount > 0 ? 'need restocking' : 'all stocked', top: stats.lowStockCount > 0 ? '#D97706' : '#32A287', val: stats.lowStockCount > 0 ? '#D97706' : '#32A287' },
    { label: "Today's Revenue", value: `${stats.todaySales.toLocaleString()} RWF`, sub: 'collected today', top: '#32A287', val: '#32A287' },
    { label: 'Pending Claims', value: stats.pendingClaims.toString(), sub: 'awaiting review', top: '#201E50', val: '#201E50' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main style={{ marginLeft: 240, padding: '28px 32px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#201E50', margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Overview of your pharmacy operations</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {cards.map(card => (
            <div
  key={card.label}
  style={{
    background: `linear-gradient(135deg, ${card.top}, ${card.top}CC)`,
    borderRadius: 14,
    padding: '22px',
    color: '#fff',
    boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-3px)';
    e.currentTarget.style.boxShadow = '0 14px 24px rgba(0,0,0,0.08)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
  }}
>
              {loading
                ? <div style={{ height: 32, width: 80, backgroundColor: '#F1F5F9', borderRadius: 6, marginBottom: 8 }} />
                : <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{card.value}</div>
              }
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Tables */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          {/* Low Stock */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #F1F5F9', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#201E50' }}>Low Stock Alerts</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>Medicines below reorder level</div>
              </div>
              {stats.lowStockCount > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: '#D97706', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '2px 10px', borderRadius: 20 }}>{stats.lowStockCount} items</span>}
            </div>
            {loading ? (
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1,2,3].map(i => <div key={i} style={{ height: 36, backgroundColor: '#F8FAFC', borderRadius: 6 }} />)}
              </div>
            ) : lowStockItems.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>All medicines are adequately stocked.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #F8FAFC' }}>
                    {['Medicine', 'Current', 'Reorder Level', 'Status'].map(h => (
                      <th key={h} style={{ padding: '9px 20px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item, i) => (
                    <tr key={item.id} style={{ borderBottom: i < lowStockItems.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                      <td style={{ padding: '11px 20px', fontWeight: 500, color: '#374151' }}>{item.medicineName || item.name || 'Unknown'}</td>
                      <td style={{ padding: '11px 20px', color: '#EF4444', fontWeight: 600 }}>{item.quantity}</td>
                      <td style={{ padding: '11px 20px', color: '#6B7280' }}>{item.reorderLevel}</td>
                      <td style={{ padding: '11px 20px' }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#D97706', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: 20 }}>Low Stock</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Recent Sales */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #F1F5F9', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #F8FAFC' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#201E50' }}>Recent Sales</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>Latest transactions</div>
            </div>
            <div style={{ flex: 1 }}>
              {loading ? (
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[1,2,3].map(i => <div key={i} style={{ height: 44, backgroundColor: '#F8FAFC', borderRadius: 6 }} />)}
                </div>
              ) : recentSales.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>No transactions today</div>
              ) : recentSales.map((sale, i) => (
                <div key={sale.id} style={{ padding: '11px 20px', borderBottom: i < recentSales.length - 1 ? '1px solid #F8FAFC' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: 'monospace' }}>{sale.invoiceNumber}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#32A287' }}>{(sale.total || 0).toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>RWF</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '8px 20px', borderTop: '1px solid #F8FAFC', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#D1D5DB' }}>
              <span>v1.0.0</span><span>© 2026 PharmaLink</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PharmacistDashboard;