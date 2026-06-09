// 公告类型
export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'notice' | 'maintenance' | 'activity';
  level?: 'normal' | 'important' | 'urgent';
}

// 天气类型
export interface WeatherInfo {
  city: string;
  temperature: number;
  weather: string;
  humidity: number;
  wind: string;
  airQuality: string;
  airQualityLevel: string;
}

// 访客类型
export interface Visitor {
  id: string;
  name: string;
  phone: string;
  company: string;
  visitTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'visited' | 'expired';
  visitorCode?: string;
  hostName: string;
  hostFloor: string;
}

// 待办事项类型
export interface TodoItem {
  id: string;
  title: string;
  description: string;
  type: 'approval' | 'service' | 'payment' | 'notice';
  status: 'pending' | 'processing' | 'done';
  createTime: string;
  priority: 'high' | 'medium' | 'low';
}

export type ServiceTicketType = 'repair' | 'complaint' | 'cleaning';
export type TicketUrgency = 'low' | 'medium' | 'high';

export interface ServiceTicket {
  id: string;
  title: string;
  type: ServiceTicketType;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createTime: string;
  updateTime: string;
  handler?: string;
  progress: number;
  images?: string[];
  location: string;
  contactName: string;
  contactPhone: string;
  urgency?: TicketUrgency;
  typeText?: string;
}

// 会议室类型
export interface MeetingRoom {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  facilities: string[];
  status: 'available' | 'occupied' | 'maintenance';
  image?: string;
}

// 工位类型
export interface Desk {
  id: string;
  code: string;
  floor: string;
  area: string;
  status: 'available' | 'occupied' | 'reserved';
}

// 货梯时段类型
export interface ElevatorSlot {
  id: string;
  timeRange: string;
  capacity: number;
  booked: number;
  status: 'available' | 'full';
}

// 消息类型
export interface MessageItem {
  id: string;
  title: string;
  content: string;
  type: 'maintenance' | 'payment' | 'approval' | 'system';
  status: 'unread' | 'read';
  createTime: string;
  needRating?: boolean;
  rating?: number;
  relatedId?: string;
}

// 联系人类型
export interface Contact {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  avatar?: string;
}

// 通行记录类型
export interface AccessRecord {
  id: string;
  type: 'visitor' | 'employee' | 'vehicle';
  name: string;
  time: string;
  gate: string;
  status: 'success' | 'failed';
}

// 快捷入口类型
export interface QuickEntry {
  key: string;
  title: string;
  iconBg: string;
  iconColor: string;
  pagePath?: string;
}

// 预订统一类型
export type BookingType = 'meeting' | 'desk' | 'elevator';

export interface BookingRecord {
  id: string;
  type: BookingType;
  title: string;
  date: string;
  time: string;
  status: 'confirmed' | 'cancelled';
  // 会议室专属
  topic?: string;
  attendees?: number;
  facilities?: string[];
  // 工位专属
  applicant?: string;
  location?: string;
  // 货梯专属
  capacity?: number;
  capacityLeft?: number;
  // 通用
  purpose?: string;
  createTime?: string;
}
