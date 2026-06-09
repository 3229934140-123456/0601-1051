import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import { useAppStore } from '@/store';
import dayjs from 'dayjs';
import classnames from 'classnames';
import { accessRecords } from '@/data/access';

const expireOptions = [
  { label: '1天', days: 1 },
  { label: '3天', days: 3 },
  { label: '7天', days: 7 },
  { label: '30天', days: 30 }
];

const AccessPage: React.FC = () => {
  const visitors = useAppStore((s) => s.visitors);
  const tempPlates = useAppStore((s) => s.tempPlates);
  const addTempPlate = useAppStore((s) => s.addTempPlate);

  const [qrCountdown, setQrCountdown] = useState(60);
  const [showPlateSheet, setShowPlateSheet] = useState(false);
  const [plateForm, setPlateForm] = useState({ plate: '', days: 1 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('[AccessPage] 页面加载，访客数:', visitors.length, '车牌数:', tempPlates.length);
    startCountdown();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setQrCountdown(60);
    timerRef.current = setInterval(() => {
      setQrCountdown((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);
  };

  const handleQrRefresh = () => {
    console.log('[AccessPage] 刷新门禁码');
    Taro.showToast({ title: '二维码已刷新', icon: 'success' });
    startCountdown();
  };

  const handleVisitorApply = () => {
    console.log('[AccessPage] 访客申请');
    Taro.navigateTo({ url: '/pages/visitor-apply/index' });
  };

  const handlePlateRegister = () => {
    console.log('[AccessPage] 车牌登记');
    setPlateForm({ plate: '', days: 1 });
    setShowPlateSheet(true);
  };

  const handleAccessRecord = () => {
    console.log('[AccessPage] 通行记录');
    Taro.showModal({
      title: '通行记录',
      content: `本月共 ${accessRecords.length} 条通行记录\n最近：${accessRecords[0]?.location} - ${accessRecords[0]?.time}`,
      showCancel: false
    });
  };

  const validatePlate = (plate: string) => {
    const plateRegex = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5,6}$/;
    return plateRegex.test(plate.toUpperCase());
  };

  const handlePlateSubmit = () => {
    const plate = plateForm.plate.trim().toUpperCase();
    if (!plate) {
      Taro.showToast({ title: '请输入车牌号', icon: 'none' });
      return;
    }
    if (!validatePlate(plate)) {
      Taro.showToast({ title: '请输入正确的车牌号', icon: 'none' });
      return;
    }
    const expireTime = dayjs().add(plateForm.days, 'day').format('YYYY-MM-DD');
    console.log('[AccessPage] 提交车牌登记:', { plate, expireTime });
    addTempPlate({ plate, expireTime });
    Taro.showToast({ title: '登记成功', icon: 'success' });
    setShowPlateSheet(false);
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>门禁通行</Text>

        <View className={styles.qrCard} onClick={handleQrRefresh}>
          <Text className={styles.qrTitle}>员工门禁二维码（点击刷新）</Text>
          <View className={styles.qrBox}>
            <View className={`${styles.qrCorner} ${styles.tl}`} />
            <View className={`${styles.qrCorner} ${styles.tr}`} />
            <View className={`${styles.qrCorner} ${styles.bl}`} />
            <View className={`${styles.qrCorner} ${styles.br}`} />
            <Text className={styles.qrCode}>▦</Text>
          </View>
          <Text className={styles.qrName}>李明</Text>
          <Text className={styles.qrEmpNo}>员工编号：EMP2024001 · A座18F</Text>
          <View className={styles.qrRefresh}>
            <Text>🔄 {qrCountdown}s后刷新</Text>
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
            <Text className={styles.sectionMore} onClick={handleVisitorApply}>+ 新增</Text>
          </View>
          {visitors.length === 0 ? (
            <Text className={styles.emptyHint}>暂无访客，点击右上角添加</Text>
          ) : (
            visitors.slice(0, 5).map((visitor) => (
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
            ))
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>临时车牌</Text>
            <Text className={styles.sectionMore} onClick={handlePlateRegister}>+ 新增登记</Text>
          </View>
          {tempPlates.length === 0 ? (
            <Text className={styles.emptyHint}>暂无车牌，点击右上角登记</Text>
          ) : (
            tempPlates.map((plate) => (
              <View key={plate.id} className={styles.plateItem}>
                <View className={styles.plateIcon} style={{
                  opacity: plate.status === 'expired' ? 0.5 : 1
                }}>
                  <Text className={styles.plateIconText}>沪</Text>
                </View>
                <View className={styles.plateInfo}>
                  <Text className={styles.plateNo} style={{
                    color: plate.status === 'expired' ? '#C9CDD4' : undefined,
                    textDecoration: plate.status === 'expired' ? 'line-through' : undefined
                  }}>
                    {plate.plate}
                  </Text>
                  <Text className={styles.plateExpire}>
                    有效期至：{plate.expireTime}
                  </Text>
                </View>
                <StatusTag
                  status={plate.status}
                  text={plate.status === 'active' ? '生效中' : '已过期'}
                />
              </View>
            ))
          )}
        </View>
      </View>

      {showPlateSheet && (
        <View className={styles.mask} onClick={() => setShowPlateSheet(false)}>
          <View className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <View className={styles.sheetHeader}>
              <Text className={styles.sheetTitle}>新增临时车牌</Text>
              <Text className={styles.sheetClose} onClick={() => setShowPlateSheet(false)}>×</Text>
            </View>

            <View className={styles.sheetItem}>
              <Text className={classnames(styles.sheetLabel, styles.sheetLabelRequired)}>车牌号</Text>
              <Input
                className={styles.sheetInput}
                placeholder="请输入车牌号，如沪A12345"
                placeholderClass="input-placeholder"
                value={plateForm.plate}
                onInput={(e) => setPlateForm((p) => ({ ...p, plate: e.detail.value }))}
                maxlength={8}
              />
            </View>

            <View className={styles.sheetItem}>
              <Text className={classnames(styles.sheetLabel, styles.sheetLabelRequired)}>有效期</Text>
              <View className={styles.sheetRow}>
                {expireOptions.map((opt) => (
                  <Text
                    key={opt.days}
                    className={classnames(styles.sheetTag, plateForm.days === opt.days && styles.sheetTagActive)}
                    onClick={() => setPlateForm((p) => ({ ...p, days: opt.days }))}
                  >
                    {opt.label}
                  </Text>
                ))}
              </View>
              <Text className={styles.sheetLabel} style={{ fontSize: '22rpx', marginTop: '8rpx', color: '#86909C' }}>
                到期时间：{dayjs().add(plateForm.days, 'day').format('YYYY年MM月DD日')}
              </Text>
            </View>

            <View className={styles.sheetBtn} onClick={handlePlateSubmit}>
              <Text>确认登记</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default AccessPage;
