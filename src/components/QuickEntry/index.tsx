import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import type { QuickEntry } from '@/types';

interface QuickEntryProps {
  data: QuickEntry[];
}

const iconMap: Record<string, string> = {
  visitor: '访',
  qrcode: '码',
  repair: '修',
  meeting: '会',
  desk: '位',
  complaint: '诉',
  cleaning: '洁',
  more: '···'
};

const tabBarMap: Record<string, string> = {
  home: '/pages/home/index',
  access: '/pages/access/index',
  service: '/pages/service/index',
  resource: '/pages/resource/index',
  message: '/pages/message/index'
};

const QuickEntryGrid: React.FC<QuickEntryProps> = ({ data }) => {
  const handleClick = (item: QuickEntry) => {
    console.log('[QuickEntry] 点击入口:', item.key, item.pagePath);
    if (item.pagePath) {
      if (item.pagePath.startsWith('tabBar:')) {
        const key = item.pagePath.replace('tabBar:', '');
        const tabPath = tabBarMap[key];
        if (tabPath) {
          Taro.switchTab({ url: tabPath });
          return;
        }
      }
      Taro.navigateTo({ url: item.pagePath });
    } else {
      Taro.showToast({ title: `${item.title}功能开发中`, icon: 'none' });
    }
  };

  return (
    <View className={styles.grid}>
      {data.map((item) => (
        <View key={item.key} className={styles.item} onClick={() => handleClick(item)}>
          <View
            className={styles.iconBox}
            style={{ backgroundColor: item.iconBg }}
          >
            <Text className={styles.iconText} style={{ color: item.iconColor }}>
              {iconMap[item.key] || item.title.charAt(0)}
            </Text>
          </View>
          <Text className={styles.title}>{item.title}</Text>
        </View>
      ))}
    </View>
  );
};

export default QuickEntryGrid;
