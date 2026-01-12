'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; 
import { Package, Search, ChevronRight, LogOut } from 'lucide-react';

export default function AssetListPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [assets] = useState([
    { id: 'A001', name: 'เครื่องพิมพ์ 3D (3D Printer)', type: 'Lab Equipment' },
    { id: 'A002', name: 'กล้องจุลทรรศน์ (Microscope)', type: 'Lab Equipment' },
    { id: 'A003', name: 'เครื่องฉายโปรเจคเตอร์ (Projector)', type: 'Lab Equipment' },
    { id: 'A004', name: 'เครื่องผลิตน้ำแข็ง', type: 'Lab Equipment' },
  ]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; } 
      else { setHasMounted(true); }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (!hasMounted) return null;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '30px 15px', position: 'relative' }}>
      
      {/* --- ปุ่มออกจากระบบ (ตำแหน่งมุมขวาบน) --- */}
      <button 
        onClick={handleLogout} 
        style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '10px 16px', 
          borderRadius: '12px', 
          border: '1px solid #fee2e2', 
          backgroundColor: '#fff', 
          color: '#ef4444', 
          fontSize: '13px', 
          fontWeight: 700, 
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }}
      >
        <LogOut size={16} /> ออกจากระบบ
      </button>

      <header style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
        <div style={{ width: '60px', height: '60px', backgroundColor: '#1e40af', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
          <Package size={32} color="#fff" />
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1e3a8a', margin: 0 }}>เลือกครุภัณฑ์ที่ต้องการจอง</h1>
        <p style={{ color: '#f97316', fontSize: '16px', fontWeight: 800, marginTop: '5px' }}>Asset Selection</p>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto' }}>
        {assets.map((item) => (
          <div 
            key={item.id} 
            onClick={() => window.location.href = `/booking?id=${item.id}&name=${encodeURIComponent(item.name)}`}
            style={{ 
              backgroundColor: '#fff', 
              padding: '25px', 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '15px', 
              cursor: 'pointer', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
              border: '1px solid transparent',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e3a8a', fontWeight: 700 }}>{item.name}</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: '5px 0 0 0' }}>รหัส: {item.id}</p>
            </div>
            <ChevronRight color="#e2e8f0" size={24} />
          </div>
        ))}
      </main>
    </div>
  );
}
