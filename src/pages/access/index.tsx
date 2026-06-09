import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { myVisitors, tempPlates, accessRecords } from '@/data/access';

const AccessPage: React.FC = () => {
  const [qrRefreshTime, setQrRefreshTime] = useState('60s后刷新');

  useEffect(() => {
    console.log('[AccessPage] 页面加载');
  }, []);

  const handleQrRefresh = () => {
    console.log('[AccessPage] 刷新门禁码');
    Taro.showToast({ title: '二维码已刷新', icon: 'success' });
    setQrRefreshTime('60s后刷新');
  };

  const handleVisitorApply = () => {
    console.log('[AccessPage] 访客申请');
    Taro.navigateTo({ url: '/pages/visitor-apply/index' });
  };

  const handlePlateRegister = () => {
    console.log('[AccessPage] 车牌登记');
    Taro.showToast({ title: '车牌登记功能开发中', icon: 'none' });
  };

  const handleAccessRecord = () => {
    console.log('[AccessPage] 通行记录');
    Taro.showToast({ title: `共${accessRecords.length}条通行记录`, icon: 'none' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>门禁通行</Text>

        <View className={styles.qrCard}>
          <Text className={styles.qrTitle}>员工门禁二维码</Text>
          <View className={styles.qrBox}>
            <View className={`${styles.qrCorner} ${styles.tl}`} />
            <View className={`${styles.qrCorner} ${styles.tr}`} />
            <View className={`${styles.qrCorner} ${styles.bl}`} />
            <View className={`${styles.qrCorner} ${styles.br}`} />
            <Text className={styles.qrCode}>▦</Text>
          </View>
          <Text className={styles.qrName}>李明</Text>
          <Text className={styles.qrEmpNo}>员工编号：EMP2024001 · A座18F</Text>
          <View className={styles.qrRefresh} onClick={handleQrRefresh}>
            <Text>🔄 {qrRefreshTime}</Text>
          </View>
        </View>
      </View>

      <View className={styles.container}>
        <View className={styles.actionRow}>
          <View className={styles.actionItem} onClick={handleVisitorApply}>
            <View className={styles.actionIcon} style={{ background: 'rgba(22, 93, 255, 0.1)', color: '#165DFF' }}>
              <Text>访</Text>
            </View>
            <Text className={styles.actionText}>访客申请</Text>
          </View>
          <View className={styles.actionItem} onClick={handlePlateRegister}>
            <View className={styles.actionIcon} style={{ background: 'rgba(114, 46, 209, 0.1)', color: '#722ED1' }}>
              <Text>车</Text>
            </View>
            <Text className={styles.actionText}>车牌登记</Text>
          </View>
          <View className={styles.actionItem} onClick={handleAccessRecord}>
            <View className={styles.actionIcon} style={{ background: 'rgba(255, 125, 0, 0.1)', color: '#FF7D00' }}>
              <Text>记</Text>
            </View>
            <Text className={styles.actionText}>通行记录</Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>我的访客</Text>
            <Text className={styles.sectionMore}>全部 ›</Text>
          </View>
          {myVisitors.slice(0, 3).map((visitor) => (
            <View key={visitor.id} className={styles.visitorItem}>
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

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>临时车牌</Text>
            <Text className={styles.sectionMore}>+ 新增登记</Text>
          </View>
          {tempPlates.map((plate) => (
            <View key={plate.id} className={styles.plateItem}>
              <View className={styles.plateIcon}>
                <Text className={styles.plateIconText}>沪</Text>
              </View>
              <View className={styles.plateInfo}>
                <Text className={styles.plateNo}>{plate.plate}</Text>
                <Text className={styles.plateExpire}>有效期至：{plate.expireTime}</Text>
              </View>
              <StatusTag status={plate.status} text={plate.status === 'active' ? '生效中' : '已过期'} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default AccessPage;
