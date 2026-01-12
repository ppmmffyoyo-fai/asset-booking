'use client'
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // พิเศษ: ดักจับกรณีจังหวะที่ Supabase ส่ง Token มาทาง URL
  useEffect(() => {
    const handleStatus = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.log("Session error:", error.message);
    };
    handleStatus();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      alert("ไม่สามารถเปลี่ยนรหัสได้: " + error.message);
    } else {
      setIsFinished(true);
      setTimeout(() => { window.location.href = '/login'; }, 2000);
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '28px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        {!isFinished ? (
          <form onSubmit={handleUpdate}>
            <div style={{ width: '60px', height: '60px', backgroundColor: '#1e40af', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}><Lock size={32} color="#fff" /></div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1e3a8a', marginBottom: '10px' }}>ตั้งรหัสผ่านใหม่</h1>
            <input 
              type="password" 
              placeholder="รหัสผ่านใหม่ (6 ตัวขึ้นไป)" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '12px', border: '1.5px solid #e2e8f0', textAlign: 'center' }} 
              required 
              minLength={6}
            />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '15px', border: 'none', backgroundColor: '#f97316', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </form>
        ) : (
          <div>
            <CheckCircle2 size={60} color="#22c55e" style={{ margin: '0 auto 15px' }} />
            <h2 style={{ color: '#1e3a8a', fontWeight: 900 }}>สำเร็จ!</h2>
          </div>
        )}
      </div>
    </div>
  );
}