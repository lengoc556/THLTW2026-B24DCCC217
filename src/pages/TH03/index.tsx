// App.tsx
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

// -------------------- Types --------------------
export type Employee = {
  id: string;
  name: string;
  maxCustomersPerDay: number;
  workSchedule: WorkSchedule[];
};

export type WorkSchedule = {
  dayOfWeek: number; // 0-6 (Chủ nhật - Thứ bảy)
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
};

export type Service = {
  id: string;
  name: string;
  price: number;
  duration: number; // phút
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
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
};

export type Review = {
  id: string;
  appointmentId: string;
  customerName: string;
  employeeId: string;
  rating: number; // 1-5
  comment: string;
  reply?: string;
  createdAt: Date;
};

// -------------------- Context --------------------
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

// Helper: generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper: parse time string to minutes
const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// Helper: add minutes to time string
const addMinutes = (time: string, minutes: number): string => {
  const total = timeToMinutes(time) + minutes;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Helper: check if two time ranges overlap
const doTimeRangesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
  return timeToMinutes(start1) < timeToMinutes(end2) && timeToMinutes(start2) < timeToMinutes(end1);
};

// Mock data
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

  // Employee CRUD
  const addEmployee = useCallback((emp: Omit<Employee, 'id'>) => {
    setEmployees(prev => [...prev, { id: generateId(), ...emp }]);
    message.success('Thêm nhân viên thành công');
  }, []);

  const updateEmployee = useCallback((id: string, emp: Omit<Employee, 'id'>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { id, ...emp } : e));
    message.success('Cập nhật nhân viên thành công');
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    // Check if employee has appointments
    const hasAppointments = appointments.some(a => a.employeeId === id && a.status !== 'cancelled');
    if (hasAppointments) {
      message.error('Không thể xóa nhân viên đang có lịch hẹn');
      return;
    }
    setEmployees(prev => prev.filter(e => e.id !== id));
    message.success('Xóa nhân viên thành công');
  }, [appointments]);

  // Service CRUD
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

  // Appointment CRUD
  const addAppointment = useCallback((apt: Omit<Appointment, 'id' | 'createdAt' | 'endTime'> & { startTime: string }) => {
    const service = services.find(s => s.id === apt.serviceId);
    if (!service) {
      message.error('Dịch vụ không tồn tại');
      return;
    }
    const endTime = addMinutes(apt.startTime, service.duration);

    // Check availability
    if (!isTimeSlotAvailable(apt.employeeId, apt.date, apt.startTime, endTime)) {
      message.error('Khung giờ này đã có lịch hẹn hoặc nhân viên không làm việc');
      return;
    }

    // Check max customers per day
    const employee = employees.find(e => e.id === apt.employeeId);
    if (employee) {
      const appointmentsOnDate = appointments.filter(a =>
        a.employeeId === apt.employeeId &&
        a.date === apt.date &&
        a.status !== 'cancelled'
      ).length;
      if (appointmentsOnDate >= employee.maxCustomersPerDay) {
        message.error(`Nhân viên đã đạt giới hạn ${employee.maxCustomersPerDay} khách/ngày`);
        return;
      }
    }

    const newAppointment: Appointment = {
      id: generateId(),
      ...apt,
      endTime,
      createdAt: new Date(),
    };
    setAppointments(prev => [...prev, newAppointment]);
    message.success('Đặt lịch thành công');
  }, [services, employees, appointments]);

  const updateAppointment = useCallback((id: string, apt: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...apt } : a));
    message.success('Cập nhật lịch hẹn thành công');
  }, []);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    message.success('Xóa lịch hẹn thành công');
  }, []);

  // Review CRUD
  const addReview = useCallback((review: Omit<Review, 'id' | 'createdAt'>) => {
    setReviews(prev => [...prev, { id: generateId(), createdAt: new Date(), ...review }]);
    message.success('Đánh giá thành công');
  }, []);

  const updateReview = useCallback((id: string, review: Partial<Review>) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, ...review } : r));
    message.success('Cập nhật đánh giá thành công');
  }, []);

  const deleteReview = useCallback((id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    message.success('Xóa đánh giá thành công');
  }, []);

  const replyToReview = useCallback((reviewId: string, reply: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply } : r));
    message.success('Phản hồi đánh giá thành công');
  }, []);

  // Helper: check if time slot is available
  const isTimeSlotAvailable = useCallback((
    employeeId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): boolean => {
    // Check employee working schedule
    const dayOfWeek = dayjs(date).day(); // 0 = Sunday, 6 = Saturday
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return false;

    const isWorking = employee.workSchedule.some(schedule => {
      if (schedule.dayOfWeek !== dayOfWeek) return false;
      return timeToMinutes(startTime) >= timeToMinutes(schedule.startTime) &&
             timeToMinutes(endTime) <= timeToMinutes(schedule.endTime);
    });
    if (!isWorking) return false;

    // Check overlapping appointments
    const overlapping = appointments.some(apt => {
      if (apt.employeeId !== employeeId) return false;
      if (apt.date !== date) return false;
      if (apt.status === 'cancelled') return false;
      if (excludeAppointmentId && apt.id === excludeAppointmentId) return false;
      return doTimeRangesOverlap(startTime, endTime, apt.startTime, apt.endTime);
    });

    return !overlapping;
  }, [employees, appointments]);

  // Get employee average rating
  const getEmployeeAverageRating = useCallback((employeeId: string): number => {
    const employeeReviews = reviews.filter(r => r.employeeId === employeeId);
    if (employeeReviews.length === 0) return 0;
    const sum = employeeReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / employeeReviews.length;
  }, [reviews]);

  // Appointment statistics
  const getAppointmentStats = useCallback((startDate?: string, endDate?: string) => {
    let filtered = appointments;
    if (startDate && endDate) {
      filtered = appointments.filter(a => a.date >= startDate && a.date <= endDate);
    }
    const total = filtered.length;
    const byStatus = {
      pending: filtered.filter(a => a.status === 'pending').length,
      confirmed: filtered.filter(a => a.status === 'confirmed').length,
      completed: filtered.filter(a => a.status === 'completed').length,
      cancelled: filtered.filter(a => a.status === 'cancelled').length,
    };
    return { total, byStatus };
  }, [appointments]);

  // Revenue statistics
  const getRevenueStats = useCallback((startDate?: string, endDate?: string) => {
    let filtered = appointments.filter(a => a.status === 'completed');
    if (startDate && endDate) {
      filtered = filtered.filter(a => a.date >= startDate && a.date <= endDate);
    }

    const byService: Record<string, number> = {};
    const byEmployee: Record<string, number> = {};

    filtered.forEach(apt => {
      const service = services.find(s => s.id === apt.serviceId);
      if (!service) return;

      byService[apt.serviceId] = (byService[apt.serviceId] || 0) + service.price;
      byEmployee[apt.employeeId] = (byEmployee[apt.employeeId] || 0) + service.price;
    });

    const totalRevenue = filtered.reduce((sum, apt) => {
      const service = services.find(s => s.id === apt.serviceId);
      return sum + (service?.price || 0);
    }, 0);

    return { totalRevenue, byService, byEmployee };
  }, [appointments, services]);

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
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addReview,
    updateReview,
    deleteReview,
    replyToReview,
    isTimeSlotAvailable,
    getEmployeeAverageRating,
    getAppointmentStats,
    getRevenueStats,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

// -------------------- Components --------------------

// Modal wrapper for forms
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

// 1. Employee & Service Management
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

const ServiceManager: React.FC = () => {
  const { services, addService, updateService, deleteService } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const columns = [
    { title: 'Tên dịch vụ', dataIndex: 'name', key: 'name' },
    { title: 'Giá (VNĐ)', dataIndex: 'price', key: 'price', render: (p: number) => p.toLocaleString() },
    { title: 'Thời gian (phút)', dataIndex: 'duration', key: 'duration' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Service) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => { setEditingService(record); setModalVisible(true); }} />
          <Button icon={<DeleteOutlined />} danger onClick={() => deleteService(record.id)} />
        </Space>
      ),
    },
  ];

  const handleSave = (values: any) => {
    if (editingService) {
      updateService(editingService.id, values);
    } else {
      addService(values);
    }
    setModalVisible(false);
    setEditingService(null);
  };

  const formItems = (
    <>
      <Form.Item label="Tên dịch vụ" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Giá (VNĐ)" name="price" rules={[{ required: true }]}>
        <InputNumber min={0} step={1000} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="Thời gian thực hiện (phút)" name="duration" rules={[{ required: true }]}>
        <InputNumber min={5} step={5} />
      </Form.Item>
      <Form.Item label="Mô tả" name="description">
        <Input.TextArea rows={3} />
      </Form.Item>
    </>
  );

  return (
    <Card title="Quản lý dịch vụ">
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
        Thêm dịch vụ
      </Button>
      <Table dataSource={services} columns={columns} rowKey="id" pagination={false} />
      <EditModal
        visible={modalVisible}
        editingItem={editingService}
        onCancel={() => { setModalVisible(false); setEditingService(null); }}
        onSave={handleSave}
        formItems={formItems}
        title={editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}
      />
    </Card>
  );
};

// 2. Appointment Management
const AppointmentManager: React.FC = () => {
  const { employees, services, appointments, addAppointment, updateAppointment, deleteAppointment } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const statusColors = {
    pending: 'orange',
    confirmed: 'blue',
    completed: 'green',
    cancelled: 'red',
  };

  const statusLabels = {
    pending: 'Chờ duyệt',
    confirmed: 'Xác nhận',
    completed: 'Hoàn thành',
    cancelled: 'Hủy',
  };

  const columns = [
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
    { title: 'SĐT', dataIndex: 'customerPhone', key: 'customerPhone' },
    {
      title: 'Nhân viên',
      dataIndex: 'employeeId',
      key: 'employee',
      render: (id: string) => employees.find(e => e.id === id)?.name || id,
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceId',
      key: 'service',
      render: (id: string) => services.find(s => s.id === id)?.name || id,
    },
    { title: 'Ngày', dataIndex: 'date', key: 'date' },
    { title: 'Giờ', dataIndex: 'startTime', key: 'startTime' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s: AppointmentStatus) => <Badge color={statusColors[s]} text={statusLabels[s]} />,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Appointment) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => { setEditingAppointment(record); setModalVisible(true); }} />
          <Button icon={<DeleteOutlined />} danger onClick={() => deleteAppointment(record.id)} />
        </Space>
      ),
    },
  ];

  const handleSave = (values: any) => {
    if (editingAppointment) {
      updateAppointment(editingAppointment.id, values);
    } else {
      addAppointment(values);
    }
    setModalVisible(false);
    setEditingAppointment(null);
  };

  const formItems = (
    <>
      <Form.Item label="Tên khách hàng" name="customerName" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Số điện thoại" name="customerPhone" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Email" name="customerEmail">
        <Input type="email" />
      </Form.Item>
      <Form.Item label="Nhân viên" name="employeeId" rules={[{ required: true }]}>
        <Select placeholder="Chọn nhân viên">
          {employees.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
        </Select>
      </Form.Item>
      <Form.Item label="Dịch vụ" name="serviceId" rules={[{ required: true }]}>
        <Select placeholder="Chọn dịch vụ">
          {services.map(s => <Option key={s.id} value={s.id}>{s.name} - {s.price.toLocaleString()}đ ({s.duration} phút)</Option>)}
        </Select>
      </Form.Item>
      <Form.Item label="Ngày hẹn" name="date" rules={[{ required: true }]}>
        <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="Giờ bắt đầu" name="startTime" rules={[{ required: true }]}>
        <TimePicker format="HH:mm" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="Ghi chú" name="notes">
        <Input.TextArea rows={2} />
      </Form.Item>
      {editingAppointment && (
        <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
          <Select>
            <Option value="pending">Chờ duyệt</Option>
            <Option value="confirmed">Xác nhận</Option>
            <Option value="completed">Hoàn thành</Option>
            <Option value="cancelled">Hủy</Option>
          </Select>
        </Form.Item>
      )}
    </>
  );

  return (
    <Card title="Quản lý lịch hẹn">
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
        Đặt lịch mới
      </Button>
      <Table dataSource={appointments} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      <EditModal
        visible={modalVisible}
        editingItem={editingAppointment}
        onCancel={() => { setModalVisible(false); setEditingAppointment(null); }}
        onSave={handleSave}
        formItems={formItems}
        title={editingAppointment ? 'Sửa lịch hẹn' : 'Đặt lịch hẹn'}
        width={600}
      />
    </Card>
  );
};

// 3. Reviews & Ratings
const ReviewManager: React.FC = () => {
  const { reviews, employees, services, appointments, addReview, updateReview, deleteReview, replyToReview } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  const columns = [
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
    {
      title: 'Nhân viên',
      dataIndex: 'employeeId',
      key: 'employee',
      render: (id: string) => employees.find(e => e.id === id)?.name || id,
    },
    { title: 'Đánh giá', dataIndex: 'rating', key: 'rating', render: (r: number) => <Rate disabled defaultValue={r} /> },
    { title: 'Nhận xét', dataIndex: 'comment', key: 'comment' },
    {
      title: 'Phản hồi',
      key: 'reply',
      render: (_: any, record: Review) => record.reply || 'Chưa phản hồi',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Review) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => { setEditingReview(record); setModalVisible(true); }} />
          <Button onClick={() => { setSelectedReview(record); setReplyText(record.reply || ''); setReplyModalVisible(true); }}>
            Phản hồi
          </Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => deleteReview(record.id)} />
        </Space>
      ),
    },
  ];

  const handleSave = (values: any) => {
    if (editingReview) {
      updateReview(editingReview.id, values);
    } else {
      addReview(values);
    }
    setModalVisible(false);
    setEditingReview(null);
  };

  const handleReply = () => {
    if (selectedReview) {
      replyToReview(selectedReview.id, replyText);
      setReplyModalVisible(false);
      setSelectedReview(null);
      setReplyText('');
    }
  };

  const formItems = (
    <>
      <Form.Item label="Khách hàng" name="customerName" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Nhân viên" name="employeeId" rules={[{ required: true }]}>
        <Select>
          {employees.map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}
        </Select>
      </Form.Item>
      <Form.Item label="Lịch hẹn" name="appointmentId" rules={[{ required: true }]}>
        <Select placeholder="Chọn lịch hẹn đã hoàn thành">
          {appointments.filter(a => a.status === 'completed').map(a => (
            <Option key={a.id} value={a.id}>
              {a.customerName} - {a.date} {a.startTime}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Đánh giá" name="rating" rules={[{ required: true }]}>
        <Rate />
      </Form.Item>
      <Form.Item label="Nhận xét" name="comment" rules={[{ required: true }]}>
        <Input.TextArea rows={3} />
      </Form.Item>
    </>
  );

  return (
    <Card title="Đánh giá dịch vụ">
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
        Thêm đánh giá
      </Button>
      <Table dataSource={reviews} columns={columns} rowKey="id" pagination={false} />
      <EditModal
        visible={modalVisible}
        editingItem={editingReview}
        onCancel={() => { setModalVisible(false); setEditingReview(null); }}
        onSave={handleSave}
        formItems={formItems}
        title={editingReview ? 'Sửa đánh giá' : 'Thêm đánh giá'}
        width={600}
      />
      <Modal
        title="Phản hồi đánh giá"
        visible={replyModalVisible}
        onOk={handleReply}
        onCancel={() => setReplyModalVisible(false)}
      >
        <Input.TextArea rows={4} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Nhập phản hồi..." />
      </Modal>
    </Card>
  );
};

// 4. Statistics & Reports
const Statistics: React.FC = () => {
  const { employees, services, getAppointmentStats, getRevenueStats, getEmployeeAverageRating } = useAppContext();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const stats = useMemo(() => {
    const start = dateRange?.[0]?.format('YYYY-MM-DD');
    const end = dateRange?.[1]?.format('YYYY-MM-DD');
    return {
      appointments: getAppointmentStats(start, end),
      revenue: getRevenueStats(start, end),
    };
  }, [dateRange, getAppointmentStats, getRevenueStats]);

  const employeeRatings = useMemo(() => {
    return employees.map(e => ({
      ...e,
      avgRating: getEmployeeAverageRating(e.id),
    }));
  }, [employees, getEmployeeAverageRating]);

  return (
    <Card title="Thống kê & báo cáo">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card size="small">
          <RangePicker onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])} style={{ marginBottom: 16 }} />
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="Tổng lịch hẹn" value={stats.appointments.total} />
            </Col>
            <Col span={6}>
              <Statistic title="Hoàn thành" value={stats.appointments.byStatus.completed} />
            </Col>
            <Col span={6}>
              <Statistic title="Đã xác nhận" value={stats.appointments.byStatus.confirmed} />
            </Col>
            <Col span={6}>
              <Statistic title="Chờ duyệt" value={stats.appointments.byStatus.pending} />
            </Col>
          </Row>
        </Card>

        <Card size="small" title="Doanh thu">
          <Statistic
            title="Tổng doanh thu"
            value={stats.revenue.totalRevenue}
            precision={0}
            suffix="VNĐ"
            prefix={<DollarOutlined />}
          />
          <Title level={5}>Theo dịch vụ</Title>
          <ul>
            {services.map(s => (
              <li key={s.id}>{s.name}: {((stats.revenue.byService[s.id] || 0)).toLocaleString()} VNĐ</li>
            ))}
          </ul>
          <Title level={5}>Theo nhân viên</Title>
          <ul>
            {employees.map(e => (
              <li key={e.id}>{e.name}: {((stats.revenue.byEmployee[e.id] || 0)).toLocaleString()} VNĐ</li>
            ))}
          </ul>
        </Card>

        <Card size="small" title="Đánh giá nhân viên">
          <Table
            dataSource={employeeRatings}
            columns={[
              { title: 'Nhân viên', dataIndex: 'name', key: 'name' },
              { title: 'Đánh giá trung bình', key: 'rating', render: (_: any, r: any) => <Rate disabled defaultValue={r.avgRating} allowHalf /> },
            ]}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </Space>
    </Card>
  );
};

// -------------------- Main App --------------------
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
            <TabPane tab="Dịch vụ" key="2">
              <ServiceManager />
            </TabPane>
            <TabPane tab="Lịch hẹn" key="3">
              <AppointmentManager />
            </TabPane>
            <TabPane tab="Đánh giá" key="4">
              <ReviewManager />
            </TabPane>
            <TabPane tab="Thống kê" key="5">
              <Statistics />
            </TabPane>
          </Tabs>
        </Content>
      </Layout>
    </AppProvider>
  );
};

export default App;
