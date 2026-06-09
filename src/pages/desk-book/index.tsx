import React, { useState, useMemo } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { desks } from '@/data/resource';
import dayjs from 'dayjs';

type DeskArea = 'all' | 'A' | 'B';

const DeskBookPage: React.FC = () => {
  const router = useRouter();
  const preDate = router.params.date as string | undefined;
  const addBooking = useAppStore((s) => s.addBooking);
  const bookings = useAppStore((s) => s.bookings);
  const isBookingPast = useAppStore((s) => s.isBookingPast);
  const [deskArea, setDeskArea] = useState<DeskArea>('all');

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
    deskId: '',
    deskCode: '',
    applicant: '李明',
    purpose: ''
  });

  // 按区域过滤
  const filteredDesks = useMemo(() => {
    return deskArea === 'all' ? desks : desks.filter((d) => d.area === `${deskArea}区`);
  }, [deskArea]);

  // 按当前选择的日期动态判断占用状态
  const occupiedCodes = useMemo(() => {
    return bookings
      .filter((b) => b.type === 'desk' && b.date === form.date && b.status === 'confirmed')
      .map((b) => b.title.replace('工位 ', ''));
  }, [bookings, form.date]);

  const totalPrice = form.deskCode ? 50 : 0;

  const handleBack = () => Taro.navigateBack();

  const validate = () => {
    if (!form.deskId) {
      Taro.showToast({ title: '请选择工位', icon: 'none' });
      return false;
    }
    if (!form.applicant.trim()) {
      Taro.showToast({ title: '请输入申请人', icon: 'none' });
      return false;
    }
    // 防重复提交
    const exists = bookings.some(
      (b) =>
        b.type === 'desk' &&
        b.title === `工位 ${form.deskCode}` &&
        b.date === form.date &&
        b.status === 'confirmed'
    );
    if (exists) {
      Taro.showToast({ title: '该工位此日期已被预订', icon: 'none' });
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    console.log('[DeskBook] 提交预订:', form);
    addBooking({
      type: 'desk',
      title: `工位 ${form.deskCode}`,
      date: form.date,
      time: '全天',
      applicant: form.applicant,
      location: `${form.deskCode.startsWith('A') ? 'A' : 'B'}区 · A座18F`,
      purpose: form.purpose || undefined
    });
    Taro.showToast({ title: '预订成功', icon: 'success' });
    setTimeout(() => Taro.switchTab({ url: '/pages/resource/index' }), 1500);
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerBack}>
          <View className={styles.backIcon} onClick={handleBack}>‹</View>
          <Text className={styles.headerTitle}>共享工位预订</Text>
        </View>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>位置</Text>
            <Text className={styles.infoValue}>A座18F 开放办公区</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>设施</Text>
            <Text className={styles.infoValue}>显示器 · 人体工学椅 · 电源 · WiFi</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>价格</Text>
            <Text className={styles.infoPrice}>¥50/天</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择日期</Text>
        <Text className={styles.sectionSubtitle}>周末不开放预订（周一至周五可订）</Text>
        <View className={styles.dateRow}>
          {dates.map((d) => (
            <View
              key={d.date}
              className={classnames(
                styles.dateItem,
                form.date === d.date && styles.dateItemActive,
                d.disabled && styles.deskItemOccupied
              )}
              onClick={() => !d.disabled && setForm((f) => ({ ...f, date: d.date, deskId: '', deskCode: '' }))}
            >
              <Text className={styles.dateWeek}>{d.week}</Text>
              <Text className={styles.dateDay}>{d.day}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择工位</Text>
        <Text className={styles.sectionSubtitle}>A座18F开放办公区（灰色为已被预订）</Text>
        <View className={styles.areaFilter}>
          {(['all', 'A', 'B'] as DeskArea[]).map((area) => (
            <Text
              key={area}
              className={classnames(styles.areaChip, deskArea === area && styles.areaChipActive)}
              onClick={() => {
                setDeskArea(area);
                setForm((f) => ({ ...f, deskId: '', deskCode: '' }));
              }}
            >
              {area === 'all' ? '全部' : `${area}区`}
            </Text>
          ))}
        </View>
        <View className={styles.deskGrid}>
          {filteredDesks.map((desk) => {
            const isOccupied = desk.status !== 'available' || occupiedCodes.includes(desk.code);
            const isSelected = form.deskId === desk.id;
            return (
              <View
                key={desk.id}
                className={classnames(
                  styles.deskItem,
                  isSelected && styles.deskItemActive,
                  isOccupied && styles.deskItemOccupied
                )}
                onClick={() => !isOccupied && setForm((f) => ({ ...f, deskId: desk.id, deskCode: desk.code }))}
              >
                <Text className={styles.deskCode}>{desk.code}</Text>
                <Text className={styles.deskStatus}>
                  {isOccupied ? '已订' : desk.area}
                </Text>
              </View>
            );
          })}
        </View>
        <View className={styles.legend}>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ background: '#F2F3F5' }} />
            <Text>可选</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ background: 'rgba(255, 125, 0, 0.2)', border: '2rpx solid #FF7D00' }} />
            <Text>已选</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ background: '#E5E6EB' }} />
            <Text>已订</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>预订信息</Text>
        <View className={styles.formItem}>
          <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>申请人</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入申请人姓名"
            placeholderClass="input-placeholder"
            value={form.applicant}
            onInput={(e) => setForm((f) => ({ ...f, applicant: e.detail.value }))}
            maxlength={20}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>使用目的（可选）</Text>
          <Input
            className={styles.formInput}
            placeholder="如：出差办公、临时加班等"
            placeholderClass="input-placeholder"
            value={form.purpose}
            onInput={(e) => setForm((f) => ({ ...f, purpose: e.detail.value }))}
            maxlength={50}
          />
        </View>
      </View>

      {form.deskCode && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>预订摘要</Text>
          <View className={styles.summary}>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>工位</Text>
              <Text className={styles.summaryValue}>{form.deskCode} · A座18F</Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>日期</Text>
              <Text className={styles.summaryValue}>{form.date}</Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>申请人</Text>
              <Text className={styles.summaryValue}>{form.applicant}</Text>
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

export default DeskBookPage;
