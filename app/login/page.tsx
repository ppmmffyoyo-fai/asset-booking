'use client'
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; 
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. ฟังก์ชันล็อกอินด้วยอีเมลปกติ
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    else window.location.href = '/'; 
    setLoading(false);
  };

  // 2. ฟังก์ชันล็อกอินด้วย Google (ที่เพิ่มใหม่)
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // พากลับมาที่หน้าเว็บหลักหลังล็อกอินสำเร็จ
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) alert("Google Login Error: " + error.message);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '28px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{ width: '60px', height: '60px', backgroundColor: '#1e40af', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <ShieldCheck size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1e3a8a', margin: 0 }}>เข้าสู่ระบบ</h1>
          <h2 style={{ color: '#f97316', fontSize: '14px', fontWeight: 800 }}>Asset Management System</h2>
        </header>

        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            onChange={(e) => setEmail(e.target.value)} 
            style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '12px', border: '1.5px solid #e2e8f0', boxSizing: 'border-box' }} 
            required 
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '12px', border: '1.5px solid #e2e8f0', boxSizing: 'border-box' }} 
            required 
          />

          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Link href="/forgot-password" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>
              ลืมรหัสผ่าน?
            </Link>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '15px', border: 'none', backgroundColor: '#f97316', color: '#fff', fontWeight: 800, cursor: 'pointer', marginBottom: '15px' }}>
            {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {/* --- ขีดคั่นกลาง --- */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0 20px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
          <span style={{ padding: '0 10px', color: '#94a3b8', fontSize: '12px' }}>หรือ</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
        </div>

        {/* --- ปุ่ม Google Login (เพิ่มใหม่) --- */}
        <button 
          onClick={handleGoogleLogin}
          type="button"
          style={{ 
            width: '100%', 
            padding: '14px', 
            borderRadius: '15px', 
            border: '1.5px solid #e2e8f0', 
            backgroundColor: '#fff', 
            color: '#334155', 
            fontWeight: 700, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
        >
          <img src="https://www.google.com/favicon.ico" alt="google" style={{ width: '18px', height: '18px' }} />
          เข้าใช้งานด้วย Google
        </button>

      </div>
    </div>
  );
}