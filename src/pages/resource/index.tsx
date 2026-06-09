import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store';
import { meetingRooms, desks, elevatorSlots } from '@/data/resource';
import dayjs from 'dayjs';
import type { BookingType } from '@/types';

const ResourcePage: React.FC = () => {
  const [activeResource, setActiveResource] = useState<'meeting' | 'desk' | 'elevator'>('meeting');
  const bookings = useAppStore((s) => s.bookings);
  const addBooking = useAppStore((s) => s.addBooking);

  // 货梯预订底部弹层
  const [showElevatorSheet, setShowElevatorSheet] = useState(false);
  const [elevatorDate, setElevatorDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [elevatorSlot, setElevatorSlot] = useState('');

  const elevatorDates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = dayjs().add(i, 'day');
      return {
        date: d.format('YYYY-MM-DD'),
        week: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.day()],
        day: d.format('DD')
      };
    });
  }, []);

  // 统计某个日期的货梯预订数量（模拟 booked 字段）
  const getElevatorBooked = (slotId: string, date: string) => {
    const count = bookings.filter(
      (b) => b.type === 'elevator' && b.title.includes(slotId) && b.date === date
    ).length;
    const baseSlot = elevatorSlots.find((s) => s.id === slotId);
    return (baseSlot?.booked || 0) + count;
  };

  const availableRooms = meetingRooms.filter((r) => r.status === 'available').length;

  const handleBookMeeting = (roomId: string, roomName: string) => {
    console.log('[ResourcePage] 预订会议室:', roomId, roomName);
    Taro.navigateTo({
      url: `/pages/meeting-book/index?roomId=${roomId}&roomName=${encodeURIComponent(roomName)}`
    });
  };

  const handleBookDesk = () => {
    console.log('[ResourcePage] 预订工位');
    Taro.navigateTo({ url: '/pages/desk-book/index' });
  };

  const handleOpenElevatorSheet = () => {
    setElevatorSlot('');
    setShowElevatorSheet(true);
  };

  const handleBookElevator = () => {
    if (!elevatorSlot) {
      Taro.showToast({ title: '请选择时段', icon: 'none' });
      return;
    }
    const slot = elevatorSlots.find((s) => s.id === elevatorSlot);
    if (!slot) return;
    // 防重复
    const exists = bookings.some(
      (b) =>
        b.type === 'elevator' &&
        b.title.includes(elevatorSlot) &&
        b.date === elevatorDate &&
        b.status === 'confirmed'
    );
    if (exists) {
      Taro.showToast({ title: '您已预约该时段', icon: 'none' });
      return;
    }
    addBooking({
      type: 'elevator',
      title: `货梯 ${slot.id}`,
      date: elevatorDate,
      time: slot.timeRange
    });
    Taro.showToast({ title: '预约成功', icon: 'success' });
    setShowElevatorSheet(false);
  };

  const typeMeta: Record<BookingType, { icon: string; bg: string; color: string; label: string }> = {
    meeting: { icon: '🏢', bg: 'rgba(114, 46, 209, 0.1)', color: '#722ED1', label: '会议室' },
    desk: { icon: '💺', bg: 'rgba(255, 125, 0, 0.1)', color: '#FF7D00', label: '工位' },
    elevator: { icon: '🛗', bg: 'rgba(15, 198, 194, 0.1)', color: '#0FC6C2', label: '货梯' }
  };

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
            <Text className={styles.statNum}>{bookings.length}</Text>
            <Text className={styles.statLabel}>我的预订</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{elevatorSlots.filter((s) => s.status === 'available').length}</Text>
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
              style={{
                background: activeResource === 'meeting' ? 'rgba(114, 46, 209, 0.15)' : 'transparent',
                color: activeResource === 'meeting' ? '#722ED1' : 'transparent'
              }}
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
              style={{
                background: activeResource === 'desk' ? 'rgba(255, 125, 0, 0.15)' : 'transparent',
                color: activeResource === 'desk' ? '#FF7D00' : 'transparent'
              }}
            >
              <Text>{desks.filter((d) => d.status === 'available').length}个空闲</Text>
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
              style={{
                background: activeResource === 'elevator' ? 'rgba(15, 198, 194, 0.15)' : 'transparent',
                color: activeResource === 'elevator' ? '#0FC6C2' : 'transparent'
              }}
            >
              <Text>5个时段</Text>
            </View>
          </View>
        </View>

        {activeResource === 'meeting' && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>会议室列表</Text>
              <Text className={styles.sectionMore}>全部 ›</Text>
            </View>
            {meetingRooms.slice(0, 4).map((room) => (
              <View key={room.id} className={styles.roomItem}>
                <View className={styles.roomInfo}>
                  <Text className={styles.roomName}>{room.name}</Text>
                  <Text className={styles.roomMeta}>
                    {room.floor} · 容纳{room.capacity}人
                  </Text>
                  <View className={styles.roomFacilities}>
                    {room.facilities.slice(0, 3).map((f, idx) => (
                      <Text key={idx} className={styles.facilityTag}>
                        {f}
                      </Text>
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
                    <Text>
                      {room.status === 'available' ? '立即预订' : room.status === 'maintenance' ? '维护中' : '使用中'}
                    </Text>
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
              A座18F · 今日可预订{desks.filter((d) => d.status === 'available').length}个工位，日租 ¥50/天
            </Text>
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '16rpx' }}>
              {desks
                .filter((d) => d.status === 'available')
                .map((desk) => (
                  <View
                    key={desk.id}
                    style={{
                      width: 'calc(33.33% - 12rpx)',
                      padding: '24rpx 16rpx',
                      background: 'rgba(0, 180, 42, 0.06)',
                      borderRadius: '12rpx',
                      border: '2rpx solid rgba(0, 180, 42, 0.2)',
                      textAlign: 'center'
                    }}
                  >
                    <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#00B42A' }}>{desk.code}</Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {activeResource === 'elevator' && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>货梯时段（今日）</Text>
              <View className={styles.sectionMore} onClick={handleOpenElevatorSheet}>
                <Text>预约 ›</Text>
              </View>
            </View>
            <View className={styles.elevatorSlotGrid}>
              {elevatorSlots.map((slot) => {
                const bookedCount = getElevatorBooked(slot.id, dayjs().format('YYYY-MM-DD'));
                const isFull = slot.status === 'full' || bookedCount >= slot.capacity;
                return (
                  <View
                    key={slot.id}
                    className={classnames(styles.elevatorSlot, isFull && styles.elevatorSlotFull)}
                    onClick={() => !isFull && handleOpenElevatorSheet()}
                  >
                    <Text className={styles.elevatorSlotTime}>{slot.timeRange}</Text>
                    <Text className={styles.elevatorSlotInfo}>
                      {isFull ? '已满' : `载重${slot.capacity}吨 · 剩${slot.capacity - bookedCount}单`}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>我的预订</Text>
            <Text className={styles.sectionMore}>全部 ›</Text>
          </View>
          {bookings.length === 0 ? (
            <Text className={styles.emptyHint}>暂无预订记录</Text>
          ) : (
            bookings.map((b) => {
              const meta = typeMeta[b.type];
              return (
                <View key={b.id} className={styles.bookingItem}>
                  <View className={styles.bookingIcon} style={{ background: meta.bg, color: meta.color }}>
                    <Text>{meta.icon}</Text>
                  </View>
                  <View className={styles.bookingInfo}>
                    <View className={styles.bookingName}>
                      <Text
                        className={styles.bookingTypeBadge}
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {meta.label}
                      </Text>
                      <Text>{b.title.replace(/货梯\s?e\d/, '货梯时段')}</Text>
                    </View>
                    <Text className={styles.bookingTime}>
                      {b.date} {b.time}
                    </Text>
                  </View>
                  <StatusTag status="approved" text={b.status === 'confirmed' ? '已确认' : '已取消'} />
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* 货梯预订底部弹层 */}
      {showElevatorSheet && (
        <>
          <View className={styles.mask} onClick={() => setShowElevatorSheet(false)} />
          <View className={styles.sheet}>
            <Text className={styles.sheetTitle}>货梯时段预约</Text>

            <Text className={styles.sheetSubtitle}>选择日期</Text>
            <View style={{ display: 'flex', gap: 12, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
              {elevatorDates.map((d) => (
                <View
                  key={d.date}
                  style={{
                    flexShrink: 0,
                    padding: '16rpx 24rpx',
                    borderRadius: 12,
                    border: '2rpx solid',
                    borderColor: elevatorDate === d.date ? '#0FC6C2' : '#E5E6EB',
                    background: elevatorDate === d.date ? 'rgba(15, 198, 194, 0.08)' : '#fff',
                    textAlign: 'center',
                    minWidth: 100
                  }}
                  onClick={() => {
                    setElevatorDate(d.date);
                    setElevatorSlot('');
                  }}
                >
                  <Text style={{ fontSize: 20, color: elevatorDate === d.date ? '#0FC6C2' : '#86909C' }}>{d.week}</Text>
                  <Text style={{ display: 'block', fontSize: 28, fontWeight: 600, color: elevatorDate === d.date ? '#0FC6C2' : '#1D2129', marginTop: 4 }}>
                    {d.day}
                  </Text>
                </View>
              ))}
            </View>

            <Text className={styles.sheetSubtitle}>选择时段</Text>
            <View className={styles.elevatorSlotGrid}>
              {elevatorSlots.map((slot) => {
                const bookedCount = getElevatorBooked(slot.id, elevatorDate);
                const isFull = slot.status === 'full' || bookedCount >= slot.capacity;
                const isActive = elevatorSlot === slot.id;
                return (
                  <View
                    key={slot.id}
                    className={classnames(
                      styles.elevatorSlot,
                      isFull && styles.elevatorSlotFull,
                      isActive && !isFull && styles.elevatorSlotActive
                    )}
                    onClick={() => !isFull && setElevatorSlot(slot.id)}
                  >
                    <Text className={styles.elevatorSlotTime}>{slot.timeRange}</Text>
                    <Text className={styles.elevatorSlotInfo}>
                      {isFull ? '已满' : `剩${slot.capacity - bookedCount}单`}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View className={styles.sheetFooter}>
              <View className={styles.btnCancel} onClick={() => setShowElevatorSheet(false)}>
                <Text>取消</Text>
              </View>
              <View className={styles.btnSubmit} onClick={handleBookElevator}>
                <Text>确认预约</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default ResourcePage;
