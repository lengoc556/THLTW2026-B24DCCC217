import { useState } from 'react';
import {
  Layout, Menu, Card, Row, Col, Statistic, Timeline, Table, Button, Space,
  Input, Select, DatePicker, Modal, Form, Popconfirm, message, Tag, Drawer,
  Progress, Segmented, InputNumber, Typography, Divider
} from 'antd';
import {
  DashboardOutlined, CalendarOutlined, HeartOutlined, TagOutlined,
  BookOutlined, PlusOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;


type WorkoutStatus = 'Hoàn thành' | 'Bỏ lỡ';
interface Workout { id: string; date: string; type: string; duration: number; calories: number; notes: string; status: WorkoutStatus; }

interface Metric { id: string; date: string; weight: number; height: number; heartRate: number; sleep: number; }

type GoalStatus = 'Đang thực hiện' | 'Đã đạt' | 'Đã hủy';
interface Goal { id: string; name: string; type: string; target: number; current: number; deadline: string; status: GoalStatus; }

type Difficulty = 'Dễ' | 'Trung bình' | 'Khó';
interface Exercise { id: string; name: string; muscle: string; difficulty: Difficulty; description: string; caloriesPerHour: number; }

// --- MOCK DATA ---
const INITIAL_WORKOUTS: Workout[] = [
  { id: '1', date: '2023-10-25', type: 'Cardio', duration: 30, calories: 300, notes: 'Chạy bộ', status: 'Hoàn thành' },
  { id: '2', date: '2023-10-26', type: 'Strength', duration: 45, calories: 400, notes: 'Đẩy ngực', status: 'Hoàn thành' },
  { id: '3', date: '2023-10-27', type: 'Yoga', duration: 60, calories: 200, notes: 'Giãn cơ', status: 'Bỏ lỡ' },
];

const INITIAL_METRICS: Metric[] = [
  { id: '1', date: '2023-10-25', weight: 70, height: 175, heartRate: 65, sleep: 8 },
  { id: '2', date: '2023-10-26', weight: 69.8, height: 175, heartRate: 62, sleep: 7.5 },
];

const INITIAL_GOALS: Goal[] = [
  { id: '1', name: 'Giảm 5kg', type: 'Giảm cân', target: 5, current: 2.5, deadline: '2023-12-31', status: 'Đang thực hiện' },
  { id: '2', name: 'Chạy 10km', type: 'Cải thiện sức bền', target: 10, current: 10, deadline: '2023-11-15', status: 'Đã đạt' },
];

const INITIAL_EXERCISES: Exercise[] = [
  { id: '1', name: 'Push Up', muscle: 'Chest', difficulty: 'Dễ', description: 'Chống đẩy cơ bản', caloriesPerHour: 400 },
  { id: '2', name: 'Squat', muscle: 'Legs', difficulty: 'Trung bình', description: 'Gánh đùi', caloriesPerHour: 500 },
  { id: '3', name: 'Pull Up', muscle: 'Back', difficulty: 'Khó', description: 'Hít xà đơn', caloriesPerHour: 450 },
];

export default function FitnessApp() {
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  
  // States
  const [workouts, setWorkouts] = useState<Workout[]>(INITIAL_WORKOUTS);
  const [metrics, ] = useState<Metric[]>(INITIAL_METRICS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [exercises, ] = useState<Exercise[]>(INITIAL_EXERCISES);

  // --- COMPONENT: DASHBOARD ---
  const DashboardView = () => {
    const totalWorkouts = workouts.filter(w => w.status === 'Hoàn thành').length;
    const totalCalories = workouts.reduce((sum, w) => w.status === 'Hoàn thành' ? sum + w.calories : sum, 0);
    const completedGoals = goals.filter(g => g.status === 'Đã đạt').length;
    const goalPercent = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

    return (
      <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        <Row gutter={16}>
          <Col span={6}><Card><Statistic title="Buổi tập (Tháng)" value={totalWorkouts} /></Card></Col>
          <Col span={6}><Card><Statistic title="Calo đã đốt" value={totalCalories} suffix="kcal" /></Card></Col>
          <Col span={6}><Card><Statistic title="Streak (Ngày liên tiếp)" value={3} suffix="ngày" /></Card></Col>
          <Col span={6}><Card><Statistic title="Mục tiêu hoàn thành" value={goalPercent} suffix="%" /></Card></Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Card title="Biểu đồ tập luyện (Tuần)">
              {/* Mock Bar Chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 16, justifyContent: 'center' }}>
                {[40, 70, 50, 90].map((h, i) => (
                  <div key={i} style={{ width: 40, height: `${h}%`, background: '#1890ff', borderRadius: '4px 4px 0 0' }} title={`Tuần ${i+1}`} />
                ))}
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Thay đổi cân nặng">
               {/* Mock Line Chart (Simplified with dots) */}
               <div style={{ display: 'flex', alignItems: 'center', height: 200, gap: 32, justifyContent: 'center' }}>
                {metrics.map((m, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#52c41a' }} />
                    <Text type="secondary" style={{ marginTop: 8 }}>{m.weight}kg</Text>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        <Card title="5 buổi tập gần nhất">
          <Timeline mode="left">
            {workouts.slice(-5).reverse().map(w => (
              <Timeline.Item key={w.id} color={w.status === 'Hoàn thành' ? 'green' : 'red'}>
                <strong>{w.date}</strong> - {w.type} ({w.duration} phút) - {w.calories} kcal
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      </Space>
    );
  };

  // --- COMPONENT: NHẬT KÝ TẬP LUYỆN ---
  const WorkoutLogView = () => {
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');

    const columns: ColumnsType<Workout> = [
      { title: 'Ngày', dataIndex: 'date', key: 'date', sorter: (a, b) => a.date.localeCompare(b.date) },
      { title: 'Loại bài tập', dataIndex: 'type', key: 'type' },
      { title: 'Thời lượng (phút)', dataIndex: 'duration', key: 'duration' },
      { title: 'Calo đốt', dataIndex: 'calories', key: 'calories' },
      { title: 'Ghi chú', dataIndex: 'notes', key: 'notes' },
      { 
        title: 'Trạng thái', dataIndex: 'status', key: 'status',
        render: (status) => <Tag color={status === 'Hoàn thành' ? 'success' : 'error'}>{status}</Tag>
      },
      {
        title: 'Hành động', key: 'action',
        render: (_, record) => (
          <Space>
            <Button type="text" icon={<EditOutlined />} onClick={() => { form.setFieldsValue({ ...record, date: dayjs(record.date) }); setEditingId(record.id); setIsModalOpen(true); }} />
            <Popconfirm title="Xóa buổi tập?" onConfirm={() => { setWorkouts(workouts.filter(w => w.id !== record.id)); message.success('Đã xóa'); }}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        )
      }
    ];

    const handleSave = () => {
      form.validateFields().then(values => {
        const formattedValues = { ...values, date: values.date.format('YYYY-MM-DD') };
        if (editingId) {
          setWorkouts(workouts.map(w => w.id === editingId ? { ...w, ...formattedValues } : w));
        } else {
          setWorkouts([...workouts, { ...formattedValues, id: Date.now().toString() }]);
        }
        setIsModalOpen(false);
        message.success('Đã lưu buổi tập');
      });
    };

    const filtered = workouts.filter(w => w.notes.toLowerCase().includes(searchText.toLowerCase()) || w.type.toLowerCase().includes(searchText.toLowerCase()));

    return (
      <Card title="Nhật ký tập luyện">
        <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Input.Search placeholder="Tìm kiếm..." onSearch={setSearchText} allowClear style={{ width: 200 }} />
            <RangePicker />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditingId(null); setIsModalOpen(true); }}>Thêm buổi tập</Button>
        </Space>
        <Table columns={columns} dataSource={filtered} rowKey="id" />
        
        <Modal title={editingId ? "Sửa buổi tập" : "Thêm buổi tập"} visible={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleSave}>
          <Form form={form} layout="vertical">
            <Form.Item name="date" label="Ngày tập" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="type" label="Loại bài tập" rules={[{ required: true }]}>
              <Select><Option value="Cardio">Cardio</Option><Option value="Strength">Strength</Option><Option value="Yoga">Yoga</Option><Option value="HIIT">HIIT</Option><Option value="Other">Khác</Option></Select>
            </Form.Item>
            <Space style={{ display: 'flex', width: '100%' }}>
              <Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="calories" label="Calo đốt" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
            </Space>
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}><Select><Option value="Hoàn thành">Hoàn thành</Option><Option value="Bỏ lỡ">Bỏ lỡ</Option></Select></Form.Item>
            <Form.Item name="notes" label="Ghi chú"><Input.TextArea /></Form.Item>
          </Form>
        </Modal>
      </Card>
    );
  };

  // --- COMPONENT: NHẬT KÝ CHỈ SỐ SỨC KHỎE ---
  const MetricsLogView = () => {
    const getBMIData = (weight: number, height: number) => {
      const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);
      const numBmi = parseFloat(bmi);
      let color = 'red', label = 'Béo phì';
      if (numBmi < 18.5) { color = 'blue'; label = 'Thiếu cân'; }
      else if (numBmi < 25) { color = 'green'; label = 'Bình thường'; }
      else if (numBmi < 30) { color = 'gold'; label = 'Thừa cân'; }
      return { bmi, color, label };
    };

    const columns: ColumnsType<Metric> = [
      { title: 'Ngày', dataIndex: 'date', key: 'date' },
      { title: 'Cân nặng (kg)', dataIndex: 'weight', key: 'weight' },
      { title: 'Chiều cao (cm)', dataIndex: 'height', key: 'height' },
      { 
        title: 'BMI', key: 'bmi',
        render: (_, record) => {
          const { bmi, color, label } = getBMIData(record.weight, record.height);
          return <Tag color={color}>{bmi} - {label}</Tag>;
        }
      },
      { title: 'Nhịp tim lúc nghỉ (bpm)', dataIndex: 'heartRate', key: 'heartRate' },
      { title: 'Giờ ngủ', dataIndex: 'sleep', key: 'sleep' },
    ];

    return (
      <Card title="Nhật ký chỉ số sức khỏe">
        <Table columns={columns} dataSource={metrics} rowKey="id" />
      </Card>
    );
  };

  // --- COMPONENT: QUẢN LÝ MỤC TIÊU ---
  const GoalsView = () => {
    const [filter, setFilter] = useState('Tất cả');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [form] = Form.useForm();

    const displayedGoals = goals.filter(g => filter === 'Tất cả' || g.status === filter);

    const updateCurrent = (id: string, value: number | null) => {
      if(value === null) return;
      setGoals(goals.map(g => {
        if(g.id !== id) return g;
        const newStatus = value >= g.target ? 'Đã đạt' : g.status;
        return { ...g, current: value, status: newStatus as GoalStatus };
      }));
    };

    const handleSaveGoal = () => {
      form.validateFields().then(values => {
        setGoals([...goals, { ...values, id: Date.now().toString(), current: 0, deadline: values.deadline.format('YYYY-MM-DD'), status: 'Đang thực hiện' }]);
        setIsDrawerOpen(false);
        form.resetFields();
      });
    };

    return (
      <div>
        <Space style={{ marginBottom: 24, justifyContent: 'space-between', width: '100%' }}>
          <Segmented options={['Tất cả', 'Đang thực hiện', 'Đã đạt', 'Đã hủy']} value={filter} onChange={setFilter as any} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDrawerOpen(true)}>Thêm mục tiêu</Button>
        </Space>

        <Row gutter={[16, 16]}>
          {displayedGoals.map(g => (
            <Col span={8} key={g.id}>
              <Card title={g.name} extra={<Tag color={g.status === 'Đã đạt' ? 'green' : g.status === 'Đã hủy' ? 'default' : 'blue'}>{g.status}</Tag>}>
                <Text type="secondary">{g.type} • Deadline: {g.deadline}</Text>
                <div style={{ marginTop: 16 }}>
                  <Progress percent={Math.min(100, Math.round((g.current / g.target) * 100))} status={g.status === 'Đã đạt' ? 'success' : 'active'} />
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Space>
                    <Text>Hiện tại:</Text>
                    <InputNumber min={0} value={g.current} onChange={(v) => updateCurrent(g.id, v)} />
                  </Space>
                  <Text>/ {g.target}</Text>
                </div>
                <Divider style={{ margin: '16px 0' }} />
                <Popconfirm title="Xóa mục tiêu này?" onConfirm={() => setGoals(goals.filter(x => x.id !== g.id))}>
                  <Button danger type="text" block icon={<DeleteOutlined />}>Xóa</Button>
                </Popconfirm>
              </Card>
            </Col>
          ))}
        </Row>

        <Drawer title="Thêm mục tiêu mới" width={400} onClose={() => setIsDrawerOpen(false)} visible={isDrawerOpen} extra={<Button type="primary" onClick={handleSaveGoal}>Lưu</Button>}>
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Tên mục tiêu" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
              <Select><Option value="Giảm cân">Giảm cân</Option><Option value="Tăng cơ">Tăng cơ</Option><Option value="Cải thiện sức bền">Cải thiện sức bền</Option><Option value="Khác">Khác</Option></Select>
            </Form.Item>
            <Form.Item name="target" label="Giá trị mục tiêu" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="deadline" label="Deadline" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          </Form>
        </Drawer>
      </div>
    );
  };

  // --- COMPONENT: THƯ VIỆN BÀI TẬP ---
  const ExerciseLibraryView = () => {
    const [searchText, setSearchText] = useState('');
    const [detailModal, setDetailModal] = useState<Exercise | null>(null);

    const filteredEx = exercises.filter(e => e.name.toLowerCase().includes(searchText.toLowerCase()));

    return (
      <div>
        <Space style={{ marginBottom: 24 }}>
          <Input.Search placeholder="Tìm bài tập..." allowClear onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} />
          <Button icon={<PlusOutlined />}>Thêm bài tập (Mock)</Button>
        </Space>
        
        <Row gutter={[16, 16]}>
          {filteredEx.map(ex => (
            <Col span={8} key={ex.id}>
              <Card hoverable onClick={() => setDetailModal(ex)}>
                <Card.Meta 
                  title={<Space>{ex.name} <Tag color={ex.difficulty === 'Dễ' ? 'green' : ex.difficulty === 'Khó' ? 'red' : 'orange'}>{ex.difficulty}</Tag></Space>}
                  description={
                    <>
                      <Text type="secondary">Nhóm cơ: {ex.muscle}</Text><br/>
                      <Text type="secondary">Đốt: ~{ex.caloriesPerHour} kcal/h</Text>
                      <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 8 }}>{ex.description}</Paragraph>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Modal title={detailModal?.name} visible={!!detailModal} onCancel={() => setDetailModal(null)} footer={null}>
          {detailModal && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Tag color="blue">{detailModal.muscle}</Tag>
              <Title level={5}>Hướng dẫn thực hiện:</Title>
              <Paragraph>{detailModal.description}</Paragraph>
              <Text strong>Lượng calo tiêu thụ trung bình: {detailModal.caloriesPerHour} kcal/giờ</Text>
            </Space>
          )}
        </Modal>
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="light">
        <div style={{ height: 64, margin: 16, textAlign: 'center', fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>FitTracker</div>
        <Menu mode="inline" selectedKeys={[currentMenu]} onClick={(e) => setCurrentMenu(e.key)}
          items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
            { key: 'workouts', icon: <CalendarOutlined />, label: 'Nhật ký tập luyện' },
            { key: 'metrics', icon: <HeartOutlined />, label: 'Chỉ số sức khỏe' },
            { key: 'goals', icon: <TagOutlined />, label: 'Quản lý mục tiêu' },
            { key: 'library', icon: <BookOutlined />, label: 'Thư viện bài tập' },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <Title level={4} style={{ margin: '16px 0' }}>
            {currentMenu === 'dashboard' && 'Tổng quan'}
            {currentMenu === 'workouts' && 'Nhật ký tập luyện'}
            {currentMenu === 'metrics' && 'Theo dõi chỉ số sức khỏe'}
            {currentMenu === 'goals' && 'Mục tiêu của bạn'}
            {currentMenu === 'library' && 'Thư viện bài tập'}
          </Title>
        </Header>
        <Content style={{ margin: '24px', overflow: 'initial' }}>
          {currentMenu === 'dashboard' && <DashboardView />}
          {currentMenu === 'workouts' && <WorkoutLogView />}
          {currentMenu === 'metrics' && <MetricsLogView />}
          {currentMenu === 'goals' && <GoalsView />}
          {currentMenu === 'library' && <ExerciseLibraryView />}
        </Content>
      </Layout>
    </Layout>
  );
}