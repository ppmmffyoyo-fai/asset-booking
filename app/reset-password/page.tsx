'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { CheckCircle2, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  // ท่าไม้ตาย: ดึง Token จาก URL มาใช้เองถ้า Supabase มองไม่เห็น
  useEffect(() => {
    const handleToken = async () => {
      // ดึง hash จาก URL (ที่มี access_token)
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        // บังคับให้ Supabase รับรู้ Session จาก hash โดยตรง
        const { data, error } = await supabase.auth.setSession({
          access_token: new URLSearchParams(hash.replace('#', '?')).get('access_token') || '',
          refresh_token: new URLSearchParams(hash.replace('#', '?')).get('refresh_token') || '',
        });
        if (error) console.error("Force session error:", error.message);
      }
    };
    handleToken();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("รหัสผ่านไม่ตรงกันครับ!");
      return;
    }

    setLoading(true);
    // ใช้คำสั่งเปลี่ยนรหัสผ่าน
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      alert("ยังไม่ได้อีก!: " + error.message);
    } else {
      setSuccess(true);
      await supabase.auth.signOut();
      setTimeout(() => { window.location.href = '/login'; }, 3000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <CheckCircle2 size={60} color="#22c55e" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ color: '#1e3a8a' }}>สำเร็จแล้วพี่!</h2>
          <p>เปลี่ยนรหัสผ่านเรียบร้อย กำลังไปหน้า Login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: '#1e3a8a', marginBottom: '10px' }}>ตั้งรหัสผ่านใหม่</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>กรุณาระบุรหัสผ่านใหม่ (ห้ามกดจากเครื่องอื่น)</p>
        <form onSubmit={handleUpdate}>
          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <input type={showPass1 ? "text" : "password"} placeholder="รหัสผ่านใหม่" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={inputStyle} />
            <button type="button" onClick={() => setShowPass1(!showPass1)} style={eyeBtnStyle}>
              {showPass1 ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
            </button>
          </div>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <input type={showPass2 ? "text" : "password"} placeholder="ยืนยันรหัสผ่านใหม่" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputStyle} />
            <button type="button" onClick={() => setShowPass2(!showPass2)} style={eyeBtnStyle}>
              {showPass2 ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
            </button>
          </div>
          <button type="submit" disabled={loading} style={buttonStyle}>{loading ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}</button>
        </form>
      </div>
    </div>
  );
}

// สไตล์เดิม (ขอละไว้เพื่อความสั้น แต่ให้พี่ใช้ตัวเดิมนะ)
const containerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' };
const cardStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '40px 30px', borderRadius: '28px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '14px 45px 14px 15px', borderRadius: '14px', border: '2px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '16px', outline: 'none' };
const eyeBtnStyle: React.CSSProperties = { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' };
const buttonStyle: React.CSSProperties = { width: '100%', padding: '14px', borderRadius: '14px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '16px' };