'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient'; 
import { Menu, X, User, Calendar, Clock, Monitor, ChevronRight, LogOut, Trash2 } from 'lucide-react';

export default function AssetSelectionPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);

  // 1. โหลดข้อมูลเบื้องต้น
  useEffect(() => {
    const init = async () => {
      // ดึงข้อมูล User
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email?.toLowerCase().trim() || '');
        fetchMyBookings(user.email?.toLowerCase().trim() || '');
      }
      // ดึงรายชื่อครุภัณฑ์
      const { data: assetData } = await supabase.from('assets').select('*');
      if (assetData) setAssets(assetData);
    };
    init();
  }, []);

  // 2. ฟังก์ชันดึงรายการจองของตัวเอง
  const fetchMyBookings = async (email: string) => {
    const { data } = await supabase
      .from('bookings')
      .select('*, assets(name)') 
      .eq('created_by', email)
      .order('start_time', { ascending: false });
    if (data) setMyBookings(data);
  };

  // 3. ฟังก์ชันยกเลิกการจอง
  const handleDeleteBooking = async (id: string) => {
    if (confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (!error && userEmail) fetchMyBookings(userEmail);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', position: 'relative' }}>
      
      {/* --- Header & Menu Button --- */}
      <header style={headerStyle}>
        <button onClick={() => setIsSidebarOpen(true)} style={menuBtnStyle}>
          <Menu size={28} />
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={iconBoxStyle}><Monitor size={24} color="#fff" /></div>
          <h2 style={{ color: '#1e3a8a', fontSize: '22px', fontWeight: 'bold', margin: '10px 0 5px' }}>เลือกครุภัณฑ์ที่ต้องการจอง</h2>
          <p style={{ color: '#f97316', fontSize: '14px', fontWeight: '600' }}>Asset Selection</p>
        </div>
        <button onClick={handleLogout} style={logoutBtnStyle}><LogOut size={18} /> ออกจากระบบ</button>
      </header>

      {/* --- Sidebar (เด้งจากซ้าย) --- */}
      {isSidebarOpen && (
        <>
          <div style={overlayStyle} onClick={() => setIsSidebarOpen(false)} />
          <div style={sidebarStyle}>
            <button onClick={() => setIsSidebarOpen(false)} style={closeSidebarStyle}><X size={24} /></button>
            
            {/* บัญชีผู้ใช้ */}
            <div style={userProfileStyle}>
              <div style={avatarStyle}><User size={35} color="#fff" /></div>
              <h3 style={{ marginTop: '15px', color: '#1e293b', fontSize: '16px' }}>บัญชีผู้ใช้</h3>
              <p style={{ color: '#64748b', fontSize: '13px' }}>{userEmail}</p>
            </div>

            <hr style={hrStyle} />

            {/* รายการจองของฉัน */}
            <div style={{ padding: '0 10px' }}>
              <h4 style={sectionTitleStyle}><Calendar size={18} /> ตารางการจองของฉัน</h4>
              <div style={scrollAreaStyle}>
                {myBookings.length > 0 ? myBookings.map((b) => (
                  <div key={b.id} style={bookingCardStyle}>
                    <div style={{ flex: 1 }}>
                      <p style={assetNameStyle}>{b.assets?.name || 'เครื่องจอง'}</p>
                      <p style={timeStyle}>
                        <Clock size={12} /> {new Date(b.start_time).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })} น.
                      </p>
                    </div>
                    <button onClick={() => handleDeleteBooking(b.id)} style={deleteBtnStyle}><Trash2 size={16} /></button>
                  </div>
                )) : (
                  <p style={emptyTextStyle}>ไม่มีประวัติการจอง</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- รายการครุภัณฑ์ (Asset List) --- */}
      <main style={mainContentStyle}>
        {assets.map((asset) => (
          <div 
            key={asset.id} 
            style={assetCardStyle}
            onClick={() => router.push(`/booking?id=${asset.id}&name=${encodeURIComponent(asset.name)}`)}
          >
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '16px', color: '#1e3a8a', fontWeight: 'bold' }}>{asset.name}</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>รหัส: {asset.id}</p>
            </div>
            <ChevronRight color="#e2e8f0" />
          </div>
        ))}
      </main>
    </div>
  );
}

// --- Styles Toolkit ---
const headerStyle: React.CSSProperties = { display: 'flex', alignItems: 'start', padding: '20px', backgroundColor: '#fff' };
const menuBtnStyle = { border: 'none', background: '#fff', cursor: 'pointer', color: '#1e3a8a', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };
const iconBoxStyle = { width: '45px', height: '45px', backgroundColor: '#1e3a8a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' };
const logoutBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid #fee2e2', padding: '8px 12px', borderRadius: '10px', color: '#ef4444', backgroundColor: '#fff', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' };

const sidebarStyle: React.CSSProperties = { position: 'fixed', left: 0, top: 0, bottom: 0, width: '320px', backgroundColor: '#fff', zIndex: 3000, padding: '40px 20px', boxShadow: '5px 0 25px rgba(0,0,0,0.1)', animation: 'slideIn 0.3s ease-out' };
const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 2500 };
const closeSidebarStyle: React.CSSProperties = { position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' };
const userProfileStyle: React.CSSProperties = { textAlign: 'center', marginBottom: '20px' };
const avatarStyle = { width: '70px', height: '70px', backgroundColor: '#1e3a8a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' };
const hrStyle = { border: 'none', borderTop: '1px solid #f1f5f9', margin: '20px 0' };
const sectionTitleStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '15px' };
const scrollAreaStyle: React.CSSProperties = { maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' };

const bookingCardStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '10px', border: '1px solid #edf2f7' };
const assetNameStyle = { fontWeight: 'bold', fontSize: '14px', color: '#334155', margin: 0 };
const timeStyle: React.CSSProperties = { fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' };
const deleteBtnStyle = { border: 'none', background: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '5px' };
const emptyTextStyle = { textAlign: 'center' as const, color: '#94a3b8', fontSize: '13px', marginTop: '30px' };

const mainContentStyle = { padding: '20px', maxWidth: '600px', margin: '0 auto' };
const assetCardStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', backgroundColor: '#fff', borderRadius: '15px', marginBottom: '15px', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' };