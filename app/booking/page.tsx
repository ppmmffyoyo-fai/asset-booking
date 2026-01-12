'use client'
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient'; 
import { X, ArrowLeft, LogOut } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

function BookingContent() {
  const searchParams = useSearchParams();
  const assetId = searchParams.get('id') || '';

  // ✅ 1. ยัดรายชื่อเครื่องมือลงในโค้ดเลย (เพิ่มเครื่องผลิตน้ำแข็งแล้ว)
  const assetList: { [key: string]: string } = {
    'A001': 'เครื่องพิมพ์ 3D (3D Printer)',
    'A002': 'กล้องจุลทรรศน์ (Microscope)',
    'A003': 'เครื่องฉายโปรเจคเตอร์ (Projector)',
    'A004': 'เครื่องผลิตน้ำแข็ง',
  };

  // ✅ 2. แสดงชื่อทันทีตาม ID ที่ส่งมา (ถ้าไม่เจอให้โชว์รหัสแทน)
  const [assetName, setAssetName] = useState(assetList[assetId] || `ครุภัณฑ์รหัส: ${assetId}`); 
  
  const [events, setEvents] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email ?? null);
      // ❌ ลบ fetchAssetName จาก Database ออก เพื่อแก้ปัญหา "ค้าง"
    };
    init();
    setHasMounted(true);
  }, []);

  // ✅ ดึงรายการจองจากตาราง bookings
  const fetchBookings = useCallback(async () => {
    if (!assetId) return;
    const { data } = await supabase.from('bookings').select('*').eq('asset_id', assetId);
    if (data) {
      const formatted = data.map((item: any) => ({
        id: item.id,
        title: `${new Date(item.start_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น. ${item.staff_name}`,
        start: item.start_time,
        end: item.end_time,
        extendedProps: { ...item }
      }));
      setEvents(formatted as any);
    }
  }, [assetId]);

  useEffect(() => { if (hasMounted) fetchBookings(); }, [hasMounted, fetchBookings]);

  const deleteBooking = async (id: string) => {
    if (confirm('ยืนยันการยกเลิกการจอง?')) {
      await supabase.from('bookings').delete().eq('id', id);
      setDetailModalOpen(false);
      fetchBookings();
    }
  };

  if (!hasMounted) return null;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
      <button onClick={() => supabase.auth.signOut().then(() => window.location.href='/login')} style={logoutBtnStyle}>
        <LogOut size={14}/> ออกจากระบบ
      </button>
      
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button onClick={() => window.location.href = '/'} style={backBtnStyle}>
          <ArrowLeft size={18} /> กลับหน้าหลัก
        </button>
        {/* ✅ ชื่อเครื่องจะโผล่ทันที ไม่ค้าง "กำลังโหลด" */}
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a', marginTop: '10px' }}>{assetName}</h1>
      </header>

      <main style={calendarContainerStyle}>
        <FullCalendar
          plugins={[daygridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          displayEventTime={false}
          eventClick={(info) => { setSelectedEvent(info.event); setDetailModalOpen(true); }}
        />
      </main>

      {detailModalOpen && selectedEvent && (
        <div style={overlayStyle}>
          <div style={modalContentStyle}>
            <button onClick={() => setDetailModalOpen(false)} style={closeBtnStyle}><X size={20} /></button>
            <h3 style={{textAlign:'center', marginBottom:'15px'}}>ข้อมูลการจอง</h3>
            <p><strong>ผู้จอง:</strong> {selectedEvent.extendedProps.staff_name}</p>
            <p><strong>เวลา:</strong> {new Date(selectedEvent.start).toLocaleString('th-TH')}</p>
            {(selectedEvent.extendedProps.created_by === userEmail || !selectedEvent.extendedProps.created_by) && (
              <button onClick={() => deleteBooking(selectedEvent.id)} style={deleteBtnStyle}>ยกเลิกการจอง</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Styles ---
const logoutBtnStyle: React.CSSProperties = { position: 'absolute', top: '20px', right: '20px', padding: '8px 12px', border: '1px solid #fee2e2', borderRadius: '10px', color: '#ef4444', backgroundColor: '#fff', cursor: 'pointer' };
const backBtnStyle = { display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' };
const calendarContainerStyle = { backgroundColor: '#fff', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '900px', margin: '0 auto' };
const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', width: '320px', position: 'relative' };
const closeBtnStyle: React.CSSProperties = { position: 'absolute', top: '10px', right: '10px', border: 'none', background: 'none', cursor: 'pointer' };
const deleteBtnStyle = { width: '100%', padding: '10px', marginTop: '10px', borderRadius: '10px', backgroundColor: '#fff', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer' };

export default function BookingPage() { return <Suspense fallback={null}><BookingContent /></Suspense>; }