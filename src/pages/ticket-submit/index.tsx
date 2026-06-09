import React, { useState } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import type { ServiceTicketType, TicketUrgency } from '@/types';

const typeOptions: { key: ServiceTicketType; name: string; icon: string }[] = [
  { key: 'repair', name: '报修', icon: '🔧' },
  { key: 'complaint', name: '投诉', icon: '💬' },
  { key: 'cleaning', name: '保洁', icon: '🧹' }
];

const urgencyOptions: { key: TicketUrgency; name: string }[] = [
  { key: 'low', name: '普通' },
  { key: 'medium', name: '紧急' },
  { key: 'high', name: '特急' }
];

const defaultLocations = ['A座18F办公区', 'A座18F前台', 'A座18F会议室', '电梯间', '卫生间'];

const TicketSubmitPage: React.FC = () => {
  const router = useRouter();
  const addTicket = useAppStore((s) => s.addTicket);
  const queryType = (router.params.type as ServiceTicketType) || 'repair';

  const [form, setForm] = useState<{
    type: ServiceTicketType;
    location: string;
    description: string;
    contactName: string;
    contactPhone: string;
    urgency: TicketUrgency;
  }>({
    type: queryType,
    location: '',
    description: '',
    contactName: '李明',
    contactPhone: '138****8888',
    urgency: 'medium'
  });

  const updateForm = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (!form.location.trim()) {
      Taro.showToast({ title: '请填写位置信息', icon: 'none' });
      return false;
    }
    if (!form.description.trim()) {
      Taro.showToast({ title: '请填写问题描述', icon: 'none' });
      return false;
    }
    if (!form.contactName.trim()) {
      Taro.showToast({ title: '请填写联系人', icon: 'none' });
      return false;
    }
    if (!/^1[3-9]\d{4,9}$/.test(form.contactPhone.replace(/\*/g, '0')) && !form.contactPhone.includes('*')) {
      Taro.showToast({ title: '请填写正确的联系电话', icon: 'none' });
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    console.log('[TicketSubmit] 提交工单:', form);

    const typeText: Record<ServiceTicketType, string> = {
      repair: '维修报修',
      complaint: '投诉建议',
      cleaning: '保洁服务'
    };

    addTicket({
      type: form.type,
      title: form.description.slice(0, 20) + (form.description.length > 20 ? '...' : ''),
      description: form.description,
      location: form.location,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      urgency: form.urgency,
      typeText: typeText[form.type]
    });

    Taro.showToast({ title: '提交成功', icon: 'success' });
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/service/index' });
    }, 1500);
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  const typeConfig = typeOptions.find((t) => t.key === form.type) || typeOptions[0];

  return (
    <View className={styles.page}>
      <View className={styles.typeCard}>
        <Text className={styles.typeTitle}>选择工单类型</Text>
        <View className={styles.typeRow}>
          {typeOptions.map((opt) => (
            <View
              key={opt.key}
              className={classnames(styles.typeItem, form.type === opt.key && styles.typeItemActive)}
              onClick={() => updateForm('type', opt.key)}
            >
              <Text className={styles.typeIcon}>{opt.icon}</Text>
              <Text className={styles.typeName}>{opt.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.formCard}>
        <Text className={styles.formTitle}>{typeConfig.icon} {typeConfig.name}工单</Text>

        <View className={styles.formItem}>
          <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>问题位置</Text>
          <View className={styles.locationRow}>
            {defaultLocations.map((loc) => (
              <Text
                key={loc}
                className={classnames(styles.locationTag, form.location === loc && styles.locationTagActive)}
                onClick={() => updateForm('location', loc)}
              >
                {loc}
              </Text>
            ))}
          </View>
          <Input
            className={styles.formInput}
            style={{ marginTop: '12rpx' }}
            placeholder="或手动输入具体位置，如A座18F1801室"
            placeholderClass="input-placeholder"
            value={defaultLocations.includes(form.location) ? '' : form.location}
            onInput={(e) => updateForm('location', e.detail.value)}
            maxlength={50}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>问题描述</Text>
          <Textarea
            className={styles.formTextarea}
            placeholder={`请详细描述${typeConfig.name}的具体情况...`}
            placeholderClass="input-placeholder"
            value={form.description}
            onInput={(e) => updateForm('description', e.detail.value)}
            maxlength={500}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>紧急程度</Text>
          <View className={styles.urgencyRow}>
            {urgencyOptions.map((opt) => (
              <Text
                key={opt.key}
                className={classnames(styles.urgencyItem, form.urgency === opt.key && styles.urgencyItemActive)}
                onClick={() => updateForm('urgency', opt.key)}
              >
                {opt.name}
              </Text>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>联系人</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入联系人姓名"
            placeholderClass="input-placeholder"
            value={form.contactName}
            onInput={(e) => updateForm('contactName', e.detail.value)}
            maxlength={20}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>联系电话</Text>
          <Input
            className={styles.formInput}
            type="number"
            placeholder="请输入联系电话"
            placeholderClass="input-placeholder"
            value={form.contactPhone}
            onInput={(e) => updateForm('contactPhone', e.detail.value)}
            maxlength={11}
          />
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.btnCancel} onClick={handleCancel}>
          <Text>取消</Text>
        </View>
        <View className={styles.btnSubmit} onClick={handleSubmit}>
          <Text>提交工单</Text>
        </View>
      </View>
    </View>
  );
};

export default TicketSubmitPage;
