import { create } from 'zustand';
import dayjs from 'dayjs';
import Taro from '@tarojs/taro';
import type {
  Visitor,
  ServiceTicket,
  BookingRecord,
  BookingType,
  BookingDisplayStatus,
  TimelineEvent
} from '@/types';
import { myVisitors, tempPlates, ticketList, bookedMeetings, bookedDesks } from '@/data';
import { meetingRooms, elevatorSlots } from '@/data/resource';

interface TempPlate {
  id: string;
  plate: string;
  expireTime: string;
  status: 'active' | 'expired';
}

const STORAGE_KEY = 'smart-building-bookings';

// 构建初始 Mock 预订，带 timeline
const buildMockBookings = (): BookingRecord[] => {
  const meetingRecords: BookingRecord[] = bookedMeetings.map((m: any, idx: number) => {
    const room = meetingRooms.find((r) => r.name === m.roomName);
    const ct = dayjs().subtract(idx + 1, 'day').format('YYYY-MM-DD HH:mm');
    return {
      id: m.id,
      type: 'meeting',
      title: m.roomName,
      date: m.date,
      time: m.time,
      status: m.status,
      topic: idx === 0 ? '季度产品评审会' : '项目周会',
      attendees: idx === 0 ? 8 : 5,
      facilities: room?.facilities || [],
      createTime: ct,
      timeline: [{ time: ct, action: '创建', remark: '用户提交预订' }, { time: ct, action: '确认', remark: '系统自动确认' }]
    };
  });
  const deskRecords: BookingRecord[] = bookedDesks.map((d: any, idx: number) => {
    const ct = dayjs().subtract(idx + 2, 'day').format('YYYY-MM-DD HH:mm');
    return {
      id: d.id,
      type: 'desk',
      title: `工位 ${d.code}`,
      date: d.date,
      time: '全天',
      status: d.status,
      applicant: '李明',
      location: `${d.code.startsWith('A') ? 'A' : 'B'}区 · A座18F`,
      purpose: idx === 0 ? '出差办公' : '临时加班',
      createTime: ct,
      timeline: [{ time: ct, action: '创建', remark: '用户提交预订' }, { time: ct, action: '确认', remark: '系统自动确认' }]
    };
  });
  return [...meetingRecords, ...deskRecords];
};

// 读取本地持久化数据
const loadBookings = (): BookingRecord[] => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('[Store] loadBookings failed', e);
  }
  return buildMockBookings();
};

const saveBookings = (list: BookingRecord[]) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('[Store] saveBookings failed', e);
  }
};

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

  addBooking: (booking: Omit<BookingRecord, 'id' | 'status' | 'timeline' | 'createTime'>) => void;
  cancelBooking: (id: string) => void;
  getBookingDisplayStatus: (b: BookingRecord) => BookingDisplayStatus;
  isBookingPast: (b: BookingRecord) => boolean;
  isTimeSlotPast: (date: string, time: string, type: BookingType) => boolean;
  hasDeskBooking: (deskCode: string, date: string) => boolean;
  hasElevatorBooking: (slotId: string, date: string) => boolean;
  getDateResourceSummary: (date: string) => {
    meeting: { total: number; booked: number; available: number };
    desk: { total: number; booked: number; available: number };
    elevator: { total: number; booked: number; available: number };
  };

  setRating: (ticketId: string, rating: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  visitors: myVisitors,
  tempPlates,
  tickets: ticketList,
  bookings: loadBookings(),
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
    const now = dayjs().format('YYYY-MM-DD HH:mm');
    const timeline: TimelineEvent[] = [
      { time: now, action: '创建', remark: '用户提交预订' },
      { time: now, action: '确认', remark: '系统自动确认' }
    ];
    const newBooking: BookingRecord = {
      ...booking,
      id: `b${Date.now()}`,
      status: 'confirmed',
      createTime: now,
      timeline
    };
    set((state) => {
      const list = [newBooking, ...state.bookings];
      saveBookings(list);
      return { bookings: list };
    });
  },

  cancelBooking: (id) => {
    console.log('[Store] cancelBooking:', id);
    const now = dayjs().format('YYYY-MM-DD HH:mm');
    set((state) => {
      const list = state.bookings.map((b) =>
        b.id === id
          ? {
              ...b,
              status: 'cancelled' as const,
              cancelTime: now,
              timeline: [...(b.timeline || []), { time: now, action: '取消' as const, remark: '用户主动取消' }]
            }
          : b
      );
      saveBookings(list);
      return { bookings: list };
    });
  },

  getBookingDisplayStatus: (b) => {
    if (b.status === 'cancelled') return 'cancelled';
    if (get().isBookingPast(b)) return 'completed';
    return 'upcoming';
  },

  isBookingPast: (b) => {
    if (b.status === 'cancelled') return false;
    const bookingDate = dayjs(b.date);
    if (bookingDate.isBefore(dayjs(), 'day')) return true;
    if (bookingDate.isAfter(dayjs(), 'day')) return false;
    // 当天判断时段
    return get().isTimeSlotPast(b.date, b.time, b.type);
  },

  isTimeSlotPast: (date, time, type) => {
    if (type === 'desk') {
      // 工位全天：当天 19:00 后视为已完成
      return dayjs(`${date} 19:00`).isBefore(dayjs());
    }
    // 会议室 / 货梯：用时间段结束时间判断
    const match = time.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
    if (!match) return false;
    const endHour = Number(match[3]);
    const endMin = Number(match[4]);
    const endMoment = dayjs(`${date} ${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`);
    return endMoment.isBefore(dayjs());
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

  getDateResourceSummary: (date) => {
    const confirmedList = get().bookings.filter((b) => b.date === date && b.status === 'confirmed');
    const meetingBooked = confirmedList.filter((b) => b.type === 'meeting').length;
    const deskBooked = confirmedList.filter((b) => b.type === 'desk').length;
    const elevatorBooked = confirmedList.filter((b) => b.type === 'elevator').length;
    return {
      meeting: { total: meetingRooms.filter((r) => r.status === 'available').length, booked: meetingBooked, available: Math.max(0, meetingRooms.filter((r) => r.status === 'available').length - meetingBooked) },
      desk: { total: 24, booked: deskBooked, available: Math.max(0, 24 - deskBooked) },
      elevator: { total: elevatorSlots.length * 20, booked: elevatorBooked, available: Math.max(0, elevatorSlots.length * 20 - elevatorBooked) }
    };
  },

  setRating: (ticketId, rating) => {
    console.log('[Store] setRating:', ticketId, rating);
    set((state) => ({
      ratings: { ...state.ratings, [ticketId]: rating }
    }));
  }
}));

export { };
