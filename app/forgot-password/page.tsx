'use client'
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // ใช้ window.location.origin เพื่อให้ลิงก์ฉลาดตามเครื่องที่รัน (จะ localhost หรือ IP ก็ได้)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } else {
      setMessage("ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่อีเมลแล้ว! (โปรดเช็กในมือถือหรือคอมเครื่องนี้)");
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '28px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        <button onClick={() => window.location.href = '/login'} style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> กลับหน้าล็อกอิน
        </button>
        
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1e3a8a', marginBottom: '10px' }}>ลืมรหัสผ่าน</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>กรอกอีเมลเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่</p>

        {message ? (
          <div style={{ padding: '15px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '12px', textAlign: 'center', fontSize: '14px' }}>
            {message}
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '15px', color: '#94a3b8' }} />
              <input 
                type="email" 
                placeholder="Email ของคุณ" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1.5px solid #e2e8f0' }} 
                required 
              />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '15px', border: 'none', backgroundColor: '#f97316', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
              {loading ? 'กำลังส่ง...' : 'ส่งอีเมลรีเซ็ตรหัสผ่าน'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}