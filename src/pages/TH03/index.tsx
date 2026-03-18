
import React, { useState, createContext, useContext, useCallback, useMemo } from 'react';
import {
  Layout, Tabs, Table, Button, Modal, Form, Input, InputNumber, Select, Space, message,
  Card, Typography, Rate, Descriptions, Badge, DatePicker, TimePicker, Row, Col, Statistic,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined,
  HistoryOutlined, DollarOutlined, UserOutlined, CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Header, Content } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export type Employee = {
  id: string;
  name: string;
  maxCustomersPerDay: number;
  workSchedule: WorkSchedule[];
};

export type WorkSchedule = {
  dayOfWeek: number; 
  startTime: string; 
  endTime: string;   
};

export type Service = {
  id: string;
  name: string;
  price: number;
  duration: number; 
  description?: string;
};

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type Appointment = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  employeeId: string;
  serviceId: string;
  date: string;      
  startTime: string;
  endTime: string; 
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
};

export type Review = {
  id: string;
  appointmentId: string;
  customerName: string;
  employeeId: string;
  rating: number; 
  comment: string;
  reply?: string;
  createdAt: Date;
};

interface AppContextType {
  employees: Employee[];
  services: Service[];
  appointments: Appointment[];
  reviews: Review[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, emp: Omit<Employee, 'id'>) => void;
  deleteEmployee: (id: string) => void;
  addService: (svc: Omit<Service, 'id'>) => void;
  updateService: (id: string, svc: Omit<Service, 'id'>) => void;
  deleteService: (id: string) => void;
  addAppointment: (apt: Omit<Appointment, 'id' | 'createdAt' | 'endTime'> & { startTime: string }) => void;
  updateAppointment: (id: string, apt: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  updateReview: (id: string, review: Partial<Review>) => void;
  deleteReview: (id: string) => void;
  replyToReview: (reviewId: string, reply: string) => void;
  isTimeSlotAvailable: (employeeId: string, date: string, startTime: string, endTime: string, excludeAppointmentId?: string) => boolean;
  getEmployeeAverageRating: (employeeId: string) => number;
  getAppointmentStats: (startDate?: string, endDate?: string) => any;
  getRevenueStats: (startDate?: string, endDate?: string) => any;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};


const generateId = () => Math.random().toString(36).substr(2, 9);

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};


const addMinutes = (time: string, minutes: number): string => {
  const total = timeToMinutes(time) + minutes;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};


const doTimeRangesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
  return timeToMinutes(start1) < timeToMinutes(end2) && timeToMinutes(start2) < timeToMinutes(end1);
};


const initialEmployees: Employee[] = [
  {
    id: 'e1',
    name: 'Nguyễn Văn A',
    maxCustomersPerDay: 5,
    workSchedule: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
      { dayOfWeek: 1, startTime: '13:00', endTime: '17:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '12:00' },
      { dayOfWeek: 2, startTime: '13:00', endTime: '17:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '12:00' },
      { dayOfWeek: 3, startTime: '13:00', endTime: '17:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '12:00' },
      { dayOfWeek: 4, startTime: '13:00', endTime: '17:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '12:00' },
      { dayOfWeek: 5, startTime: '13:00', endTime: '17:00' },
    ],
  },
  {
    id: 'e2',
    name: 'Trần Thị B',
    maxCustomersPerDay: 3,
    workSchedule: [
      { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '15:00' },
    ],
  },
];

const initialServices: Service[] = [
  { id: 's1', name: 'Cắt tóc nam', price: 100000, duration: 30, description: 'Cắt tóc nam cơ bản' },
  { id: 's2', name: 'Gội đầu', price: 80000, duration: 45, description: 'Gội đầu thư giãn' },
  { id: 's3', name: 'Nhuộm tóc', price: 500000, duration: 120, description: 'Nhuộm tóc màu' },
];

const initialAppointments: Appointment[] = [
  {
    id: 'a1',
    customerName: 'Lê Văn C',
    customerPhone: '0909123456',
    employeeId: 'e1',
    serviceId: 's1',
    date: dayjs().format('YYYY-MM-DD'),
    startTime: '09:00',
    endTime: '09:30',
    status: 'completed',
    createdAt: new Date(),
  },

  {
    id: 'a2',
    customerName: 'Phạm Thị D',
    customerPhone: '0918234567',
    employeeId: 'e2',
    serviceId: 's2',
    date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    startTime: '10:00',
    endTime: '10:45',
    status: 'confirmed',
    createdAt: new Date(),
  },
];

const initialReviews: Review[] = [
  {
    id: 'r1',
    appointmentId: 'a1',
    customerName: 'Lê Văn C',
    employeeId: 'e1',
    rating: 5,
    comment: 'Rất hài lòng, nhân viên nhiệt tình',
    createdAt: new Date(),
  },
];

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);


  const addEmployee = useCallback((emp: Omit<Employee, 'id'>) => {
    setEmployees(prev => [...prev, { id: generateId(), ...emp }]);
    message.success('Thêm nhân viên thành công');
  }, []);

  const updateEmployee = useCallback((id: string, emp: Omit<Employee, 'id'>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { id, ...emp } : e));
    message.success('Cập nhật nhân viên thành công');
  }, []);

  const deleteEmployee = useCallback((id: string) => {

    const hasAppointments = appointments.some(a => a.employeeId === id && a.status !== 'cancelled');
    if (hasAppointments) {
      message.error('Không thể xóa nhân viên đang có lịch hẹn');
      return;
    }
    setEmployees(prev => prev.filter(e => e.id !== id));
    message.success('Xóa nhân viên thành công');
  }, [appointments]);


  const addService = useCallback((svc: Omit<Service, 'id'>) => {
    setServices(prev => [...prev, { id: generateId(), ...svc }]);
    message.success('Thêm dịch vụ thành công');
  }, []);

  const updateService = useCallback((id: string, svc: Omit<Service, 'id'>) => {
    setServices(prev => prev.map(s => s.id === id ? { id, ...svc } : s));
    message.success('Cập nhật dịch vụ thành công');
  }, []);

  const deleteService = useCallback((id: string) => {
    const hasAppointments = appointments.some(a => a.serviceId === id && a.status !== 'cancelled');
    if (hasAppointments) {
      message.error('Không thể xóa dịch vụ đang có lịch hẹn');
      return;
    }
    setServices(prev => prev.filter(s => s.id !== id));
    message.success('Xóa dịch vụ thành công');
  }, [appointments]);


  
  const contextValue: AppContextType = {
    employees,
    services,
    appointments,
    reviews,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addService,
    updateService,
    deleteService,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};


interface EditModalProps<T> {
  visible: boolean;
  editingItem: T | null;
  onCancel: () => void;
  onSave: (item: any) => void;
  formItems: React.ReactNode;
  title: string;
  width?: number;
}

const EditModal = <T,>({ visible, editingItem, onCancel, onSave, formItems, title, width }: EditModalProps<T>) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible && editingItem) {
      form.setFieldsValue(editingItem);
    } else {
      form.resetFields();
    }
  }, [visible, editingItem, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={title}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={width}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {formItems}
      </Form>
    </Modal>
  );
};
const EmployeeManager: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [schedule, setSchedule] = useState<WorkSchedule[]>([{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }]);

  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const columns = [
    { title: 'Tên nhân viên', dataIndex: 'name', key: 'name' },
    { title: 'Giới hạn khách/ngày', dataIndex: 'maxCustomersPerDay', key: 'maxCustomersPerDay' },
    {
      title: 'Lịch làm việc',
      key: 'schedule',
      render: (_: any, record: Employee) => (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {record.workSchedule.map((s, idx) => (
            <li key={idx}>{daysOfWeek[s.dayOfWeek]}: {s.startTime}-{s.endTime}</li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Employee) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => { setEditingEmployee(record); setSchedule(record.workSchedule); setModalVisible(true); }} />
          <Button icon={<DeleteOutlined />} danger onClick={() => deleteEmployee(record.id)} />
        </Space>
      ),
    },
  ];

  const handleAddSchedule = () => {
    setSchedule([...schedule, { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }]);
  };

  const handleRemoveSchedule = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const handleScheduleChange = (index: number, field: keyof WorkSchedule, value: any) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const handleSave = (values: any) => {
    const employeeData = { ...values, workSchedule: schedule };
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, employeeData);
    } else {
      addEmployee(employeeData);
    }
    setModalVisible(false);
    setEditingEmployee(null);
    setSchedule([{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }]);
  };

  const formItems = (
    <>
      <Form.Item label="Tên nhân viên" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Giới hạn khách/ngày" name="maxCustomersPerDay" rules={[{ required: true }]}>
        <InputNumber min={1} max={20} />
      </Form.Item>
      <Title level={5}>Lịch làm việc</Title>
      {schedule.map((s, index) => (
        <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
          <Select value={s.dayOfWeek} onChange={val => handleScheduleChange(index, 'dayOfWeek', val)} style={{ width: 60 }}>
            {daysOfWeek.map((day, i) => <Option key={i} value={i}>{day}</Option>)}
          </Select>
          <TimePicker
            format="HH:mm"
            value={dayjs(s.startTime, 'HH:mm')}
            onChange={time => handleScheduleChange(index, 'startTime', time?.format('HH:mm') || '09:00')}
            style={{ width: 100 }}
          />
          <span>-</span>
          <TimePicker
            format="HH:mm"
            value={dayjs(s.endTime, 'HH:mm')}
            onChange={time => handleScheduleChange(index, 'endTime', time?.format('HH:mm') || '17:00')}
            style={{ width: 100 }}
          />
          <Button danger onClick={() => handleRemoveSchedule(index)} icon={<DeleteOutlined />} />
        </Space>
      ))}
      <Button type="dashed" onClick={handleAddSchedule} block icon={<PlusOutlined />}>
        Thêm ca làm việc
      </Button>
    </>
  );

  return (
    <Card title="Quản lý nhân viên">
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
        Thêm nhân viên
      </Button>
      <Table dataSource={employees} columns={columns} rowKey="id" pagination={false} />
      <EditModal
        visible={modalVisible}
        editingItem={editingEmployee}
        onCancel={() => { setModalVisible(false); setEditingEmployee(null); setSchedule([{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }]); }}
        onSave={handleSave}
        formItems={formItems}
        title={editingEmployee ? 'Sửa nhân viên' : 'Thêm nhân viên'}
        width={600}
      />
    </Card>
  );
};


const App: React.FC = () => {
  return (
    <AppProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ color: 'white', fontSize: 20 }}>Hệ thống đặt lịch hẹn dịch vụ</Header>
        <Content style={{ padding: '24px' }}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Nhân viên" key="1">
              <EmployeeManager />
            </TabPane>
          </Tabs>
        </Content>
      </Layout>
    </AppProvider>
  );
};

export default App;