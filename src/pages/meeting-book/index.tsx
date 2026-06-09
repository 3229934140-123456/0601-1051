import React, { useState, useMemo } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { meetingRooms } from '@/data/resource';
import dayjs from 'dayjs';

const timeSlots = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '13:00-14:00', '14:00-15:00', '15:00-16:00',
  '16:00-17:00', '17:00-18:00', '18:00-19:00'
];

const MeetingBookPage: React.FC = () => {
  const router = useRouter();
  const roomId = router.params.roomId as string;
  const roomName = decodeURIComponent((router.params.roomName as string) || '会议室');
  const preDate = router.params.date as string | undefined;
  const addBooking = useAppStore((s) => s.addBooking);
  const bookings = useAppStore((s) => s.bookings);
  const isTimeSlotPast = useAppStore((s) => s.isTimeSlotPast);

  const room = useMemo(() => meetingRooms.find((r) => r.id === roomId) || meetingRooms[0], [roomId]);

  const dates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = dayjs().add(i, 'day');
      return {
        date: d.format('YYYY-MM-DD'),
        week: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.day()],
        day: d.format('DD'),
        disabled: d.day() === 0 || d.day() === 6
      };
    });
  }, []);

  const initialDate = useMemo(() => {
    if (preDate) {
      const exists = dates.find((d) => d.date === preDate && !d.disabled);
      if (exists) return preDate;
    }
    return dates[0].date;
  }, [preDate, dates]);

  const [form, setForm] = useState({
    date: initialDate,
    time: '',
    title: '',
    attendees: 4
  });

  const unavailable = useMemo(() => {
    const bookedSet = new Set(
      bookings
        .filter(
          (b) => b.type === 'meeting' && b.title === (room?.name || roomName) && b.date === form.date && b.status === 'confirmed'
        )
        .map((b) => b.time)
    );
    // 已过时时段一并禁用
    return timeSlots.filter((s) => bookedSet.has(s) || isTimeSlotPast(form.date, s, 'meeting'));
  }, [bookings, room, roomName, form.date, isTimeSlotPast]);

  const handleBack = () => Taro.navigateBack();

  const totalPrice = form.time ? 80 : 0;

  const validate = () => {
    if (!form.time) {
      Taro.showToast({ title: '请选择时间段', icon: 'none' });
      return false;
    }
    if (!form.title.trim()) {
      Taro.showToast({ title: '请输入会议主题', icon: 'none' });
      return false;
    }
    if (!form.attendees || form.attendees <= 0) {
      Taro.showToast({ title: '请输入参会人数', icon: 'none' });
      return false;
    }
    if (room && form.attendees > room.capacity) {
      Taro.showToast({ title: `最多容纳${room.capacity}人`, icon: 'none' });
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    // 防重复提交检查
    const exists = bookings.some(
      (b) =>
        b.type === 'meeting' &&
        b.title === (room?.name || roomName) &&
        b.date === form.date &&
        b.time === form.time &&
        b.status === 'confirmed'
    );
    if (exists) {
      Taro.showToast({ title: '该时段已被预订', icon: 'none' });
      return;
    }
    console.log('[MeetingBook] 提交预订:', form);
    addBooking({
      type: 'meeting',
      title: room?.name || roomName,
      date: form.date,
      time: form.time,
      topic: form.title,
      attendees: form.attendees,
      facilities: room?.facilities || []
    });
    Taro.showToast({ title: '预订成功', icon: 'success' });
    setTimeout(() => Taro.switchTab({ url: '/pages/resource/index' }), 1500);
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerBack}>
          <View className={styles.backIcon} onClick={handleBack}>‹</View>
          <Text className={styles.headerTitle}>会议室预订</Text>
        </View>
        <View className={styles.roomCard}>
          <Text className={styles.roomName}>{room?.name || roomName}</Text>
          <Text className={styles.roomMeta}>
            {room?.floor || 'A座18F'} · 容纳{room?.capacity || 8}人 · ¥80/小时
          </Text>
          <View className={styles.roomFacilities}>
            {(room?.facilities || ['投影', '白板', '视频会议']).map((f, idx) => (
              <Text key={idx} className={styles.facilityTag}>{f}</Text>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择日期</Text>
        <View className={styles.dateRow}>
          {dates.map((d) => (
            <View
              key={d.date}
              className={classnames(
                styles.dateItem,
                form.date === d.date && styles.dateItemActive,
                d.disabled && styles.timeSlotDisabled
              )}
              onClick={() => !d.disabled && setForm((f) => ({ ...f, date: d.date, time: '' }))}
            >
              <Text className={styles.dateWeek}>{d.week}</Text>
              <Text className={styles.dateDay}>{d.day}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择时段（¥80/小时）</Text>
        <View className={styles.timeGrid}>
          {timeSlots.map((slot) => {
            const isUnavailable = unavailable.includes(slot);
            return (
              <Text
                key={slot}
                className={classnames(
                  styles.timeSlot,
                  form.time === slot && styles.timeSlotActive,
                  isUnavailable && styles.timeSlotDisabled
                )}
                onClick={() => !isUnavailable && setForm((f) => ({ ...f, time: slot })}
              >
                {isUnavailable ? `${slot}(已约)` : slot}
              </Text>
            );
          })}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>预订信息</Text>
        <View className={styles.formItem}>
          <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>会议主题</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入会议主题"
            placeholderClass="input-placeholder"
            value={form.title}
            onInput={(e) => setForm((f) => ({ ...f, title: e.detail.value })}
            maxlength={30}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>参会人数</Text>
          <Input
            className={styles.formInput}
            type="number"
            placeholder={`最多${room?.capacity || 8}人`}
            placeholderClass="input-placeholder"
            value={String(form.attendees)}
            onInput={(e) => setForm((f) => ({ ...f, attendees: Number(e.detail.value) || 0 }))}
          />
        </View>
      </View>

      {form.time && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>预订摘要</Text>
          <View className={styles.summary}>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>会议室</Text>
              <Text className={styles.summaryValue}>{room?.name || roomName}</Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>日期</Text>
              <Text className={styles.summaryValue}>{form.date}</Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>时段</Text>
              <Text className={styles.summaryValue}>{form.time}</Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>费用</Text>
              <Text className={styles.summaryPrice}>¥{totalPrice}</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.footer}>
        <View className={styles.btnCancel} onClick={handleBack}>
          <Text>取消</Text>
        </View>
        <View className={styles.btnSubmit} onClick={handleSubmit}>
          <Text>确认预订</Text>
        </View>
      </View>
    </View>
  );
};

export default MeetingBookPage;
