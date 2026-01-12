'use client'
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // ส่งลิงก์ไปยังอีเมล (URL คือหน้าที่เราจะให้เขาไปตั้งรหัสใหม่)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      setMessage("ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้วครับ!");
    }
    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <button onClick={() => window.location.href = '/login'} style={backBtnStyle}>
          <ArrowLeft size={16} /> กลับหน้าล็อกอิน
        </button>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>ลืมรหัสผ่าน</h2>
        
        {message ? (
          <p style={{ color: '#059669', textAlign: 'center' }}>{message}</p>
        ) : (
          <form onSubmit={handleResetRequest}>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>
              ระบุอีเมลของคุณเพื่อรับลิงก์ตั้งรหัสผ่านใหม่
            </p>
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <Mail size={16} style={iconStyle} />
              <input 
                type="email" 
                placeholder="อีเมลของคุณ" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={inputStyle} 
              />
            </div>
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Style (เหมือนหน้า Login พี่เลย)
const containerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' };
const cardStyle = { padding: '40px', backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' };
const inputStyle = { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px' };
const iconStyle = { position: 'absolute' as const, left: '12px', top: '15px', color: '#94a3b8' };
const btnStyle = { width: '100%', padding: '12px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' as const };
const backBtnStyle = { border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' };