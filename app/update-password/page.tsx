'use client'
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, CheckCircle2 } from 'lucide-react';

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("รหัสผ่านไม่ตรงกันครับ!");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      alert("Error: " + error.message);
    } else {
      setSuccess(true);
      setTimeout(() => { window.location.href = '/login'; }, 3000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <CheckCircle2 size={60} color="#22c55e" style={{ margin: '0 auto 20px' }} />
          <h2>Password Updated!</h2>
          <p>เปลี่ยนรหัสผ่านสำเร็จ ระบบกำลังพาคุณไปหน้า Login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: '#1e3a8a' }}>Set New Password</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>กรุณาระบุรหัสผ่านใหม่ของคุณ 2 ครั้งให้ตรงกัน</p>
        <form onSubmit={handleUpdate}>
          <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{...inputStyle, marginTop: '10px'}} />
          <button type="submit" disabled={loading} style={buttonStyle}>{loading ? 'Updating...' : 'Update Password'}</button>
        </form>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9' };
const cardStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const buttonStyle = { width: '100%', padding: '12px', marginTop: '20px', borderRadius: '12px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' };