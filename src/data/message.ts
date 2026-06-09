import type { MessageItem, Contact } from '@/types';

export const messageList: MessageItem[] = [
  {
    id: 'msg1',
    title: '停电检修通知',
    content: '尊敬的租户您好，A座将于6月15日 22:00-次日02:00进行电力设备例行检修，届时电梯、照明将暂停使用，请您提前做好准备。',
    type: 'maintenance',
    status: 'unread',
    createTime: '2026-06-10 09:00'
  },
  {
    id: 'msg2',
    title: '物业费催缴提醒',
    content: '您所在公司2026年第二季度物业费尚未缴纳，金额为 ¥12,580.00，请于6月20日前完成缴纳，逾期将产生滞纳金。',
    type: 'payment',
    status: 'unread',
    createTime: '2026-06-08 10:30'
  },
  {
    id: 'msg3',
    title: '访客申请审核通过',
    content: '您申请的访客【王芳】已审核通过，访客码为 V20260610002，到访时间为 06月10日 14:00，请通知访客携带身份证到访。',
    type: 'approval',
    status: 'read',
    createTime: '2026-06-10 10:15'
  },
  {
    id: 'msg4',
    title: '报修工单已完成',
    content: '您提交的报修工单【茶水间地面有积水】已处理完成，请对本次服务进行评价。',
    type: 'system',
    status: 'read',
    createTime: '2026-06-08 15:00',
    needRating: true,
    relatedId: 's2'
  },
  {
    id: 'msg5',
    title: '会议室预订确认',
    content: '您预订的【星河会议室】已确认，时间为 2026-06-12 14:00-16:00，请准时使用。',
    type: 'approval',
    status: 'read',
    createTime: '2026-06-10 08:00'
  },
  {
    id: 'msg6',
    title: '空调温度调整通知',
    content: '根据近期天气变化，楼宇中央空调温度已统一调整为24度，如有特殊需求请联系物业前台。',
    type: 'system',
    status: 'read',
    createTime: '2026-06-07 14:00'
  }
];

export const contacts: Contact[] = [
  { id: 'c1', name: '物业前台', role: '客服', department: '物业服务中心', phone: '021-8888-8888' },
  { id: 'c2', name: '张经理', role: '物业经理', department: '物业服务中心', phone: '138****8888' },
  { id: 'c3', name: '王工程师', role: '维修工程师', department: '工程运维部', phone: '139****6666' },
  { id: 'c4', name: '李安保', role: '安保队长', department: '安全保卫部', phone: '137****9999' },
  { id: 'c5', name: '保洁张阿姨', role: '保洁主管', department: '环境管理部', phone: '136****7777' },
  { id: 'c6', name: '行政小王', role: '行政专员', department: '租户公司-行政部', phone: '135****5555' }
];
