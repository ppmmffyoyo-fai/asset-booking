'use client'
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient'; 
import { X, ArrowLeft, AlertCircle, CheckCircle2, LogOut } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  const handleLogout = async () => {
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      await supabase.auth.signOut();
      router.push('/login'); // หรือหน้าหน้าหลักที่พี่ต้องการ
    }
  };

  const fetchBookings = useCallback(async () => {
    if (!assetId) return;
    const { data } = await supabase.from('bookings').select('*').eq('asset_id', assetId);
    if (data) {
      const formatted = data.map((item: any) => ({
        id: item.id,
        title: item.staff_name,
        start: item.start_time,
        end: item.end_time,
        allDay: false,
        extendedProps: { ...item }
      }));
      setEvents(formatted as any);
    }
  }, [assetId]);

  useEffect(() => { if (hasMounted) fetchBookings(); }, [hasMounted, fetchBookings]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const startObj = new Date(`${selectedDate}T${startTime}:00`);
    const endObj = new Date(`${selectedDate}T${endTime}:00`);
    const now = new Date();

    if (startObj.getTime() < now.getTime()) {
      setErrorMessage("ไม่สามารถจองย้อนหลังได้ กรุณาตรวจสอบวันที่และเวลาอีกครั้ง");
      setErrorModalOpen(true);
      return;
    }

    if (endObj.getTime() <= startObj.getTime()) {
      setErrorMessage("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น");
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
      setErrorMessage("ช่วงเวลานี้มีการจองซ้อนทับกัน กรุณาเปลี่ยนเวลาจอง");
      setErrorModalOpen(true);
      return;
    }

    const { error } = await supabase.from('bookings').insert([{ 
      asset_id: assetId, 
      staff_name: `${firstName} ${lastName}`, 
      phone_number: phoneNumber, 
      start_time: isoStart, 
      end_time: isoEnd, 
      created_by: userEmail
    }]);

    if (!error) {
      setModalOpen(false); 
      setSuccessModalOpen(true); 
      fetchBookings();
      setFirstName(''); setLastName(''); setPhoneNumber('');
    }
  };

  if (!hasMounted) return null;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {/* ปุ่ม Logout ที่มุมขวาบน */}
      <button onClick={handleLogout} style={logoutBtnStyle}>
        <LogOut size={18} /> ออกจากระบบ
      </button>

      <style>{`
        .fc-event { background-color: #1e3a8a !important; border: none !important; border-radius: 4px !important; padding: 2px 6px !important; }
        .fc-event-main { display: flex !important; align-items: center !important; color: white !important; font-size: 11px !important; }
        .fc-event-main::before { content: ""; display: inline-block; width: 5px; height: 5px; background-color: #f97316; border-radius: 50%; margin-right: 6px; flex-shrink: 0; }
        .fc-toolbar-title { color: #1e3a8a; font-weight: bold; text-transform: capitalize; }
        .fc-button-primary { background-color: #1e3a8a !important; border: none !important; }
      `}</style>

      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button onClick={() => window.location.href = '/'} style={backBtnStyle}><ArrowLeft size={18} /> กลับหน้าหลัก</button>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a', marginTop: '10px' }}>{assetName}</h1>
      </header>

      <main style={calendarContainerStyle}>
        <FullCalendar
          plugins={[daygridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          locale="en" 
          buttonText={{ today: 'Today' }}
          nextDayThreshold="00:00:00"
          dateClick={(arg) => {
            const clickedDate = new Date(arg.dateStr);
            const today = new Date();
            today.setHours(0,0,0,0);
            if (clickedDate.getTime() < today.getTime()) {
              setErrorMessage("ไม่สามารถจองวันที่ผ่านมาแล้วได้");
              setErrorModalOpen(true);
              return;
            }
            setSelectedDate(arg.dateStr); 
            setModalOpen(true); 
          }}
          eventClick={(info) => { setSelectedEvent(info.event); setDetailModalOpen(true); }}
          eventContent={(arg) => {
            const sTime = arg.event.start?.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            const eTime = arg.event.end?.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            return (
              <div className="fc-event-main">
                <span style={{ fontWeight: 'bold' }}>{sTime}-{eTime} น.</span>
                <span style={{ marginLeft: '5px' }}>{arg.event.title}</span>
              </div>
            );
          }}
        />
      </main>

      {/* Modal จอง */}
      {modalOpen && (
        <div style={overlayStyle}>
          <div style={modalContentStyle}>
            <button onClick={() => setModalOpen(false)} style={closeBtnStyle}><X size={20} /></button>
            <h3 style={{textAlign:'center', color:'#1e3a8a', marginBottom: '20px'}}>จองวันที่: {selectedDate}</h3>
            <form onSubmit={handleBookingSubmit}>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                <input type="text" placeholder="ชื่อ" value={firstName} onChange={(e)=>setFirstName(e.target.value)} required style={inputStyle} />
                <input type="text" placeholder="นามสกุล" value={lastName} onChange={(e)=>setLastName(e.target.value)} required style={inputStyle} />
              </div>
              <input type="text" placeholder="เบอร์โทรภายใน" value={phoneNumber} onChange={(e)=>setPhoneNumber(e.target.value)} required style={inputStyle} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <div style={{flex:1}}>
                  <label style={{fontSize:'14px', fontWeight:'bold'}}>เวลาเริ่มต้น</label>
                  <input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} required style={inputStyle} />
                </div>
                <div style={{flex:1}}>
                  <label style={{fontSize:'14px', fontWeight:'bold'}}>เวลาสิ้นสุด</label>
                  <input type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)} required style={inputStyle} />
                </div>
              </div>
              <button type="submit" style={saveBtnStyle}>ยืนยันการจอง</button>
            </form>
          </div>
        </div>
      )}

      {/* Pop-up แจ้งเตือนข้อผิดพลาด */}
      {errorModalOpen && (
        <div style={overlayStyle} onClick={() => setErrorModalOpen(false)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <AlertCircle size={48} color="#ef4444" style={{margin:'0 auto 10px', display:'block'}}/>
            <p style={{textAlign:'center', fontWeight:'bold', color:'#ef4444'}}>{errorMessage}</p>
            <button onClick={() => setErrorModalOpen(false)} style={{...saveBtnStyle, backgroundColor:'#ef4444', marginTop:'20px'}}>รับทราบ</button>
          </div>
        </div>
      )}

      {successModalOpen && <div style={overlayStyle} onClick={() => setSuccessModalOpen(false)}><div style={modalContentStyle}><CheckCircle2 size={48} color="#22c55e" style={{margin:'0 auto 10px', display:'block'}}/><h3 style={{textAlign:'center'}}>จองสำเร็จ!</h3></div></div>}
      
      {detailModalOpen && selectedEvent && (
        <div style={overlayStyle}>
          <div style={modalContentStyle}>
            <button onClick={() => setDetailModalOpen(false)} style={closeBtnStyle}><X size={20} /></button>
            <h3 style={{textAlign:'center', color:'#1e3a8a', marginBottom: '20px'}}>รายละเอียดการจอง</h3>
            <div style={{fontSize: '15px', lineHeight: '2'}}>
              <p><strong>ผู้จอง:</strong> {selectedEvent.extendedProps.staff_name}</p>
              <p><strong>เบอร์โทร:</strong> {selectedEvent.extendedProps.phone_number}</p>
              <p><strong>เวลา:</strong> {new Date(selectedEvent.start).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'})} - {new Date(selectedEvent.end).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'})} น.</p>
            </div>
            {selectedEvent.extendedProps.created_by === userEmail && (
              <button onClick={async () => {
                if(confirm('ต้องการยกเลิกการจองนี้ใช่หรือไม่?')){
                  await supabase.from('bookings').delete().eq('id', selectedEvent.id);
                  setDetailModalOpen(false); fetchBookings();
                }
              }} style={deleteBtnStyle}>ยกเลิกการจอง</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Styles ---
const logoutBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: '#ef4444',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  zIndex: 10
};

const backBtnStyle = { border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', display:'flex', alignItems:'center', gap:'5px' };
const calendarContainerStyle = { backgroundColor: '#fff', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '900px', margin: '0 auto' };
const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', width: '380px', position: 'relative' };
const closeBtnStyle: React.CSSProperties = { position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' };
const saveBtnStyle = { width: '100%', padding: '12px', marginTop: '15px', borderRadius: '10px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' };
const deleteBtnStyle = { width: '100%', padding: '10px', marginTop: '20px', borderRadius: '10px', backgroundColor: '#fff', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer' };

export default function BookingPage() { return <Suspense fallback={null}><BookingContent /></Suspense>; }