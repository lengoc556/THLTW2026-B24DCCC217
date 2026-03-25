import { useState, useMemo, useRef } from "react";
import {
  Layout, Menu, Button, Table, Modal, Form, Input, Select,
  InputNumber, Tag, Space, Card, Typography, Drawer,
  Divider, Row, Col, Statistic, message, Popconfirm,
  Tooltip, DatePicker, Alert, Badge, Descriptions, Steps,
  Result, Tabs, Empty, InputRef
} from "antd";
import {
  BookOutlined, FileTextOutlined, SettingOutlined, SearchOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  SafetyCertificateOutlined, AuditOutlined, FormOutlined,
  BarChartOutlined, IdcardOutlined, CalendarOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined,
  FolderOpenOutlined, ArrowRightOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// ─── TYPES ───────────────────────────────────────────────────────────────────
type FieldType = "String" | "Number" | "Date";

interface CustomField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
}

interface DiplomaBook {
  id: string;
  year: number;
  name: string;
  currentSeq: number; // auto-increment counter
}

interface Decision {
  id: string;
  bookId: string;
  decisionNo: string;    // Số QĐ
  issueDate: string;     // Ngày ban hành
  summary: string;       // Trích yếu
  lookupCount: number;   // Số lượt tra cứu
}

interface DiplomaRecord {
  id: string;
  seqNo: number;         // Số vào sổ (auto)
  diplomaNo: string;     // Số hiệu văn bằng
  studentId: string;     // Mã sinh viên
  fullName: string;
  birthDate: string;
  decisionId: string;
  bookId: string;
  customValues: Record<string, string>; // fieldId -> value
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_FIELDS: CustomField[] = [
  { id: "cf1", name: "Dân tộc", type: "String", required: false },
  { id: "cf2", name: "Nơi sinh", type: "String", required: false },
  { id: "cf3", name: "Điểm trung bình", type: "Number", required: true },
  { id: "cf4", name: "Xếp loại tốt nghiệp", type: "String", required: true },
  { id: "cf5", name: "Hệ đào tạo", type: "String", required: true },
  { id: "cf6", name: "Ngành học", type: "String", required: true },
  { id: "cf7", name: "Ngày nhập học", type: "Date", required: false },
];

const SEED_BOOKS: DiplomaBook[] = [
  { id: "bk2023", year: 2023, name: "Sổ văn bằng năm 2023", currentSeq: 3 },
  { id: "bk2024", year: 2024, name: "Sổ văn bằng năm 2024", currentSeq: 5 },
];

const SEED_DECISIONS: Decision[] = [
  { id: "d1", bookId: "bk2023", decisionNo: "QĐ-125/2023", issueDate: "2023-06-15", summary: "Công nhận tốt nghiệp đợt 1 năm 2023", lookupCount: 42 },
  { id: "d2", bookId: "bk2023", decisionNo: "QĐ-310/2023", issueDate: "2023-12-20", summary: "Công nhận tốt nghiệp đợt 2 năm 2023", lookupCount: 18 },
  { id: "d3", bookId: "bk2024", decisionNo: "QĐ-087/2024", issueDate: "2024-06-10", summary: "Công nhận tốt nghiệp đợt 1 năm 2024", lookupCount: 31 },
  { id: "d4", bookId: "bk2024", decisionNo: "QĐ-201/2024", issueDate: "2024-12-18", summary: "Công nhận tốt nghiệp đợt 2 năm 2024", lookupCount: 7 },
];

const SEED_RECORDS: DiplomaRecord[] = [
  { id: "r1", seqNo: 1, diplomaNo: "TN-2023-001", studentId: "SV20190001", fullName: "Nguyễn Thị Hoa", birthDate: "2001-03-15", decisionId: "d1", bookId: "bk2023",
    customValues: { cf1:"Kinh", cf2:"Hà Nội", cf3:"3.52", cf4:"Giỏi", cf5:"Chính quy", cf6:"Công nghệ thông tin", cf7:"2019-09-01" } },
  { id: "r2", seqNo: 2, diplomaNo: "TN-2023-002", studentId: "SV20190045", fullName: "Trần Văn Minh", birthDate: "2001-07-22", decisionId: "d1", bookId: "bk2023",
    customValues: { cf1:"Tày", cf2:"Cao Bằng", cf3:"2.87", cf4:"Khá", cf5:"Chính quy", cf6:"Kế toán", cf7:"2019-09-01" } },
  { id: "r3", seqNo: 3, diplomaNo: "TN-2023-003", studentId: "SV20190123", fullName: "Lê Thị Lan Anh", birthDate: "2000-11-08", decisionId: "d2", bookId: "bk2023",
    customValues: { cf1:"Kinh", cf2:"TP. Hồ Chí Minh", cf3:"3.78", cf4:"Xuất sắc", cf5:"Chính quy", cf6:"Quản trị kinh doanh", cf7:"2019-09-01" } },
  { id: "r4", seqNo: 1, diplomaNo: "TN-2024-001", studentId: "SV20200011", fullName: "Phạm Đức Hùng", birthDate: "2002-05-30", decisionId: "d3", bookId: "bk2024",
    customValues: { cf1:"Kinh", cf2:"Đà Nẵng", cf3:"3.21", cf4:"Giỏi", cf5:"Chính quy", cf6:"Công nghệ thông tin", cf7:"2020-09-01" } },
  { id: "r5", seqNo: 2, diplomaNo: "TN-2024-002", studentId: "SV20200055", fullName: "Hoàng Thị Thu", birthDate: "2002-01-14", decisionId: "d3", bookId: "bk2024",
    customValues: { cf1:"Mường", cf2:"Hòa Bình", cf3:"2.65", cf4:"Trung bình", cf5:"Chính quy", cf6:"Luật", cf7:"2020-09-01" } },
  { id: "r6", seqNo: 3, diplomaNo: "TN-2024-003", studentId: "SV20200099", fullName: "Vũ Thanh Tùng", birthDate: "2001-09-25", decisionId: "d4", bookId: "bk2024",
    customValues: { cf1:"Kinh", cf2:"Hải Phòng", cf3:"3.45", cf4:"Giỏi", cf5:"Chính quy", cf6:"Kỹ thuật điện", cf7:"2020-09-01" } },
  { id: "r7", seqNo: 4, diplomaNo: "TN-2024-004", studentId: "SV20200102", fullName: "Đặng Thị Hằng", birthDate: "2002-04-18", decisionId: "d4", bookId: "bk2024",
    customValues: { cf1:"Thái", cf2:"Sơn La", cf3:"3.01", cf4:"Khá", cf5:"Chính quy", cf6:"Y khoa", cf7:"2020-09-01" } },
  { id: "r8", seqNo: 5, diplomaNo: "TN-2024-005", studentId: "SV20200201", fullName: "Bùi Văn Đạt", birthDate: "2001-12-03", decisionId: "d3", bookId: "bk2024",
    customValues: { cf1:"Kinh", cf2:"Nghệ An", cf3:"3.60", cf4:"Giỏi", cf5:"Chính quy", cf6:"Công nghệ thông tin", cf7:"2020-09-01" } },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const TYPE_COLOR: Record<FieldType, string> = { String:"blue", Number:"green", Date:"orange" };
const TYPE_ICON: Record<FieldType, string> = { String:"Aa", Number:"#", Date:"📅" };
const fmtDate = (d: string) => d ? dayjs(d).format("DD/MM/YYYY") : "—";
const RANK_COLOR: Record<string,string> = { "Xuất sắc":"#gold", "Giỏi":"#52c41a", "Khá":"#1677ff", "Trung bình":"#faad14", "Yếu":"#ff4d4f" };

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("books");
  const [fields, setFields] = useState<CustomField[]>(SEED_FIELDS);
  const [books, setBooks] = useState<DiplomaBook[]>(SEED_BOOKS);
  const [decisions, setDecisions] = useState<Decision[]>(SEED_DECISIONS);
  const [records, setRecords] = useState<DiplomaRecord[]>(SEED_RECORDS);
  const [messageApi, ctx] = message.useMessage();

  // Modals
  const [fieldModal, setFieldModal] = useState(false);
  const [bookModal, setBookModal] = useState(false);
  const [decisionModal, setDecisionModal] = useState(false);
  const [recordModal, setRecordModal] = useState(false);
  const [detailDrawer, setDetailDrawer] = useState<DiplomaRecord | null>(null);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [editingBook, setEditingBook] = useState<DiplomaBook | null>(null);
  const [editingDecision, setEditingDecision] = useState<Decision | null>(null);
  const [editingRecord, setEditingRecord] = useState<DiplomaRecord | null>(null);

  // Lookup state
  const [lookupParams, setLookupParams] = useState({ diplomaNo:"", seqNo:"", studentId:"", fullName:"", birthDate:"" });
  const [lookupResult, setLookupResult] = useState<DiplomaRecord[] | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [lookupDetail, setLookupDetail] = useState<DiplomaRecord | null>(null);

  const [fieldForm] = Form.useForm();
  const [bookForm] = Form.useForm();
  const [decisionForm] = Form.useForm();
  const [recordForm] = Form.useForm();

  // ── FIELD CRUD ──
  const openFieldModal = (f?: CustomField) => {
    setEditingField(f || null);
    fieldForm.setFieldsValue(f || { name:"", type:"String", required:false });
    setFieldModal(true);
  };
  const saveField = () => {
    fieldForm.validateFields().then(vals => {
      if (editingField) {
        setFields(p => p.map(f => f.id === editingField.id ? { ...f, ...vals } : f));
        messageApi.success("Cập nhật trường thông tin thành công!");
      } else {
        setFields(p => [...p, { id:`cf${Date.now()}`, ...vals }]);
        messageApi.success("Thêm trường thông tin thành công!");
      }
      setFieldModal(false);
    });
  };
  const deleteField = (id: string) => {
    setFields(p => p.filter(f => f.id !== id));
    messageApi.success("Đã xóa trường thông tin!");
  };

  // ── BOOK CRUD ──
  const openBookModal = (b?: DiplomaBook) => {
    setEditingBook(b || null);
    bookForm.setFieldsValue(b || { year: new Date().getFullYear(), name:"" });
    setBookModal(true);
  };
  const saveBook = () => {
    bookForm.validateFields().then(vals => {
      if (books.find(b => b.year === vals.year && b.id !== editingBook?.id)) {
        messageApi.error("Năm này đã có sổ văn bằng!"); return;
      }
      if (editingBook) {
        setBooks(p => p.map(b => b.id === editingBook.id ? { ...b, ...vals } : b));
      } else {
        setBooks(p => [...p, { id:`bk${vals.year}`, currentSeq:0, ...vals }]);
        messageApi.success("Mở sổ văn bằng mới thành công!");
      }
      setBookModal(false);
    });
  };
  const deleteBook = (id: string) => {
    if (decisions.some(d => d.bookId === id)) { messageApi.error("Không thể xóa sổ đang có quyết định!"); return; }
    setBooks(p => p.filter(b => b.id !== id));
    messageApi.success("Đã xóa sổ!");
  };

  // ── DECISION CRUD ──
  const openDecisionModal = (d?: Decision) => {
    setEditingDecision(d || null);
    decisionForm.setFieldsValue(d ? { ...d, issueDate: dayjs(d.issueDate) } : { decisionNo:"", summary:"", bookId:"" });
    setDecisionModal(true);
  };
  const saveDecision = () => {
    decisionForm.validateFields().then(vals => {
      const dec: Decision = {
        ...vals,
        issueDate: dayjs(vals.issueDate).format("YYYY-MM-DD"),
        id: editingDecision?.id || `d${Date.now()}`,
        lookupCount: editingDecision?.lookupCount || 0,
      };
      if (editingDecision) setDecisions(p => p.map(d => d.id === editingDecision.id ? dec : d));
      else setDecisions(p => [...p, dec]);
      messageApi.success(editingDecision ? "Cập nhật quyết định!" : "Thêm quyết định thành công!");
      setDecisionModal(false);
    });
  };
  const deleteDecision = (id: string) => {
    if (records.some(r => r.decisionId === id)) { messageApi.error("Không thể xóa quyết định đang có văn bằng!"); return; }
    setDecisions(p => p.filter(d => d.id !== id));
    messageApi.success("Đã xóa!");
  };

  // ── RECORD CRUD ──
  const openRecordModal = (r?: DiplomaRecord) => {
    setEditingRecord(r || null);
    if (r) {
      const vals: any = { ...r, birthDate: dayjs(r.birthDate) };
      fields.forEach(f => {
        if (f.type === "Date" && r.customValues[f.id]) {
          vals[`cf_${f.id}`] = dayjs(r.customValues[f.id]);
        } else {
          vals[`cf_${f.id}`] = r.customValues[f.id];
        }
      });
      recordForm.setFieldsValue(vals);
    } else {
      recordForm.resetFields();
      recordForm.setFieldsValue({ diplomaNo:"", studentId:"", fullName:"" });
    }
    setRecordModal(true);
  };

  const saveRecord = () => {
    recordForm.validateFields().then(vals => {
      const decisionId = vals.decisionId;
      const dec = decisions.find(d => d.id === decisionId);
      if (!dec) return;
      const book = books.find(b => b.id === dec.bookId);
      if (!book) return;

      // Check duplicate diplomaNo
      if (!editingRecord && records.some(r => r.diplomaNo === vals.diplomaNo)) {
        messageApi.error("Số hiệu văn bằng đã tồn tại!"); return;
      }
      if (editingRecord && records.some(r => r.diplomaNo === vals.diplomaNo && r.id !== editingRecord.id)) {
        messageApi.error("Số hiệu văn bằng đã tồn tại!"); return;
      }

      const customValues: Record<string,string> = {};
      fields.forEach(f => {
        const v = vals[`cf_${f.id}`];
        if (v !== undefined && v !== null && v !== "") {
          customValues[f.id] = f.type === "Date" ? dayjs(v).format("YYYY-MM-DD") : String(v);
        }
      });

      if (editingRecord) {
        const updated: DiplomaRecord = {
          ...editingRecord,
          diplomaNo: vals.diplomaNo,
          studentId: vals.studentId,
          fullName: vals.fullName,
          birthDate: dayjs(vals.birthDate).format("YYYY-MM-DD"),
          decisionId: vals.decisionId,
          bookId: dec.bookId,
          customValues,
        };
        setRecords(p => p.map(r => r.id === editingRecord.id ? updated : r));
        messageApi.success("Cập nhật văn bằng thành công!");
      } else {
        const newSeq = book.currentSeq + 1;
        setBooks(p => p.map(b => b.id === book.id ? { ...b, currentSeq: newSeq } : b));
        const newRecord: DiplomaRecord = {
          id: `r${Date.now()}`,
          seqNo: newSeq,
          diplomaNo: vals.diplomaNo,
          studentId: vals.studentId,
          fullName: vals.fullName,
          birthDate: dayjs(vals.birthDate).format("YYYY-MM-DD"),
          decisionId,
          bookId: dec.bookId,
          customValues,
        };
        setRecords(p => [...p, newRecord]);
        messageApi.success(`Thêm văn bằng thành công! Số vào sổ: ${newSeq}`);
      }
      setRecordModal(false);
    });
  };

  const deleteRecord = (id: string) => {
    setRecords(p => p.filter(r => r.id !== id));
    messageApi.success("Đã xóa văn bằng!");
  };

  // ── LOOKUP ──
  const handleLookup = () => {
    const filled = Object.entries(lookupParams).filter(([,v]) => v.trim() !== "");
    if (filled.length < 2) { setLookupError("Vui lòng nhập ít nhất 2 tham số tìm kiếm!"); setLookupResult(null); return; }
    setLookupError("");
    const results = records.filter(r => {
      const checks = [
        lookupParams.diplomaNo && r.diplomaNo.toLowerCase().includes(lookupParams.diplomaNo.toLowerCase()),
        lookupParams.seqNo && String(r.seqNo) === lookupParams.seqNo.trim(),
        lookupParams.studentId && r.studentId.toLowerCase().includes(lookupParams.studentId.toLowerCase()),
        lookupParams.fullName && r.fullName.toLowerCase().includes(lookupParams.fullName.toLowerCase()),
        lookupParams.birthDate && r.birthDate === dayjs(lookupParams.birthDate).format("YYYY-MM-DD"),
      ].filter(Boolean);
      return checks.length === filled.length;
    });
    // Increment lookup count for related decisions
    const decIds = [...new Set(results.map(r => r.decisionId))];
    setDecisions(p => p.map(d => decIds.includes(d.id) ? { ...d, lookupCount: d.lookupCount + 1 } : d));
    setLookupResult(results);
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────
  const renderBooks = () => (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
        <Title level={3} style={{ margin:0 }}> Sổ văn bằng</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openBookModal()}>Mở sổ mới</Button>
      </div>
      <Row gutter={[16,16]}>
        {[...books].sort((a,b)=>b.year-a.year).map(bk => {
          const bkDecisions = decisions.filter(d => d.bookId === bk.id);
          const bkRecords = records.filter(r => r.bookId === bk.id);
          return (
            <Col xs={24} sm={12} lg={8} key={bk.id}>
              <Card
                bordered={false}
                style={{ borderRadius:12, boxShadow:"0 2px 16px rgba(0,0,0,0.09)", borderTop:"4px solid #1677ff" }}
                actions={[
                  <Tooltip title="Chỉnh sửa"><EditOutlined onClick={() => openBookModal(bk)} /></Tooltip>,
                  <Popconfirm title="Xóa sổ này?" onConfirm={() => deleteBook(bk.id)}><DeleteOutlined style={{ color:"#ff4d4f" }} /></Popconfirm>
                ]}
              >
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <FolderOpenOutlined style={{ fontSize:28, color:"#1677ff" }} />
                  <div>
                    <Text strong style={{ fontSize:15 }}>{bk.name}</Text>
                    <br/><Tag color="blue">Năm {bk.year}</Tag>
                  </div>
                </div>
                <Divider style={{ margin:"10px 0" }} />
                <Row gutter={8}>
                  <Col span={8} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:22, fontWeight:700, color:"#1677ff" }}>{bkDecisions.length}</div>
                    <Text type="secondary" style={{ fontSize:11 }}>Quyết định</Text>
                  </Col>
                  <Col span={8} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:22, fontWeight:700, color:"#52c41a" }}>{bkRecords.length}</div>
                    <Text type="secondary" style={{ fontSize:11 }}>Văn bằng</Text>
                  </Col>
                  <Col span={8} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:22, fontWeight:700, color:"#faad14" }}>{bk.currentSeq}</div>
                    <Text type="secondary" style={{ fontSize:11 }}>Số vào sổ HT</Text>
                  </Col>
                </Row>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Card title="📋 Tất cả quyết định tốt nghiệp" bordered={false} style={{ marginTop:20 }}>
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openDecisionModal()}>Thêm quyết định</Button>
        </div>
        <Table
          dataSource={decisions} rowKey="id"
          columns={[
            { title:"Số QĐ", dataIndex:"decisionNo", render:v=><Tag color="blue">{v}</Tag> },
            { title:"Ngày ban hành", dataIndex:"issueDate", render:v=>fmtDate(v) },
            { title:"Trích yếu", dataIndex:"summary", ellipsis:true },
            { title:"Sổ văn bằng", dataIndex:"bookId", render:v=>{
              const bk = books.find(b=>b.id===v);
              return <Tag color="purple">{bk?.name}</Tag>;
            }},
            { title:"Lượt tra cứu", dataIndex:"lookupCount", render:v=><Badge count={v} color="#1677ff" showZero /> },
            { title:"Số VB", key:"vc", render:(_,r)=>records.filter(rc=>rc.decisionId===r.id).length },
            { title:"Thao tác", render:(_,r)=>(
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => openDecisionModal(r)} />
                <Popconfirm title="Xóa quyết định?" onConfirm={() => deleteDecision(r.id)}>
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            )},
          ]}
          pagination={false}
        />
      </Card>
    </div>
  );

  const renderRecords = () => (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
        <Title level={3} style={{ margin:0 }}> Thông tin văn bằng</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openRecordModal()}>Cấp văn bằng</Button>
      </div>
      <Table
        dataSource={[...records].sort((a,b) => a.bookId.localeCompare(b.bookId) || a.seqNo - b.seqNo)}
        rowKey="id"
        scroll={{ x: 1000 }}
        columns={[
          { title:"Số vào sổ", dataIndex:"seqNo", width:90, render:(v,r)=>(
            <div style={{ textAlign:"center" }}>
              <div style={{ fontWeight:700, color:"#1677ff", fontSize:16 }}>{v}</div>
              <Text type="secondary" style={{ fontSize:10 }}>{books.find(b=>b.id===r.bookId)?.year}</Text>
            </div>
          )},
          { title:"Số hiệu VB", dataIndex:"diplomaNo", render:v=><Tag color="geekblue" style={{ fontFamily:"monospace" }}>{v}</Tag> },
          { title:"Mã SV", dataIndex:"studentId", render:v=><Text code>{v}</Text> },
          { title:"Họ tên", dataIndex:"fullName", render:v=><Text strong>{v}</Text> },
          { title:"Ngày sinh", dataIndex:"birthDate", render:v=>fmtDate(v) },
          { title:"Quyết định", dataIndex:"decisionId", render:v=>{
            const d = decisions.find(dec=>dec.id===v);
            return <Tooltip title={d?.summary}><Tag color="blue">{d?.decisionNo}</Tag></Tooltip>;
          }},
          { title:"Xếp loại", key:"rank", render:(_,r)=>{
            const v = r.customValues["cf4"];
            return v ? <Tag color={v==="Xuất sắc"?"gold":v==="Giỏi"?"green":v==="Khá"?"blue":"orange"}>{v}</Tag> : "—";
          }},
          { title:"Thao tác", width:130, render:(_,r)=>(
            <Space>
              <Tooltip title="Xem chi tiết"><Button size="small" icon={<EyeOutlined />} onClick={() => setDetailDrawer(r)} /></Tooltip>
              <Tooltip title="Chỉnh sửa"><Button size="small" icon={<EditOutlined />} onClick={() => openRecordModal(r)} /></Tooltip>
              <Popconfirm title="Xóa văn bằng?" onConfirm={() => deleteRecord(r.id)}>
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          )},
        ]}
        pagination={{ pageSize:8 }}
      />
    </div>
  );

  const renderFields = () => (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
        <Title level={3} style={{ margin:0 }}> Cấu hình biểu mẫu phụ lục</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openFieldModal()}>Thêm trường</Button>
      </div>
      <Alert
        message="Trường thông tin mặc định (bắt buộc)"
        description={
          <Space wrap>
            {["Số vào sổ (auto)","Số hiệu văn bằng","Mã sinh viên","Họ tên","Ngày sinh"].map(f=>
              <Tag key={f} color="default" icon={<CheckCircleOutlined />}>{f}</Tag>
            )}
          </Space>
        }
        type="info" showIcon style={{ marginBottom:16 }}
      />
      <Card bordered={false} style={{ boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
        <Table
          dataSource={fields} rowKey="id"
          columns={[
            { title:"#", render:(_,__,i)=>i+1, width:50 },
            { title:"Tên trường", dataIndex:"name", render:v=><Text strong>{v}</Text> },
            { title:"Kiểu dữ liệu", dataIndex:"type", render:(v:FieldType)=>(
              <Tag color={TYPE_COLOR[v]} style={{ fontFamily:"monospace" }}>{TYPE_ICON[v]} {v}</Tag>
            )},
            { title:"Bắt buộc", dataIndex:"required", render:v=>v
              ? <Tag color="red" icon={<CheckCircleOutlined />}>Bắt buộc</Tag>
              : <Tag color="default">Không bắt buộc</Tag>
            },
            { title:"Control nhập liệu", dataIndex:"type", key:"ctrl", render:(v:FieldType)=>(
              <Text type="secondary" style={{ fontSize:12 }}>
                {v==="String"?"<Input />" : v==="Number"?"<InputNumber />" : "<DatePicker />"}
              </Text>
            )},
            { title:"Thao tác", render:(_,r)=>(
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => openFieldModal(r)} />
                <Popconfirm title="Xóa trường thông tin này?" onConfirm={() => deleteField(r.id)}>
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            )},
          ]}
          pagination={false}
        />
      </Card>
    </div>
  );

  const renderLookup = () => (
    <div>
      <Title level={3} style={{ marginBottom:6 }}> Tra cứu văn bằng tốt nghiệp</Title>
      <Paragraph type="secondary" style={{ marginBottom:20 }}>Nhập ít nhất 2 tham số để tra cứu thông tin văn bằng.</Paragraph>

      <Card bordered={false} style={{ borderRadius:12, boxShadow:"0 2px 16px rgba(0,0,0,0.08)", marginBottom:20 }}>
        <Row gutter={[16,12]}>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom:4 }}><Text strong>Số hiệu văn bằng</Text></div>
            <Input placeholder="VD: TN-2024-001" value={lookupParams.diplomaNo}
              onChange={e => setLookupParams(p=>({...p,diplomaNo:e.target.value}))}
              prefix={<IdcardOutlined style={{ color:"#1677ff" }} />} />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom:4 }}><Text strong>Số vào sổ</Text></div>
            <Input placeholder="VD: 3" value={lookupParams.seqNo}
              onChange={e => setLookupParams(p=>({...p,seqNo:e.target.value}))}
              prefix={<BookOutlined style={{ color:"#52c41a" }} />} />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom:4 }}><Text strong>Mã sinh viên</Text></div>
            <Input placeholder="VD: SV20200011" value={lookupParams.studentId}
              onChange={e => setLookupParams(p=>({...p,studentId:e.target.value}))}
              prefix={<AuditOutlined style={{ color:"#faad14" }} />} />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom:4 }}><Text strong>Họ tên</Text></div>
            <Input placeholder="VD: Nguyễn Thị Hoa" value={lookupParams.fullName}
              onChange={e => setLookupParams(p=>({...p,fullName:e.target.value}))}
              prefix={<FormOutlined style={{ color:"#722ed1" }} />} />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom:4 }}><Text strong>Ngày sinh</Text></div>
            <DatePicker placeholder="DD/MM/YYYY" format="DD/MM/YYYY" style={{ width:"100%" }}
              onChange={v => setLookupParams(p=>({...p,birthDate:v?v.format("YYYY-MM-DD"):""}))}
              prefix={<CalendarOutlined />} />
          </Col>
          <Col xs={24} sm={12} md={8} style={{ display:"flex", alignItems:"flex-end" }}>
            <Button type="primary" icon={<SearchOutlined />} block size="large" onClick={handleLookup}
              style={{ background:"linear-gradient(135deg,#1677ff,#0052cc)", border:"none" }}>
              Tra cứu văn bằng
            </Button>
          </Col>
        </Row>
        {lookupError && <Alert message={lookupError} type="warning" showIcon style={{ marginTop:16 }} />}
      </Card>

      {lookupResult !== null && (
        lookupResult.length === 0 ? (
          <Result icon={<ExclamationCircleOutlined style={{ color:"#faad14" }} />}
            title="Không tìm thấy văn bằng"
            subTitle="Vui lòng kiểm tra lại thông tin và thử lại." />
        ) : (
          <div>
            <Alert message={`Tìm thấy ${lookupResult.length} kết quả`} type="success" showIcon style={{ marginBottom:12 }} />
            {lookupResult.map(r => {
              const dec = decisions.find(d=>d.id===r.decisionId);
              const bk = books.find(b=>b.id===r.bookId);
              return (
                <Card key={r.id} bordered={false}
                  style={{ marginBottom:12, borderRadius:10, boxShadow:"0 2px 12px rgba(0,0,0,0.08)", borderLeft:"4px solid #52c41a" }}
                  extra={<Button type="link" icon={<ArrowRightOutlined />} onClick={() => setLookupDetail(r)}>Xem chi tiết</Button>}
                  title={<Space><SafetyCertificateOutlined style={{ color:"#52c41a" }} /><Text strong>{r.fullName}</Text><Tag color="green">{r.diplomaNo}</Tag></Space>}
                >
                  <Row gutter={16}>
                    <Col xs={12} md={6}><Text type="secondary">Mã SV:</Text><br/><Text strong>{r.studentId}</Text></Col>
                    <Col xs={12} md={6}><Text type="secondary">Số vào sổ:</Text><br/><Text strong style={{ color:"#1677ff" }}>#{r.seqNo} / {bk?.year}</Text></Col>
                    <Col xs={12} md={6}><Text type="secondary">Ngày sinh:</Text><br/><Text>{fmtDate(r.birthDate)}</Text></Col>
                    <Col xs={12} md={6}><Text type="secondary">Quyết định:</Text><br/><Tag color="blue">{dec?.decisionNo}</Tag></Col>
                  </Row>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Lookup detail modal */}
      <Modal
        title={<Space><SafetyCertificateOutlined style={{ color:"#52c41a" }} />Chi tiết văn bằng tốt nghiệp</Space>}
        open={!!lookupDetail} onCancel={() => setLookupDetail(null)} footer={null} width={620}
      >
        {lookupDetail && (() => {
          const dec = decisions.find(d=>d.id===lookupDetail.decisionId);
          const bk = books.find(b=>b.id===lookupDetail.bookId);
          return (
            <>
              <div style={{ background:"linear-gradient(135deg,#e6f4ff,#f0f9ff)", borderRadius:10, padding:"16px 20px", marginBottom:16, textAlign:"center", border:"1px solid #91caff" }}>
                <SafetyCertificateOutlined style={{ fontSize:40, color:"#1677ff", marginBottom:8 }} />
                <Title level={4} style={{ margin:0 }}>{lookupDetail.fullName}</Title>
                <Tag color="blue" style={{ marginTop:6, fontSize:13, padding:"2px 12px" }}>{lookupDetail.diplomaNo}</Tag>
              </div>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Mã sinh viên">{lookupDetail.studentId}</Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">{fmtDate(lookupDetail.birthDate)}</Descriptions.Item>
                <Descriptions.Item label="Số vào sổ"><Tag color="blue">#{lookupDetail.seqNo}</Tag></Descriptions.Item>
                <Descriptions.Item label="Năm sổ">{bk?.year}</Descriptions.Item>
                {fields.map(f => {
                  const v = lookupDetail.customValues[f.id];
                  return (
                    <Descriptions.Item key={f.id} label={f.name}>
                      {f.id==="cf4" && v ? <Tag color={v==="Xuất sắc"?"gold":v==="Giỏi"?"green":"blue"}>{v}</Tag>
                        : (v || <Text type="secondary">—</Text>)}
                    </Descriptions.Item>
                  );
                })}
              </Descriptions>
              <Divider>Quyết định tốt nghiệp</Divider>
              <Descriptions bordered size="small">
                <Descriptions.Item label="Số QĐ">{dec?.decisionNo}</Descriptions.Item>
                <Descriptions.Item label="Ngày ban hành">{fmtDate(dec?.issueDate||"")}</Descriptions.Item>
                <Descriptions.Item label="Trích yếu" span={2}>{dec?.summary}</Descriptions.Item>
                <Descriptions.Item label="Sổ văn bằng">{bk?.name}</Descriptions.Item>
              </Descriptions>
            </>
          );
        })()}
      </Modal>
    </div>
  );

  const renderStats = () => (
    <div>
      <Title level={3} style={{ marginBottom:20 }}> Thống kê hệ thống</Title>
      <Row gutter={[16,16]} style={{ marginBottom:20 }}>
        {[
          { title:"Tổng sổ văn bằng", value:books.length, color:"#1677ff", icon:<BookOutlined /> },
          { title:"Tổng quyết định TN", value:decisions.length, color:"#52c41a", icon:<FileTextOutlined /> },
          { title:"Tổng văn bằng", value:records.length, color:"#faad14", icon:<SafetyCertificateOutlined /> },
          { title:"Tổng lượt tra cứu", value:decisions.reduce((s,d)=>s+d.lookupCount,0), color:"#722ed1", icon:<SearchOutlined /> },
        ].map((s,i)=>(
          <Col xs={24} sm={12} md={6} key={i}>
            <Card bordered={false} style={{ borderRadius:10, borderTop:`4px solid ${s.color}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontSize:28, color:s.color }}>{s.icon}</div>
                <Statistic title={s.title} value={s.value} valueStyle={{ color:s.color, fontWeight:700 }} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16,16]}>
        <Col xs={24} md={12}>
          <Card title=" Văn bằng theo sổ & quyết định" bordered={false}>
            {books.map(bk => (
              <div key={bk.id} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <Text strong>{bk.name}</Text>
                  <Badge count={records.filter(r=>r.bookId===bk.id).length} color="#1677ff" showZero />
                </div>
                {decisions.filter(d=>d.bookId===bk.id).map(dec=>(
                  <div key={dec.id} style={{ paddingLeft:16, marginBottom:4, display:"flex", justifyContent:"space-between" }}>
                    <Text type="secondary" style={{ fontSize:12 }}>{dec.decisionNo} — {dec.summary.substring(0,35)}...</Text>
                    <Space>
                      <Tag style={{ fontSize:10 }}>{records.filter(r=>r.decisionId===dec.id).length} VB</Tag>
                      <Tag color="purple" style={{ fontSize:10 }}>{dec.lookupCount} tra cứu</Tag>
                    </Space>
                  </div>
                ))}
                <Divider style={{ margin:"8px 0" }} />
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title=" Lượt tra cứu theo quyết định" bordered={false}>
            {[...decisions].sort((a,b)=>b.lookupCount-a.lookupCount).map(d => {
              const max = Math.max(...decisions.map(x=>x.lookupCount));
              return (
                <div key={d.id} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <Tooltip title={d.summary}><Tag color="blue">{d.decisionNo}</Tag></Tooltip>
                    <Text strong>{d.lookupCount} lượt</Text>
                  </div>
                  <div style={{ background:"#f0f0f0", borderRadius:4, height:8 }}>
                    <div style={{ width:`${max>0?Math.round(d.lookupCount/max*100):0}%`, background:"#1677ff", height:8, borderRadius:4, transition:"width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </Card>
        </Col>
      </Row>
    </div>
  );

  const pageMap: Record<string, ()=>JSX.Element> = {
    books: renderBooks,
    records: renderRecords,
    fields: renderFields,
    lookup: renderLookup,
    stats: renderStats,
  };

  const menuItems = [
    { key:"books", icon:<BookOutlined />, label:"Sổ văn bằng & QĐ" },
    { key:"records", icon:<SafetyCertificateOutlined />, label:"Thông tin văn bằng" },
    { key:"fields", icon:<SettingOutlined />, label:"Cấu hình biểu mẫu" },
    { key:"lookup", icon:<SearchOutlined />, label:"Tra cứu văn bằng" },
    { key:"stats", icon:<BarChartOutlined />, label:"Thống kê" },
  ];

  return (
    <Layout style={{ minHeight:"100vh" }}>
      {ctx}
      <Sider width={230} theme="dark" style={{ background:"#0d1b2a" }}>
        <div style={{ padding:"18px 16px 12px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <SafetyCertificateOutlined style={{ fontSize:28, color:"#52c41a" }} />
            <div>
              <div style={{ color:"#fff", fontWeight:800, fontSize:13, lineHeight:1.3 }}>Hệ thống quản lý</div>
              <div style={{ color:"#52c41a", fontSize:11, fontWeight:600 }}>Sổ Văn Bằng Tốt Nghiệp</div>
            </div>
          </div>
        </div>
        <Divider style={{ borderColor:"#1e3a5a", margin:"0 0 8px" }} />
        <Menu theme="dark" mode="inline" selectedKeys={[page]} items={menuItems}
          onClick={({key})=>setPage(key)} style={{ background:"transparent" }} />
        <div style={{ position:"absolute", bottom:16, left:0, right:0, textAlign:"center" }}>
          <Text style={{ color:"#2d4a6a", fontSize:11 }}>Phòng Đào Tạo • v1.0</Text>
        </div>
      </Sider>

      <Layout>
        <Header style={{ background:"#fff", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
          <Text style={{ fontSize:16, fontWeight:700, color:"#0d1b2a" }}>
            {menuItems.find(m=>m.key===page)?.label}
          </Text>
          <Space>
            <Tag color="success" icon={<CheckCircleOutlined />}>{records.length} văn bằng</Tag>
            <Tag color="blue" icon={<BookOutlined />}>{books.length} sổ</Tag>
          </Space>
        </Header>
        <Content style={{ margin:20, padding:24, background:"#f4f7fb", minHeight:280 }}>
          {(pageMap[page]||renderBooks)()}
        </Content>
      </Layout>

      {/* Field Modal */}
      <Modal title={editingField?"Chỉnh sửa trường":"Thêm trường thông tin"} open={fieldModal} onOk={saveField} onCancel={()=>setFieldModal(false)} okText="Lưu">
        <Form form={fieldForm} layout="vertical">
          <Form.Item name="name" label="Tên trường" rules={[{required:true}]}><Input placeholder="VD: Dân tộc, Điểm trung bình..." /></Form.Item>
          <Form.Item name="type" label="Kiểu dữ liệu" rules={[{required:true}]}>
            <Select>
              <Option value="String"><Tag color="blue">Aa String</Tag> — Văn bản</Option>
              <Option value="Number"><Tag color="green"># Number</Tag> — Số</Option>
              <Option value="Date"><Tag color="orange">📅 Date</Tag> — Ngày tháng</Option>
            </Select>
          </Form.Item>
          <Form.Item name="required" label="Bắt buộc nhập">
            <Select>
              <Option value={true}>Bắt buộc</Option>
              <Option value={false}>Không bắt buộc</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Book Modal */}
      <Modal title={editingBook?"Chỉnh sửa sổ":"Mở sổ văn bằng mới"} open={bookModal} onOk={saveBook} onCancel={()=>setBookModal(false)} okText="Lưu">
        <Form form={bookForm} layout="vertical">
          <Form.Item name="year" label="Năm" rules={[{required:true}]}><InputNumber min={2000} max={2100} style={{ width:"100%" }} /></Form.Item>
          <Form.Item name="name" label="Tên sổ" rules={[{required:true}]}><Input placeholder="VD: Sổ văn bằng năm 2025" /></Form.Item>
        </Form>
        {!editingBook && <Alert message="Số vào sổ sẽ tự động bắt đầu từ 1 khi mở sổ mới." type="info" showIcon />}
      </Modal>

      {/* Decision Modal */}
      <Modal title={editingDecision?"Chỉnh sửa quyết định":"Thêm quyết định tốt nghiệp"} open={decisionModal} onOk={saveDecision} onCancel={()=>setDecisionModal(false)} okText="Lưu" width={540}>
        <Form form={decisionForm} layout="vertical">
          <Row gutter={12}>
            <Col span={12}><Form.Item name="decisionNo" label="Số QĐ" rules={[{required:true}]}><Input placeholder="VD: QĐ-087/2025" /></Form.Item></Col>
            <Col span={12}><Form.Item name="issueDate" label="Ngày ban hành" rules={[{required:true}]}><DatePicker style={{ width:"100%" }} format="DD/MM/YYYY" /></Form.Item></Col>
          </Row>
          <Form.Item name="summary" label="Trích yếu" rules={[{required:true}]}><Input.TextArea rows={2} placeholder="VD: Công nhận tốt nghiệp đợt 1 năm 2025" /></Form.Item>
          <Form.Item name="bookId" label="Thuộc sổ văn bằng" rules={[{required:true}]}>
            <Select placeholder="Chọn sổ">
              {books.map(b=><Option key={b.id} value={b.id}>{b.name}</Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Record Modal */}
      <Modal title={editingRecord?"Chỉnh sửa thông tin văn bằng":"Cấp văn bằng mới"} open={recordModal}
        onOk={saveRecord} onCancel={()=>setRecordModal(false)} okText="Lưu" width={660}>
        <Form form={recordForm} layout="vertical">
          {/* Số vào sổ - readonly */}
          {editingRecord ? (
            <Form.Item label="Số vào sổ">
              <Tag color="blue" style={{ fontSize:14, padding:"4px 12px" }}>#{editingRecord.seqNo}</Tag>
              <Text type="secondary" style={{ marginLeft:8, fontSize:12 }}>Không thể thay đổi</Text>
            </Form.Item>
          ) : (
            <Alert message="Số vào sổ sẽ được tự động cấp khi lưu, không thể chỉnh sửa." type="info" showIcon style={{ marginBottom:12 }} />
          )}

          <Form.Item name="decisionId" label="Quyết định tốt nghiệp" rules={[{required:true}]}>
            <Select placeholder="Chọn quyết định">
              {decisions.map(d=>{
                const bk = books.find(b=>b.id===d.bookId);
                return <Option key={d.id} value={d.id}><Tag color="blue">{d.decisionNo}</Tag> {d.summary} <Text type="secondary">({bk?.year})</Text></Option>;
              })}
            </Select>
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}><Form.Item name="diplomaNo" label="Số hiệu văn bằng" rules={[{required:true}]}><Input placeholder="VD: TN-2025-001" style={{ fontFamily:"monospace" }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="studentId" label="Mã sinh viên" rules={[{required:true}]}><Input placeholder="VD: SV20210001" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={14}><Form.Item name="fullName" label="Họ tên" rules={[{required:true}]}><Input /></Form.Item></Col>
            <Col span={10}><Form.Item name="birthDate" label="Ngày sinh" rules={[{required:true}]}><DatePicker style={{ width:"100%" }} format="DD/MM/YYYY" /></Form.Item></Col>
          </Row>

          <Divider>Thông tin phụ lục (từ cấu hình biểu mẫu)</Divider>
          <Row gutter={12}>
            {fields.map(f => (
              <Col span={12} key={f.id}>
                <Form.Item name={`cf_${f.id}`} label={<span>{f.name} <Tag color={TYPE_COLOR[f.type]} style={{ fontSize:10 }}>{f.type}</Tag></span>}
                  rules={f.required?[{required:true,message:`${f.name} là bắt buộc`}]:[]}>
                  {f.type === "String" ? <Input /> :
                   f.type === "Number" ? <InputNumber style={{ width:"100%" }} step={0.01} /> :
                   <DatePicker style={{ width:"100%" }} format="DD/MM/YYYY" />}
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      </Modal>

      {/* Record Detail Drawer */}
      <Drawer title={<Space><SafetyCertificateOutlined style={{ color:"#52c41a" }} />Chi tiết văn bằng</Space>}
        open={!!detailDrawer} onClose={() => setDetailDrawer(null)} width={500}>
        {detailDrawer && (() => {
          const dec = decisions.find(d=>d.id===detailDrawer.decisionId);
          const bk = books.find(b=>b.id===detailDrawer.bookId);
          return (
            <>
              <div style={{ background:"linear-gradient(135deg,#e6f4ff,#f0f9ff)", borderRadius:10, padding:"16px", marginBottom:16, textAlign:"center", border:"1px solid #91caff" }}>
                <SafetyCertificateOutlined style={{ fontSize:36, color:"#1677ff", marginBottom:6 }} />
                <Title level={4} style={{ margin:0 }}>{detailDrawer.fullName}</Title>
                <div style={{ marginTop:8 }}>
                  <Tag color="blue">{detailDrawer.diplomaNo}</Tag>
                  <Tag color="green">Số vào sổ: #{detailDrawer.seqNo}</Tag>
                </div>
              </div>
              <Descriptions bordered column={2} size="small" style={{ marginBottom:16 }}>
                <Descriptions.Item label="Mã SV">{detailDrawer.studentId}</Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">{fmtDate(detailDrawer.birthDate)}</Descriptions.Item>
                <Descriptions.Item label="Sổ văn bằng">{bk?.year}</Descriptions.Item>
                <Descriptions.Item label="Số vào sổ">{detailDrawer.seqNo}</Descriptions.Item>
                {fields.map(f=>{
                  const v = detailDrawer.customValues[f.id];
                  return (
                    <Descriptions.Item key={f.id} label={f.name}>
                      {f.id==="cf3" && v ? <Tag color="green">{v}</Tag>
                        : f.id==="cf4" && v ? <Tag color={v==="Xuất sắc"?"gold":v==="Giỏi"?"green":"blue"}>{v}</Tag>
                        : f.type==="Date" && v ? fmtDate(v)
                        : (v || <Text type="secondary">—</Text>)}
                    </Descriptions.Item>
                  );
                })}
              </Descriptions>
              <Divider>Quyết định tốt nghiệp</Divider>
              <Descriptions bordered size="small">
                <Descriptions.Item label="Số QĐ">{dec?.decisionNo}</Descriptions.Item>
                <Descriptions.Item label="Ngày ban hành">{fmtDate(dec?.issueDate||"")}</Descriptions.Item>
                <Descriptions.Item label="Trích yếu" span={2}>{dec?.summary}</Descriptions.Item>
              </Descriptions>
            </>
          );
        })()}
      </Drawer>
    </Layout>
  );
}