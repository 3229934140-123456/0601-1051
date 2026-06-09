import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import StatusTag from '@/components/StatusTag';
import dayjs from 'dayjs';

const TicketDetailPage: React.FC = () => {
  const router = useRouter();
  const ticketId = router.params.id;
  const tickets = useAppStore((s) => s.tickets);
  const ratings = useAppStore((s) => s.ratings);
  const setRating = useAppStore((s) => s.setRating);

  const [ratingValue, setRatingValue] = useState(ratings[ticketId as string] || 0);
  const [hoverRating, setHoverRating] = useState(0);

  const ticket = useMemo(() => {
    return tickets.find((t) => t.id === ticketId);
  }, [tickets, ticketId]);

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleCancel = () => {
    Taro.showModal({
      title: '取消工单',
      content: '确定要取消该工单吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已取消工单', icon: 'success' });
          setTimeout(() => Taro.navigateBack(), 1000);
        }
      }
    });
  };

  const handleContact = () => {
    if (ticket?.handler) {
      Taro.makePhoneCall?.({ phoneNumber: '400-000-0000' }).catch(() => {
        Taro.showToast({ title: `联系处理人：${ticket.handler}`, icon: 'none' });
      });
    } else {
      Taro.showToast({ title: '暂无处理人', icon: 'none' });
    }
  };

  const handleRatingSubmit = () => {
    if (ratingValue === 0) {
      Taro.showToast({ title: '请先选择星级', icon: 'none' });
      return;
    }
    setRating(ticketId as string, ratingValue);
    Taro.showToast({ title: `已提交${ratingValue}星评价`, icon: 'success' });
  };

  const buildTimeline = () => {
    if (!ticket) return [];
    const items: { time: string; title: string; desc: string; status: 'done' | 'active' | 'pending' }[] = [
      {
        time: ticket.createTime,
        title: '工单已提交',
        desc: `工单提交成功，等待物业受理`,
        status: 'done'
      }
    ];

    if (ticket.progress >= 30) {
      items.push({
        time: dayjs(ticket.createTime).add(5, 'minute').format('YYYY-MM-DD HH:mm'),
        title: '工单已受理',
        desc: ticket.handler ? `${ticket.handler}已接单，正在前往处理` : '物业客服已接单，正在安排处理',
        status: ticket.progress >= 50 ? 'done' : 'active'
      });
    }

    if (ticket.progress >= 50) {
      items.push({
        time: dayjs(ticket.createTime).add(20, 'minute').format('YYYY-MM-DD HH:mm'),
        title: '处理中',
        desc: '工作人员已到达现场，正在进行处理',
        status: ticket.progress >= 80 ? 'done' : 'active'
      });
    }

    if (ticket.progress >= 80) {
      items.push({
        time: dayjs(ticket.createTime).add(1, 'hour').format('YYYY-MM-DD HH:mm'),
        title: '处理完成',
        desc: '问题已处理完成，请确认处理结果',
        status: ticket.progress >= 100 ? 'done' : 'active'
      });
    }

    if (ticket.progress >= 100) {
      items.push({
        time: ticket.updateTime,
        title: '工单已完成',
        desc: '工单已处理完成，感谢您的配合',
        status: 'done'
      });
    }

    return items;
  };

  if (!ticket) {
    return (
      <View className={styles.page}>
        <View style={{ padding: 100, textAlign: 'center' }}>
          <Text style={{ fontSize: 28, color: '#86909C' }}>工单不存在或已被删除</Text>
        </View>
      </View>
    );
  }

  const timeline = buildTimeline();
  const isCompleted = ticket.status === 'completed' || ticket.progress >= 100;
  const currentRating = ratings[ticketId as string] || ratingValue;

  return (
    <View className={styles.page}>
      <View className={styles.headerCard}>
        <View className={styles.headerTop}>
          <View className={styles.headerBack} onClick={handleBack}>‹</View>
          <Text className={styles.headerTitle}>工单详情</Text>
          <View className={styles.headerPlaceholder} />
        </View>

        <View className={styles.headerInfo}>
          <Text className={styles.headerType}>
            {ticket.typeText || (ticket.type === 'repair' ? '维修报修' : ticket.type === 'complaint' ? '投诉建议' : '保洁服务')}
          </Text>
          <Text className={styles.headerTicketTitle}>{ticket.title}</Text>
          <View className={styles.headerMeta}>
            <StatusTag status={ticket.status} />
            <Text>工单号：{ticket.id.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionTitleIcon}>📊</Text> 处理进度
        </Text>
        <View className={styles.progressBox}>
          <View className={styles.progressBar}>
            <View className={styles.progressFill} style={{ width: `${ticket.progress}%` }} />
          </View>
          <View className={styles.progressInfo}>
            <Text>当前进度：{ticket.progress}%</Text>
            <Text>预计剩余：{Math.max(0, 100 - ticket.progress) <= 0 ? '已完成' : `${Math.ceil((100 - ticket.progress) / 20)}小时`}</Text>
          </View>
        </View>

        <View className={styles.timeline}>
          {timeline.map((item, idx) => (
            <View key={idx} className={styles.timelineItem}>
              <View
                className={classnames(
                  styles.timelineDot,
                  item.status === 'done' && styles.timelineDotDone,
                  item.status === 'active' && styles.timelineDotActive
                )}
              />
              <Text className={styles.timelineTime}>{item.time}</Text>
              <Text className={styles.timelineTitle}>{item.title}</Text>
              <Text className={styles.timelineDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionTitleIcon}>📝</Text> 工单信息
        </Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>问题位置</Text>
          <Text className={styles.infoValue}>{ticket.location}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>问题描述</Text>
          <Text className={styles.infoValue}>{ticket.description}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>紧急程度</Text>
          <Text className={styles.infoValue}>
            {ticket.urgency === 'high' ? '特急' : ticket.urgency === 'medium' ? '紧急' : '普通'}
          </Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>联系人</Text>
          <Text className={styles.infoValue}>{ticket.contactName} · {ticket.contactPhone}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>处理人</Text>
          <Text className={styles.infoValue}>{ticket.handler || '待分配'}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>提交时间</Text>
          <Text className={styles.infoValue}>{ticket.createTime}</Text>
        </View>
      </View>

      {isCompleted && !currentRating && (
        <View className={styles.ratingSection}>
          <Text className={styles.ratingTitle}>请对本次服务进行评价</Text>
          <View className={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text
                key={star}
                className={classnames(
                  styles.ratingStar,
                  (hoverRating || ratingValue) >= star && styles.ratingStarActive
                )}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRatingValue(star)}
              >
                ★
              </Text>
            ))}
          </View>
          <View className={styles.ratingSubmit} onClick={handleRatingSubmit}>
            <Text>提交评价</Text>
          </View>
        </View>
      )}

      {isCompleted && currentRating > 0 && (
        <View className={styles.ratingSection}>
          <Text className={styles.ratingTitle}>您的评价</Text>
          <View className={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text
                key={star}
                className={classnames(styles.ratingStar, currentRating >= star && styles.ratingStarActive)}
              >
                ★
              </Text>
            ))}
          </View>
          <Text style={{ textAlign: 'center', fontSize: 24, color: '#86909C' }}>感谢您的反馈！</Text>
        </View>
      )}

      <View className={styles.footer}>
        {ticket.status === 'pending' && (
          <View className={styles.btnSecondary} onClick={handleCancel}>
            <Text>取消工单</Text>
          </View>
        )}
        <View className={ticket.status === 'pending' ? styles.btnPrimary : styles.btnPrimary} style={{ flex: ticket.status === 'pending' ? 1 : 1 }} onClick={handleContact}>
          <Text>联系{ticket.handler || '客服'}</Text>
        </View>
      </View>
    </View>
  );
};

export default TicketDetailPage;
