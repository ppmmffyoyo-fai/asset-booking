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
      const formatted = data.map((item: any) => ({
        id: item.id,
        title: item.staff_name,
        start: item.start_time,
        end: item.end_time,
        allDay: false,
        extendedProps: { 
          ...item,
          created_by: item.created_by ? item.created_by.toLowerCase().trim() : null 
        }
      }));
      setEvents(formatted as any);
    }
  }, [assetId]);

  useEffect(() => { if (hasMounted) fetchBookings(); }, [hasMounted, fetchBookings]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. สร้าง Object เวลาที่เลือก
    const startObj = new Date(`${selectedDate}T${startTime}:00+07:00`);
    const endObj = new Date(`${selectedDate}T${endTime}:00+07:00`);
    const now = new Date();

    // 2. ตรวจสอบ: ห้ามจองย้อนหลัง
    if (startObj < now) {
      setErrorMessage("ไม่สามารถจองเวลาย้อนหลังได้ครับ");
      setErrorModalOpen(true);
      return;
    }

    // 3. ตรวจสอบ: เวลาจบต้องหลังเวลาเริ่ม
    if (endObj <= startObj) {
      setErrorMessage("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม");
      setErrorModalOpen(true);
      return;
    }

    const isoStart = startObj.toISOString();
    const isoEnd = endObj.toISOString();

    // 4. ตรวจสอบ: ห้ามจองซ้อนทับ (Check Overlap)
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('*')
      .eq('asset_id', assetId)
      .lt('start_time', isoEnd) // เริ่มต้นของรายการที่มีอยู่ น้อยกว่า เวลาจบที่เราเลือก
      .gt('end_time', isoStart); // สิ้นสุดของรายการที่มีอยู่ มากกว่า เวลาเริ่มที่เราเลือก

    if (conflicts && conflicts.length > 0) {
      setErrorMessage("ช่วงเวลานี้มีการจองซ้อนทับกัน กรุณาเลือกเวลาอื่นครับ");
      setErrorModalOpen(true);
      return;
    }

    // 5. บันทึกข้อมูล
    const { error } = await supabase.from('bookings').insert([{ 
      asset_id: assetId, staff_name: `${firstName} ${lastName}`, 
      phone_number: phoneNumber, start_time: isoStart, end_time: isoEnd, created_by: userEmail
    }]);

    if (!error) {
      setModalOpen(false); 
      setSuccessModalOpen(true); 
      fetchBookings();
      setFirstName(''); setLastName(''); setPhoneNumber('');
    } else {
      setErrorMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setErrorModalOpen(true);
    }
  };

  if (!hasMounted) return null;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <style>{`
        .fc-event {
          background-color: #2563eb !important; 
          border: none !important;
          border-radius: 4px !important;
          padding: 2px 6px !important;
          margin-bottom: 2px !important;
        }
        .fc-event-main {
          display: flex !important;
          align-items: center !important;
          color: white !important;
          font-size: 11px !important;
          white-space: nowrap !important;
        }
        .fc-event-main::before {
          content: "";
          display: inline-block;
          width: 5px;
          height: 5px;
          background-color: #f97316;
          border-radius: 50%;
          margin-right: 6px;
          flex-shrink: 0;
        }
        .fc-toolbar-title { color: #1e3a8a; font-weight: bold; }
        .fc-button-primary { background-color: #2563eb !important; border: none !important; }
      `}</style>

      <button onClick={() => supabase.auth.signOut().then(() => window.location.href='/login')} style={logoutBtnStyle}>ออกจากระบบ</button>
      
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
          dateClick={(arg) => { setSelectedDate(arg.dateStr); setModalOpen(true); }}
          eventClick={(info) => { setSelectedEvent(info.event); setDetailModalOpen(true); }}
          eventContent={(arg) => {
            const sTime = arg.event.start?.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            const eTime = arg.event.end?.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            return (
              <div className="fc-event-main">
                <span style={{ fontWeight: 'bold' }}>{sTime}-{eTime} น.</span>
                <span style={{ marginLeft: '5px', opacity: 0.9 }}>{arg.event.title}</span>
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
            <h3 style={{textAlign:'center', color:'#1e3a8a'}}>จองวันที่: {selectedDate}</h3>
            <form onSubmit={handleBookingSubmit}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <input type="text" placeholder="ชื่อ" value={firstName} onChange={(e)=>setFirstName(e.target.value)} required style={inputStyle} />
                <input type="text" placeholder="นามสกุล" value={lastName} onChange={(e)=>setLastName(e.target.value)} required style={inputStyle} />
              </div>
              <input type="text" placeholder="เบอร์โทรภายใน" value={phoneNumber} onChange={(e)=>setPhoneNumber(e.target.value)} required style={inputStyle} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <div style={{flex:1}}><label>เริ่ม</label><input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} required style={inputStyle} /></div>
                <div style={{flex:1}}><label>จบ</label><input type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)} required style={inputStyle} /></div>
              </div>
              <button type="submit" style={saveBtnStyle}>ยืนยันการจอง</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal รายละเอียด */}
      {detailModalOpen && selectedEvent && (
        <div style={overlayStyle}>
          <div style={modalContentStyle}>
            <button onClick={() => setDetailModalOpen(false)} style={closeBtnStyle}><X size={20} /></button>
            <h3 style={{textAlign:'center', color:'#1e3a8a', marginBottom: '20px'}}>รายละเอียดการจอง</h3>
            <div style={{fontSize: '15px', lineHeight: '2'}}>
              <p><strong>ผู้จอง:</strong> {selectedEvent.extendedProps.staff_name}</p>
              <p><strong>เบอร์โทรภายใน:</strong> {selectedEvent.extendedProps.phone_number}</p>
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

      {/* Popup แจ้งเตือนข้อผิดพลาด */}
      {errorModalOpen && (
        <div style={overlayStyle} onClick={() => setErrorModalOpen(false)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <AlertCircle size={48} color="#ef4444" style={{margin:'0 auto 10px', display:'block'}}/>
            <p style={{textAlign:'center', fontWeight:'bold', color:'#ef4444'}}>{errorMessage}</p>
            <button onClick={() => setErrorModalOpen(false)} style={{...saveBtnStyle, backgroundColor:'#ef4444', marginTop:'20px'}}>ปิด</button>
          </div>
        </div>
      )}

      {successModalOpen && <div style={overlayStyle} onClick={() => setSuccessModalOpen(false)}><div style={modalContentStyle}><CheckCircle2 size={48} color="#22c55e" style={{margin:'0 auto 10px', display:'block'}}/><h3 style={{textAlign:'center'}}>จองสำเร็จ!</h3></div></div>}
    </div>
  );
}

const logoutBtnStyle: React.CSSProperties = { position: 'absolute', top: '20px', right: '20px', padding: '8px 12px', borderRadius: '10px', color: '#ef4444', backgroundColor: '#fff', border: '1px solid #fee2e2', cursor: 'pointer' };
const backBtnStyle = { border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', display:'flex', alignItems:'center', gap:'5px' };
const calendarContainerStyle = { backgroundColor: '#fff', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '900px', margin: '0 auto' };
const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', width: '360px', position: 'relative' };
const closeBtnStyle: React.CSSProperties = { position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' };
const saveBtnStyle = { width: '100%', padding: '12px', marginTop: '15px', borderRadius: '10px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' };
const deleteBtnStyle = { width: '100%', padding: '10px', marginTop: '20px', borderRadius: '10px', backgroundColor: '#fff', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer' };

export default function BookingPage() { return <Suspense fallback={null}><BookingContent /></Suspense>; }