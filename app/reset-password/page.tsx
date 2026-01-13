'use client'
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // ท่าไม้ตาย: อัปเดตรหัสผ่านตรงๆ 
    // Supabase จะดึง token จาก URL มาใช้เองโดยอัตโนมัติในระดับเบื้องหลัง
    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      alert("Error: " + error.message + " \nแนะนำให้ขอลิงก์ใหม่และเปิดในคอมเครื่องเดิมครับ");
    } else {
      alert("สำเร็จ! เปลี่ยนรหัสผ่านเรียบร้อย");
      window.location.href = '/login';
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ color: '#1e3a8a' }}>ตั้งรหัสผ่านใหม่</h2>
        <form onSubmit={handleUpdate} style={{ marginTop: '20px' }}>
          <input 
            type="password" 
            placeholder="รหัสผ่านใหม่" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd' }} 
          />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
            {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
          </button>
        </form>
      </div>
    </div>
  );
}