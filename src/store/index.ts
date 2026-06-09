import { create } from 'zustand';
import dayjs from 'dayjs';
import type { Visitor, ServiceTicket, Contact } from '@/types';
import { myVisitors, tempPlates, ticketList, bookedMeetings, bookedDesks, meetingRooms, desks } from '@/data';

interface TempPlate {
  id: string;
  plate: string;
  expireTime: string;
  status: 'active' | 'expired';
}

interface BookedMeeting {
  id: string;
  roomName: string;
  roomId: string;
  date: string;
  time: string;
  status: 'confirmed' | 'cancelled';
}

interface BookedDesk {
  id: string;
  code: string;
  deskId: string;
  date: string;
  status: 'confirmed' | 'cancelled';
}

interface AppState {
  visitors: Visitor[];
  tempPlates: TempPlate[];
  tickets: ServiceTicket[];
  bookedMeetings: BookedMeeting[];
  bookedDesks: BookedDesk[];
  ratings: Record<string, number>;

  addVisitor: (visitor: Omit<Visitor, 'id' | 'status' | 'hostName' | 'hostFloor'>) => void;
  approveVisitor: (id: string) => void;
  rejectVisitor: (id: string) => void;

  addTempPlate: (plate: Omit<TempPlate, 'id' | 'status'>) => void;

  addTicket: (ticket: Omit<ServiceTicket, 'id' | 'status' | 'progress' | 'createTime' | 'updateTime'>) => void;

  addBookedMeeting: (meeting: Omit<BookedMeeting, 'id' | 'status'>) => void;
  addBookedDesk: (desk: Omit<BookedDesk, 'id' | 'status'>) => void;

  setRating: (ticketId: string, rating: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  visitors: myVisitors,
  tempPlates: tempPlates,
  tickets: ticketList,
  bookedMeetings: bookedMeetings,
  bookedDesks: bookedDesks,
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

  addBookedMeeting: (meeting) => {
    console.log('[Store] addBookedMeeting:', meeting);
    const newMeeting: BookedMeeting = {
      ...meeting,
      id: `bm${Date.now()}`,
      status: 'confirmed'
    };
    set((state) => ({ bookedMeetings: [newMeeting, ...state.bookedMeetings] }));
  },

  addBookedDesk: (desk) => {
    console.log('[Store] addBookedDesk:', desk);
    const newDesk: BookedDesk = {
      ...desk,
      id: `bd${Date.now()}`,
      status: 'confirmed'
    };
    set((state) => ({ bookedDesks: [newDesk, ...state.bookedDesks] }));
  },

  setRating: (ticketId, rating) => {
    console.log('[Store] setRating:', ticketId, rating);
    set((state) => ({
      ratings: { ...state.ratings, [ticketId]: rating }
    }));
  }
}));

export { meetingRooms, desks };
