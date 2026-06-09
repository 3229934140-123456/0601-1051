import type { Announcement, WeatherInfo, Visitor, TodoItem, QuickEntry } from '@/types';

export const announcementList: Announcement[] = [
  {
    id: 'a1',
    title: '【重要】6月15日 B座电梯年检通知',
    content: '尊敬的租户您好，B座1-3号电梯将于6月15日 22:00-次日06:00进行年度安全检测，请您提前安排出行。',
    date: '2026-06-10',
    type: 'maintenance',
    level: 'important'
  },
  {
    id: 'a2',
    title: '写字楼中央空调已开启制冷模式',
    content: '随着气温升高，楼宇中央空调已于今日开启制冷模式，工作时间为工作日 08:00-18:30，如需调整请联系物业。',
    date: '2026-06-09',
    type: 'notice',
    level: 'normal'
  },
  {
    id: 'a3',
    title: '楼宇消防演练即将开展',
    content: '为提升全员消防安全意识，物业将于6月20日下午14:00开展消防应急演练，请各公司积极配合。',
    date: '2026-06-08',
    type: 'activity',
    level: 'normal'
  },
  {
    id: 'a4',
    title: '【紧急】地下车库临时封闭通知',
    content: 'B2层地下车库因消防管道检修，于今日16:00-20:00临时封闭，请将车辆移至B1层或地面停车场。',
    date: '2026-06-10',
    type: 'maintenance',
    level: 'urgent'
  }
];

export const weatherInfo: WeatherInfo = {
  city: '上海市',
  temperature: 28,
  weather: '多云转晴',
  humidity: 65,
  wind: '东南风 3级',
  airQuality: '78',
  airQualityLevel: '良'
};

export const todayVisitors: Visitor[] = [
  {
    id: 'v1',
    name: '张晓明',
    phone: '138****5678',
    company: '上海科技有限公司',
    visitTime: '10:30',
    status: 'approved',
    visitorCode: 'V20260610001',
    hostName: '李明',
    hostFloor: '18F'
  },
  {
    id: 'v2',
    name: '王芳',
    phone: '139****1234',
    company: '华信咨询集团',
    visitTime: '14:00',
    status: 'pending',
    hostName: '李明',
    hostFloor: '18F'
  },
  {
    id: 'v3',
    name: '赵强',
    phone: '137****9876',
    company: '卓越设计工作室',
    visitTime: '15:30',
    status: 'pending',
    hostName: '李明',
    hostFloor: '18F'
  }
];

export const todoList: TodoItem[] = [
  {
    id: 't1',
    title: '访客审批',
    description: '王芳 申请今日14:00来访',
    type: 'approval',
    status: 'pending',
    createTime: '2026-06-10 09:15',
    priority: 'high'
  },
  {
    id: 't2',
    title: '报修处理中',
    description: '会议室投影仪维修 - 工程师已派单',
    type: 'service',
    status: 'processing',
    createTime: '2026-06-09 16:30',
    priority: 'medium'
  },
  {
    id: 't3',
    title: '物业费催缴',
    description: '2026年Q2物业费待缴纳 ¥12,580',
    type: 'payment',
    status: 'pending',
    createTime: '2026-06-05 10:00',
    priority: 'high'
  },
  {
    id: 't4',
    title: '会议室审核通过',
    description: '您预订的6月12日 大会议室已确认',
    type: 'notice',
    status: 'done',
    createTime: '2026-06-10 08:00',
    priority: 'low'
  }
];

export const quickEntries: QuickEntry[] = [
  { key: 'visitor', title: '访客申请', iconBg: 'rgba(22, 93, 255, 0.1)', iconColor: '#165DFF', pagePath: '/pages/visitor-apply/index' },
  { key: 'qrcode', title: '门禁码', iconBg: 'rgba(15, 198, 194, 0.1)', iconColor: '#0FC6C2' },
  { key: 'repair', title: '报修', iconBg: 'rgba(247, 186, 30, 0.1)', iconColor: '#F7BA1E', pagePath: '/pages/ticket-submit/index' },
  { key: 'meeting', title: '会议室', iconBg: 'rgba(114, 46, 209, 0.1)', iconColor: '#722ED1', pagePath: '/pages/meeting-book/index' },
  { key: 'desk', title: '工位预订', iconBg: 'rgba(255, 125, 0, 0.1)', iconColor: '#FF7D00', pagePath: '/pages/desk-book/index' },
  { key: 'complaint', title: '投诉建议', iconBg: 'rgba(245, 63, 63, 0.1)', iconColor: '#F53F3F' },
  { key: 'cleaning', title: '保洁服务', iconBg: 'rgba(0, 180, 42, 0.1)', iconColor: '#00B42A' },
  { key: 'more', title: '更多', iconBg: 'rgba(134, 144, 156, 0.1)', iconColor: '#86909C' }
];
