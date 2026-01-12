'use client'
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient'; 
import { X, ArrowLeft, LogOut, AlertCircle, CheckCircle2 } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

function BookingContent() {
  const searchParams = useSearchParams();
  const assetId = searchParams.get('id') || '';
  // ✅ ดึงชื่อจาก URL โดยตรง (แก้ปัญหาชื่อไม่ขึ้นตามรูปที่พี่ส่งมา)
  const assetNameFromUrl = searchParams.get('name') || '';

  const assetList: { [key: string]: string } = {
    '1': 'เครื่องพิมพ์ 3D (3D Printer)',
    '2': 'กล้องจุลทรรศน์ (Microscope)',
    '3': 'เครื่องฉายโปรเจคเตอร์ (Projector)',
    '4': 'เครื่องผลิตน้ำแข็ง',
    'A001': 'เครื่องพิมพ์ 3D (3D Printer)',
  };

  // ✅ ถ้าใน URL มีชื่อส่งมาให้ใช้ชื่อนั้นเลย ถ้าไม่มีค่อยหาใน list
  const [assetName] = useState(assetNameFromUrl || assetList[assetId] || `รหัสครุภัณฑ์: ${assetId}`);
  
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [hasMounted, setHasMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('16:30');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email ?? null);
    };
    init();
    setHasMounted(true);
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!assetId) return;
    const { data } = await supabase.from('bookings').select('*').eq('asset_id', assetId);
    if (data) {
      const formatted = data.map((item: any) => {
        // ✅ แปลงเวลาให้แสดงผลเป็นรูปแบบไทย (GMT+7)
        const sDate = new Date(item.start_time);
        const eDate = new Date(item.end_time);
        const s = sDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
        const e = eDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
        
        return {
          id: item.id,
          title: `${s}-${e} น. ${item.staff_name}`,
          start: item.start_time,
          end: item.end_time,
          extendedProps: { ...item }
        };
      });
      setEvents(formatted as any);
    }
  }, [assetId]);

  useEffect(() => { if (hasMounted) fetchBookings(); }, [hasMounted, fetchBookings]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ✅ ส่งเวลาพร้อม Time Zone +07:00 ป้องกันเวลาเพี้ยน
    const newStart = `${selectedDate}T${startTime}:00+07:00`;
    const newEnd = `${selectedDate}T${endTime}:00+07:00`;

    if (new Date(newEnd) <= new Date(newStart)) {
      alert("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม");
      return;
    }

    // ✅ ตรวจสอบการจองทับซ้อน
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('*')
      .eq('asset_id', assetId)
      .lt('start_time', newEnd)
      .gt('end_time', newStart);

    if (conflicts && conflicts.length > 0) {
      setErrorModalOpen(true);
      return;
    }

    const fullStaffName = `${firstName} ${lastName}`;

    const { error } = await supabase.from('bookings').insert([
      { 
        asset_id: assetId, 
        staff_name: fullStaffName, 
        start_time: newStart, 
        end_time: newEnd,
        created_by: userEmail
      }
    ]);

    if (error) {
      alert("จองไม่สำเร็จ: " + error.message);
    } else {
      setModalOpen(false);
      setSuccessModalOpen(true);
      setFirstName('');
      setLastName('');
      fetchBookings();
    }
  };

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
      <button onClick={() => supabase.auth.signOut().then(() => window.location.href='/login')} style={logoutBtnStyle}><LogOut size={14}/> ออกจากระบบ</button>
      
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button onClick={() => window.location.href = '/'} style={backBtnStyle}><ArrowLeft size={18} /> กลับหน้าหลัก</button>
        {/* ✅ แสดงชื่อเครื่องที่ถูกต้อง */}
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a', marginTop: '10px' }}>{assetName}</h1>
      </header>

      <main style={calendarContainerStyle}>
        <FullCalendar
          plugins={[daygridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          displayEventTime={false}
          dateClick={(arg) => { setSelectedDate(arg.dateStr); setModalOpen(true); }}
          eventClick={(info) => { setSelectedEvent(info.event); setDetailModalOpen(true); }}
          timeZone="Asia/Bangkok"
        />
      </main>

      {/* Modal จองใหม่ - แยกชื่อ/นามสกุล */}
      {modalOpen && (
        <div style={overlayStyle}>
          <div style={modalContentStyle}>
            <button onClick={() => setModalOpen(false)} style={closeBtnStyle}><X size={20} /></button>
            <h3 style={{textAlign:'center', marginBottom:'15px', color:'#1e3a8a'}}>จองวันที่: {selectedDate}</h3>
            <form onSubmit={handleBookingSubmit}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px' }}>ชื่อ:</label>
                  <input type="text" placeholder="ชื่อ" value={firstName} onChange={(e)=>setFirstName(e.target.value)} required style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px' }}>นามสกุล:</label>
                  <input type="text" placeholder="นามสกุล" value={lastName} onChange={(e)=>setLastName(e.target.value)} required style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px' }}>เวลาเริ่ม:</label>
                  <input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} required style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px' }}>เวลาจบ:</label>
                  <input type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)} required style={inputStyle} />
                </div>
              </div>
              <button type="submit" style={saveBtnStyle}>ยืนยันการจอง</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal แจ้งเตือนจองซ้ำ (Conflict) */}
      {errorModalOpen && (
        <div style={overlayStyle}>
          <div style={{ ...modalContentStyle, textAlign: 'center', borderTop: '5px solid #ef4444' }}>
            <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '15px', marginLeft: 'auto', marginRight: 'auto' }} />
            <h3 style={{ color: '#b91c1c', marginBottom: '10px' }}>ไม่สามารถจองได้</h3>
            <p style={{ fontSize: '14px', color: '#4b5563' }}>
              จองไม่ได้เนื่องจากเวลานี้มีคนจองแล้ว <br /> กรุณาเลือกการจองใหม่อีกครั้ง
            </p>
            <button onClick={() => setErrorModalOpen(false)} style={{ ...saveBtnStyle, backgroundColor: '#ef4444', marginTop: '20px' }}>ตกลง</button>
          </div>
        </div>
      )}

      {/* Modal จองสำเร็จ */}
      {successModalOpen && (
        <div style={overlayStyle}>
          <div style={{ ...modalContentStyle, textAlign: 'center', borderTop: '5px solid #22c55e' }}>
            <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: '15px', marginLeft: 'auto', marginRight: 'auto' }} />
            <h3 style={{ color: '#15803d', marginBottom: '10px' }}>จองสำเร็จเรียบร้อย!</h3>
            <p style={{ fontSize: '14px', color: '#4b5563' }}>
              ระบบได้บันทึกการจองของท่าน <br /> ลงในปฏิทินเรียบร้อยแล้ว
            </p>
            <button onClick={() => setSuccessModalOpen(false)} style={{ ...saveBtnStyle, backgroundColor: '#22c55e', marginTop: '20px' }}>ตกลง</button>
          </div>
        </div>
      )}

      {/* Modal รายละเอียดการจอง */}
      {detailModalOpen && selectedEvent && (
        <div style={overlayStyle}>
          <div style={modalContentStyle}>
            <button onClick={() => setDetailModalOpen(false)} style={closeBtnStyle}><X size={20} /></button>
            <h3 style={{textAlign:'center', color:'#1e3a8a', marginBottom:'15px'}}>รายละเอียด</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
               <p><strong>ผู้จอง:</strong> {selectedEvent.extendedProps.staff_name}</p>
               <p><strong>เวลา:</strong> {selectedEvent.title}</p>
            </div>
            {(selectedEvent.extendedProps.created_by === userEmail || !selectedEvent.extendedProps.created_by) && (
              <button onClick={() => deleteBooking(selectedEvent.id)} style={deleteBtnStyle}>ยกเลิกการจอง</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const logoutBtnStyle: React.CSSProperties = { position: 'absolute', top: '20px', right: '20px', padding: '8px 12px', border: '1px solid #fee2e2', borderRadius: '10px', color: '#ef4444', backgroundColor: '#fff', cursor: 'pointer', zIndex: 10 };
const backBtnStyle = { display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' };
const calendarContainerStyle = { backgroundColor: '#fff', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '900px', margin: '0 auto' };
const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', width: '350px', position: 'relative' };
const closeBtnStyle: React.CSSProperties = { position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px', fontSize: '14px' };
const saveBtnStyle = { width: '100%', padding: '12px', marginTop: '15px', borderRadius: '10px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' };
const deleteBtnStyle = { width: '100%', padding: '10px', marginTop: '20px', borderRadius: '10px', backgroundColor: '#fff', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer' };

export default function BookingPage() { return <Suspense fallback={null}><BookingContent /></Suspense>; }