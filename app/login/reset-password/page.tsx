'use client'
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // ดักจับ Token จาก URL ทันทีที่เข้าหน้าเว็บ
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setHasSession(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน!");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      alert("เปลี่ยนไม่สำเร็จ: " + error.message);
    } else {
      alert("เปลี่ยนรหัสผ่านสำเร็จ!");
      window.location.href = '/login';
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', margin: 'auto' }}>
      <h2>ตั้งรหัสผ่านใหม่</h2>
      {!hasSession && <p style={{ color: 'orange' }}>กำลังตรวจสอบสิทธิ์... กรุณารอสักครู่</p>}
      
      <form onSubmit={handleUpdate}>
        <input 
          type="password" 
          placeholder="รหัสผ่านใหม่" 
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ width: '100%', padding: '12px', margin: '10px 0', borderRadius: '8px', border: '1px solid #ddd' }}
          required 
        />
        <input 
          type="password" 
          placeholder="ยืนยันรหัสผ่านใหม่" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ width: '100%', padding: '12px', margin: '10px 0', borderRadius: '8px', border: '1px solid #ddd' }}
          required 
        />
        <button 
          type="submit" 
          disabled={loading || !hasSession}
          style={{ width: '100%', padding: '12px', backgroundColor: hasSession ? '#f97316' : '#ccc', color: '#fff', border: 'none', borderRadius: '8px' }}
        >
          {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่าน'}
        </button>
      </form>
    </div>
  );
}