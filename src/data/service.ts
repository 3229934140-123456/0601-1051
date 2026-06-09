import type { ServiceTicket } from '@/types';

export const ticketList: ServiceTicket[] = [
  {
    id: 's1',
    title: '会议室投影仪故障',
    type: 'repair',
    description: '18楼大会议室投影仪无法开机，按下电源键无反应，已尝试重启仍无法使用。',
    status: 'processing',
    createTime: '2026-06-09 16:30',
    updateTime: '2026-06-10 09:00',
    handler: '王工程师',
    progress: 60,
    location: 'A座18F 大会议室',
    contactName: '李明',
    contactPhone: '138****0001'
  },
  {
    id: 's2',
    title: '茶水间地面有积水',
    type: 'cleaning',
    description: '18楼东侧茶水间地面有大量积水，容易滑倒，请尽快安排保洁处理。',
    status: 'completed',
    createTime: '2026-06-08 14:20',
    updateTime: '2026-06-08 15:00',
    handler: '张阿姨',
    progress: 100,
    location: 'A座18F 东茶水间',
    contactName: '李明',
    contactPhone: '138****0001'
  },
  {
    id: 's3',
    title: '空调温度过低无法调节',
    type: 'complaint',
    description: '办公区中央空调温度过低，控制面板显示16度但无法调高，已反馈多次未解决。',
    status: 'pending',
    createTime: '2026-06-10 09:30',
    updateTime: '2026-06-10 09:30',
    progress: 10,
    location: 'A座18F 开放办公区',
    contactName: '李明',
    contactPhone: '138****0001'
  },
  {
    id: 's4',
    title: '办公椅损坏需维修',
    type: 'repair',
    description: '工位A1805的办公椅升降功能损坏，座椅无法固定高度一直下滑。',
    status: 'completed',
    createTime: '2026-06-05 10:00',
    updateTime: '2026-06-06 14:00',
    handler: '李师傅',
    progress: 100,
    location: 'A座18F A1805工位',
    contactName: '李明',
    contactPhone: '138****0001'
  }
];
