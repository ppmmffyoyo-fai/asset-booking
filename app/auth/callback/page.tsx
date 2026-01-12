// ไฟล์: app/auth/callback/page.tsx
'use client'
import { useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function AuthCallback() {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        window.location.href = '/' // ล็อกอินสำเร็จให้กลับหน้าหลัก
      }
    })
    return () => authListener.subscription.unsubscribe()
  }, [])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>กำลังเข้าสู่ระบบ... โปรดรอสักครู่</p>
    </div>
  )
}