import type { Visitor, AccessRecord } from '@/types';

export const myVisitors: Visitor[] = [
  {
    id: 'v1',
    name: '张晓明',
    phone: '138****5678',
    company: '上海科技有限公司',
    visitTime: '2026-06-10 10:30',
    status: 'visited',
    visitorCode: 'V20260610001',
    hostName: '李明',
    hostFloor: '18F'
  },
  {
    id: 'v2',
    name: '王芳',
    phone: '139****1234',
    company: '华信咨询集团',
    visitTime: '2026-06-10 14:00',
    status: 'approved',
    visitorCode: 'V20260610002',
    hostName: '李明',
    hostFloor: '18F'
  },
  {
    id: 'v3',
    name: '赵强',
    phone: '137****9876',
    company: '卓越设计工作室',
    visitTime: '2026-06-10 15:30',
    status: 'pending',
    hostName: '李明',
    hostFloor: '18F'
  },
  {
    id: 'v4',
    name: '刘洋',
    phone: '136****4321',
    company: '创意文化传媒',
    visitTime: '2026-06-09 09:00',
    status: 'expired',
    visitorCode: 'V20260609001',
    hostName: '李明',
    hostFloor: '18F'
  }
];

export const accessRecords: AccessRecord[] = [
  { id: 'r1', type: 'employee', name: '本人', time: '2026-06-10 08:55', gate: 'A座1楼大厅闸机', status: 'success' },
  { id: 'r2', type: 'visitor', name: '张晓明', time: '2026-06-10 10:32', gate: 'A座1楼访客通道', status: 'success' },
  { id: 'r3', type: 'vehicle', name: '沪A·88888', time: '2026-06-10 08:50', gate: '地下车库B2入口', status: 'success' },
  { id: 'r4', type: 'employee', name: '本人', time: '2026-06-09 18:30', gate: 'A座1楼大厅闸机', status: 'success' },
  { id: 'r5', type: 'employee', name: '本人', time: '2026-06-09 09:05', gate: 'A座1楼大厅闸机', status: 'success' }
];

export const tempPlates = [
  { id: 'p1', plate: '沪A·88888', expireTime: '2026-06-12 23:59', status: 'active' },
  { id: 'p2', plate: '沪B·66666', expireTime: '2026-06-10 23:59', status: 'active' },
  { id: 'p3', plate: '沪C·12345', expireTime: '2026-06-08 23:59', status: 'expired' }
];
