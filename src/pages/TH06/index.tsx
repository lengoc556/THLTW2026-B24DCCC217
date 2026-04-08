// App.tsx
import React, { useState, useMemo } from 'react';
import { Layout, Card, Row, Col, Input, Select, Rate, Button, Tag, Empty, Drawer, Grid, Checkbox, Radio, Slider, Popover, Typography } from 'antd';
import { EnvironmentOutlined, DollarOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

const { Header, Content } = Layout;
const { Meta } = Card;
const { useBreakpoint } = Grid;

// Dữ liệu mẫu
const destinations = [
  { id: '1', name: 'Vịnh Hạ Long', location: 'Quảng Ninh', type: 'beach', rating: 4.8, priceRange: 'medium', image: 'https://picsum.photos/300/200?random=1', description: 'Kỳ quan thiên nhiên thế giới' },
  { id: '2', name: 'Sapa', location: 'Lào Cai', type: 'mountain', rating: 4.7, priceRange: 'low', image: 'https://picsum.photos/300/200?random=2', description: 'Thị trấn mờ sương' },
  { id: '3', name: 'Đà Nẵng', location: 'Đà Nẵng', type: 'city', rating: 4.6, priceRange: 'medium', image: 'https://picsum.photos/300/200?random=3', description: 'Thành phố đáng sống' },
  { id: '4', name: 'Phú Quốc', location: 'Kiên Giang', type: 'beach', rating: 4.5, priceRange: 'high', image: 'https://picsum.photos/300/200?random=4', description: 'Đảo ngọc' },
  { id: '5', name: 'Hội An', location: 'Quảng Nam', type: 'city', rating: 4.9, priceRange: 'low', image: 'https://picsum.photos/300/200?random=5', description: 'Phố cổ đèn lồng' },
  { id: '6', name: 'Đà Lạt', location: 'Lâm Đồng', type: 'mountain', rating: 4.4, priceRange: 'low', image: 'https://picsum.photos/300/200?random=6', description: 'Thành phố ngàn hoa' },
];

const typeLabels = { beach: 'Biển', mountain: 'Núi', city: 'Thành phố', countryside: 'Miền quê' };
const priceLabels = { low: '€', medium: '€€', high: '€€€', luxury: '€€€€' };

const App = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string[]>([]);
  const [filterPrice, setFilterPrice] = useState<string>('all');
  const [minRating, setMinRating] = useState(0);
  const [mobileFilterVisible, setMobileFilterVisible] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Lọc và sắp xếp
  const filtered = useMemo(() => {
    let result = destinations.filter(d => 
      (search === '' || d.name.toLowerCase().includes(search.toLowerCase()) || d.location.toLowerCase().includes(search.toLowerCase())) &&
      (filterType.length === 0 || filterType.includes(d.type)) &&
      (filterPrice === 'all' || d.priceRange === filterPrice) &&
      d.rating >= minRating
    );
    return result.sort((a, b) => b.rating - a.rating);
  }, [search, filterType, filterPrice, minRating]);

  // Component Card điểm đến
  const DestinationCard = ({ d }: { d: typeof destinations[0] }) => (
    <Card
      hoverable
      cover={<img alt={d.name} src={d.image} style={{ height: 200, objectFit: 'cover' }} />}
      style={{ height: '100%' }}
    >
      <Meta
        title={<div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{d.name}</span>
          <span style={{ color: '#d4af37' }}>{priceLabels[d.priceRange]}</span>
        </div>}
        description={
          <div>
            <div><EnvironmentOutlined /> {d.location}</div>
            <Rate disabled defaultValue={d.rating} style={{ fontSize: 12, margin: '8px 0' }} />
            <Tag color="blue">{typeLabels[d.type]}</Tag>
            <Paragraph ellipsis={{ rows: 2 }} style={{ fontSize: 12, marginTop: 8 }}>{d.description}</Paragraph>
          </div>
        }
      />
    </Card>
  );

  // Nội dung bộ lọc
  const FilterContent = () => (
    <div>
      <div><strong>Loại hình</strong></div>
      <Checkbox.Group options={[
        { label: '🏖️ Biển', value: 'beach' },
        { label: '⛰️ Núi', value: 'mountain' },
        { label: '🏙️ Thành phố', value: 'city' },
      ]} onChange={setFilterType} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, marginBottom: 16 }} />

      <div><strong>Ngân sách</strong></div>
      <Radio.Group onChange={e => setFilterPrice(e.target.value)} value={filterPrice} style={{ marginTop: 8, marginBottom: 16, display: 'flex', gap: 8 }}>
        <Radio value="all">Tất cả</Radio><Radio value="low">€</Radio><Radio value="medium">€€</Radio><Radio value="high">€€€</Radio>
      </Radio.Group>

      <div><strong>Đánh giá ≥</strong></div>
      <Slider min={0} max={5} step={0.5} value={minRating} onChange={setMinRating} style={{ marginTop: 8 }} />
    </div>
  );

  return (
    <Layout>
      <Header style={{ background: '#1890ff', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ color: 'white', margin: 0 }}>🌍 Travel Planner</h2>
        {isMobile && <Button icon={<FilterOutlined />} style={{ background: 'white' }} onClick={() => setMobileFilterVisible(true)} />}
      </Header>

      <Content style={{ padding: isMobile ? 16 : 24, background: '#f0f2f5' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1>Khám phá điểm đến</h1>
          <p>Hàng ngàn điểm đến đang chờ bạn</p>
        </div>

        {/* Thanh tìm kiếm và lọc */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <Input.Search placeholder="Tìm theo tên, địa điểm..." enterButton={<SearchOutlined />} onSearch={setSearch} size="large" />
          </Col>
          <Col xs={12} md={6}>
            <Select placeholder="Sắp xếp" style={{ width: '100%' }} size="large" defaultValue="rating">
              <Option value="rating">Đánh giá cao nhất</Option>
              <Option value="price-asc">Giá thấp đến cao</Option>
              <Option value="name">Tên A-Z</Option>
            </Select>
          </Col>
          <Col xs={12} md={6}>
            {!isMobile ? (
              <Popover content={<FilterContent />} title="Lọc điểm đến" trigger="click" placement="bottomRight">
                <Button icon={<FilterOutlined />} size="large" block>Lọc</Button>
              </Popover>
            ) : (
              <Button icon={<FilterOutlined />} size="large" block onClick={() => setMobileFilterVisible(true)}>Lọc</Button>
            )}
          </Col>
        </Row>

        {/* Danh sách điểm đến */}
        {filtered.length === 0 ? (
          <Empty description="Không tìm thấy điểm đến" />
        ) : (
          <Row gutter={[16, 16]}>
            {filtered.map(d => (
              <Col xs={24} sm={12} md={8} lg={6} key={d.id}>
                <DestinationCard d={d} />
              </Col>
            ))}
          </Row>
        )}
      </Content>

      {/* Drawer lọc trên mobile */}
      <Drawer title="Lọc điểm đến" placement="bottom" height="auto" open={mobileFilterVisible} onClose={() => setMobileFilterVisible(false)}>
        <FilterContent />
        <Button type="primary" block style={{ marginTop: 16 }} onClick={() => setMobileFilterVisible(false)}>Áp dụng</Button>
      </Drawer>
    </Layout>
  );
};

export default App;