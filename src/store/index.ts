import { create } from 'zustand';
import dayjs from 'dayjs';
import type { Visitor, ServiceTicket, BookingRecord, BookingType } from '@/types';
import { myVisitors, tempPlates, ticketList, bookedMeetings, bookedDesks } from '@/data';
import { meetingRooms, elevatorSlots } from '@/data/resource';

interface TempPlate {
  id: string;
  plate: string;
  expireTime: string;
  status: 'active' | 'expired';
}

const initBookings: BookingRecord[] = [
  ...bookedMeetings.map((m: any) => {
    const room = meetingRooms.find((r) => r.name === m.roomName);
    return {
      id: m.id,
      type: 'meeting' as BookingType,
      title: m.roomName,
      date: m.date,
      time: m.time,
      status: m.status,
      topic: '季度产品评审会',
      attendees: 8,
      facilities: room?.facilities || [],
      createTime: '2026-06-09 14:30'
    };
  }),
  ...bookedDesks.map((d: any) => ({
    id: d.id,
    type: 'desk' as BookingType,
    title: `工位 ${d.code}`,
    date: d.date,
    time: '全天',
    status: d.status,
    applicant: '李明',
    location: `${d.code.startsWith('A') ? 'A' : 'B'}区 · A座18F`,
    purpose: '出差办公',
    createTime: '2026-06-09 10:12'
  }))
];

interface AppState {
  visitors: Visitor[];
  tempPlates: TempPlate[];
  tickets: ServiceTicket[];
  bookings: BookingRecord[];
  ratings: Record<string, number>;

  addVisitor: (visitor: Omit<Visitor, 'id' | 'status' | 'hostName' | 'hostFloor'>) => void;
  approveVisitor: (id: string) => void;
  rejectVisitor: (id: string) => void;

  addTempPlate: (plate: Omit<TempPlate, 'id' | 'status'>) => void;

  addTicket: (ticket: Omit<ServiceTicket, 'id' | 'status' | 'progress' | 'createTime' | 'updateTime'>) => void;

  addBooking: (booking: Omit<BookingRecord, 'id' | 'status'>) => void;
  cancelBooking: (id: string) => void;
  hasDeskBooking: (deskCode: string, date: string) => boolean;
  hasElevatorBooking: (slotId: string, date: string) => boolean;

  setRating: (ticketId: string, rating: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  visitors: myVisitors,
  tempPlates,
  tickets: ticketList,
  bookings: initBookings,
  ratings: {},

  addVisitor: (visitor) => {
    console.log('[Store] addVisitor:', visitor);
    const newVisitor: Visitor = {
      ...visitor,
      id: `v${Date.now()}`,
      status: 'pending',
      hostName: '李明',
      hostFloor: '18F',
      visitorCode: `V${dayjs().format('YYYYMMDD')}${String(get().visitors.length + 1).padStart(3, '0')}`
    };
    set((state) => ({ visitors: [newVisitor, ...state.visitors] }));
  },

  approveVisitor: (id) => {
    console.log('[Store] approveVisitor:', id);
    set((state) => ({
      visitors: state.visitors.map((v) =>
        v.id === id ? { ...v, status: 'approved' as const } : v
      )
    }));
  },

  rejectVisitor: (id) => {
    console.log('[Store] rejectVisitor:', id);
    set((state) => ({
      visitors: state.visitors.map((v) =>
        v.id === id ? { ...v, status: 'rejected' as const } : v
      )
    }));
  },

  addTempPlate: (plate) => {
    console.log('[Store] addTempPlate:', plate);
    const newPlate: TempPlate = {
      ...plate,
      id: `p${Date.now()}`,
      status: dayjs(plate.expireTime).isAfter(dayjs()) ? 'active' : 'expired'
    };
    set((state) => ({ tempPlates: [newPlate, ...state.tempPlates] }));
  },

  addTicket: (ticket) => {
    console.log('[Store] addTicket:', ticket);
    const newTicket: ServiceTicket = {
      ...ticket,
      id: `s${Date.now()}`,
      status: 'pending',
      progress: 10,
      createTime: dayjs().format('YYYY-MM-DD HH:mm'),
      updateTime: dayjs().format('YYYY-MM-DD HH:mm')
    };
    set((state) => ({ tickets: [newTicket, ...state.tickets] }));
  },

  addBooking: (booking) => {
    console.log('[Store] addBooking:', booking);
    const newBooking: BookingRecord = {
      ...booking,
      id: `b${Date.now()}`,
      status: 'confirmed',
      createTime: dayjs().format('YYYY-MM-DD HH:mm')
    };
    set((state) => ({ bookings: [newBooking, ...state.bookings] }));
  },

  cancelBooking: (id) => {
    console.log('[Store] cancelBooking:', id);
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status: 'cancelled' as const } : b
      )
    }));
  },

  hasDeskBooking: (deskCode, date) => {
    return get().bookings.some(
      (b) => b.type === 'desk' && b.title.includes(deskCode) && b.date === date && b.status === 'confirmed'
    );
  },

  hasElevatorBooking: (slotId, date) => {
    return get().bookings.some(
      (b) => b.type === 'elevator' && b.title.includes(slotId) && b.date === date && b.status === 'confirmed'
    );
  },

  setRating: (ticketId, rating) => {
    console.log('[Store] setRating:', ticketId, rating);
    set((state) => ({
      ratings: { ...state.ratings, [ticketId]: rating }
    }));
  }
}));

export { };
