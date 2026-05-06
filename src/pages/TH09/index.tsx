import React, { useState, useEffect, useMemo } from 'react';
import {
  Layout, Menu, Card, Row, Col, Statistic, Table, Button, Space, Input,
  Select, DatePicker, Modal, Form, Tag, Popconfirm, message, Typography
} from 'antd';
import {
  DashboardOutlined, ProjectOutlined, UnorderedListOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import dayjs from 'dayjs';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU ---
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO string YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
}

// --- HẰNG SỐ & MÀU SẮC ---
const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'Cần làm',
  IN_PROGRESS: 'Đang làm',
  DONE: 'Hoàn thành'
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  HIGH: 'red',
  MEDIUM: 'orange',
  LOW: 'green'
};

export default function TaskTrackerApp() {
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // State cho Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();

  // --- LOCAL STORAGE SYNC ---
  useEffect(() => {
    const savedTasks = localStorage.getItem('kanban_tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Failed to parse tasks from localStorage');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kanban_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // --- LOGIC: THÊM / SỬA TASK ---
  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      form.setFieldsValue({
        ...task,
        deadline: dayjs(task.deadline),
      });
    } else {
      setEditingTask(null);
      form.resetFields();
      form.setFieldsValue({ status: 'TODO', priority: 'MEDIUM' });
    }
    setIsModalOpen(true);
  };

  const handleSaveTask = () => {
    form.validateFields().then((values) => {
      const formattedValues = {
        ...values,
        deadline: values.deadline.format('YYYY-MM-DD'),
      };

      if (editingTask) {
        setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...formattedValues } : t));
        message.success('Đã cập nhật công việc!');
      } else {
        const newTask: Task = {
          ...formattedValues,
          id: `task-${Date.now()}`,
        };
        setTasks([...tasks, newTask]);
        message.success('Đã thêm công việc mới!');
      }
      setIsModalOpen(false);
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    message.success('Đã xóa công việc!');
  };

  // --- COMPONENT: DASHBOARD ---
  const DashboardView = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;
    const overdueTasks = tasks.filter(
      t => t.status !== 'DONE' && dayjs(t.deadline).isBefore(dayjs(), 'day')
    ).length;

    return (
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="Tổng số công việc" value={totalTasks} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Đã hoàn thành" value={completedTasks} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Quá hạn" value={overdueTasks} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>
    );
  };

  // --- COMPONENT: KANBAN BOARD ---
  const KanbanView = () => {
    const onDragEnd = (result: DropResult) => {
      const { source, destination, draggableId } = result;
      if (!destination) return; // Kéo ra ngoài
      if (source.droppableId === destination.droppableId && source.index === destination.index) return; // Không đổi vị trí

      const updatedTasks = Array.from(tasks);
      const taskIndex = updatedTasks.findIndex(t => t.id === draggableId);
      
      if (taskIndex > -1) {
        // Cập nhật trạng thái (status) của task theo cột được thả vào
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          status: destination.droppableId as TaskStatus,
        };
        setTasks(updatedTasks);
      }
    };

    const columns: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {columns.map(status => {
            const columnTasks = tasks.filter(t => t.status === status);
            return (
              <div key={status} style={{ flex: 1, background: '#f0f2f5', padding: 16, borderRadius: 8 }}>
                <Title level={5} style={{ marginBottom: 16 }}>
                  {STATUS_LABELS[status]} ({columnTasks.length})
                </Title>
                <Droppable droppableId={status}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: 200 }}>
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{ ...provided.draggableProps.style, marginBottom: 16 }}
                            >
                              <Card 
                                size="small" 
                                hoverable 
                                actions={[
                                  <EditOutlined key="edit" onClick={() => handleOpenModal(task)} />,
                                  <Popconfirm key="delete" title="Xóa task?" onConfirm={() => handleDeleteTask(task.id)}>
                                    <DeleteOutlined style={{ color: 'red' }} />
                                  </Popconfirm>
                                ]}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                  <Text strong>{task.title}</Text>
                                  <Tag color={PRIORITY_COLORS[task.priority]}>{task.priority}</Tag>
                                </div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Deadline: {task.deadline}</Text>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    );
  };

  // --- COMPONENT: TASK LIST (TABLE) ---
  const TaskListView = () => {
    const [searchText, setSearchText] = useState('');

    const columns: ColumnsType<Task> = [
      { title: 'Tên công việc', dataIndex: 'title', key: 'title' },
      { 
        title: 'Mức độ', dataIndex: 'priority', key: 'priority',
        render: (p: TaskPriority) => <Tag color={PRIORITY_COLORS[p]}>{p}</Tag>,
        filters: [
          { text: 'Cao', value: 'HIGH' },
          { text: 'Trung bình', value: 'MEDIUM' },
          { text: 'Thấp', value: 'LOW' },
        ],
        onFilter: (value, record) => record.priority === value,
      },
      { 
        title: 'Trạng thái', dataIndex: 'status', key: 'status',
        render: (s: TaskStatus) => <Tag>{STATUS_LABELS[s]}</Tag>,
        filters: [
          { text: 'Cần làm', value: 'TODO' },
          { text: 'Đang làm', value: 'IN_PROGRESS' },
          { text: 'Hoàn thành', value: 'DONE' },
        ],
        onFilter: (value, record) => record.status === value,
      },
      { 
        title: 'Deadline', dataIndex: 'deadline', key: 'deadline',
        sorter: (a, b) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf(),
      },
      { 
        title: 'Thẻ (Tags)', dataIndex: 'tags', key: 'tags',
        render: (tags: string[]) => tags?.map(t => <Tag key={t} color="blue">{t}</Tag>)
      },
      {
        title: 'Hành động', key: 'action',
        render: (_, record) => (
          <Space>
            <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
            <Popconfirm title="Xóa công việc?" onConfirm={() => handleDeleteTask(record.id)}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        )
      }
    ];

    const filteredTasks = useMemo(() => {
      if (!searchText) return tasks;
      return tasks.filter(t => t.title.toLowerCase().includes(searchText.toLowerCase()));
    }, [tasks, searchText]);

    return (
      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <Space style={{ marginBottom: 16 }}>
          <Input.Search 
            placeholder="Tìm kiếm công việc..." 
            allowClear 
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </Space>
        <Table columns={columns} dataSource={filteredTasks} rowKey="id" />
      </div>
    );
  };

  // --- LAYOUT CHÍNH ---
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="light">
        <div style={{ height: 64, margin: 16, textAlign: 'center' }}>
          <Title level={3} style={{ color: '#1890ff', margin: 0, lineHeight: '64px' }}>TaskTracker</Title>
        </div>
        <Menu 
          mode="inline" 
          selectedKeys={[currentMenu]} 
          onClick={(e) => setCurrentMenu(e.key)}
          items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
            { key: 'kanban', icon: <ProjectOutlined />, label: 'Kanban Board' },
            { key: 'list', icon: <UnorderedListOutlined />, label: 'Danh sách công việc' },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            {currentMenu === 'dashboard' && 'Tổng quan'}
            {currentMenu === 'kanban' && 'Bảng Kanban'}
            {currentMenu === 'list' && 'Danh sách'}
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            Thêm công việc
          </Button>
        </Header>
        <Content style={{ margin: '24px', overflow: 'initial' }}>
          {currentMenu === 'dashboard' && <DashboardView />}
          {currentMenu === 'kanban' && <KanbanView />}
          {currentMenu === 'list' && <TaskListView />}
        </Content>
      </Layout>

      {/* --- MODAL FORM --- */}
      <Modal
        title={editingTask ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
        open={isModalOpen}
        onOk={handleSaveTask}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Tên công việc" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="deadline" label="Deadline" rules={[{ required: true, message: 'Chọn deadline!' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Mức độ ưu tiên" rules={[{ required: true }]}>
                <Select>
                  <Option value="HIGH">Cao</Option>
                  <Option value="MEDIUM">Trung bình</Option>
                  <Option value="LOW">Thấp</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                <Select>
                  <Option value="TODO">Cần làm</Option>
                  <Option value="IN_PROGRESS">Đang làm</Option>
                  <Option value="DONE">Hoàn thành</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tags" label="Thẻ (Tags)">
                <Select mode="tags" placeholder="Nhập thẻ và nhấn Enter" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Layout>
  );
}