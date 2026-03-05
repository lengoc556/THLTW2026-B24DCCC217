import React, { useMemo, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Popconfirm, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

type Product = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

const initialData: Product[] = [
  { id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
  { id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
  { id: 3, name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', price: 18000000, quantity: 12 },
  { id: 5, name: 'MacBook Air M3', price: 28000000, quantity: 8 },
];

const IndexPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialData);
  const [search, setSearch] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [form] = Form.useForm<Product>();

  // Lọc theo tên (không phân biệt hoa thường), realtime
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      render: (_: any, __: Product, idx: number) => idx + 1,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      render: (v: number) => v.toLocaleString('vi-VN'),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      width: 140,
      render: (_: any, record: Product) => (
        <Popconfirm
          title="Xác nhận xóa sản phẩm?"
          okText="Xóa"
          cancelText="Hủy"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  const handleDelete = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    message.success('Xóa sản phẩm thành công');
  };

  const handleOpen = () => {
    form.resetFields();
    setOpen(true);
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      const newItem: Product = {
        id: Date.now(), // mock id
        name: values.name,
        price: values.price,
        quantity: values.quantity,
      };
      setProducts(prev => [newItem, ...prev]);
      setOpen(false);
      message.success('Thêm sản phẩm thành công');
    } catch {
      // validation error -> do nothing
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          allowClear
          placeholder="Tìm kiếm theo tên sản phẩm..."
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 320 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpen}>
          Thêm sản phẩm
        </Button>
      </Space>

      <Table
        rowKey="id"
        dataSource={filtered}
        columns={columns}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title="Thêm sản phẩm mới"
        visible={open}
        onOk={handleAdd}
        onCancel={() => setOpen(false)}
        okText="Thêm"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input placeholder="Ví dụ: Tai nghe Bluetooth" />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="price"
            rules={[
              { required: true, message: 'Vui lòng nhập giá' },
              {
                validator: (_, value) =>
                  value > 0
                    ? Promise.resolve()
                    : Promise.reject(new Error('Giá phải là số dương')),
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              step={1000}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => Number((v || '').replace(/,/g, '')) as any}
            />
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              {
                validator: (_, value) =>
                  Number.isInteger(value) && value > 0
                    ? Promise.resolve()
                    : Promise.reject(new Error('Số lượng phải là số nguyên dương')),
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} step={1} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IndexPage;
