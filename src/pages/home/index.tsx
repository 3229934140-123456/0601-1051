import React, { useState, useEffect } from 'react';
import { View, Text, Swiper, SwiperItem } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import QuickEntryGrid from '@/components/QuickEntry';
import StatusTag from '@/components/StatusTag';
import {
  announcementList,
  weatherInfo,
  todayVisitors,
  todoList,
  quickEntries
} from '@/data/home';
import type { TodoItem } from '@/types';

const HomePage: React.FC = () => {
  const [currentNotice, setCurrentNotice] = useState(0);

  useEffect(() => {
    console.log('[HomePage] 页面加载');
  }, []);

  const handlePullDownRefresh = () => {
    console.log('[HomePage] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  };

  useEffect(() => {
    Taro.eventCenter.on('onPullDownRefresh', handlePullDownRefresh);
    return () => {
      Taro.eventCenter.off('onPullDownRefresh', handlePullDownRefresh);
    };
  }, []);

  const getPriorityClass = (priority: TodoItem['priority']) => {
    switch (priority) {
      case 'high':
        return styles.todoDotHigh;
      case 'medium':
        return styles.todoDotMedium;
      default:
        return styles.todoDotLow;
    }
  };

  const handleVisitorClick = (visitorId: string) => {
    console.log('[HomePage] 点击访客:', visitorId);
    Taro.navigateTo({ url: '/pages/access/index' });
  };

  const handleTodoClick = (todoId: string) => {
    console.log('[HomePage] 点击待办:', todoId);
    Taro.switchTab({ url: '/pages/message/index' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userRow}>
          <View className={styles.avatar}>
            <Text className={styles.avatarText}>李</Text>
          </View>
          <View className={styles.userInfo}>
            <Text className={styles.userName}>李明，您好</Text>
            <Text className={styles.userCompany}>星辰科技有限公司</Text>
          </View>
          <View className={styles.floorBadge}>
            <Text>A座 18F</Text>
          </View>
        </View>

        <View className={styles.noticeSwiper}>
          <Text className={styles.noticeTag}>公告</Text>
          <Swiper
            className={styles.noticeItem}
            vertical
            autoplay
            interval={3000}
            circular
            onChange={(e) => setCurrentNotice(e.detail.current)}
          >
            {announcementList.map((item) => (
              <SwiperItem key={item.id}>
                <View style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                  <Text className={styles.noticeText}>{item.title}</Text>
                </View>
              </SwiperItem>
            ))}
          </Swiper>
        </View>
      </View>

      <View className={styles.container}>
        <View className={styles.weatherCard}>
          <View className={styles.weatherLeft}>
            <Text className={styles.weatherIcon}>⛅</Text>
            <View>
              <Text className={styles.weatherTemp}>{weatherInfo.temperature}°</Text>
              <Text className={styles.weatherDesc}>{weatherInfo.weather}</Text>
            </View>
          </View>
          <View className={styles.weatherRight}>
            <Text className={styles.weatherCity}>{weatherInfo.city}</Text>
            <Text className={styles.weatherExtra}>{weatherInfo.wind} · 湿度{weatherInfo.humidity}%</Text>
            <Text className={styles.airQuality}>空气{weatherInfo.airQualityLevel} {weatherInfo.airQuality}</Text>
          </View>
        </View>

        <View className={styles.quickCard}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>快捷服务</Text>
          </View>
          <QuickEntryGrid data={quickEntries} />
        </View>

        <View className={styles.visitorCard}>
          <View className={styles.sectionHeader} style={{ padding: 0, marginBottom: 0 }}>
            <Text className={styles.sectionTitle}>今日访客</Text>
            <Text className={styles.sectionMore}>查看全部 ›</Text>
          </View>
          <View style={{ marginTop: '$spacing-md' }}>
            {todayVisitors.map((visitor) => (
              <View
                key={visitor.id}
                className={styles.visitorItem}
                onClick={() => handleVisitorClick(visitor.id)}
              >
                <View className={styles.visitorAvatar}>
                  <Text className={styles.visitorAvatarText}>{visitor.name.charAt(0)}</Text>
                </View>
                <View className={styles.visitorInfo}>
                  <Text className={styles.visitorName}>{visitor.name}</Text>
                  <Text className={styles.visitorMeta}>
                    {visitor.company} · {visitor.visitTime}
                  </Text>
                </View>
                <StatusTag status={visitor.status} />
              </View>
            ))}
          </View>
        </View>

        <View className={styles.todoCard}>
          <View className={styles.sectionHeader} style={{ padding: 0, marginBottom: 0 }}>
            <Text className={styles.sectionTitle}>待办事项</Text>
            <Text className={styles.sectionMore}>全部 ›</Text>
          </View>
          <View style={{ marginTop: '$spacing-md' }}>
            {todoList.filter(t => t.status !== 'done').slice(0, 3).map((todo) => (
              <View
                key={todo.id}
                className={styles.todoItem}
                onClick={() => handleTodoClick(todo.id)}
              >
                <View className={`${styles.todoDot} ${getPriorityClass(todo.priority)}`} />
                <View className={styles.todoInfo}>
                  <Text className={styles.todoTitle}>{todo.title}</Text>
                  <Text className={styles.todoDesc}>{todo.description}</Text>
                  <Text className={styles.todoTime}>{todo.createTime}</Text>
                </View>
                <StatusTag status={todo.status} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomePage;
