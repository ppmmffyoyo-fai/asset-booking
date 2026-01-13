'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  
  // สถานะเปิด/ปิดตา
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

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
          <p style={{ color: '#64748b' }}>ลิงก์หมดอายุหรือเซสชันไม่ถูกต้อง กรุณาขอลิงก์ใหม่จากหน้าลืมรหัสผ่านครับ</p>
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
          <h2 style={{ color: '#1e3a8a' }}>บันทึกรหัสผ่านใหม่แล้ว!</h2>
          <p style={{ color: '#64748b' }}>ระบบกำลังพาคุณไปหน้า Login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: '#1e3a8a', marginBottom: '10px' }}>ตั้งรหัสผ่านใหม่</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>กรุณาระบุรหัสผ่านใหม่ของคุณ</p>
        
        <form onSubmit={handleUpdate}>
          {/* ช่องรหัสผ่าน 1 */}
          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <input 
              type={showPass1 ? "text" : "password"} 
              placeholder="รหัสผ่านใหม่" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
              style={inputStyle} 
            />
            <button 
              type="button" 
              onClick={() => setShowPass1(!showPass1)} 
              style={eyeBtnStyle}
            >
              {showPass1 ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
            </button>
          </div>

          {/* ช่องรหัสผ่าน 2 */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <input 
              type={showPass2 ? "text" : "password"} 
              placeholder="ยืนยันรหัสผ่านใหม่" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              style={inputStyle} 
            />
            <button 
              type="button" 
              onClick={() => setShowPass2(!showPass2)} 
              style={eyeBtnStyle}
            >
              {showPass2 ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
            </button>
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Styles ---
const containerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' };

const cardStyle: React.CSSProperties = { 
  backgroundColor: '#fff', 
  padding: '40px 30px', 
  borderRadius: '28px', 
  width: '90%', 
  maxWidth: '400px', 
  textAlign: 'center', 
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)' 
};

const inputStyle: React.CSSProperties = { 
  width: '100%', 
  padding: '14px 45px 14px 15px', 
  borderRadius: '14px', 
  border: '2px solid #e2e8f0', // ขอบชัดเจนขึ้น
  backgroundColor: '#ffffff', // พื้นหลังสีขาว
  fontSize: '16px',
  outline: 'none',
  color: '#1e293b'
};

const eyeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  right: '15px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const buttonStyle: React.CSSProperties = { 
  width: '100%', 
  padding: '14px', 
  borderRadius: '14px', 
  backgroundColor: '#1e3a8a', 
  color: '#fff', 
  border: 'none', 
  cursor: 'pointer', 
  fontWeight: 'bold', 
  fontSize: '16px',
  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)'
};