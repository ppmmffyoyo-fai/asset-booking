'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; 
import { Package, ChevronRight, LogOut, Menu, X, User, Calendar, Clock, Trash2 } from 'lucide-react';

export default function AssetListPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // เพิ่มตัวเช็กโหลด
  
  const [assets] = useState([
    { id: 'A001', name: 'เครื่องพิมพ์ 3D (3D Printer)', type: 'Lab Equipment' },
    { id: 'A002', name: 'กล้องจุลทรรศน์ (Microscope)', type: 'Lab Equipment' },
    { id: 'A003', name: 'เครื่องฉายโปรเจคเตอร์ (Projector)', type: 'Lab Equipment' },
    { id: 'A004', name: 'เครื่องผลิตน้ำแข็ง', type: 'Lab Equipment' },
    { id: 'A005', name: 'เครื่องตัดเลเซอร์', type: 'Lab Equipment' },
  ]);

  useEffect(() => {
    const initAuth = async () => {
      // 1. เช็ก Session แบบละเอียด
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const email = session.user.email?.toLowerCase().trim() || '';
        setUserEmail(email);
        
        // 2. ถ้ามี Session ค่อยไปดึงข้อมูลการจอง
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('*')
          .eq('created_by', email)
          .order('start_time', { ascending: false });
        
        if (bookingData) setMyBookings(bookingData);
        setLoading(false); // โหลดเสร็จแล้ว
      } else {
        // 3. ถ้าไม่มี Session จริงๆ ค่อยส่งไปหน้า Login
        window.location.href = '/login';
      }
    };

    initAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // ระหว่างรอเช็กสิทธิ์ ให้ขึ้นหน้าจอว่างสีฟ้าอ่อนๆ ไว้ก่อน ไม่ให้มันดีดไปมา
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#1e3a8a', fontWeight: 'bold' }}>กำลังยืนยันตัวตน...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '30px 15px', position: 'relative' }}>
      
      {/* ปุ่มเมนู Hamburger */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        style={{ position: 'absolute', top: '20px', left: '20px', border: 'none', background: '#fff', padding: '10px', borderRadius: '12px', cursor: 'pointer', color: '#1e3a8a', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 10 }}
      >
        <Menu size={24} />
      </button>

      {/* ปุ่ม Logout */}
      <button onClick={handleLogout} style={logoutBtnStyle}>
        <LogOut size={16} /> ออกจากระบบ
      </button>

      {/* Sidebar */}
      {isSidebarOpen && (
        <>
          <div style={overlayStyle} onClick={() => setIsSidebarOpen(false)} />
          <div style={sidebarStyle}>
            <button onClick={() => setIsSidebarOpen(false)} style={closeSidebarBtn}><X size={24} /></button>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <div style={avatarStyle}><User size={32} color="#fff" /></div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: '15px' }}>บัญชีผู้ใช้</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>{userEmail}</p>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '20px 0' }} />
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#1e3a8a' }}>
              <Calendar size={18} /> รายการจองของฉัน
            </h4>
            <div style={{ marginTop: '15px' }}>
              {myBookings.length > 0 ? myBookings.map((b) => (
                <div key={b.id} style={bookingCardStyle}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: '13px', margin: 0 }}>รหัสเครื่อง: {b.asset_id}</p>
                    <p style={{ fontSize: '11px', color: '#64748b' }}>{new Date(b.start_time).toLocaleString('th-TH')}</p>
                  </div>
                </div>
              )) : <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>ยังไม่มีรายการจอง</p>}
            </div>
          </div>
        </>
      )}

      <header style={{ textAlign: 'center', marginBottom: '40px', marginTop: '60px' }}>
        <div style={{ width: '60px', height: '60px', backgroundColor: '#1e40af', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
          <Package size={32} color="#fff" />
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1e3a8a' }}>เลือกครุภัณฑ์ที่ต้องการจอง</h1>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto' }}>
        {assets.map((item) => (
          <div key={item.id} onClick={() => window.location.href = `/booking?id=${item.id}&name=${encodeURIComponent(item.name)}`} style={assetCardStyle}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e3a8a' }}>{item.name}</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8' }}>รหัส: {item.id}</p>
            </div>
            <ChevronRight color="#e2e8f0" size={24} />
          </div>
        ))}
      </main>
    </div>
  );
}

// Styles เหมือนเดิม
const logoutBtnStyle: React.CSSProperties = { position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', border: '1px solid #fee2e2', backgroundColor: '#fff', color: '#ef4444', cursor: 'pointer', fontWeight: 700 };
const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 2000 };
const sidebarStyle: React.CSSProperties = { position: 'fixed', left: 0, top: 0, bottom: 0, width: '280px', backgroundColor: '#fff', zIndex: 2100, padding: '25px', boxShadow: '5px 0 15px rgba(0,0,0,0.1)' };
const avatarStyle = { width: '60px', height: '60px', backgroundColor: '#1e3a8a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' };
const closeSidebarBtn: React.CSSProperties = { position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', cursor: 'pointer' };
const bookingCardStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '10px', marginBottom: '8px', border: '1px solid #f1f5f9' };
const assetCardStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', display: 'flex', alignItems: 'center', marginBottom: '15px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };