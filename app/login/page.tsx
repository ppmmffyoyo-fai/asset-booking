'use client'
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; 
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link'; // <--- ต้องมีบรรทัดนี้

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    else window.location.href = '/'; 
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleLogin} style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '28px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        <header style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{ width: '60px', height: '60px', backgroundColor: '#1e40af', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <ShieldCheck size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1e3a8a', margin: 0 }}>เข้าสู่ระบบ</h1>
          <h2 style={{ color: '#f97316', fontSize: '14px', fontWeight: 800 }}>Asset Management System</h2>
        </header>

        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => setEmail(e.target.value)} 
          style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '12px', border: '1.5px solid #e2e8f0' }} 
          required 
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '12px', border: '1.5px solid #e2e8f0' }} 
          required 
        />

        {/* --- ปุ่มลืมรหัสผ่าน (ถ้าหายไปให้เช็กตรงนี้ครับ) --- */}
        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
          <Link href="/forgot-password" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>
            ลืมรหัสผ่าน?
          </Link>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '15px', border: 'none', backgroundColor: '#f97316', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
          {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  );
}