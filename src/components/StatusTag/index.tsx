import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatusTagProps {
  status: string;
  text?: string;
}

const statusTextMap: Record<string, string> = {
  success: '成功',
  warning: '警告',
  error: '错误',
  info: '信息',
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  cancelled: '已取消',
  expired: '已过期',
  approved: '已通过',
  rejected: '已拒绝',
  visited: '已到访',
  available: '可使用',
  occupied: '使用中',
  full: '已满',
  maintenance: '维护中',
  reserved: '已预订',
  unread: '未读',
  read: '已读',
  active: '生效中'
};

const StatusTag: React.FC<StatusTagProps> = ({ status, text }) => {
  const displayText = text || statusTextMap[status] || status;
  return (
    <View className={classnames(styles.tag, styles[status] || styles.info)}>
      <Text>{displayText}</Text>
    </View>
  );
};

export default StatusTag;
