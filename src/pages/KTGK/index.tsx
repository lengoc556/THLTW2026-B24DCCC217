import React, { useState, useMemo } from 'react';
import {Table,Button,Input,Select,Space,Modal,Form,InputNumber,Popconfirm,message,Typography} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;


export type RoomType = 'Lý thuyết' | 'Thực hành' | 'Hội trường';

export interface Room {
  id: string; 
  name: string;
  capacity: number; 
  type: RoomType; 
  manager: string;
}

const MOCK_MANAGERS = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Văn D'];

const INITIAL_ROOMS: Room[] = [
  { id: 'P101', name: 'Phòng học 101', capacity: 40, type: 'Lý thuyết', manager: 'Nguyễn Văn A' },
  { id: 'P102', name: 'Phòng Lab 1', capacity: 25, type: 'Thực hành', manager: 'Trần Thị B' },
  { id: 'HT01', name: 'Hội trường A', capacity: 150, type: 'Hội trường', manager: 'Lê Văn C' },
];

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<RoomType | undefined>(undefined);
  const [filterManager, setFilterManager] = useState<string | undefined>(undefined);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form] = Form.useForm();

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchSearch =
        room.id.toLowerCase().includes(searchText.toLowerCase()) ||
        room.name.toLowerCase().includes(searchText.toLowerCase());
      const matchType = filterType ? room.type === filterType : true;
      const matchManager = filterManager ? room.manager === filterManager : true;

      return matchSearch && matchType && matchManager;
    });
  }, [rooms, searchText, filterType, filterManager]);

  const columns: ColumnsType<Room> = [
    { title: 'Mã phòng', dataIndex: 'id', key: 'id' },
    { title: 'Tên phòng', dataIndex: 'name', key: 'name' },
    {
      title: 'Số chỗ ngồi',
      dataIndex: 'capacity',
      key: 'capacity',
      sorter: (a, b) => a.capacity - b.capacity,
    },
    { title: 'Loại phòng', dataIndex: 'type', key: 'type' },
    { title: 'Người phụ trách', dataIndex: 'manager', key: 'manager' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => {
        const canDelete = record.capacity < 30; 

        return (
          <Space size="middle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
              style={{ color: '#1890ff' }}
            >
              Sửa
            </Button>
            {canDelete ? (
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa phòng này?"
                onConfirm={() => handleDelete(record.id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="text" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            ) : (
              <Button type="text" danger disabled title="Chỉ được xóa phòng dưới 30 chỗ ngồi">
                Xóa
              </Button>
            )}
          </Space>
        );
      },
    },
  ];


  const handleOpenModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      form.setFieldsValue(room);
    } else {
      setEditingRoom(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setRooms(rooms.filter((room) => room.id !== id));
    message.success('Xóa phòng học thành công!');
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingRoom) {
        setRooms(
          rooms.map((room) => (room.id === editingRoom.id ? { ...room, ...values, id: editingRoom.id } : room))
        );
        message.success('Cập nhật phòng học thành công!');
      } else {
        setRooms([...rooms, values as Room]);
        message.success('Thêm phòng học thành công!');
      }
      setIsModalVisible(false);
    });
  };

  const checkDuplicateId = (_: any, value: string) => {
    if (!value) return Promise.resolve();
    const isDuplicate = rooms.some((room) => room.id === value && room.id !== editingRoom?.id);
    if (isDuplicate) return Promise.reject(new Error('Mã phòng đã tồn tại!'));
    return Promise.resolve();
  };

  const checkDuplicateName = (_: any, value: string) => {
    if (!value) return Promise.resolve();
    const isDuplicate = rooms.some((room) => room.name === value && room.id !== editingRoom?.id);
    if (isDuplicate) return Promise.reject(new Error('Tên phòng đã tồn tại!'));
    return Promise.resolve();
  };

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      <Title level={3}>Quản lý phòng học</Title>

      {/* --- Thanh Công cụ --- */}
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Input
            placeholder="Tìm mã hoặc tên phòng"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Lọc theo loại phòng"
            style={{ width: 180 }}
            allowClear
            onChange={(value) => setFilterType(value)}
          >
            <Option value="Lý thuyết">Lý thuyết</Option>
            <Option value="Thực hành">Thực hành</Option>
            <Option value="Hội trường">Hội trường</Option>
          </Select>
          <Select
            placeholder="Lọc người phụ trách"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => setFilterManager(value)}
          >
            {MOCK_MANAGERS.map((manager) => (
              <Option key={manager} value={manager}>
                {manager}
              </Option>
            ))}
          </Select>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Thêm phòng học
        </Button>
      </Space>

      {}
      <Table
        columns={columns}
        dataSource={filteredRooms}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
      />

      {}
      <Modal
        title={editingRoom ? 'Chỉnh sửa phòng học' : 'Thêm phòng học'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="id"
            label="Mã phòng"
            rules={[
              { required: true, message: 'Vui lòng nhập mã phòng!' },
              { max: 10, message: 'Mã phòng tối đa 10 ký tự!' },
              { validator: checkDuplicateId },
            ]}
          >
            <Input disabled={!!editingRoom} placeholder="Nhập mã phòng" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên phòng"
            rules={[
              { required: true, message: 'Vui lòng nhập tên phòng!' },
              { max: 50, message: 'Tên phòng tối đa 50 ký tự!' },
              { validator: checkDuplicateName },
            ]}
          >
            <Input placeholder="Nhập tên phòng" />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Số chỗ ngồi"
            rules={[
              { required: true, message: 'Vui lòng nhập số chỗ ngồi!' },
            ]}
          >
            <InputNumber
              min={10}
              max={200}
              style={{ width: '100%' }}
              placeholder="Nhập số chỗ ngồi (10 - 200)"
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại phòng"
            rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]}
          >
            <Select placeholder="Chọn loại phòng">
              <Option value="Lý thuyết">Lý thuyết</Option>
              <Option value="Thực hành">Thực hành</Option>
              <Option value="Hội trường">Hội trường</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="manager"
            label="Người phụ trách"
            rules={[{ required: true, message: 'Vui lòng chọn người phụ trách!' }]}
          >
            <Select placeholder="Chọn người phụ trách">
              {MOCK_MANAGERS.map((manager) => (
                <Option key={manager} value={manager}>
                  {manager}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomManagement;