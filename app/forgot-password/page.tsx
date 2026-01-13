'use client'
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // ส่งลิงก์ไปที่เมล โดยบอกว่าถ้ากดแล้วให้กลับมาที่หน้า /update-password
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
  // บังคับให้ส่งกลับมาที่ชื่อสั้นเท่านั้น
  redirectTo: 'https://assetbooking.vercel.app/reset-password', 
});

    if (error) {
      alert("Error: " + error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <CheckCircle2 size={60} color="#22c55e" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ textAlign: 'center' }}>Check your email</h2>
          <p style={{ textAlign: 'center', color: '#64748b' }}>เราได้ส่งลิงก์สำหรับเปลี่ยนรหัสผ่านไปที่ {email} แล้วครับ</p>
          <button onClick={() => window.location.href = '/login'} style={buttonStyle}>Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <button onClick={() => window.location.href = '/login'} style={backBtnStyle}><ArrowLeft size={18} /> Back</button>
        <h2 style={{ marginTop: '20px' }}>Forgot Password</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>ระบุอีเมลของคุณเพื่อรับลิงก์ตั้งรหัสผ่านใหม่</p>
        <form onSubmit={handleReset}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={iconStyle} />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputWithIconStyle} />
          </div>
          <button type="submit" disabled={loading} style={buttonStyle}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
        </form>
      </div>
    </div>
  );
}

// Styles (เหมือนหน้า Login เดิมของพี่)
const containerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9' };
const cardStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' };
const buttonStyle = { width: '100%', padding: '12px', marginTop: '20px', borderRadius: '12px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' };
const inputWithIconStyle = { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '10px' };
const iconStyle: React.CSSProperties = { position: 'absolute', left: '12px', top: '22px', color: '#94a3b8' };
const backBtnStyle = { border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };