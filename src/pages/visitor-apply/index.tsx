import React, { useState } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import dayjs from 'dayjs';

const reasonOptions = ['商务洽谈', '面试招聘', '项目合作', '参观访问', '技术交流', '其他'];

const VisitorApplyPage: React.FC = () => {
  const router = useRouter();
  const addVisitor = useAppStore((s) => s.addVisitor);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    company: '',
    visitDate: dayjs().format('YYYY-MM-DD'),
    visitTime: '10:00',
    reason: ''
  });

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) {
      Taro.showToast({ title: '请输入访客姓名', icon: 'none' });
      return false;
    }
    if (!/^1[3-9]\d{9}$/.test(form.phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return false;
    }
    if (!form.company.trim()) {
      Taro.showToast({ title: '请输入访客公司', icon: 'none' });
      return false;
    }
    if (!form.reason.trim()) {
      Taro.showToast({ title: '请输入来访事由', icon: 'none' });
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    console.log('[VisitorApply] 提交表单:', form);

    addVisitor({
      name: form.name.trim(),
      phone: form.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      company: form.company.trim(),
      visitTime: `${form.visitDate} ${form.visitTime}`
    });

    Taro.showToast({ title: '申请提交成功', icon: 'success' });

    setTimeout(() => {
      Taro.switchTab({ url: '/pages/access/index' });
    }, 1500);
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  const handleDatePick = async () => {
    try {
      const res = await Taro.showDatePicker?.({
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: dayjs().add(30, 'day').format('YYYY-MM-DD')
      }) as any;
      if (res && res.value) {
        updateForm('visitDate', res.value);
      }
    } catch (e) {
      console.error('[VisitorApply] 日期选择失败:', e);
    }
  };

  const handleTimePick = async () => {
    try {
      const res = await Taro.showTimePicker?.({}) as any;
      if (res && res.value) {
        updateForm('visitTime', res.value);
      }
    } catch (e) {
      console.error('[VisitorApply] 时间选择失败:', e);
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.tipBox}>
        <Text className={styles.tipTitle}>温馨提示</Text>
        <Text className={styles.tipText}>
          访客需携带身份证，在前台通过后进入；申请通过后系统将自动发送访客码短信。
        </Text>
      </View>

      <View className={styles.formCard}>
        <Text className={styles.formTitle}>访客信息</Text>

        <View className={styles.formItem}>
          <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>访客姓名</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入访客姓名"
            placeholderClass="input-placeholder"
            value={form.name}
            onInput={(e) => updateForm('name', e.detail.value)}
            maxlength={20}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>手机号</Text>
          <Input
            className={styles.formInput}
            type="number"
            placeholder="请输入访客手机号"
            placeholderClass="input-placeholder"
            value={form.phone}
            onInput={(e) => updateForm('phone', e.detail.value)}
            maxlength={11}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>所属公司</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入访客所属公司"
            placeholderClass="input-placeholder"
            value={form.company}
            onInput={(e) => updateForm('company', e.detail.value)}
            maxlength={50}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>到访日期</Text>
          <View className={styles.pickerRow} onClick={handleDatePick}>
            <Text className={form.visitDate ? styles.pickerText : classnames(styles.pickerText, styles.pickerPlaceholder)}>
              {form.visitDate || '请选择到访日期'}
            </Text>
            <Text className={styles.pickerArrow}>›</Text>
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>到访时间</Text>
          <View className={styles.pickerRow} onClick={handleTimePick}>
            <Text className={form.visitTime ? styles.pickerText : classnames(styles.pickerText, styles.pickerPlaceholder)}>
              {form.visitTime || '请选择到访时间'}
            </Text>
            <Text className={styles.pickerArrow}>›</Text>
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>来访事由</Text>
          <View className={styles.reasonTags}>
            {reasonOptions.map((item) => (
              <Text
                key={item}
                className={classnames(styles.reasonTag, form.reason === item && styles.reasonTagActive)}
                onClick={() => updateForm('reason', item)}
              >
                {item}
              </Text>
            ))}
          </View>
          <Textarea
            className={styles.formTextarea}
            style={{ marginTop: '16rpx' }}
            placeholder="请详细描述来访事由（可选）"
            placeholderClass="input-placeholder"
            value={reasonOptions.includes(form.reason) ? '' : form.reason}
            onInput={(e) => updateForm('reason', e.detail.value)}
            maxlength={200}
          />
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.btnCancel} onClick={handleCancel}>
          <Text>取消</Text>
        </View>
        <View className={styles.btnSubmit} onClick={handleSubmit}>
          <Text>提交申请</Text>
        </View>
      </View>
    </View>
  );
};

export default VisitorApplyPage;
