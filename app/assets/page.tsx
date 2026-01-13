'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Menu, X, User, Calendar, Clock, Monitor, LogOut } from 'lucide-react';

export default function AssetSelectionPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [myBookings, setMyBookings] = useState<any[]>([]);

  // 1. โหลดข้อมูล User และ รายการจองของตัวเอง
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const email = user.email?.toLowerCase().trim() || '';
        setUserEmail(email);
        
        // ดึงรายการจองเฉพาะของเรา
        const { data } = await supabase
          .from('bookings')
          .select('*, assets(name)') // เชื่อมตารางเอาชื่อเครื่องมาโชว์ด้วย
          .eq('created_by', email)
          .order('start_time', { ascending: false });
        
        if (data) setMyBookings(data);
      }
    };
    loadUserData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* --- ส่วนปุ่มเปิดเมนู --- */}
      <header style={headerStyle}>
        <button onClick={() => setIsSidebarOpen(true)} style={menuBtnStyle}>
          <Menu size={24} />
        </button>
        <h1 style={{ color: '#1e3a8a', fontWeight: 'bold' }}>เลือกครุภัณฑ์ที่ต้องการจอง</h1>
      </header>

      {/* --- Sidebar (แถบเมนูข้าง) --- */}
      {isSidebarOpen && (
        <div style={sidebarOverlayStyle} onClick={() => setIsSidebarOpen(false)}>
          <div style={sidebarContentStyle} onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsSidebarOpen(false)} style={closeSidebarBtnStyle}>
              <X size={24} />
            </button>

            {/* บัญชีผู้ใช้ */}
            <div style={userSectionStyle}>
              <div style={avatarStyle}><User size={30} color="#fff" /></div>
              <p style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>บัญชีผู้ใช้</p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>{userEmail}</p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />

            {/* ตารางการจองของตัวเอง */}
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <Calendar size={18} /> รายการจองของฉัน
            </h3>

            <div style={bookingListStyle}>
              {myBookings.length > 0 ? myBookings.map((b) => (
                <div key={b.id} style={bookingItemStyle}>
                  <p style={{ fontWeight: 'bold', color: '#1e3a8a', fontSize: '14px' }}>
                    <Monitor size={14} inline /> {b.assets?.name || 'ครุภัณฑ์'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#475569' }}>
                    <Clock size={12} inline /> {new Date(b.start_time).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                  <p style={{ fontSize: '11px', color: '#94a3b8' }}>สถานที่: {b.location || '-'}</p>
                </div>
              )) : (
                <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '20px' }}>ยังไม่มีรายการจอง</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- ส่วนรายชื่อครุภัณฑ์ (โค้ดเดิมของพี่) --- */}
      <main style={{ padding: '20px' }}>
         {/* พี่เอาหน้า List ครุภัณฑ์มาใส่ตรงนี้ได้เลยครับ */}
      </main>
    </div>
  );
}

// --- Styles (ก๊อปไปวางได้เลย) ---
const headerStyle = { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const menuBtnStyle = { border: 'none', background: 'none', cursor: 'pointer', color: '#1e3a8a' };
const sidebarOverlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 2000 };
const sidebarContentStyle: React.CSSProperties = { position: 'absolute', left: 0, top: 0, bottom: 0, width: '300px', backgroundColor: '#fff', padding: '30px 20px', boxShadow: '4px 0 15px rgba(0,0,0,0.1)' };
const closeSidebarBtnStyle = { position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', cursor: 'pointer' };
const userSectionStyle = { textAlign: 'center' as const, marginTop: '20px' };
const avatarStyle = { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' };
const bookingListStyle = { maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' as const };
const bookingItemStyle = { padding: '12px', border: '1px solid #f1f5f9', borderRadius: '12px', marginBottom: '10px', backgroundColor: '#f8fafc' };