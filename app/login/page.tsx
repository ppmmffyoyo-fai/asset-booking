'use client'
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง: " + error.message);
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}` }
    });
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={logoWrapperStyle}><ShieldCheck size={40} color="#fff" /></div>
        <h2 style={{ color: '#1e3a8a', fontSize: '24px', fontWeight: 'bold' }}>เข้าสู่ระบบ</h2>
        <p style={{ color: '#f97316', fontSize: '14px', fontWeight: '600', marginBottom: '30px' }}>Asset Management System</p>
        
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <div style={{ marginTop: '15px', marginBottom: '30px' }}> {/* เพิ่มระยะห่างล่างแทนที่ลืมรหัสผ่าน */}
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          </div>
          
          <button type="submit" disabled={loading} style={loginBtnStyle}>
            {loading ? 'กำลังโหลด...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div style={{ margin: '20px 0', color: '#94a3b8', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
          <span>หรือ</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
        </div>

        {/* ปุ่ม Google สีขาว ตามที่พี่ต้องการ แต่ตัวหนังสือเข้มปั้ด */}
        <button type="button" onClick={handleGoogleLogin} style={googleBtnStyle}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="google" />
          <span style={{ color: '#1e293b', fontWeight: '800', fontSize: '15px' }}>เข้าใช้งานด้วย Google</span>
        </button>
      </div>
    </div>
  );
}

// --- Styles (ปรับตามรูปเป๊ะๆ) ---
const containerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' };
const cardStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '50px 40px', borderRadius: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', width: '100%', maxWidth: '420px', textAlign: 'center' };
const logoWrapperStyle: React.CSSProperties = { backgroundColor: '#1e3a8a', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' };
const inputStyle = { width: '100%', padding: '14px 20px', borderRadius: '15px', border: '1px solid #e2e8f0', fontSize: '15px', outline: 'none', backgroundColor: '#fcfcfc' };
const loginBtnStyle = { width: '100%', padding: '14px', borderRadius: '15px', backgroundColor: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' as 'bold', fontSize: '16px' };

// ปุ่ม Google แบบสีขาว คลีนๆ แต่ตัวหนังสือเข้ม
const googleBtnStyle: React.CSSProperties = { 
  width: '100%', 
  padding: '12px', 
  borderRadius: '15px', 
  backgroundColor: '#fff', 
  color: '#1e293b', 
  border: '1px solid #e2e8f0', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  gap: '10px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};