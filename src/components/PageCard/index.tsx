import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface PageCardProps {
  title?: string;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const PageCard: React.FC<PageCardProps> = ({ title, extra, children, className }) => {
  return (
    <View className={`${styles.card} ${className || ''}`}>
      {(title || extra) && (
        <View className={styles.cardHeader}>
          {title && <Text className={styles.cardTitle}>{title}</Text>}
          {extra && <View className={styles.cardExtra}>{extra}</View>}
        </View>
      )}
      <View className={styles.cardContent}>{children}</View>
    </View>
  );
};

export default PageCard;
