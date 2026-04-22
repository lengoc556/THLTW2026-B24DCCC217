import React, { useState, useEffect, useMemo } from 'react';
import {
  Layout, Menu, Card, Tag, Input, Pagination, Row, Col, Typography,
  Table, Button, Space, Modal, Form, Select, Popconfirm, message, Avatar, Divider
} from 'antd';
import {
  HomeOutlined, UserOutlined, SettingOutlined, EditOutlined,
  DeleteOutlined, PlusOutlined, TagsOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Header, Content, Sider } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;


type ArticleStatus = 'Draft' | 'Published';

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string; 
  imageUrl: string;
  tags: string[];
  status: ArticleStatus;
  views: number;
  createdAt: string;
  author: string;
}


const MOCK_TAGS = ['React', 'TypeScript', 'Ant Design', 'Frontend'];
const INITIAL_ARTICLES: Article[] = [
  {
    id: '1', title: 'Học React cơ bản', slug: 'hoc-react-co-ban', summary: 'Tóm tắt bài học React...',
    content: '## React là gì? \nReact JS là một thư viện JavaScript mạnh mẽ giúp xây dựng giao diện người dùng (UI) động và phức tạp một cách hiệu quả và linh hoạt, cho phép tạo ra các ứng dụng web tương tác và trải nghiệm người dùng mượt mà hơn. Với khả năng tái sử dụng component và cơ chế Virtual DOM, React JS hỗ trợ phát triển các ứng dụng web nhanh chóng và hiệu suất cao, giúp cung cấp trải nghiệm tốt hơn cho người dùng. Trong bài viết này, mình sẽ hướng dẫn bạn tìm hiểu React JS là gì và khám phá mọi thứ cần biết về phần mềm React JS, từ những khái niệm cơ bản đến các ứng dụng thực tế.',
    imageUrl: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
    tags: ['React', 'Frontend'], status: 'Published', views: 120, createdAt: '2023-10-01', author: 'Dev Admin'
  },
  {
    id: '2', title: 'TypeScript cho người mới', slug: 'ts-cho-nguoi-moi', summary: 'Tìm hiểu TS...',
    content: '## Nội dung bài viết TS \nChi tiết...',
    imageUrl: 'https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png',
    tags: ['TypeScript', 'Frontend'], status: 'Published', views: 50, createdAt: '2023-10-05', author: 'Dev Admin'
  },
  {
    id: '3', title: 'Bản nháp Ant Design', slug: 'ban-nhap-antd', summary: 'Đang viết...',
    content: 'Chưa có nội dung', imageUrl: '',
    tags: ['Ant Design'], status: 'Draft', views: 0, createdAt: '2023-10-10', author: 'Dev Admin'
  }
];

const BlogApp: React.FC = () => {
  // State toàn cục
  const [currentView, setCurrentView] = useState<string>('home'); // home, detail, about, admin-articles, admin-tags
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [tags] = useState<string[]>(MOCK_TAGS);
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);

  const ClientView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedSearch(searchTerm);
      }, 300);
      return () => clearTimeout(handler);
    }, [searchTerm]);

    const filteredArticles = useMemo(() => {
      let result = articles.filter(a => a.status === 'Published');
      if (debouncedSearch) {
        result = result.filter(a => a.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
      }
      if (selectedTag) {
        result = result.filter(a => a.tags.includes(selectedTag));
      }
      return result;
    }, [articles, debouncedSearch, selectedTag]);

    const pageSize = 9;
    const paginatedArticles = filteredArticles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleReadArticle = (article: Article) => {
      const updatedArticles = articles.map(a => a.id === article.id ? { ...a, views: a.views + 1 } : a);
      setArticles(updatedArticles);
      setViewingArticle({ ...article, views: article.views + 1 });
      setCurrentView('detail');
    };

    if (currentView === 'detail' && viewingArticle) {
      const relatedArticles = articles.filter(
        a => a.id !== viewingArticle.id && a.status === 'Published' && a.tags.some(t => viewingArticle.tags.includes(t))
      ).slice(0, 3);

      return (
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto', background: '#fff' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => setCurrentView('home')} style={{ marginBottom: 16 }}>
            Quay lại
          </Button>
          <Title>{viewingArticle.title}</Title>
          <Space split={<Divider type="vertical" />} style={{ marginBottom: 24, color: '#888' }}>
            <Text>{viewingArticle.author}</Text>
            <Text>{viewingArticle.createdAt}</Text>
            <Text>{viewingArticle.views} lượt xem</Text>
          </Space>
          <div style={{ marginBottom: 24 }}>
            {viewingArticle.tags.map(tag => <Tag color="blue" key={tag}>{tag}</Tag>)}
          </div>
          <img src={viewingArticle.imageUrl} alt="cover" style={{ width: '100%', borderRadius: 8, marginBottom: 24 }} />
          {/* Nơi render Markdown thật. Hiện tại dùng pre-wrap để hiển thị text thô */}
          <div style={{ whiteSpace: 'pre-wrap', fontSize: 16, lineHeight: 1.6 }}>
            {viewingArticle.content}
          </div>
          
          <Divider />
          <Title level={4}>Bài viết liên quan</Title>
          <Row gutter={[16, 16]}>
            {relatedArticles.map(a => (
              <Col span={8} key={a.id}>
                <Card hoverable onClick={() => handleReadArticle(a)} cover={<img alt="cover" src={a.imageUrl} style={{ height: 120, objectFit: 'cover' }} />}>
                  <Card.Meta title={a.title} />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      );
    }

    if (currentView === 'about') {
      return (
        <div style={{ padding: 24, maxWidth: 600, margin: '0 auto', textAlign: 'center', background: '#fff', borderRadius: 8 }}>
          <Avatar size={120} src="https://joeschmoe.io/api/v1/random" style={{ marginBottom: 16 }} />
          <Title level={2}>Dev Admin</Title>
          <Paragraph style={{ fontSize: 16 }}>
            Xin chào! Tôi là một lập trình viên đam mê công nghệ, chuyên về React và hệ sinh thái Frontend. 
            Blog này là nơi tôi chia sẻ kiến thức và hành trình học tập của mình.
          </Paragraph>
          <Space>
            {['React', 'TypeScript', 'NodeJS', 'UI/UX'].map(skill => <Tag color="cyan" key={skill}>{skill}</Tag>)}
          </Space>
        </div>
      );
    }

    return (
      <div style={{ padding: 24 }}>
        <Row justify="space-between" style={{ marginBottom: 24 }}>
          <Col>
            <Space>
              <Tag.CheckableTag checked={selectedTag === null} onChange={() => setSelectedTag(null)}>Tất cả</Tag.CheckableTag>
              {tags.map(tag => (
                <Tag.CheckableTag key={tag} checked={selectedTag === tag} onChange={(checked) => setSelectedTag(checked ? tag : null)}>
                  {tag}
                </Tag.CheckableTag>
              ))}
            </Space>
          </Col>
          <Col>
            <Input
              placeholder="Tìm kiếm bài viết..."
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 250 }}
            />
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {paginatedArticles.map(article => (
            <Col xs={24} sm={12} md={8} key={article.id}>
              <Card
                hoverable
                onClick={() => handleReadArticle(article)}
                cover={<img alt="cover" src={article.imageUrl} style={{ height: 200, objectFit: 'cover' }} />}
              >
                <Card.Meta
                  title={article.title}
                  description={
                    <div>
                      <Paragraph ellipsis={{ rows: 2 }}>{article.summary}</Paragraph>
                      <Space size={[0, 4]} wrap>
                        {article.tags.map(tag => <Tag color="blue" key={tag}>{tag}</Tag>)}
                      </Space>
                      <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
                        {article.createdAt} • {article.views} views
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
        
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Pagination current={currentPage} total={filteredArticles.length} pageSize={pageSize} onChange={setCurrentPage} />
        </div>
      </div>
    );
  };

  // --- COMPONENT: QUẢN LÝ BÀI VIẾT (ADMIN) ---
  const AdminArticles = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState<ArticleStatus | undefined>(undefined);

    const columns: ColumnsType<Article> = [
      { title: 'Tiêu đề', dataIndex: 'title', key: 'title', width: '30%' },
      { 
        title: 'Trạng thái', dataIndex: 'status', key: 'status',
        render: (status) => <Tag color={status === 'Published' ? 'green' : 'default'}>{status}</Tag> 
      },
      { 
        title: 'Thẻ', dataIndex: 'tags', key: 'tags',
        render: (tags: string[]) => tags.map(t => <Tag key={t}>{t}</Tag>) 
      },
      { title: 'Lượt xem', dataIndex: 'views', key: 'views', sorter: (a, b) => a.views - b.views },
      { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt' },
      {
        title: 'Hành động', key: 'action',
        render: (_, record) => (
          <Space size="middle">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
            <Popconfirm title="Xóa bài viết này?" onConfirm={() => handleDelete(record.id)}>
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ];

    const filteredData = articles.filter(a => {
      const matchTitle = a.title.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = filterStatus ? a.status === filterStatus : true;
      return matchTitle && matchStatus;
    });

    const handleEdit = (record: Article) => {
      setEditingId(record.id);
      form.setFieldsValue(record);
      setIsModalVisible(true);
    };

    const handleDelete = (id: string) => {
      setArticles(articles.filter(a => a.id !== id));
      message.success('Đã xóa bài viết');
    };

    const handleSave = () => {
      form.validateFields().then(values => {
        if (editingId) {
          setArticles(articles.map(a => a.id === editingId ? { ...a, ...values } : a));
          message.success('Đã cập nhật bài viết');
        } else {
          const newArticle = {
            ...values,
            id: Date.now().toString(),
            views: 0,
            createdAt: new Date().toISOString().split('T')[0],
            author: 'Dev Admin'
          };
          setArticles([newArticle, ...articles]);
          message.success('Đã thêm bài viết mới');
        }
        setIsModalVisible(false);
      });
    };

    return (
      <div style={{ padding: 24, background: '#fff' }}>
        <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Input.Search placeholder="Tìm theo tiêu đề" onSearch={setSearchText} style={{ width: 250 }} allowClear />
            <Select placeholder="Lọc trạng thái" style={{ width: 150 }} allowClear onChange={setFilterStatus}>
              <Option value="Published">Đã đăng</Option>
              <Option value="Draft">Nháp</Option>
            </Select>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditingId(null); setIsModalVisible(true); }}>
            Thêm bài viết
          </Button>
        </Space>

        <Table columns={columns} dataSource={filteredData} rowKey="id" />

        <Modal title={editingId ? 'Sửa bài viết' : 'Thêm bài viết'} visible={isModalVisible} onOk={handleSave} onCancel={() => setIsModalVisible(false)} width={800}>
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="slug" label="Slug" rules={[{ required: true }]}><Input /></Form.Item>
              </Col>
            </Row>
            <Form.Item name="summary" label="Tóm tắt"><Input.TextArea rows={2} /></Form.Item>
            <Form.Item name="content" label="Nội dung (Markdown)" rules={[{ required: true }]}><Input.TextArea rows={6} /></Form.Item>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="imageUrl" label="Ảnh đại diện (URL)"><Input /></Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="tags" label="Thẻ (Tags)">
                  <Select mode="tags" placeholder="Chọn hoặc nhập thẻ">
                    {tags.map(t => <Option key={t} value={t}>{t}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                  <Select><Option value="Draft">Nháp</Option><Option value="Published">Đã đăng</Option></Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  };

  // --- COMPONENT: QUẢN LÝ THẺ (TAGS) ---
  const AdminTags = () => {
    const tagData = tags.map(t => ({
      name: t,
      usageCount: articles.filter(a => a.tags.includes(t)).length
    }));

    return (
      <div style={{ padding: 24, background: '#fff' }}>
        <Title level={4}>Quản lý thẻ</Title>
        <Table 
          columns={[
            { title: 'Tên thẻ', dataIndex: 'name', key: 'name' },
            { title: 'Số bài viết đang dùng', dataIndex: 'usageCount', key: 'usageCount' },
            { 
              title: 'Hành động', key: 'action', 
              render: (_, record) => (
                <Button danger type="text" disabled={record.usageCount > 0} title={record.usageCount > 0 ? "Không thể xóa thẻ đang được sử dụng" : ""}>
                  Xóa
                </Button>
              )
            }
          ]} 
          dataSource={tagData} 
          rowKey="name" 
        />
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={250}>
        <div style={{ height: 64, margin: 16, textAlign: 'center', fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
          My Blog
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentView.startsWith('admin') ? currentView : (currentView === 'detail' ? 'home' : currentView)]}
          onClick={(e) => setCurrentView(e.key)}
          items={[
            { key: 'home', icon: <HomeOutlined />, label: 'Trang chủ' },
            { key: 'about', icon: <UserOutlined />, label: 'Giới thiệu' },
            { type: 'divider' },
            { 
              key: 'adminGroup', label: 'Quản trị (Admin)', icon: <SettingOutlined />,
              children: [
                { key: 'admin-articles', icon: <EditOutlined />, label: 'Quản lý bài viết' },
                { key: 'admin-tags', icon: <TagsOutlined />, label: 'Quản lý thẻ' },
              ]
            }
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <Title level={4} style={{ margin: '16px 0' }}>
            {currentView === 'home' && 'Bài viết mới nhất'}
            {currentView === 'detail' && 'Đọc bài viết'}
            {currentView === 'about' && 'Thông tin tác giả'}
            {currentView === 'admin-articles' && 'Quản trị - Bài viết'}
            {currentView === 'admin-tags' && 'Quản trị - Thẻ (Tags)'}
          </Title>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          {['home', 'detail', 'about'].includes(currentView) && <ClientView />}
          {currentView === 'admin-articles' && <AdminArticles />}
          {currentView === 'admin-tags' && <AdminTags />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default BlogApp;