import React, { useState, createContext, useContext, useCallback } from 'react';
import {
  Layout, Tabs, Table, Button, Modal, Form, Input, InputNumber, Select, Space, message, Card, Typography,} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { TabPane } = Tabs;
const { Title } = Typography;
const { Option } = Select;

export type KnowledgeBlock = {
  id: string;
  name: string;
};

export type Subject = {
  id: string;
  code: string;
  name: string;
  credits: number;
};

export type Difficulty = 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';

export type Question = {
  id: string;
  code: string;         
  subjectId: string;
  content: string;
  difficulty: Difficulty;
  knowledgeBlockId: string;
};

export type ExamRequirement = {
  difficulty: Difficulty;
  knowledgeBlockId: string;
  count: number;
};

export type ExamStructure = {
  id: string;
  name: string;
  subjectId: string;
  requirements: ExamRequirement[];
};

export type Exam = {
  id: string;
  name: string;
  structureId?: string; 
  subjectId: string;
  createdAt: Date;
  questions: string[];    
};

interface AppContextType {
  knowledgeBlocks: KnowledgeBlock[];
  subjects: Subject[];
  questions: Question[];
  examStructures: ExamStructure[];
  exams: Exam[];
  addKnowledgeBlock: (block: Omit<KnowledgeBlock, 'id'>) => void;
  updateKnowledgeBlock: (id: string, block: Omit<KnowledgeBlock, 'id'>) => void;
  deleteKnowledgeBlock: (id: string) => void;
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, subject: Omit<Subject, 'id'>) => void;
  deleteSubject: (id: string) => void;
  addQuestion: (question: Omit<Question, 'id' | 'code'> & { code?: string }) => void;
  updateQuestion: (id: string, question: Omit<Question, 'id' | 'code'> & { code?: string }) => void;
  deleteQuestion: (id: string) => void;
  addExamStructure: (structure: Omit<ExamStructure, 'id'>) => void;
  updateExamStructure: (id: string, structure: Omit<ExamStructure, 'id'>) => void;
  deleteExamStructure: (id: string) => void;
  addExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => void;
  deleteExam: (id: string) => void;
  generateExam: (subjectId: string, requirements: ExamRequirement[], name: string, structureId?: string) => Exam | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialKnowledgeBlocks: KnowledgeBlock[] = [
  { id: '1', name: 'Tổng quan' },
  { id: '2', name: 'Chuyên sâu' },
  { id: '3', name: 'Ứng dụng' },
];

const initialSubjects: Subject[] = [
  { id: 's1', code: 'MATH101', name: 'Toán cao cấp', credits: 3 },
  { id: 's2', code: 'CS202', name: 'Lập trình web', credits: 4 },
];

const initialQuestions: Question[] = [
  { id: 'q1', code: 'Q001', subjectId: 's1', content: 'Định nghĩa đạo hàm?', difficulty: 'Dễ', knowledgeBlockId: '1' },
  { id: 'q2', code: 'Q002', subjectId: 's1', content: 'Ứng dụng tích phân trong tính diện tích?', difficulty: 'Trung bình', knowledgeBlockId: '3' },
  { id: 'q3', code: 'Q003', subjectId: 's2', content: 'Giải thích RESTful API?', difficulty: 'Trung bình', knowledgeBlockId: '2' },
  { id: 'q4', code: 'Q004', subjectId: 's2', content: 'So sánh cookies và session?', difficulty: 'Khó', knowledgeBlockId: '2' },
];

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [knowledgeBlocks, setKnowledgeBlocks] = useState<KnowledgeBlock[]>(initialKnowledgeBlocks);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [examStructures, setExamStructures] = useState<ExamStructure[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);


  const addKnowledgeBlock = useCallback((block: Omit<KnowledgeBlock, 'id'>) => {
    setKnowledgeBlocks(prev => [...prev, { id: generateId(), ...block }]);
  }, []);

  const updateKnowledgeBlock = useCallback((id: string, block: Omit<KnowledgeBlock, 'id'>) => {
    setKnowledgeBlocks(prev => prev.map(b => b.id === id ? { id, ...block } : b));
  }, []);

  const deleteKnowledgeBlock = useCallback((id: string) => {
    setKnowledgeBlocks(prev => prev.filter(b => b.id !== id));
  }, []);


  const addSubject = useCallback((subject: Omit<Subject, 'id'>) => {
    setSubjects(prev => [...prev, { id: generateId(), ...subject }]);
  }, []);

  const updateSubject = useCallback((id: string, subject: Omit<Subject, 'id'>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { id, ...subject } : s));
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  }, []);


  const addQuestion = useCallback((question: Omit<Question, 'id' | 'code'> & { code?: string }) => {
    const newCode = question.code || `Q${String(questions.length + 1).padStart(3, '0')}`;
    setQuestions(prev => [...prev, { id: generateId(), code: newCode, ...question }]);
  }, [questions]);

  const updateQuestion = useCallback((id: string, question: Omit<Question, 'id' | 'code'> & { code?: string }) => {
    setQuestions(prev => prev.map(q => q.id === id ? { id, code: q.code, ...question } : q));
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  }, []);

  const addExamStructure = useCallback((structure: Omit<ExamStructure, 'id'>) => {
    setExamStructures(prev => [...prev, { id: generateId(), ...structure }]);
  }, []);

  const updateExamStructure = useCallback((id: string, structure: Omit<ExamStructure, 'id'>) => {
    setExamStructures(prev => prev.map(s => s.id === id ? { id, ...structure } : s));
  }, []);

  const deleteExamStructure = useCallback((id: string) => {
    setExamStructures(prev => prev.filter(s => s.id !== id));
  }, []);

  const addExam = useCallback((exam: Omit<Exam, 'id' | 'createdAt'>) => {
    setExams(prev => [...prev, { id: generateId(), createdAt: new Date(), ...exam }]);
  }, []);

  const deleteExam = useCallback((id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
  }, []);

  const generateExam = useCallback((
    subjectId: string,
    requirements: ExamRequirement[],
    name: string,
    structureId?: string
  ): Exam | null => {

    const subjectQuestions = questions.filter(q => q.subjectId === subjectId);
    const selectedQuestionIds: string[] = [];
    const errors: string[] = [];

    const reqs = [...requirements];

    for (const req of reqs) {
      const { difficulty, knowledgeBlockId, count } = req;

      const available = subjectQuestions.filter(
        q => q.difficulty === difficulty && q.knowledgeBlockId === knowledgeBlockId && !selectedQuestionIds.includes(q.id)
      );
      if (available.length < count) {
        const blockName = knowledgeBlocks.find(b => b.id === knowledgeBlockId)?.name || knowledgeBlockId;
        errors.push(`Không đủ câu hỏi cho ${difficulty} - ${blockName} (cần ${count}, chỉ có ${available.length})`);
      } else {
        const shuffled = [...available].sort(() => 0.5 - Math.random());
        const chosen = shuffled.slice(0, count).map(q => q.id);
        selectedQuestionIds.push(...chosen);
      }
    }

    if (errors.length > 0) {
      message.error(errors.join('; '));
      return null;
    }

    const newExam: Exam = {
      id: generateId(),
      name,
      structureId,
      subjectId,
      createdAt: new Date(),
      questions: selectedQuestionIds,
    };
    setExams(prev => [...prev, newExam]);
    message.success('Tạo đề thi thành công!');
    return newExam;
  }, [questions, knowledgeBlocks]);

  const value: AppContextType = {
    knowledgeBlocks,
    subjects,
    questions,
    examStructures,
    exams,
    addKnowledgeBlock,
    updateKnowledgeBlock,
    deleteKnowledgeBlock,
    addSubject,
    updateSubject,
    deleteSubject,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addExamStructure,
    updateExamStructure,
    deleteExamStructure,
    addExam,
    deleteExam,
    generateExam,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// -------------------- Components --------------------

// Modal dùng chung cho các form thêm/sửa
interface EditModalProps<T> {
  visible: boolean;
  editingItem: T | null;
  onCancel: () => void;
  onSave: (item: any) => void;
  formItems: React.ReactNode;
  title: string;
}

const EditModal = <T,>({ visible, editingItem, onCancel, onSave, formItems, title }: EditModalProps<T>) => {
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
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {formItems}
      </Form>
    </Modal>
  );
};

// 1. Quản lý khối kiến thức
const KnowledgeBlockManager: React.FC = () => {
  const { knowledgeBlocks, addKnowledgeBlock, updateKnowledgeBlock, deleteKnowledgeBlock } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlock, setEditingBlock] = useState<KnowledgeBlock | null>(null);

  const columns = [
    { title: 'Tên khối kiến thức', dataIndex: 'name', key: 'name' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: KnowledgeBlock) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => { setEditingBlock(record); setModalVisible(true); }} />
          <Button icon={<DeleteOutlined />} danger onClick={() => deleteKnowledgeBlock(record.id)} />
        </Space>
      ),
    },
  ];

  const handleSave = (values: any) => {
    if (editingBlock) {
      updateKnowledgeBlock(editingBlock.id, values);
    } else {
      addKnowledgeBlock(values);
    }
    setEditingBlock(null);
  };

  const formItems = (
    <Form.Item label="Tên khối kiến thức" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
      <Input />
    </Form.Item>
  );

  return (
    <Card title="Danh mục khối kiến thức">
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
        Thêm khối kiến thức
      </Button>
      <Table dataSource={knowledgeBlocks} columns={columns} rowKey="id" pagination={false} />
      <EditModal
        visible={modalVisible}
        editingItem={editingBlock}
        onCancel={() => { setModalVisible(false); setEditingBlock(null); }}
        onSave={handleSave}
        formItems={formItems}
        title={editingBlock ? 'Sửa khối kiến thức' : 'Thêm khối kiến thức'}
      />
    </Card>
  );
};

// 2. Quản lý môn học
const SubjectManager: React.FC = () => {
  const { subjects, addSubject, updateSubject, deleteSubject } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const columns = [
    { title: 'Mã môn', dataIndex: 'code', key: 'code' },
    { title: 'Tên môn', dataIndex: 'name', key: 'name' },
    { title: 'Số tín chỉ', dataIndex: 'credits', key: 'credits' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Subject) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => { setEditingSubject(record); setModalVisible(true); }} />
          <Button icon={<DeleteOutlined />} danger onClick={() => deleteSubject(record.id)} />
        </Space>
      ),
    },
  ];

  const handleSave = (values: any) => {
    if (editingSubject) {
      updateSubject(editingSubject.id, values);
    } else {
      addSubject(values);
    }
    setEditingSubject(null);
  };

  const formItems = (
    <>
      <Form.Item label="Mã môn" name="code" rules={[{ required: true, message: 'Vui lòng nhập mã môn!' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Tên môn" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên môn!' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Số tín chỉ" name="credits" rules={[{ required: true, message: 'Vui lòng nhập số tín chỉ!' }]}>
        <InputNumber min={1} max={10} />
      </Form.Item>
    </>
  );

  return (
    <Card title="Danh mục môn học">
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
        Thêm môn học
      </Button>
      <Table dataSource={subjects} columns={columns} rowKey="id" pagination={false} />
      <EditModal
        visible={modalVisible}
        editingItem={editingSubject}
        onCancel={() => { setModalVisible(false); setEditingSubject(null); }}
        onSave={handleSave}
        formItems={formItems}
        title={editingSubject ? 'Sửa môn học' : 'Thêm môn học'}
      />
    </Card>
  );
};

const QuestionManager: React.FC = () => {
  const { questions, subjects, knowledgeBlocks, addQuestion, updateQuestion, deleteQuestion } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [filters, setFilters] = useState({ subjectId: '', difficulty: '', knowledgeBlockId: '' });

  const filteredQuestions = questions.filter(q => {
    if (filters.subjectId && q.subjectId !== filters.subjectId) return false;
    if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
    if (filters.knowledgeBlockId && q.knowledgeBlockId !== filters.knowledgeBlockId) return false;
    return true;
  });

  const columns = [
    { title: 'Mã câu hỏi', dataIndex: 'code', key: 'code' },
    {
      title: 'Môn học',
      dataIndex: 'subjectId',
      key: 'subject',
      render: (id: string) => subjects.find(s => s.id === id)?.name || id,
    },
    { title: 'Nội dung', dataIndex: 'content', key: 'content', ellipsis: true },
    { title: 'Mức độ khó', dataIndex: 'difficulty', key: 'difficulty' },
    {
      title: 'Khối kiến thức',
      dataIndex: 'knowledgeBlockId',
      key: 'knowledgeBlock',
      render: (id: string) => knowledgeBlocks.find(b => b.id === id)?.name || id,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Question) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => { setEditingQuestion(record); setModalVisible(true); }} />
          <Button icon={<DeleteOutlined />} danger onClick={() => deleteQuestion(record.id)} />
        </Space>
      ),
    },
  ];

  const handleSave = (values: any) => {
    if (editingQuestion) {
      updateQuestion(editingQuestion.id, values);
    } else {
      addQuestion(values);
    }
    setEditingQuestion(null);
  };

  const formItems = (
    <>
      <Form.Item label="Mã câu hỏi (để trống để tự sinh)" name="code">
        <Input placeholder="VD: Q001" />
      </Form.Item>
      <Form.Item label="Môn học" name="subjectId" rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}>
        <Select placeholder="Chọn môn học">
          {subjects.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
        </Select>
      </Form.Item>
      <Form.Item label="Nội dung câu hỏi" name="content" rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}>
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item label="Mức độ khó" name="difficulty" rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}>
        <Select placeholder="Chọn mức độ">
          <Option value="Dễ">Dễ</Option>
          <Option value="Trung bình">Trung bình</Option>
          <Option value="Khó">Khó</Option>
          <Option value="Rất khó">Rất khó</Option>
        </Select>
      </Form.Item>
      <Form.Item label="Khối kiến thức" name="knowledgeBlockId" rules={[{ required: true, message: 'Vui lòng chọn khối kiến thức!' }]}>
        <Select placeholder="Chọn khối kiến thức">
          {knowledgeBlocks.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
        </Select>
      </Form.Item>
    </>
  );

  return (
    <Card title="Quản lý câu hỏi">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card size="small" title="Bộ lọc tìm kiếm">
          <Space wrap>
            <Select
              placeholder="Lọc theo môn học"
              allowClear
              style={{ width: 200 }}
              onChange={value => setFilters({ ...filters, subjectId: value })}
            >
              {subjects.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
            </Select>
            <Select
              placeholder="Lọc theo mức độ khó"
              allowClear
              style={{ width: 150 }}
              onChange={value => setFilters({ ...filters, difficulty: value })}
            >
              <Option value="Dễ">Dễ</Option>
              <Option value="Trung bình">Trung bình</Option>
              <Option value="Khó">Khó</Option>
              <Option value="Rất khó">Rất khó</Option>
            </Select>
            <Select
              placeholder="Lọc theo khối kiến thức"
              allowClear
              style={{ width: 180 }}
              onChange={value => setFilters({ ...filters, knowledgeBlockId: value })}
            >
              {knowledgeBlocks.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
            </Select>
          </Space>
        </Card>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
          Thêm câu hỏi
        </Button>
        <Table dataSource={filteredQuestions} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} />
      </Space>
      <EditModal
        visible={modalVisible}
        editingItem={editingQuestion}
        onCancel={() => { setModalVisible(false); setEditingQuestion(null); }}
        onSave={handleSave}
        formItems={formItems}
        title={editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}
      />
    </Card>
  );
};

// 4. Quản lý cấu trúc đề thi
const ExamStructureManager: React.FC = () => {
  const { subjects, knowledgeBlocks, examStructures, addExamStructure, updateExamStructure, deleteExamStructure } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStructure, setEditingStructure] = useState<ExamStructure | null>(null);
  const [requirements, setRequirements] = useState<ExamRequirement[]>([{ difficulty: 'Dễ', knowledgeBlockId: '', count: 1 }]);

  const columns = [
    { title: 'Tên cấu trúc', dataIndex: 'name', key: 'name' },
    {
      title: 'Môn học',
      dataIndex: 'subjectId',
      key: 'subject',
      render: (id: string) => subjects.find(s => s.id === id)?.name || id,
    },
    {
      title: 'Yêu cầu',
      key: 'requirements',
      render: (_: any, record: ExamStructure) => (
        <ul>
          {record.requirements.map((req, idx) => {
            const block = knowledgeBlocks.find(b => b.id === req.knowledgeBlockId)?.name;
            return <li key={idx}>{req.difficulty} - {block}: {req.count} câu</li>;
          })}
        </ul>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: ExamStructure) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => { setEditingStructure(record); setRequirements(record.requirements); setModalVisible(true); }} />
          <Button icon={<DeleteOutlined />} danger onClick={() => deleteExamStructure(record.id)} />
        </Space>
      ),
    },
  ];

  const handleAddRequirement = () => {
    setRequirements([...requirements, { difficulty: 'Dễ', knowledgeBlockId: '', count: 1 }]);
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleRequirementChange = (index: number, field: keyof ExamRequirement, value: any) => {
    const newReqs = [...requirements];
    newReqs[index] = { ...newReqs[index], [field]: value };
    setRequirements(newReqs);
  };

  const handleSave = (values: any) => {
    if (requirements.some(r => !r.knowledgeBlockId)) {
      message.warning('Vui lòng chọn khối kiến thức cho tất cả các dòng yêu cầu!');
      return;
    }
    const structureData = { ...values, requirements };
    if (editingStructure) {
      updateExamStructure(editingStructure.id, structureData);
    } else {
      addExamStructure(structureData);
    }
    setModalVisible(false);
    setEditingStructure(null);
    setRequirements([{ difficulty: 'Dễ', knowledgeBlockId: '', count: 1 }]);
  };

  const formItems = (
    <>
      <Form.Item label="Tên cấu trúc" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên cấu trúc!' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Môn học" name="subjectId" rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}>
        <Select placeholder="Chọn môn học">
          {subjects.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
        </Select>
      </Form.Item>

      <Title level={5}>Yêu cầu câu hỏi</Title>
      {requirements.map((req, index) => (
        <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
          <Select
            value={req.difficulty}
            onChange={val => handleRequirementChange(index, 'difficulty', val)}
            style={{ width: 120 }}
          >
            <Option value="Dễ">Dễ</Option>
            <Option value="Trung bình">Trung bình</Option>
            <Option value="Khó">Khó</Option>
            <Option value="Rất khó">Rất khó</Option>
          </Select>
          <Select
            value={req.knowledgeBlockId}
            onChange={val => handleRequirementChange(index, 'knowledgeBlockId', val)}
            placeholder="Khối kiến thức"
            style={{ width: 150 }}
          >
            {knowledgeBlocks.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
          </Select>
          <InputNumber
            min={1}
            value={req.count}
            onChange={val => handleRequirementChange(index, 'count', val || 1)}
            placeholder="Số lượng"
          />
          <Button danger onClick={() => handleRemoveRequirement(index)} icon={<DeleteOutlined />} />
        </Space>
      ))}
      <Button type="dashed" onClick={handleAddRequirement} block icon={<PlusOutlined />}>
        Thêm yêu cầu
      </Button>
    </>
  );

  return (
    <Card title="Quản lý cấu trúc đề thi">
      <Button type="primary" icon={<PlusOutlined />} onClick={() => { setModalVisible(true); setRequirements([{ difficulty: 'Dễ', knowledgeBlockId: '', count: 1 }]); }} style={{ marginBottom: 16 }}>
        Thêm cấu trúc
      </Button>
      <Table dataSource={examStructures} columns={columns} rowKey="id" pagination={false} />
      <EditModal
        visible={modalVisible}
        editingItem={editingStructure}
        onCancel={() => { setModalVisible(false); setEditingStructure(null); setRequirements([{ difficulty: 'Dễ', knowledgeBlockId: '', count: 1 }]); }}
        onSave={handleSave}
        formItems={formItems}
        title={editingStructure ? 'Sửa cấu trúc đề thi' : 'Thêm cấu trúc đề thi'}
      />
    </Card>
  );
};

// 5. Tạo đề thi (theo cấu trúc hoặc tùy chỉnh)
const ExamGenerator: React.FC = () => {
  const { subjects, knowledgeBlocks, examStructures, generateExam } = useAppContext();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [useStructure, setUseStructure] = useState<boolean>(false);
  const [selectedStructure, setSelectedStructure] = useState<string>('');
  const [examName, setExamName] = useState<string>('');
  const [requirements, setRequirements] = useState<ExamRequirement[]>([{ difficulty: 'Dễ', knowledgeBlockId: '', count: 1 }]);

  const handleAddRequirement = () => {
    setRequirements([...requirements, { difficulty: 'Dễ', knowledgeBlockId: '', count: 1 }]);
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleRequirementChange = (index: number, field: keyof ExamRequirement, value: any) => {
    const newReqs = [...requirements];
    newReqs[index] = { ...newReqs[index], [field]: value };
    setRequirements(newReqs);
  };

  const handleGenerate = () => {
    if (!selectedSubject) {
      message.warning('Vui lòng chọn môn học!');
      return;
    }
    if (!examName.trim()) {
      message.warning('Vui lòng nhập tên đề thi!');
      return;
    }

    let finalRequirements: ExamRequirement[] = [];
    if (useStructure) {
      const structure = examStructures.find(s => s.id === selectedStructure);
      if (!structure) {
        message.error('Không tìm thấy cấu trúc!');
        return;
      }
      finalRequirements = structure.requirements;
    } else {
      if (requirements.some(r => !r.knowledgeBlockId)) {
        message.warning('Vui lòng chọn khối kiến thức cho tất cả các dòng yêu cầu!');
        return;
      }
      finalRequirements = requirements;
    }

    generateExam(selectedSubject, finalRequirements, examName, useStructure ? selectedStructure : undefined);
  };

  return (
    <Card title="Tạo đề thi">
      <Form layout="vertical">
        <Form.Item label="Tên đề thi" required>
          <Input value={examName} onChange={e => setExamName(e.target.value)} placeholder="Nhập tên đề thi" />
        </Form.Item>
        <Form.Item label="Môn học" required>
          <Select value={selectedSubject} onChange={setSelectedSubject} placeholder="Chọn môn học">
            {subjects.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
          </Select>
        </Form.Item>

        <Form.Item label="Sử dụng cấu trúc có sẵn?">
          <Select value={useStructure ? 'yes' : 'no'} onChange={val => setUseStructure(val === 'yes')} style={{ width: 200 }}>
            <Option value="no">Tùy chỉnh</Option>
            <Option value="yes">Dùng cấu trúc</Option>
          </Select>
        </Form.Item>

        {useStructure ? (
          <Form.Item label="Chọn cấu trúc" required>
            <Select value={selectedStructure} onChange={setSelectedStructure} placeholder="Chọn cấu trúc">
              {examStructures
                .filter(s => !selectedSubject || s.subjectId === selectedSubject)
                .map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
            </Select>
          </Form.Item>
        ) : (
          <>
            <Title level={5}>Yêu cầu câu hỏi</Title>
            {requirements.map((req, index) => (
              <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Select
                  value={req.difficulty}
                  onChange={val => handleRequirementChange(index, 'difficulty', val)}
                  style={{ width: 120 }}
                >
                  <Option value="Dễ">Dễ</Option>
                  <Option value="Trung bình">Trung bình</Option>
                  <Option value="Khó">Khó</Option>
                  <Option value="Rất khó">Rất khó</Option>
                </Select>
                <Select
                  value={req.knowledgeBlockId}
                  onChange={val => handleRequirementChange(index, 'knowledgeBlockId', val)}
                  placeholder="Khối kiến thức"
                  style={{ width: 150 }}
                >
                  {knowledgeBlocks.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
                </Select>
                <InputNumber
                  min={1}
                  value={req.count}
                  onChange={val => handleRequirementChange(index, 'count', val || 1)}
                  placeholder="Số lượng"
                />
                <Button danger onClick={() => handleRemoveRequirement(index)} icon={<DeleteOutlined />} />
              </Space>
            ))}
            <Button type="dashed" onClick={handleAddRequirement} block icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
              Thêm yêu cầu
            </Button>
          </>
        )}

        <Button type="primary" onClick={handleGenerate} icon={<SearchOutlined />}>
          Tạo đề thi
        </Button>
      </Form>
    </Card>
  );
};

// 6. Danh sách đề thi đã lưu
const ExamList: React.FC = () => {
  const { exams, subjects, questions, knowledgeBlocks, deleteExam } = useAppContext();

  const columns = [
    { title: 'Tên đề thi', dataIndex: 'name', key: 'name' },
    {
      title: 'Môn học',
      dataIndex: 'subjectId',
      key: 'subject',
      render: (id: string) => subjects.find(s => s.id === id)?.name || id,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => date.toLocaleString(),
    },
    {
      title: 'Số câu hỏi',
      key: 'count',
      render: (_: any, record: Exam) => record.questions.length,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Exam) => (
        <Space>
          <Button onClick={() => {
            const qs = questions.filter(q => record.questions.includes(q.id));
            const content = qs.map(q => `${q.code}: ${q.content} (${q.difficulty} - ${knowledgeBlocks.find(b => b.id === q.knowledgeBlockId)?.name})`).join('\n\n');
            Modal.info({
              title: `Chi tiết đề thi: ${record.name}`,
              content: <pre style={{ maxHeight: 400, overflow: 'auto' }}>{content}</pre>,
              width: 600,
            });
          }}>Xem</Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => deleteExam(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <Card title="Đề thi đã lưu">
      <Table dataSource={exams} columns={columns} rowKey="id" pagination={false} />
    </Card>
  );
};

// -------------------- Main App --------------------
const App: React.FC = () => {
  return (
    <AppProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ color: 'white', fontSize: 20 }}>Hệ thống quản lý ngân hàng câu hỏi tự luận</Header>
        <Content style={{ padding: '24px' }}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Khối kiến thức" key="1">
              <KnowledgeBlockManager />
            </TabPane>
            <TabPane tab="Môn học" key="2">
              <SubjectManager />
            </TabPane>
            <TabPane tab="Câu hỏi" key="3">
              <QuestionManager />
            </TabPane>
            <TabPane tab="Cấu trúc đề thi" key="4">
              <ExamStructureManager />
            </TabPane>
            <TabPane tab="Tạo đề thi" key="5">
              <ExamGenerator />
            </TabPane>
            <TabPane tab="Đề thi đã lưu" key="6">
              <ExamList />
            </TabPane>
          </Tabs>
        </Content>
      </Layout>
    </AppProvider>
  );
};

export default App;