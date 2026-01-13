'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  // ตรวจสอบว่ามี Session หรือไม่ตอนโหลดหน้า
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setSessionError(true);
      }
    };
    checkSession();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("รหัสผ่านไม่ตรงกันครับ!");
      return;
    }

    setLoading(true);
    // ใช้คำสั่ง update โดยตรง ระบบจะใช้ Token จาก URL อัตโนมัติ
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } else {
      setSuccess(true);
      setTimeout(() => { window.location.href = '/login'; }, 3000);
    }
    setLoading(false);
  };

  if (sessionError) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <AlertCircle size={60} color="#ef4444" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ color: '#ef4444' }}>Session Expired</h2>
          <p>ลิงก์หมดอายุหรือเซสชันไม่ถูกต้อง กรุณาขอลิงก์ใหม่จากหน้าลืมรหัสผ่านครับ</p>
          <button onClick={() => window.location.href = '/forgot-password'} style={buttonStyle}>ขอลิงก์ใหม่</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <CheckCircle2 size={60} color="#22c55e" style={{ margin: '0 auto 20px' }} />
          <h2>บันทึกรหัสผ่านใหม่แล้ว!</h2>
          <p>ระบบกำลังพาคุณไปหน้า Login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: '#1e3a8a' }}>ตั้งรหัสผ่านใหม่</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>กรุณาระบุรหัสผ่านใหม่ของคุณ</p>
        <form onSubmit={handleUpdate}>
          <input type="password" placeholder="รหัสผ่านใหม่" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="ยืนยันรหัสผ่านใหม่" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{...inputStyle, marginTop: '10px'}} />
          <button type="submit" disabled={loading} style={buttonStyle}>{loading ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}</button>
        </form>
      </div>
    </div>
  );
}

// Styles คงเดิม
const containerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9' };
const cardStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const buttonStyle = { width: '100%', padding: '12px', marginTop: '20px', borderRadius: '12px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' };