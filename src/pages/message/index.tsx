import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { messageList, contacts } from '@/data/message';
import type { MessageItem } from '@/types';

type MessageType = 'all' | 'maintenance' | 'payment' | 'approval' | 'system';

const MessagePage: React.FC = () => {
  const [activeType, setActiveType] = useState<MessageType>('all');
  const [filteredMessages, setFilteredMessages] = useState<MessageItem[]>(messageList);
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    console.log('[MessagePage] 页面加载');
  }, []);

  useEffect(() => {
    if (activeType === 'all') {
      setFilteredMessages(messageList);
    } else {
      setFilteredMessages(messageList.filter(m => m.type === activeType));
    }
  }, [activeType]);

  const unreadCount = messageList.filter(m => m.status === 'unread').length;

  const typeConfig: Record<string, { label: string; icon: string; bg: string; color: string }> = {
    maintenance: { label: '检修通知', icon: '⚡', bg: 'rgba(255, 125, 0, 0.12)', color: '#FF7D00' },
    payment: { label: '费用催缴', icon: '💰', bg: 'rgba(245, 63, 63, 0.12)', color: '#F53F3F' },
    approval: { label: '审核结果', icon: '✅', bg: 'rgba(22, 93, 255, 0.12)', color: '#165DFF' },
    system: { label: '系统消息', icon: '🔔', bg: 'rgba(134, 144, 156, 0.12)', color: '#86909C' }
  };

  const tabs: { key: MessageType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'maintenance', label: '检修' },
    { key: 'payment', label: '缴费' },
    { key: 'approval', label: '审核' },
    { key: 'system', label: '系统' }
  ];

  const handleMessageClick = (msg: MessageItem) => {
    console.log('[MessagePage] 查看消息:', msg.id);
    Taro.navigateTo({ url: `/pages/message-detail/index?id=${msg.id}` });
  };

  const handleRating = (msgId: string, star: number) => {
    console.log('[MessagePage] 评价消息:', msgId, star);
    setRatings(prev => ({ ...prev, [msgId]: star }));
    Taro.showToast({ title: `感谢您的${star}星评价！`, icon: 'success' });
  };

  const handleCallPhone = (phone: string, name: string) => {
    console.log('[MessagePage] 拨打电话:', phone);
    Taro.showModal({
      title: '拨打电话',
      content: `确定要拨打 ${name} 的电话吗？`,
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '正在呼叫...', icon: 'none' });
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>消息中心</Text>
        <Text className={styles.headerDesc}>及时接收楼宇重要通知</Text>
        <View className={styles.unreadBadge}>
          <Text>您有</Text>
          <Text className={styles.unreadNum}>{unreadCount}</Text>
          <Text>条未读消息</Text>
        </View>
      </View>

      <View className={styles.container}>
        <View className={styles.typeTabs}>
          {tabs.map(tab => (
            <Text
              key={tab.key}
              className={classnames(styles.typeTab, activeType === tab.key && styles.typeTabActive)}
              onClick={() => setActiveType(tab.key)}
            >
              {tab.label}
            </Text>
          ))}
        </View>

        {filteredMessages.map(msg => {
          const config = typeConfig[msg.type];
          return (
            <View key={msg.id} className={styles.messageCard} onClick={() => handleMessageClick(msg)}>
              <View className={styles.messageHeader}>
                <View
                  className={styles.messageIcon}
                  style={{ background: config.bg }}
                >
                  <Text>{config.icon}</Text>
                  {msg.status === 'unread' && <View className={styles.unreadDot} />}
                </View>
                <View className={styles.messageContent}>
                  <View className={styles.messageTitleRow}>
                    <Text className={styles.messageTitle}>{msg.title}</Text>
                    <Text className={styles.messageTime}>{msg.createTime}</Text>
                  </View>
                  <Text className={styles.messagePreview}>{msg.content}</Text>
                </View>
              </View>

              {msg.needRating && (
                <View className={styles.ratingRow} onClick={(e) => e.stopPropagation()}>
                  <Text className={styles.ratingLabel}>服务评价：</Text>
                  <View className={styles.stars}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Text
                        key={star}
                        className={classnames(
                          styles.star,
                          (ratings[msg.id] || 0) >= star && styles.starActive
                        )}
                        onClick={() => handleRating(msg.id, star)}
                      >
                        ★
                      </Text>
                    ))}
                  </View>
                  {ratings[msg.id] ? null : (
                    <View className={styles.rateBtn}>
                      <Text>去评价</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}

        <View className={styles.contactSection}>
          <View className={styles.contactHeader}>
            <Text className={styles.contactTitle}>常用联系人</Text>
            <Text className={styles.contactMore}>查看全部 ›</Text>
          </View>
          {contacts.slice(0, 4).map(contact => (
            <View key={contact.id} className={styles.contactItem}>
              <View className={styles.contactAvatar}>
                <Text className={styles.contactAvatarText}>{contact.name.charAt(0)}</Text>
              </View>
              <View className={styles.contactInfo}>
                <Text className={styles.contactName}>{contact.name}</Text>
                <Text className={styles.contactRole}>
                  {contact.role} · {contact.department}
                </Text>
              </View>
              <View
                className={styles.contactPhone}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCallPhone(contact.phone, contact.name);
                }}
              >
                <Text className={styles.contactPhoneIcon}>📞</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default MessagePage;
