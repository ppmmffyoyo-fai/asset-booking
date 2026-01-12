'use client'
import React from 'react'
import FullCalendar from '@fullcalendar/react'
import daygridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

const CalendarComponent = ({ events, onDateClick, onEventClick }: any) => {
  return (
    <FullCalendar
      plugins={[daygridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
      events={events}
      displayEventTime={false}
      dateClick={onDateClick}
      eventClick={onEventClick}
    />
  )
}
export default CalendarComponent