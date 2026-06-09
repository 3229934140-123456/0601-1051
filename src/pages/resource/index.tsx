import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store';
import { meetingRooms, desks, elevatorSlots } from '@/data/resource';
import dayjs from 'dayjs';
import type { BookingType, BookingDisplayStatus } from '@/types';

type BookingFilterType = 'all' | 'meeting' | 'desk' | 'elevator';
type BookingFilterDate = 'all' | 'today' | 'week';
type BookingFilterStatus = 'all' | BookingDisplayStatus;
type DeskArea = 'all' | 'A' | 'B';

const ResourcePage: React.FC = () => {
  const [activeResource, setActiveResource] = useState<'meeting' | 'desk' | 'elevator'>('meeting');
  const bookings = useAppStore((s) => s.bookings);
  const addBooking = useAppStore((s) => s.addBooking);
  const getDateResourceSummary = useAppStore((s) => s.getDateResourceSummary);
  const getBookingDisplayStatus = useAppStore((s) => s.getBookingDisplayStatus);
  const isTimeSlotPast = useAppStore((s) => s.isTimeSlotPast);

  // 我的预订筛选
  const [filterType, setFilterType] = useState<BookingFilterType>('all');
  const [filterDate, setFilterDate] = useState<BookingFilterDate>('all');
  const [filterStatus, setFilterStatus] = useState<BookingFilterStatus>('all');
  // 工位区域筛选
  const [deskArea, setDeskArea] = useState<DeskArea>('all');

  // 日历视图
  const [calendarMonth, setCalendarMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

  // 货梯预订底部弹层
  const [showElevatorSheet, setShowElevatorSheet] = useState(false);
  const [elevatorDate, setElevatorDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [elevatorSlot, setElevatorSlot] = useState('');
  // 是否强制绑定为今日（从今日时段卡片点进来）
  const [forceToday, setForceToday] = useState(false);

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

  // 统计某个日期的货梯预订数量
  const getElevatorBooked = (slotId: string, date: string) => {
    const count = bookings.filter(
      (b) => b.type === 'elevator' && b.title.includes(slotId) && b.date === date && b.status === 'confirmed'
    ).length;
    const baseSlot = elevatorSlots.find((s) => s.id === slotId);
    return (baseSlot?.booked || 0) + count;
  };

  const availableRooms = meetingRooms.filter((r) => r.status === 'available').length;

  // 筛选后的预订列表
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (filterType !== 'all' && b.type !== filterType) return false;
      if (filterDate === 'today') {
        if (b.date !== dayjs().format('YYYY-MM-DD')) return false;
      } else if (filterDate === 'week') {
        const today = dayjs();
        const bookingDate = dayjs(b.date);
        if (bookingDate.isBefore(today, 'day') || bookingDate.isAfter(today.add(6, 'day'), 'day')) return false;
      }
      const displayStatus = getBookingDisplayStatus(b);
      if (filterStatus !== 'all' && filterStatus !== displayStatus) return false;
      return true;
    });
  }, [bookings, filterType, filterDate, filterStatus, getBookingDisplayStatus]);

  // 按状态分组
  const groupedBookings = useMemo(() => {
    const groups: Record<BookingDisplayStatus, typeof bookings> = {
      upcoming: [],
      completed: [],
      cancelled: []
    };
    filteredBookings.forEach((b) => {
      const s = getBookingDisplayStatus(b);
      groups[s].push(b);
    });
    return groups;
  }, [filteredBookings, getBookingDisplayStatus]);

  const statusGroupMeta: { key: BookingDisplayStatus; label: string; color: string }[] = [
    { key: 'upcoming', label: '未开始', color: '#00B42A' },
    { key: 'completed', label: '已完成', color: '#86909C' },
    { key: 'cancelled', label: '已取消', color: '#F53F3F' }
  ];

  // 按区域筛选工位
  const filteredDesks = useMemo(() => {
    return deskArea === 'all' ? desks : desks.filter((d) => d.area === `${deskArea}区`);
  }, [deskArea]);

  // 日历渲染
  const calendarCells = useMemo(() => {
    const firstDay = calendarMonth.startOf('month');
    const startWeekday = firstDay.day(); // 0-6
    const daysInMonth = calendarMonth.daysInMonth();
    const cells: { date?: string; day?: number; isToday: boolean; isSelected: boolean; isPast: boolean }[] = [];
    // 空占位
    for (let i = 0; i < startWeekday; i++) cells.push({ isToday: false, isSelected: false, isPast: false });
    // 日期
    const todayStr = dayjs().format('YYYY-MM-DD');
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = calendarMonth.date(d);
      const dateStr = dateObj.format('YYYY-MM-DD');
      cells.push({
        date: dateStr,
        day: d,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        isPast: dateObj.isBefore(dayjs(), 'day')
      });
    }
    return cells;
  }, [calendarMonth, selectedDate]);

  const handlePrevMonth = () => setCalendarMonth(calendarMonth.subtract(1, 'month'));
  const handleNextMonth = () => setCalendarMonth(calendarMonth.add(1, 'month'));

  const handleBookMeeting = (roomId: string, roomName: string, preselectDate?: string) => {
    console.log('[ResourcePage] 预订会议室:', roomId, roomName, preselectDate);
    Taro.navigateTo({
      url: `/pages/meeting-book/index?roomId=${roomId}&roomName=${encodeURIComponent(roomName)}${preselectDate ? `&date=${preselectDate}` : ''}`
    });
  };

  const handleBookDesk = (preselectDate?: string) => {
    console.log('[ResourcePage] 预订工位');
    Taro.navigateTo({ url: `/pages/desk-book/index${preselectDate ? `?date=${preselectDate}` : ''}` });
  };

  // 点击日历某一天 -> 切换 activeResource 并带日期
  const handleCalendarDateClick = (date: string, type: BookingType) => {
    console.log('[ResourcePage] 日历选择日期:', date, type);
    if (type === 'meeting') {
      // 直接到预订页
      const firstAvailable = meetingRooms.find((r) => r.status === 'available');
      if (firstAvailable) handleBookMeeting(firstAvailable.id, firstAvailable.name, date);
    } else if (type === 'desk') {
      handleBookDesk(date);
    } else {
      // 货梯弹层，设置所选日期
      setElevatorDate(date);
      setElevatorSlot('');
      setForceToday(false);
      setShowElevatorSheet(true);
    }
  };

  // 从今日时段卡片点进来：强制今日并带上选中时段
  const handleOpenElevatorSheet = (preSelectedSlotId?: string, forceTodayFlag = false) => {
    const todayStr = dayjs().format('YYYY-MM-DD');
    setElevatorDate(forceTodayFlag ? todayStr : todayStr);
    setElevatorSlot(preSelectedSlotId || '');
    setForceToday(forceTodayFlag);
    setShowElevatorSheet(true);
  };

  const handleBookElevator = () => {
    if (!elevatorSlot) {
      Taro.showToast({ title: '请选择时段', icon: 'none' });
      return;
    }
    const slot = elevatorSlots.find((s) => s.id === elevatorSlot);
    if (!slot) return;
    // 判断过时
    if (isTimeSlotPast(elevatorDate, slot.timeRange, 'elevator')) {
      Taro.showToast({ title: '该时段已过期', icon: 'none' });
      return;
    }
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
    const bookedCount = getElevatorBooked(elevatorSlot, elevatorDate);
    addBooking({
      type: 'elevator',
      title: `货梯 ${elevatorSlot}`,
      date: elevatorDate,
      time: slot.timeRange,
      capacity: slot.capacity,
      capacityLeft: slot.capacity - bookedCount - 1
    });
    Taro.showToast({ title: '预约成功', icon: 'success' });
    setShowElevatorSheet(false);
  };

  // 点预订记录跳转详情
  const handleBookingDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/booking-detail/index?id=${id}` });
  };

  const typeMeta: Record<BookingType, { icon: string; bg: string; color: string; label: string }> = {
    meeting: { icon: '🏢', bg: 'rgba(114, 46, 209, 0.1)', color: '#722ED1', label: '会议室' },
    desk: { icon: '💺', bg: 'rgba(255, 125, 0, 0.1)', color: '#FF7D00', label: '工位' },
    elevator: { icon: '🛗', bg: 'rgba(15, 198, 194, 0.1)', color: '#0FC6C2', label: '货梯' }
  };

  const typeOptions: { key: BookingFilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'meeting', label: '会议室' },
    { key: 'desk', label: '工位' },
    { key: 'elevator', label: '货梯' }
  ];

  const dateOptions: { key: BookingFilterDate; label: string }[] = [
    { key: 'all', label: '全部日期' },
    { key: 'today', label: '今天' },
    { key: 'week', label: '未来一周' }
  ];

  const areaOptions: { key: DeskArea; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'A', label: 'A区' },
    { key: 'B', label: 'B区' }
  ];

  // 选中日期的资源摘要
  const selectedDaySummary = useMemo(() => getDateResourceSummary(selectedDate), [selectedDate, getDateResourceSummary]);

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
            <Text className={styles.statNum}>{bookings.filter((b) => getBookingDisplayStatus(b) === 'upcoming').length}</Text>
            <Text className={styles.statLabel}>未开始</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{elevatorSlots.filter((s) => s.status === 'available').length}</Text>
            <Text className={styles.statLabel}>货梯时段</Text>
          </View>
        </View>
      </View>

      <View className={styles.container}>
        {/* 日历视图 */}
        <View className={styles.calendarSection}>
          <View className={styles.calendarHeader}>
            <Text className={styles.calendarTitle}>
              {calendarMonth.format('YYYY年MM月')}
            </Text>
            <View style={{ display: 'flex', gap: 16 }}>
              <Text className={styles.calendarSwitch} onClick={handlePrevMonth}>‹ 上月</Text>
              <Text className={styles.calendarSwitch} onClick={handleNextMonth}>下月 ›</Text>
            </View>
          </View>
          <View className={styles.calendarWeekdays}>
            {['日', '一', '二', '三', '四', '五', '六'].map((w) => (
              <Text key={w} className={styles.calendarWeekday}>{w}</Text>
            ))}
          </View>
          <View className={styles.calendarGrid}>
            {calendarCells.map((cell, idx) => {
              if (!cell.date) {
                return <View key={`empty-${idx}`} className={classnames(styles.calendarDay, styles.calendarDayEmpty)} />;
              }
              const summary = getDateResourceSummary(cell.date);
              const avail = summary.meeting.available + summary.desk.available + summary.elevator.available;
              return (
                <View
                  key={cell.date}
                  className={classnames(
                    styles.calendarDay,
                    cell.isToday && styles.calendarDayToday,
                    cell.isSelected && styles.calendarDaySelected,
                    cell.isPast && styles.calendarDayEmpty
                  )}
                  onClick={() => !cell.isPast && setSelectedDate(cell.date)}
                >
                  <Text className={styles.calendarDayNum}>{cell.day}</Text>
                  <Text className={styles.calendarDaySub}>
                    {cell.isPast ? '' : avail > 0 ? `剩${Math.min(avail, 99)}` : '满'}
                  </Text>
                </View>
              );
            })}
          </View>
          <View className={styles.calendarLegend}>
            <View className={styles.legendRow}>
              <Text className={styles.legendDot} style={{ background: 'rgba(114, 46, 209, 0.08)', border: '1rpx solid rgba(114, 46, 209, 0.3)' }} />
              <Text>今日</Text>
            </View>
            <View className={styles.legendRow}>
              <Text className={styles.legendDot} style={{ background: '#722ED1' }} />
              <Text>选中</Text>
            </View>
            <View className={styles.legendRow}>
              <Text className={styles.legendDot} style={{ background: '#E5E6EB' }} />
              <Text>已过</Text>
            </View>
          </View>

          {/* 选中日期的资源概览 + 跳转 */}
          <View style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            {(['meeting', 'desk', 'elevator'] as BookingType[]).map((t) => {
              const meta = typeMeta[t];
              const sum = selectedDaySummary[t];
              return (
                <View
                  key={t}
                  style={{
                    flex: 1,
                    padding: 20,
                    background: meta.bg,
                    borderRadius: 12,
                    textAlign: 'center'
                  }}
                  onClick={() => handleCalendarDateClick(selectedDate, t)}
                >
                  <Text style={{ fontSize: 24 }}>{meta.icon}</Text>
                  <Text style={{ fontSize: 24, color: meta.color, display: 'block', marginTop: 4, fontWeight: 600 }}>
                    {meta.label}
                  </Text>
                  <Text style={{ fontSize: 20, color: meta.color, marginTop: 4, display: 'block' }}>
                    {selectedDate === dayjs().format('YYYY-MM-DD') ? '今天' : selectedDate.slice(5)} · 剩{sum.available}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

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
              <Text>{filteredDesks.filter((d) => d.status === 'available').length}个空闲</Text>
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
                    onClick={() => room.status === 'available' && handleBookMeeting(room.id, room.name, selectedDate)}
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
              <View className={styles.sectionMore} onClick={() => handleBookDesk(selectedDate)}>
                <Text>去预订 ›</Text>
              </View>
            </View>
            {/* 区域筛选 */}
            <View className={styles.filterRow}>
              {areaOptions.map((opt) => (
                <Text
                  key={opt.key}
                  className={classnames(styles.filterChip, deskArea === opt.key && styles.filterChipActive)}
                  style={deskArea === opt.key ? { background: 'rgba(255, 125, 0, 0.15)', color: '#FF7D00', borderColor: '#FF7D00' } : undefined}
                  onClick={() => setDeskArea(opt.key)}
                >
                  {opt.label}
                </Text>
              ))}
            </View>
            <Text style={{ fontSize: '24rpx', color: '#86909C', marginBottom: '16rpx', marginTop: 12 }}>
              A座18F · 当前可预订{filteredDesks.filter((d) => d.status === 'available').length}个工位，日租 ¥50/天
            </Text>
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '16rpx' }}>
              {filteredDesks
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
                    <Text style={{ fontSize: 20, color: '#86909C', marginTop: 4 }}>{desk.area}</Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {activeResource === 'elevator' && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>货梯时段（今日）</Text>
              <View className={styles.sectionMore} onClick={() => handleOpenElevatorSheet()}>
                <Text>预约 ›</Text>
              </View>
            </View>
            <View className={styles.elevatorSlotGrid}>
              {elevatorSlots.map((slot) => {
                const todayStr = dayjs().format('YYYY-MM-DD');
                const bookedCount = getElevatorBooked(slot.id, todayStr);
                const isPast = isTimeSlotPast(todayStr, slot.timeRange, 'elevator');
                const isFull = slot.status === 'full' || bookedCount >= slot.capacity;
                const disabled = isPast || isFull;
                return (
                  <View
                    key={slot.id}
                    className={classnames(styles.elevatorSlot, disabled && styles.elevatorSlotFull)}
                    onClick={() => !disabled && handleOpenElevatorSheet(slot.id, true)}
                  >
                    <Text className={styles.elevatorSlotTime}>{slot.timeRange}</Text>
                    <Text className={styles.elevatorSlotInfo}>
                      {isPast ? '已过期' : isFull ? '已满' : `载重${slot.capacity}吨 · 剩${slot.capacity - bookedCount}单`}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* 我的预订 - 带筛选 + 分组 */}
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>我的预订</Text>
            <Text className={styles.sectionMore}>全部 ›</Text>
          </View>

          {/* 状态 Tab */}
          <View className={styles.statusTabs}>
            {[{ key: 'all', label: '全部' }, ...statusGroupMeta].map((tab) => {
              const count = tab.key === 'all'
                ? filteredBookings.length
                : groupedBookings[tab.key as BookingDisplayStatus].length;
              const active = filterStatus === tab.key;
              return (
                <Text
                  key={tab.key}
                  className={classnames(styles.statusTab, active && styles.statusTabActive)}
                  onClick={() => setFilterStatus(tab.key as BookingFilterStatus)}
                >
                  {tab.label} ({count})
                </Text>
              );
            })}
          </View>

          {/* 类型筛选 */}
          <View className={styles.filterRow}>
            {typeOptions.map((opt) => (
              <Text
                key={opt.key}
                className={classnames(styles.filterChip, filterType === opt.key && styles.filterChipActive)}
                onClick={() => setFilterType(opt.key)}
              >
                {opt.label}
              </Text>
            ))}
          </View>
          {/* 日期筛选 */}
          <View className={styles.filterRow} style={{ marginTop: 12, marginBottom: 20 }}>
            {dateOptions.map((opt) => (
              <Text
                key={opt.key}
                className={classnames(styles.filterChip, filterDate === opt.key && styles.filterChipActive)}
                onClick={() => setFilterDate(opt.key)}
              >
                {opt.label}
              </Text>
            ))}
          </View>

          {filterStatus === 'all' ? (
            <>
              {statusGroupMeta.map((group) => {
                const list = groupedBookings[group.key];
                if (list.length === 0) return null;
                return (
                  <View key={group.key}>
                    <View className={styles.groupHeader}>
                      <Text style={{ color: group.color }}>● {group.label}</Text>
                      <Text className={styles.groupCount}>{list.length}条</Text>
                    </View>
                    {list.map((b) => {
                      const meta = typeMeta[b.type];
                      const isCancelled = b.status === 'cancelled';
                      return (
                        <View
                          key={b.id}
                          className={classnames(styles.bookingItem, isCancelled && styles.bookingItemCancelled)}
                          onClick={() => handleBookingDetail(b.id)}
                        >
                          <View className={styles.bookingIcon} style={{ background: meta.bg, color: meta.color, opacity: isCancelled ? 0.5 : 1 }}>
                            <Text>{meta.icon}</Text>
                          </View>
                          <View className={styles.bookingInfo}>
                            <View className={styles.bookingName}>
                              <Text className={styles.bookingTypeBadge} style={{ background: meta.bg, color: meta.color }}>
                                {meta.label}
                              </Text>
                              <Text>{b.title.replace(/货梯\s?e\d/, '货梯时段')}</Text>
                            </View>
                            <Text className={styles.bookingTime}>
                              {b.date} {b.time}
                            </Text>
                          </View>
                          <StatusTag
                            status={isCancelled ? 'rejected' : group.key === 'completed' ? 'completed' : 'approved'}
                            text={isCancelled ? '已取消' : group.key === 'completed' ? '已完成' : '已确认'}
                          />
                        </View>
                      );
                    })}
                  </View>
                );
              })}
              {filteredBookings.length === 0 && <Text className={styles.emptyHint}>暂无预订记录</Text>}
            </>
          ) : (
            <>
              {groupedBookings[filterStatus].length === 0 ? (
                <Text className={styles.emptyHint}>暂无预订记录</Text>
              ) : (
                groupedBookings[filterStatus].map((b) => {
                  const meta = typeMeta[b.type];
                  const isCancelled = b.status === 'cancelled';
                  return (
                    <View
                      key={b.id}
                      className={classnames(styles.bookingItem, isCancelled && styles.bookingItemCancelled)}
                      onClick={() => handleBookingDetail(b.id)}
                    >
                      <View className={styles.bookingIcon} style={{ background: meta.bg, color: meta.color, opacity: isCancelled ? 0.5 : 1 }}>
                        <Text>{meta.icon}</Text>
                      </View>
                      <View className={styles.bookingInfo}>
                        <View className={styles.bookingName}>
                          <Text className={styles.bookingTypeBadge} style={{ background: meta.bg, color: meta.color }}>
                            {meta.label}
                          </Text>
                          <Text>{b.title.replace(/货梯\s?e\d/, '货梯时段')}</Text>
                        </View>
                        <Text className={styles.bookingTime}>
                          {b.date} {b.time}
                        </Text>
                      </View>
                      <StatusTag
                        status={isCancelled ? 'rejected' : filterStatus === 'completed' ? 'completed' : 'approved'}
                        text={isCancelled ? '已取消' : filterStatus === 'completed' ? '已完成' : '已确认'}
                      />
                    </View>
                  );
                })
              )}
            </>
          )}
        </View>
      </View>

      {/* 货梯预订底部弹层 */}
      {showElevatorSheet && (
        <>
          <View className={styles.mask} onClick={() => setShowElevatorSheet(false)} />
          <View className={styles.sheet}>
            <Text className={styles.sheetTitle}>货梯时段预约</Text>

            {/* 日期选择（从今日时段卡片进入时隐藏，强制今日） */}
            {!forceToday && (
              <>
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
              </>
            )}

            {forceToday && (
              <Text style={{ fontSize: 26, color: '#0FC6C2', marginBottom: 16, display: 'block' }}>
                📅 今日 · {dayjs().format('MM月DD日')}（时段已选）
              </Text>
            )}

            <Text className={styles.sheetSubtitle}>选择时段</Text>
            <View className={styles.elevatorSlotGrid}>
              {elevatorSlots.map((slot) => {
                const bookedCount = getElevatorBooked(slot.id, elevatorDate);
                const isPast = isTimeSlotPast(elevatorDate, slot.timeRange, 'elevator');
                const isFull = slot.status === 'full' || bookedCount >= slot.capacity;
                const disabled = isPast || isFull;
                const isActive = elevatorSlot === slot.id;
                return (
                  <View
                    key={slot.id}
                    className={classnames(
                      styles.elevatorSlot,
                      disabled && styles.elevatorSlotFull,
                      isActive && !disabled && styles.elevatorSlotActive
                    )}
                    onClick={() => !disabled && setElevatorSlot(slot.id)}
                  >
                    <Text className={styles.elevatorSlotTime}>{slot.timeRange}</Text>
                    <Text className={styles.elevatorSlotInfo}>
                      {isPast ? '已过期' : isFull ? '已满' : `剩${slot.capacity - bookedCount}单`}
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
