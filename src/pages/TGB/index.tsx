// src/pages/StudyTracker.jsx
import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  message,
  Typography,
  Progress,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const DEFAULT_SUBJECTS = ['Toán', 'Văn', 'Anh', 'Khoa học', 'Công nghệ'];

export default function StudyTracker() {
  // ==================== STATE ====================
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('subjects');
    return saved ? JSON.parse(saved) : [...DEFAULT_SUBJECTS]; // Chỉ dùng default lần đầu
  });

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeTab, setActiveTab] = useState('1');

  // UI state
  const [openSessionModal, setOpenSessionModal] = useState(false);
  const [openSubjectModal, setOpenSubjectModal] = useState(false);
  const [openGoalModal, setOpenGoalModal] = useState(false);

  const [editingSession, setEditingSession] = useState(null);
  const [editingSubjectIndex, setEditingSubjectIndex] = useState(null);

  const [formSession] = Form.useForm();
  const [formSubject] = Form.useForm();
  const [formGoal] = Form.useForm();

  // ==================== PERSIST ====================
  useEffect(() => {
    localStorage.setItem('subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  // ==================== HELPERS ====================
  const isSameMonth = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };

  const totalThisMonth = (subject) =>
    sessions
      .filter((s) => s.subject === subject && isSameMonth(s.date))
      .reduce((sum, s) => sum + s.duration, 0);

  const totalStudiedThisMonth = sessions
    .filter((s) => isSameMonth(s.date))
    .reduce((sum, s) => sum + s.duration, 0);

  const totalGoalThisMonth = Object.values(goals).reduce((sum, v) => sum + (v || 0), 0);

  // ==================== SESSION HANDLERS ====================
  const openAddSession = (session = null) => {
    setEditingSession(session);
    if (session) {
      formSession.setFieldsValue({
        subject: session.subject,
        date: session.date,
        duration: session.duration,
        content: session.content,
        note: session.note,
      });
    } else {
      formSession.resetFields();
      formSession.setFieldsValue({
        date: new Date().toISOString().slice(0, 10), // mặc định hôm nay
      });
    }
    setOpenSessionModal(true);
  };

  const saveSession = async () => {
    try {
      const values = await formSession.validateFields();
      const newSession = {
        id: editingSession ? editingSession.id : Date.now(),
        subject: values.subject,
        date: values.date,
        duration: Number(values.duration),
        content: values.content || '',
        note: values.note || '',
      };

      if (editingSession) {
        setSessions((prev) => prev.map((s) => (s.id === editingSession.id ? newSession : s)));
        message.success('✅ Cập nhật buổi học thành công');
      } else {
        setSessions((prev) => [newSession, ...prev]);
        message.success('✅ Thêm buổi học thành công');
      }
      setOpenSessionModal(false);
      setEditingSession(null);
    } catch (e) {}
  };

  const deleteSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    message.success('🗑️ Đã xóa buổi học');
  };

  // ==================== SUBJECT HANDLERS ====================
  const openAddSubject = (index = null) => {
    setEditingSubjectIndex(index);
    if (index !== null) {
      formSubject.setFieldsValue({ name: subjects[index] });
    } else {
      formSubject.resetFields();
    }
    setOpenSubjectModal(true);
  };

  const saveSubject = async () => {
    try {
      const { name } = await formSubject.validateFields();
      const normalized = name.trim();
      if (!normalized) return message.warning('Tên môn không được để trống');

      const existsIndex = subjects.findIndex((s) => s.toLowerCase() === normalized.toLowerCase());

      if (editingSubjectIndex === null) {
        if (existsIndex !== -1) return message.warning('Môn học đã tồn tại');
        setSubjects((prev) => [...prev, normalized]);
        message.success('✅ Thêm môn học thành công');
      } else {
        if (existsIndex !== -1 && existsIndex !== editingSubjectIndex) {
          return message.warning('Tên môn đã tồn tại');
        }
        const oldName = subjects[editingSubjectIndex];
        setSubjects((prev) => prev.map((s, i) => (i === editingSubjectIndex ? normalized : s)));

        // Cập nhật tên trong sessions và goals
        setSessions((prev) =>
          prev.map((sess) => (sess.subject === oldName ? { ...sess, subject: normalized } : sess))
        );
        setGoals((prev) => {
          const copy = { ...prev };
          if (copy[oldName] !== undefined) {
            copy[normalized] = copy[oldName];
            delete copy[oldName];
          }
          return copy;
        });
        message.success('✅ Cập nhật môn học thành công');
      }
      setOpenSubjectModal(false);
      setEditingSubjectIndex(null);
    } catch (e) {}
  };

  const removeSubject = (index) => {
    const subj = subjects[index];
    setSubjects((prev) => prev.filter((_, i) => i !== index));
    setSessions((prev) => prev.filter((s) => s.subject !== subj));
    setGoals((prev) => {
      const copy = { ...prev };
      delete copy[subj];
      return copy;
    });
    message.success('🗑️ Đã xóa môn học và dữ liệu liên quan');
  };

  // ==================== GOAL HANDLERS ====================
  const openSetGoal = (preselectedSubject = null) => {
    formGoal.resetFields();
    if (preselectedSubject) {
      formGoal.setFieldsValue({
        subject: preselectedSubject,
        hours: goals[preselectedSubject] || 0,
      });
    }
    setOpenGoalModal(true);
  };

  const saveGoal = async () => {
    try {
      const { subject, hours } = await formGoal.validateFields();
      setGoals((prev) => ({ ...prev, [subject]: Number(hours) }));
      setOpenGoalModal(false);
      message.success('🎯 Đặt mục tiêu thành công');
    } catch (e) {}
  };

  const removeGoal = (subject) => {
    setGoals((prev) => {
      const copy = { ...prev };
      delete copy[subject];
      return copy;
    });
    message.success('🗑️ Đã xóa mục tiêu');
  };

  // ==================== TABLE COLUMNS ====================
  const columns = [
    { title: 'Môn học', dataIndex: 'subject', width: 150 },
    { title: 'Ngày', dataIndex: 'date', width: 130, sorter: (a, b) => new Date(a.date) - new Date(b.date) },
    { title: 'Thời lượng (giờ)', dataIndex: 'duration', width: 140 },
    { title: 'Nội dung', dataIndex: 'content', ellipsis: true },
    { title: 'Ghi chú', dataIndex: 'note', ellipsis: true },
    {
      title: 'Hành động',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openAddSession(record)} />
          <Popconfirm title="Xóa buổi học này?" onConfirm={() => deleteSession(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ==================== TAB CONTENTS ====================
  const subjectsTab = (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => openAddSubject()} style={{ marginBottom: 16 }}>
        + Thêm môn học
      </Button>
      {subjects.length === 0 ? (
        <Text type="secondary">Chưa có môn học nào. Hãy thêm môn!</Text>
      ) : (
        subjects.map((subj, idx) => (
          <div
            key={subj}
            style={{
              padding: '16px',
              marginBottom: 8,
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text strong style={{ fontSize: 16 }}>
              {subj}
            </Text>
            <Space>
              <Button size="small" icon={<EditOutlined />} onClick={() => openAddSubject(idx)}>
                Sửa
              </Button>
              <Popconfirm title="Xóa môn học?" onConfirm={() => removeSubject(idx)}>
                <Button size="small" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            </Space>
          </div>
        ))
      )}
    </>
  );

  const progressTab = (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => openAddSession()} style={{ marginBottom: 16 }}>
        + Thêm buổi học
      </Button>
      <Table
        rowKey="id"
        dataSource={[...sessions].sort((a, b) => new Date(b.date) - new Date(a.date))}
        columns={columns}
        pagination={{ pageSize: 8 }}
      />
    </>
  );

  const goalsTab = (
    <>
      <Title level={4} style={{ marginBottom: 8 }}>
        🎯 Mục tiêu học tập tháng này
      </Title>
      <div style={{ marginBottom: 24 }}>
        <Text strong>
          Tổng tiến độ: {totalStudiedThisMonth} / {totalGoalThisMonth} giờ
        </Text>
        <Progress
          percent={totalGoalThisMonth > 0 ? Math.min(Math.round((totalStudiedThisMonth / totalGoalThisMonth) * 100), 100) : 0}
          status="active"
          strokeColor="#1890ff"
        />
      </div>

      {subjects.map((s) => {
        const studied = totalThisMonth(s);
        const goal = goals[s] || 0;
        const percent = goal ? Math.min(Math.round((studied / goal) * 100), 100) : 0;

        return (
          <div
            key={s}
            style={{
              padding: 20,
              marginBottom: 16,
              border: '1px solid #f0f0f0',
              borderRadius: 12,
              background: '#fafafa',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Title level={5} style={{ margin: 0 }}>
                {s}
              </Title>
              <Text strong>
                {studied} / {goal} giờ
              </Text>
            </div>

            <Progress percent={percent} status={goal && studied >= goal ? 'success' : 'active'} />

            <Space style={{ marginTop: 16 }}>
              <Button size="small" onClick={() => openAddSubject(subjects.indexOf(s))}>
                Sửa tên môn
              </Button>
              <Button size="small" type={goal ? 'default' : 'primary'} onClick={() => openSetGoal(s)}>
                {goal ? 'Sửa mục tiêu' : 'Đặt mục tiêu'}
              </Button>
              {goal && (
                <Popconfirm title="Xóa mục tiêu?" onConfirm={() => removeGoal(s)}>
                  <Button size="small">Xóa mục tiêu</Button>
                </Popconfirm>
              )}
              <Popconfirm title="Xóa môn học này?" onConfirm={() => removeSubject(subjects.indexOf(s))}>
                <Button size="small" danger>
                  Xóa môn
                </Button>
              </Popconfirm>
            </Space>
          </div>
        );
      })}

      {subjects.length === 0 && <Text type="secondary">Chưa có môn học nào để đặt mục tiêu</Text>}
    </>
  );

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        📚 Quản lý Tiến độ Học tập
      </Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="📚 Quản lý Môn học" key="1">
          {subjectsTab}
        </TabPane>
        <TabPane tab="📝 Quản lý Buổi học" key="2">
          {progressTab}
        </TabPane>
        <TabPane tab="🎯 Mục tiêu Tháng" key="3">
          {goalsTab}
        </TabPane>
      </Tabs>

      {/* ==================== MODALS ==================== */}
      {/* Modal Buổi học */}
      <Modal
        title={editingSession ? 'Sửa buổi học' : 'Thêm buổi học'}
        visible={openSessionModal}
        onOk={saveSession}
        onCancel={() => {
          setOpenSessionModal(false);
          setEditingSession(null);
          formSession.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
        width={600}
      >
        <Form form={formSession} layout="vertical">
          <Form.Item name="subject" label="Môn học" rules={[{ required: true }]}>
            <Select>
              {subjects.map((subj) => (
                <Option key={subj} value={subj}>
                  {subj}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="date" label="Ngày học" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>

          <Form.Item name="duration" label="Thời lượng (giờ)" rules={[{ required: true }]}>
            <InputNumber min={0.5} step={0.5} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="content" label="Nội dung đã học">
            <Input />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Môn học */}
      <Modal
        title={editingSubjectIndex !== null ? 'Sửa môn học' : 'Thêm môn học'}
        visible={openSubjectModal}
        onOk={saveSubject}
        onCancel={() => {
          setOpenSubjectModal(false);
          setEditingSubjectIndex(null);
          formSubject.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={formSubject} layout="vertical">
          <Form.Item name="name" label="Tên môn học" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Lịch sử" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Mục tiêu */}
      <Modal
        title="Đặt / Sửa mục tiêu tháng"
        visible={openGoalModal}
        onOk={saveGoal}
        onCancel={() => {
          setOpenGoalModal(false);
          formGoal.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={formGoal} layout="vertical">
          <Form.Item name="subject" label="Môn học" rules={[{ required: true }]}>
            <Select>
              {subjects.map((subj) => (
                <Option key={subj} value={subj}>
                  {subj}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="hours" label="Số giờ mục tiêu" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} addonAfter="giờ" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}