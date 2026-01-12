'use client'
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient'; 
import { X, ArrowLeft, LogOut, AlertCircle, CheckCircle2, Phone } from 'lucide-react';
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
        // บังคับตัวพิมพ์เล็กและตัดช่องว่างตั้งแต่ต้นทาง
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
          extendedProps: { 
            ...item,
            // บังคับคนสร้างเป็นตัวพิมพ์เล็กตอนดึงมาโชว์
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
    const now = new Date().getTime(); 
    const bookingStartStr = `${selectedDate}T${startTime}:00+07:00`; 
    const bookingStartTimestamp = new Date(bookingStartStr).getTime();

    if (bookingStartTimestamp < now) {
      setErrorMessage("โปรดเลือกเวลาปัจจุบัน");
      setErrorModalOpen(true);
      return;
    }

    const newStart = bookingStartStr;
    const newEnd = `${selectedDate}T${endTime}:00+07:00`;

    if (new Date(newEnd).getTime() <= new Date(newStart).getTime()) {
      setErrorMessage("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม");
      setErrorModalOpen(true);
      return;
    }

    const { data: conflicts } = await supabase
      .from('bookings')
      .select('*')
      .eq('asset_id', assetId)
      .lt('start_time', newEnd)
      .gt('end_time', newStart);

    if (conflicts && conflicts.length > 0) {
      setErrorMessage("เวลานี้มีคนจองไว้แล้วครับ");
      setErrorModalOpen(true);
      return;
    }

    const { error } = await supabase.from('bookings').insert([
      { 
        asset_id: assetId, 
        staff_name: `${firstName} ${lastName}`, 
        phone_number: phoneNumber, 
        start_time: newStart, 
        end_time: newEnd,
        created_by: userEmail // บันทึกอีเมลที่ Clean แล้ว
      }
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setModalOpen(false);
      setSuccessModalOpen(true);
      setFirstName(''); setLastName(''); setPhoneNumber('');
      fetchBookings();
    }
  };

  if (!hasMounted) return null;

  // เช็กสิทธิ์ความเป็นเจ้าของ
  const isOwner = (event: any) => {
    if (!event || !userEmail) return false;
    const creator = event.extendedProps.created_by;
    return creator === userEmail;
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <button onClick={() => supabase.auth.signOut().then(() => window.location.href='/login')} style={logoutBtnStyle}><LogOut size={14}/> ออกจากระบบ</button>
      
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button onClick={() => window.location.href = '/'} style={backBtnStyle}><ArrowLeft size={18} /> กลับหน้าหลัก</button>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a', marginTop: '10px' }}>{assetName}</h1>
      </header>

      <main style={calendarContainerStyle}>
        <FullCalendar
          plugins={[daygridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          displayEventTime={true}
          displayEventEnd={true}
          nextDayThreshold="00:00:00"
          timeZone="Asia/Bangkok"
          dateClick={handleDateClick}
          eventClick={(info) => { setSelectedEvent(info.event); setDetailModalOpen(true); }}
        />
      </main>

      {/* Modal จอง */}
      {modalOpen && (
        <div style={overlayStyle}>
          <div style={modalContentStyle}>
            <button onClick={() => setModalOpen(false)} style={closeBtnStyle}><X size={20} /></button>
            <h3 style={{textAlign:'center', marginBottom:'15px', color: '#1e3a8a'}}>จองวันที่: {selectedDate}</h3>
            <form onSubmit={handleBookingSubmit}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input type="text" placeholder="ชื่อ" value={firstName} onChange={(e)=>setFirstName(e.target.value)} required style={inputStyle} />
                <input type="text" placeholder="นามสกุล" value={lastName} onChange={(e)=>setLastName(e.target.value)} required style={inputStyle} />
              </div>
              <input type="text" placeholder="เบอร์โทรภายใน" value={phoneNumber} onChange={(e)=>setPhoneNumber(e.target.value)} required style={inputStyle} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <div style={{flex:1}}><label style={{fontSize:'12px'}}>เริ่ม</label><input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} required style={inputStyle} /></div>
                <div style={{flex:1}}><label style={{fontSize:'12px'}}>จบ</label><input type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)} required style={inputStyle} /></div>
              </div>
              <button type="submit" style={saveBtnStyle}>ยืนยันการจอง</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal รายละเอียด และ ปุ่มยกเลิก */}
      {detailModalOpen && selectedEvent && (
        <div style={overlayStyle}>
          <div style={modalContentStyle}>
            <button onClick={() => setDetailModalOpen(false)} style={closeBtnStyle}><X size={20} /></button>
            <h3 style={{textAlign:'center', marginBottom:'15px', color: '#1e3a8a'}}>รายละเอียดการจอง</h3>
            <div style={{ fontSize: '14px', lineHeight: '2' }}>
               <p><strong>ผู้จอง:</strong> {selectedEvent.extendedProps.staff_name}</p>
               <p><strong>เบอร์โทร:</strong> {selectedEvent.extendedProps.phone_number || '-'}</p>
               <p><strong>เวลา:</strong> {selectedEvent.title}</p>
            </div>
            
            {isOwner(selectedEvent) && (
              <button onClick={async () => {
                if(confirm('ต้องการยกเลิกการจองนี้ใช่หรือไม่?')){
                  const { error } = await supabase.from('bookings').delete().eq('id', selectedEvent.id);
                  if (error) alert("ลบไม่สำเร็จ: " + error.message);
                  else { setDetailModalOpen(false); fetchBookings(); }
                }
              }} style={deleteBtnStyle}>ยกเลิกการจอง</button>
            )}
          </div>
        </div>
      )}

      {/* Modal Error/Success */}
      {errorModalOpen && (
        <div style={overlayStyle} onClick={() => setErrorModalOpen(false)}>
          <div style={{ ...modalContentStyle, textAlign: 'center' }}>
            <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 15px' }} />
            <p>{errorMessage}</p>
            <button onClick={() => setErrorModalOpen(false)} style={{ ...saveBtnStyle, backgroundColor: '#ef4444' }}>ปิด</button>
          </div>
        </div>
      )}
      {successModalOpen && (
        <div style={overlayStyle} onClick={() => setSuccessModalOpen(false)}>
          <div style={{ ...modalContentStyle, textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 15px' }} />
            <h3 style={{ color: '#15803d' }}>จองสำเร็จ!</h3>
            <button onClick={() => setSuccessModalOpen(false)} style={{ ...saveBtnStyle, backgroundColor: '#22c55e' }}>ตกลง</button>
          </div>
        </div>
      )}
    </div>
  );
}

const logoutBtnStyle: React.CSSProperties = { position: 'absolute', top: '20px', right: '20px', padding: '8px 12px', borderRadius: '10px', color: '#ef4444', backgroundColor: '#fff', border: '1px solid #fee2e2', cursor: 'pointer', zIndex: 10 };
const backBtnStyle = { display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' };
const calendarContainerStyle = { backgroundColor: '#fff', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '900px', margin: '0 auto' };
const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', width: '360px', position: 'relative' };
const closeBtnStyle: React.CSSProperties = { position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px', fontSize: '14px' };
const saveBtnStyle = { width: '100%', padding: '12px', marginTop: '15px', borderRadius: '10px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' };
const deleteBtnStyle = { width: '100%', padding: '10px', marginTop: '20px', borderRadius: '10px', backgroundColor: '#fff', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer' };

export default function BookingPage() { return <Suspense fallback={null}><BookingContent /></Suspense>; }