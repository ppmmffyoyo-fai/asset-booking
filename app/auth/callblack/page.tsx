'use client'
import { useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') router.push('/')
    })
  }, [router])
  return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>กำลังเข้าสู่ระบบ...</div>
}