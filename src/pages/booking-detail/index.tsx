import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import type { BookingType } from '@/types';
import dayjs from 'dayjs';

const BookingDetailPage: React.FC = () => {
  const router = useRouter();
  const bookingId = router.params.id as string;
  const bookings = useAppStore((s) => s.bookings);
  const cancelBooking = useAppStore((s) => s.cancelBooking);

  const booking = useMemo(() => bookings.find((b) => b.id === bookingId), [bookings, bookingId]);

  const typeMeta: Record<BookingType, { label: string; headerClass: string; icon: string }> = {
    meeting: { label: '会议室', headerClass: styles.headerMeeting, icon: '🏢' },
    desk: { label: '工位', headerClass: styles.headerDesk, icon: '💺' },
    elevator: { label: '货梯时段', headerClass: styles.headerElevator, icon: '🛗' }
  };

  const meta = booking ? typeMeta[booking.type] : typeMeta.meeting;
  const isCancelled = booking?.status === 'cancelled';
  const isPast = booking ? dayjs(booking.date).isBefore(dayjs(), 'day') : false;
  const canCancel = !isCancelled && !isPast;

  const handleBack = () => Taro.navigateBack();

  const handleCancel = () => {
    Taro.showModal({
      title: '确认取消预订',
      content: '取消后资源将被释放，可重新预订',
      confirmColor: '#F53F3F'
    }).then((res) => {
      if (res.confirm && booking) {
        cancelBooking(booking.id);
        Taro.showToast({ title: '已取消', icon: 'success' });
        setTimeout(() => Taro.navigateBack(), 1000);
      }
    });
  };

  if (!booking) {
    return (
      <View className={styles.page}>
        <View className={classnames(styles.header, styles.headerMeeting)}>
          <View className={styles.headerBack}>
            <View className={styles.backIcon} onClick={handleBack}>‹</View>
            <Text className={styles.headerTitle}>预订详情</Text>
          </View>
        </View>
        <View style={{ padding: 80, textAlign: 'center' }}>
          <Text style={{ color: '#86909C', fontSize: 28 }}>预订不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={classnames(styles.header, meta.headerClass)}>
        <View className={styles.headerBack}>
          <View className={styles.backIcon} onClick={handleBack}>‹</View>
          <Text className={styles.headerTitle}>预订详情</Text>
        </View>
        <View>
          <Text style={{ fontSize: 32, color: '#fff', fontWeight: 600 }}>
            {meta.icon} {meta.label}
            {isCancelled && <Text className={styles.cancelledBadge}>已取消</Text>}
          </Text>
          <Text className={styles.headerSubtitle}>
            预订编号：{booking.id.toUpperCase()} · 下单时间 {booking.createTime}
          </Text>
        </View>

        <View className={styles.summaryCard}>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>资源名称</Text>
            <Text className={styles.summaryValue}>
              {booking.title.replace(/货梯\s?e\d/, '货梯时段')}
            </Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>使用日期</Text>
            <Text className={styles.summaryValue}>{booking.date}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>时段</Text>
            <Text className={styles.summaryValue}>{booking.time}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>预订状态</Text>
            <Text
              className={styles.summaryValue}
              style={{ color: isCancelled ? '#F53F3F' : '#00B42A', fontWeight: 600 }}
            >
              {isCancelled ? '已取消' : '已确认'}
            </Text>
          </View>
        </View>
      </View>

      {/* 会议室详情 */}
      {booking.type === 'meeting' && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>会议信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>会议主题</Text>
            <Text className={styles.infoValue}>{booking.topic || '未填写'}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>参会人数</Text>
            <Text className={styles.infoValue}>{booking.attendees || 0} 人</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>房间设施</Text>
            <View className={styles.infoValue}>
              {booking.facilities && booking.facilities.length > 0 ? (
                <View className={styles.facilityTags}>
                  {booking.facilities.map((f, i) => (
                    <Text key={i} className={styles.facilityTag}>
                      {f}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text>—</Text>
              )}
            </View>
          </View>
        </View>
      )}

      {/* 工位详情 */}
      {booking.type === 'desk' && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>工位信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>申请人</Text>
            <Text className={styles.infoValue}>{booking.applicant || '未填写'}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>工位位置</Text>
            <Text className={styles.infoValue}>{booking.location || '未填写'}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>使用目的</Text>
            <Text className={styles.infoValue}>{booking.purpose || '未填写'}</Text>
          </View>
          <Text className={styles.tip}>
            · 全天使用：{booking.date} 09:00-19:00
            {'\n'}· 请妥善保管个人物品，下班前清理桌面
          </Text>
        </View>
      )}

      {/* 货梯详情 */}
      {booking.type === 'elevator' && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>货梯信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>使用日期</Text>
            <Text className={styles.infoValue}>{booking.date}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>时段</Text>
            <Text className={styles.infoValue}>{booking.time}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>载重容量</Text>
            <Text className={styles.infoValue}>{booking.capacity || 20} 吨</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>剩余额度</Text>
            <Text className={styles.infoValue} style={{ color: '#00B42A' }}>
              {booking.capacityLeft ?? 0} 单
            </Text>
          </View>
          <Text className={styles.tip}>
            · 请提前 10 分钟到货梯口等候
            {'\n'}· 单次限重 {booking.capacity || 20} 吨，禁止超重
          </Text>
        </View>
      )}

      <View className={styles.footer}>
        {canCancel ? (
          <>
            <View className={styles.btnBack} onClick={handleBack}>
              <Text>返回</Text>
            </View>
            <View className={styles.btnCancel} onClick={handleCancel}>
              <Text>取消预订</Text>
            </View>
          </>
        ) : (
          <View className={styles.btnBack} onClick={handleBack}>
            <Text>返回</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default BookingDetailPage;
