import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store';
import { meetingRooms, desks, elevatorSlots } from '@/data/resource';

const ResourcePage: React.FC = () => {
  const [activeResource, setActiveResource] = useState<'meeting' | 'desk' | 'elevator'>('meeting');
  const bookedMeetings = useAppStore((s) => s.bookedMeetings);
  const bookedDesks = useAppStore((s) => s.bookedDesks);
  const addBookedMeeting = useAppStore((s) => s.addBookedMeeting);
  const addBookedDesk = useAppStore((s) => s.addBookedDesk);

  useEffect(() => {
    console.log('[ResourcePage] 页面加载');
  }, []);

  const handleBookMeeting = (roomId: string, roomName: string) => {
    console.log('[ResourcePage] 预订会议室:', roomId, roomName);
    Taro.navigateTo({ url: `/pages/meeting-book/index?roomId=${roomId}&roomName=${encodeURIComponent(roomName)}` });
  };

  const handleBookDesk = () => {
    console.log('[ResourcePage] 预订工位');
    Taro.navigateTo({ url: '/pages/desk-book/index' });
  };

  const handleBookElevator = () => {
    console.log('[ResourcePage] 预订货梯');
    Taro.showToast({ title: '货梯预订功能开发中', icon: 'none' });
  };

  const availableRooms = meetingRooms.filter(r => r.status === 'available').length;
  const totalBookings = bookedMeetings.length + bookedDesks.length;

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>资源预订</Text>
        <Text className={styles.headerDesc}>预订会议室、工位、货梯等共享资源</Text>
        <View className={styles.bookingStats}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{availableRooms}</Text>
            <Text className={styles.statLabel}>可用会议室</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{totalBookings}</Text>
            <Text className={styles.statLabel}>我的预订</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{elevatorSlots.filter(s => s.status === 'available').length}</Text>
            <Text className={styles.statLabel}>货梯时段</Text>
          </View>
        </View>
      </View>

      <View className={styles.container}>
        <View className={styles.resourceTypes}>
          <View className={styles.typeCard} onClick={() => setActiveResource('meeting')}>
            <View className={styles.typeIcon} style={{ background: 'rgba(114, 46, 209, 0.12)', color: '#722ED1' }}>
              <Text>🏢</Text>
            </View>
            <Text className={styles.typeTitle}>会议室</Text>
            <Text className={styles.typeDesc}>多种规格选择</Text>
            <View
              className={styles.typeCount}
              style={{ background: activeResource === 'meeting' ? 'rgba(114, 46, 209, 0.15)' : 'transparent', color: activeResource === 'meeting' ? '#722ED1' : 'transparent' }}
            >
              <Text>{availableRooms}间可用</Text>
            </View>
          </View>
          <View className={styles.typeCard} onClick={() => setActiveResource('desk')}>
            <View className={styles.typeIcon} style={{ background: 'rgba(255, 125, 0, 0.12)', color: '#FF7D00' }}>
              <Text>💺</Text>
            </View>
            <Text className={styles.typeTitle}>共享工位</Text>
            <Text className={styles.typeDesc}>灵活日租预订</Text>
            <View
              className={styles.typeCount}
              style={{ background: activeResource === 'desk' ? 'rgba(255, 125, 0, 0.15)' : 'transparent', color: activeResource === 'desk' ? '#FF7D00' : 'transparent' }}
            >
              <Text>6个空闲</Text>
            </View>
          </View>
          <View className={styles.typeCard} onClick={() => setActiveResource('elevator')}>
            <View className={styles.typeIcon} style={{ background: 'rgba(15, 198, 194, 0.12)', color: '#0FC6C2' }}>
              <Text>🛗</Text>
            </View>
            <Text className={styles.typeTitle}>货梯时段</Text>
            <Text className={styles.typeDesc}>货运电梯预约</Text>
            <View
              className={styles.typeCount}
              style={{ background: activeResource === 'elevator' ? 'rgba(15, 198, 194, 0.15)' : 'transparent', color: activeResource === 'elevator' ? '#0FC6C2' : 'transparent' }}
            >
              <Text>4个时段</Text>
            </View>
          </View>
        </View>

        {activeResource === 'meeting' && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>会议室列表</Text>
              <Text className={styles.sectionMore}>全部 ›</Text>
            </View>
            {meetingRooms.slice(0, 4).map(room => (
              <View key={room.id} className={styles.roomItem}>
                <View className={styles.roomInfo}>
                  <Text className={styles.roomName}>{room.name}</Text>
                  <Text className={styles.roomMeta}>
                    {room.floor} · 容纳{room.capacity}人
                  </Text>
                  <View className={styles.roomFacilities}>
                    {room.facilities.slice(0, 3).map((f, idx) => (
                      <Text key={idx} className={styles.facilityTag}>{f}</Text>
                    ))}
                    {room.facilities.length > 3 && (
                      <Text className={styles.facilityTag}>+{room.facilities.length - 3}</Text>
                    )}
                  </View>
                </View>
                <View className={styles.roomAction}>
                  <StatusTag status={room.status} />
                  <View
                    className={classnames(styles.bookBtn, room.status !== 'available' && styles.bookBtnDisabled)}
                    onClick={() => room.status === 'available' && handleBookMeeting(room.id, room.name)}
                  >
                    <Text>{room.status === 'available' ? '立即预订' : room.status === 'maintenance' ? '维护中' : '使用中'}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeResource === 'desk' && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>共享工位</Text>
              <View className={styles.sectionMore} onClick={handleBookDesk}>
                <Text>去预订 ›</Text>
              </View>
            </View>
            <Text style={{ fontSize: '24rpx', color: '#86909C', marginBottom: '16rpx' }}>
              A座18F · 今日可预订6个工位，日租 ¥50/天
            </Text>
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '16rpx' }}>
              {['A1801', 'A1803', 'A1804', 'B1801', 'B1802'].map(code => (
                <View
                  key={code}
                  style={{
                    width: 'calc(33.33% - 12rpx)',
                    padding: '24rpx 16rpx',
                    background: 'rgba(0, 180, 42, 0.06)',
                    borderRadius: '12rpx',
                    border: '2rpx solid rgba(0, 180, 42, 0.2)',
                    textAlign: 'center'
                  }}
                >
                  <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#00B42A' }}>{code}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeResource === 'elevator' && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>货梯时段（今日）</Text>
              <View className={styles.sectionMore} onClick={handleBookElevator}>
                <Text>预订 ›</Text>
              </View>
            </View>
            {elevatorSlots.map(slot => (
              <View key={slot.id} className={styles.roomItem}>
                <View className={styles.roomInfo}>
                  <Text className={styles.roomName}>{slot.timeRange}</Text>
                  <Text className={styles.roomMeta}>
                    载重 {slot.capacity}吨 · 已预约{slot.booked}单
                  </Text>
                </View>
                <View className={styles.roomAction}>
                  <StatusTag status={slot.status} text={slot.status === 'available' ? '可预约' : '已满'} />
                </View>
              </View>
            ))}
          </View>
        )}

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>我的预订</Text>
            <Text className={styles.sectionMore}>全部 ›</Text>
          </View>
          {bookedMeetings.map(bm => (
            <View key={bm.id} className={styles.bookingItem}>
              <View className={styles.bookingIcon} style={{ background: 'rgba(114, 46, 209, 0.1)', color: '#722ED1' }}>
                <Text>🏢</Text>
              </View>
              <View className={styles.bookingInfo}>
                <Text className={styles.bookingName}>{bm.roomName}</Text>
                <Text className={styles.bookingTime}>{bm.date} {bm.time}</Text>
              </View>
              <StatusTag status="approved" text="已确认" />
            </View>
          ))}
          {bookedDesks.map(bd => (
            <View key={bd.id} className={styles.bookingItem}>
              <View className={styles.bookingIcon} style={{ background: 'rgba(255, 125, 0, 0.1)', color: '#FF7D00' }}>
                <Text>💺</Text>
              </View>
              <View className={styles.bookingInfo}>
                <Text className={styles.bookingName}>工位 {bd.code}</Text>
                <Text className={styles.bookingTime}>{bd.date}</Text>
              </View>
              <StatusTag status="approved" text="已确认" />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default ResourcePage;
