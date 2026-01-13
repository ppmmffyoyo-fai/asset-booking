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
  const assetNameFromUrl = searchParams.get('name') || '';

  const [assetName] = useState(assetNameFromUrl || `รหัสครุภัณฑ์: ${assetId}`);
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [hasMounted, setHasMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('16:30');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        setUserEmail(user.email.toLowerCase().trim());
      }
    };
    init();
    setHasMounted(true);
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!assetId) return;
    const { data } = await supabase.from('bookings').select('*').eq('asset_id', assetId);
    if (data) {
      const formatted = data.map((item: any) => {
        const sDate = new Date(item.start_time);
        const eDate = new Date(item.end_time);
        const s = sDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
        const e = eDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
        
        return {
          id: item.id,
          title: `${s}-${e} น. ${item.staff_name}`,
          start: item.start_time,
          end: item.end_time,
          allDay: false, // บังคับไม่ให้เป็น AllDay
          extendedProps: { 
            ...item,
            created_by: item.created_by ? item.created_by.toLowerCase().trim() : null 
          }
        };
      });
      setEvents(formatted as any);
    }
  }, [assetId]);

  useEffect(() => { if (hasMounted) fetchBookings(); }, [hasMounted, fetchBookings]);

  const handleDateClick = (arg: any) => {
    const clickedDate = new Date(arg.dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (clickedDate < today) {
      setErrorMessage("ไม่สามารถจองวันที่ผ่านมาแล้วได้ครับ");
      setErrorModalOpen(true);
      return;
    }
    setSelectedDate(arg.dateStr);
    setModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const startStr = `${selectedDate}T${startTime}:00+07:00`;
    const endStr = `${selectedDate}T${endTime}:00+07:00`;
    const startObj = new Date(startStr);
    const endObj = new Date(endStr);

    if (startObj.getTime() < new Date().getTime()) {
      setErrorMessage("ไม่สามารถจองเวลาย้อนหลังได้ครับ");
      setErrorModalOpen(true);
      return;
    }
    if (endObj.getTime() <= startObj.getTime()) {
      setErrorMessage("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม");
      setErrorModalOpen(true);
      return;
    }

    const isoStart = startObj.toISOString();
    const isoEnd = endObj.toISOString();

    const { data: conflicts } = await supabase
      .from('bookings')
      .select('*')
      .eq('asset_id', assetId)
      .lt('start_time', isoEnd)
      .gt('end_time', isoStart);

    if (conflicts && conflicts.length > 0) {
      setErrorMessage("เวลานี้มีการจองไว้แล้ว");
      setErrorModalOpen(true);
      return;
    }

    const { error } = await supabase.from('bookings').insert([{ 
      asset_id: assetId, staff_name: `${firstName} ${lastName}`, 
      phone_number: phoneNumber, start_time: isoStart, end_time: isoEnd, created_by: userEmail
    }]);

    if (!error) {
      setModalOpen(false); setSuccessModalOpen(true);
      setFirstName(''); setLastName(''); setPhoneNumber('');
      fetchBookings();
    }
  };

  if (!hasMounted) return null;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <style>{`
        /* บังคับให้ Event ไม่ล้นไปวันถัดไปในมุมมองตาราง */
        .fc-daygrid-event {
          white-space: normal !important;
          align-items: flex-start !important;
          margin-bottom: 2px !important;
        }
        .fc-v-event {
          border: none !important;
          background-color: transparent !important;
        }
      `}</style>
      
      <button onClick={() => supabase.auth.signOut().then(() => window.location.href='/login')} style={logoutBtnStyle}>ออกระบบ</button>
      
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button onClick={() => window.location.href = '/'} style={backBtnStyle}><ArrowLeft size={18} /> กลับ</button>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a' }}>{assetName}</h1>
      </header>

      <main style={calendarContainerStyle}>
        <FullCalendar
          plugins={[daygridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          displayEventTime={true}
          displayEventEnd={true}
          timeZone="Asia/Bangkok"
          nextDayThreshold="00:00:00" // ตัดจบเที่ยงคืนเป๊ะ
          forceEventDuration={true}
          dateClick={handleDateClick}
          eventClick={(info) => { setSelectedEvent(info.event); setDetailModalOpen(true); }}
          eventContent={(arg) => (
            <div style={{ 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              padding: '2px 5px', 
              borderRadius: '4px', 
              fontSize: '11px',
              width: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              <b>{arg.timeText}</b> {arg.event.extendedProps.staff_name}
            </div>
          )}
        />
      </main>

      {/* Modal จอง */}
      {modalOpen && (
        <div style={overlayStyle}>
          <div style={modalContentStyle}>
            <button onClick={() => setModalOpen(false)} style={closeBtnStyle}><X size={20} /></button>
            <h3 style={{textAlign:'center', color: '#1e3a8a'}}>จองวันที่: {selectedDate}</h3>
            <form onSubmit={handleBookingSubmit}>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                <input type="text" placeholder="ชื่อ" value={firstName} onChange={(e)=>setFirstName(e.target.value)} required style={inputStyle} />
                <input type="text" placeholder="นามสกุล" value={lastName} onChange={(e)=>setLastName(e.target.value)} required style={inputStyle} />
              </div>
              <input type="text" placeholder="เบอร์โทร" value={phoneNumber} onChange={(e)=>setPhoneNumber(e.target.value)} required style={inputStyle} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <div style={{flex:1}}><label>เริ่ม</label><input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} required style={inputStyle} /></div>
                <div style={{flex:1}}><label>จบ (ห้ามเกิน 23:59)</label><input type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)} required style={inputStyle} /></div>
              </div>
              <button type="submit" style={saveBtnStyle}>ยืนยัน</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal รายละเอียด */}
      {detailModalOpen && selectedEvent && (
        <div style={overlayStyle}>
          <div style={modalContentStyle}>
            <button onClick={() => setDetailModalOpen(false)} style={closeBtnStyle}><X size={20} /></button>
            <h3 style={{textAlign:'center', color: '#1e3a8a'}}>ข้อมูลการจอง</h3>
            <p><strong>ผู้จอง:</strong> {selectedEvent.extendedProps.staff_name}</p>
            <p><strong>เวลา:</strong> {selectedEvent.title}</p>
            {selectedEvent.extendedProps.created_by === userEmail && (
              <button onClick={async () => {
                if(confirm('ยกเลิก?')){
                  await supabase.from('bookings').delete().eq('id', selectedEvent.id);
                  setDetailModalOpen(false); fetchBookings();
                }
              }} style={deleteBtnStyle}>ยกเลิกการจอง</button>
            )}
          </div>
        </div>
      )}

      {/* Error/Success Modals */}
      {errorModalOpen && (
        <div style={overlayStyle} onClick={() => setErrorModalOpen(false)}>
          <div style={{ ...modalContentStyle, textAlign: 'center' }}>
            <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 10px' }} />
            <p>{errorMessage}</p>
          </div>
        </div>
      )}
      {successModalOpen && (
        <div style={overlayStyle} onClick={() => setSuccessModalOpen(false)}>
          <div style={{ ...modalContentStyle, textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 10px' }} />
            <h3>จองสำเร็จ</h3>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const logoutBtnStyle: React.CSSProperties = { position: 'absolute', top: '20px', right: '20px', padding: '5px 10px', borderRadius: '8px', color: '#ef4444', backgroundColor: '#fff', border: '1px solid #fee2e2', cursor: 'pointer' };
const backBtnStyle = { border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', display:'flex', alignItems:'center', gap:'5px' };
const calendarContainerStyle = { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', maxWidth: '900px', margin: '0 auto' };
const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '25px', borderRadius: '15px', width: '350px', position: 'relative' };
const closeBtnStyle: React.CSSProperties = { position: 'absolute', top: '10px', right: '10px', border: 'none', background: 'none', cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', marginTop: '5px' };
const saveBtnStyle = { width: '100%', padding: '10px', marginTop: '15px', borderRadius: '8px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', cursor: 'pointer' };
const deleteBtnStyle = { width: '100%', padding: '8px', marginTop: '15px', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer' };

export default function BookingPage() { return <Suspense fallback={null}><BookingContent /></Suspense>; }