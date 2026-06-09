import type { MeetingRoom, Desk, ElevatorSlot } from '@/types';

export const meetingRooms: MeetingRoom[] = [
  {
    id: 'm1',
    name: '星河会议室',
    floor: '18F',
    capacity: 12,
    facilities: ['投影仪', '白板', '视频会议', '空调'],
    status: 'available'
  },
  {
    id: 'm2',
    name: '云海会议室',
    floor: '18F',
    capacity: 6,
    facilities: ['电视', '白板', '空调'],
    status: 'occupied'
  },
  {
    id: 'm3',
    name: '晨曦小会议室',
    floor: '18F',
    capacity: 4,
    facilities: ['电视', '白板'],
    status: 'available'
  },
  {
    id: 'm4',
    name: '董事会议室',
    floor: '20F',
    capacity: 20,
    facilities: ['投影仪', '视频会议', '白板', '空调', '茶水服务'],
    status: 'maintenance'
  },
  {
    id: 'm5',
    name: '培训室A',
    floor: '5F',
    capacity: 30,
    facilities: ['投影仪', '音响', '白板', '空调'],
    status: 'available'
  }
];

export const desks: Desk[] = [
  { id: 'd1', code: 'A1801', floor: '18F', area: 'A区', status: 'available' },
  { id: 'd2', code: 'A1802', floor: '18F', area: 'A区', status: 'occupied' },
  { id: 'd3', code: 'A1803', floor: '18F', area: 'A区', status: 'available' },
  { id: 'd4', code: 'A1804', floor: '18F', area: 'A区', status: 'available' },
  { id: 'd5', code: 'A1805', floor: '18F', area: 'A区', status: 'reserved' },
  { id: 'd6', code: 'B1801', floor: '18F', area: 'B区', status: 'available' },
  { id: 'd7', code: 'B1802', floor: '18F', area: 'B区', status: 'available' },
  { id: 'd8', code: 'B1803', floor: '18F', area: 'B区', status: 'occupied' }
];

export const elevatorSlots: ElevatorSlot[] = [
  { id: 'e1', timeRange: '08:00 - 10:00', capacity: 20, booked: 8, status: 'available' },
  { id: 'e2', timeRange: '10:00 - 12:00', capacity: 20, booked: 18, status: 'available' },
  { id: 'e3', timeRange: '13:00 - 15:00', capacity: 20, booked: 20, status: 'full' },
  { id: 'e4', timeRange: '15:00 - 17:00', capacity: 20, booked: 5, status: 'available' },
  { id: 'e5', timeRange: '17:00 - 19:00', capacity: 20, booked: 12, status: 'available' }
];

export const bookedMeetings = [
  { id: 'bm1', roomName: '星河会议室', date: '2026-06-12', time: '14:00 - 16:00', status: 'confirmed' },
  { id: 'bm2', roomName: '晨曦小会议室', date: '2026-06-11', time: '10:00 - 11:00', status: 'confirmed' }
];

export const bookedDesks = [
  { id: 'bd1', code: 'A1803', date: '2026-06-11', status: 'confirmed' }
];
