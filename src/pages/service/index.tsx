import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { ticketList } from '@/data/service';
import type { ServiceTicket } from '@/types';

type TabType = 'all' | 'pending' | 'processing' | 'completed';

const ServicePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [filteredTickets, setFilteredTickets] = useState<ServiceTicket[]>(ticketList);

  useEffect(() => {
    console.log('[ServicePage] 页面加载');
  }, []);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredTickets(ticketList);
    } else {
      setFilteredTickets(ticketList.filter(t => t.status === activeTab));
    }
  }, [activeTab]);

  const typeConfig = {
    repair: { label: '报修', icon: '修', bg: 'rgba(247, 186, 30, 0.15', color: '#F7BA1E' },
    complaint: { label: '投诉', icon: '诉', bg: 'rgba(245, 63, 63, 0.15', color: '#F53F3F' },
    cleaning: { label: '保洁', icon: '洁', bg: 'rgba(0, 180, 42, 0.15', color: '#00B42A' }
  };

  const statusProgressColor = (status: ServiceTicket['status']) => {
    switch (status) {
      case 'pending':
        return '#FF7D00';
      case 'processing':
        return '#165DFF';
      case 'completed':
        return '#00B42A';
      default:
        return '#86909C';
    }
  };

  const handleSubmit = (type: 'repair' | 'complaint' | 'cleaning') => {
    console.log('[ServicePage] 提交工单类型:', type);
    Taro.navigateTo({ url: `/pages/ticket-submit/index?type=${type}` });
  };

  const handleTicketClick = (ticketId: string) => {
    console.log('[ServicePage] 查看工单:', ticketId);
    Taro.navigateTo({ url: `/pages/ticket-detail/index?id=${ticketId}` });
  };

  const pendingCount = ticketList.filter(t => t.status === 'pending' || t.status === 'processing').length;
  const completedCount = ticketList.filter(t => t.status === 'completed').length;

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待处理' },
    { key: 'processing', label: '处理中' },
    { key: 'completed', label: '已完成' }
  ];

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>物业服务</Text>
        <Text className={styles.headerDesc}>快速提交服务需求，实时跟踪处理进度</Text>
        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{ticketList.length}</Text>
            <Text className={styles.statLabel}>全部工单</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{pendingCount}</Text>
            <Text className={styles.statLabel}>处理中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{completedCount}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
        </View>
      </View>

      <View className={styles.container}>
        <View className={styles.serviceEntries}>
          <View className={styles.entryItem} onClick={() => handleSubmit('repair')}>
            <View className={styles.entryIcon} style={{ background: 'rgba(247, 186, 30, 0.15', color: '#F7BA1E' }}>
              <Text>🔧</Text>
            </View>
            <Text className={styles.entryTitle}>报修服务</Text>
            <Text className={styles.entryDesc}>设备设施维修</Text>
          </View>
          <View className={styles.entryItem} onClick={() => handleSubmit('complaint')}>
            <View className={styles.entryIcon} style={{ background: 'rgba(245, 63, 63, 0.15', color: '#F53F3F' }}>
              <Text>💬</Text>
            </View>
            <Text className={styles.entryTitle}>投诉建议</Text>
            <Text className={styles.entryDesc}>意见反馈投诉</Text>
          </View>
          <View className={styles.entryItem} onClick={() => handleSubmit('cleaning')}>
            <View className={styles.entryIcon} style={{ background: 'rgba(0, 180, 42, 0.15', color: '#00B42A' }}>
              <Text>🧹</Text>
            </View>
            <Text className={styles.entryTitle}>保洁服务</Text>
            <Text className={styles.entryDesc}>环境清洁需求</Text>
          </View>
        </View>

        <View className={styles.tabs}>
          {tabs.map(tab => (
            <Text
              key={tab.key}
              className={classnames(styles.tabItem, activeTab === tab.key && styles.tabActive)}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Text>
          ))}
        </View>

        {filteredTickets.map(ticket => {
          const config = typeConfig[ticket.type];
          return (
            <View key={ticket.id} className={styles.ticketCard} onClick={() => handleTicketClick(ticket.id)}>
              <View className={styles.ticketHeader}>
                <View className={styles.ticketType}>
                  <View className={styles.typeIcon} style={{ background: config.bg, color: config.color }}>
                    <Text>{config.icon}</Text>
                  </View>
                  <Text style={{ color: config.color }}>{config.label}</Text>
                </View>
                <StatusTag status={ticket.status} />
              </View>
              <Text className={styles.ticketTitle}>{ticket.title}</Text>
              <Text className={styles.ticketDesc}>{ticket.description}</Text>
              <View className={styles.progressWrap}>
                <View className={styles.progressBar}>
                  <View
                    className={styles.progressFill}
                    style={{
                      width: `${ticket.progress}%`,
                      background: statusProgressColor(ticket.status)
                    }}
                  />
                </View>
                <View className={styles.progressInfo}>
                  <Text>处理进度 {ticket.progress}%</Text>
                  {ticket.handler && <Text>处理人：{ticket.handler}</Text>}
                </View>
              </View>
              <View className={styles.ticketFooter}>
                <Text className={styles.ticketMeta}>{ticket.location} · {ticket.createTime}</Text>
                <View
                  className={styles.ticketAction}
                  style={{
                    background: ticket.status === 'completed'
                      ? 'rgba(0, 180, 42, 0.1)'
                      : 'rgba(22, 93, 255, 0.1)',
                    color: ticket.status === 'completed' ? '#00B42A' : '#165DFF'
                  }}
                >
                  <Text>{ticket.status === 'completed' ? '去评价' : '查看详情'}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default ServicePage;
