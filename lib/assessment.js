// ============================================================
// VedaAI — Assessment Summary & Demo Data
// Matches Database Management Systems exam paper & answer sheet
// ============================================================

/**
 * Compute summary statistics for an assessment.
 */
export function computeSummary(questions, mappings) {
  const answered = mappings.filter((m) => m.status === 'answered').length;
  const unanswered = mappings.filter((m) => m.status === 'unanswered').length;
  const uncertain = mappings.filter((m) => m.status === 'uncertain').length;
  const unmatched = mappings.filter((m) => m.status === 'unmatched').length;
  const total = questions.length;
  const coveragePercent = total > 0 ? Math.round((answered / total) * 100) : 0;

  return {
    totalQuestions: total,
    answered,
    unanswered,
    uncertain,
    unmatched,
    coveragePercent,
  };
}

/**
 * Format file size for display.
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Generate a unique ID.
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Get confidence level label from confidence score.
 */
export function getConfidenceLevel(confidence) {
  if (confidence >= 0.85) return 'high';
  if (confidence >= 0.6) return 'medium';
  return 'low';
}

/**
 * Get display label for confidence level.
 */
export function getConfidenceLabel(level) {
  const labels = {
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Needs Review',
  };
  return labels[level] || 'Unknown';
}

/**
 * Get status display info.
 */
export function getStatusInfo(status) {
  const info = {
    answered: { label: 'Answered', color: 'green', icon: 'check' },
    unanswered: { label: 'Unanswered', color: 'red', icon: 'x' },
    uncertain: { label: 'Needs Review', color: 'amber', icon: 'alert' },
    unmatched: { label: 'Unmatched', color: 'purple', icon: 'help' },
  };
  return info[status] || { label: 'Unknown', color: 'gray', icon: 'help' };
}

/**
 * Demo assessment data matching Database Management Systems test paper & answer sheet:
 * - Subparts as separate questions: 3(a), 3(b)
 * - Out-of-order student answers: Ans 4 before Ans 2
 * - Multi-page answer: Ans 3(b) starts on page 1, completes on page 2
 * - Unanswered questions: Q7, Q8
 * - Unmatched answer: Ans 9
 */
export function getDemoAssessmentData(qPages, aPages) {
  const questions = [
    {
      id: 'q_1',
      number: '1',
      text: 'What is a DBMS? Give three advantages of using a DBMS instead of storing data only in files.',
      page: 1,
      type: 'main',
      marks: 5,
    },
    {
      id: 'q_2',
      number: '2',
      text: 'Explain the ACID properties of a database transaction.',
      page: 1,
      type: 'main',
      marks: 6,
    },
    {
      id: 'q_3a',
      number: '3(a)',
      text: 'Define functional dependency.',
      page: 1,
      type: 'subpart',
      marks: 3,
    },
    {
      id: 'q_3b',
      number: '3(b)',
      text: 'Give an example of a functional dependency using a Student table.',
      page: 1,
      type: 'subpart',
      marks: 3,
    },
    {
      id: 'q_4',
      number: '4',
      text: 'Explain 1NF, 2NF, and 3NF. Why is normalization useful?',
      page: 1,
      type: 'main',
      marks: 8,
    },
    {
      id: 'q_5',
      number: '5',
      text: 'Differentiate between DELETE, DROP, and TRUNCATE in SQL.',
      page: 1,
      type: 'main',
      marks: 6,
    },
    {
      id: 'q_6',
      number: '6',
      text: "Write an SQL query to find employees whose salary is greater than 50000 and whose department is 'IT'.",
      page: 1,
      type: 'main',
      marks: 5,
    },
    {
      id: 'q_7',
      number: '7',
      text: 'Explain INNER JOIN and LEFT JOIN with a simple example.',
      page: 1,
      type: 'main',
      marks: 7,
    },
    {
      id: 'q_8',
      number: '8',
      text: 'What is an index? Explain one advantage and one disadvantage of indexing.',
      page: 1,
      type: 'main',
      marks: 7,
    },
  ];

  const answers = [
    {
      id: 'ans_1',
      detectedQuestionNumber: '1',
      answerText: 'A DBMS is software used to create, store, retrieve, and manage structured data. It provides better consistency, security, and concurrent access than simple file storage.',
      regions: [
        {
          page: 1,
          boundingBox: { x: 80, y: 195, width: 840, height: 105 },
        },
      ],
      confidence: 0.98,
      confidenceLevel: 'high',
    },
    {
      id: 'ans_4',
      detectedQuestionNumber: '4',
      answerText: '1NF requires atomic values. 2NF removes partial dependency on part of a composite key. 3NF removes transitive dependency. Normalization reduces redundancy and update anomalies.',
      regions: [
        {
          page: 1,
          boundingBox: { x: 80, y: 385, width: 840, height: 115 },
        },
      ],
      confidence: 0.96,
      confidenceLevel: 'high',
    },
    {
      id: 'ans_2',
      detectedQuestionNumber: '2',
      answerText: 'ACID means Atomicity, Consistency, Isolation, and Durability. Together these properties make transactions reliable.',
      regions: [
        {
          page: 1,
          boundingBox: { x: 80, y: 570, width: 840, height: 90 },
        },
      ],
      confidence: 0.97,
      confidenceLevel: 'high',
    },
    {
      id: 'ans_3a',
      detectedQuestionNumber: '3(a)',
      answerText: 'A functional dependency X -> Y means the value of X determines the value of Y.',
      regions: [
        {
          page: 1,
          boundingBox: { x: 80, y: 735, width: 840, height: 80 },
        },
      ],
      confidence: 0.95,
      confidenceLevel: 'high',
    },
    {
      id: 'ans_3b',
      detectedQuestionNumber: '3(b)',
      answerText: 'For a Student table, StudentID -> StudentName because one StudentID identifies one student name.',
      regions: [
        {
          page: 1,
          boundingBox: { x: 80, y: 885, width: 840, height: 50 },
        },
        {
          page: 2,
          boundingBox: { x: 80, y: 55, width: 840, height: 80 },
        },
      ],
      confidence: 0.94,
      confidenceLevel: 'high',
    },
    {
      id: 'ans_5',
      detectedQuestionNumber: '5',
      answerText: 'DELETE removes selected rows and can use a WHERE clause. TRUNCATE removes all rows quickly. DROP removes the table structure itself.',
      regions: [
        {
          page: 2,
          boundingBox: { x: 80, y: 200, width: 840, height: 100 },
        },
      ],
      confidence: 0.96,
      confidenceLevel: 'high',
    },
    {
      id: 'ans_6',
      detectedQuestionNumber: '6',
      answerText: "SELECT * FROM employees WHERE salary > 50000 AND department = 'IT';",
      regions: [
        {
          page: 2,
          boundingBox: { x: 80, y: 365, width: 840, height: 75 },
        },
      ],
      confidence: 0.98,
      confidenceLevel: 'high',
    },
    {
      id: 'ans_9',
      detectedQuestionNumber: '9',
      answerText: 'Extra answer: this does not correspond to any question in the paper.',
      regions: [
        {
          page: 2,
          boundingBox: { x: 80, y: 510, width: 840, height: 75 },
        },
      ],
      confidence: 0.90,
      confidenceLevel: 'high',
    },
  ];

  const mappings = [
    {
      questionId: 'q_1',
      answerId: 'ans_1',
      status: 'answered',
      confidence: 0.98,
      matchMethod: 'number',
      reasoning: 'Student answered 1. Identifies software definition and advantages (consistency, security, concurrency).',
      score: 5,
      maxMarks: 5,
      feedback: 'Excellent answer. Definition is correct and 3 key advantages over traditional file systems are provided.',
      evaluation: 'correct',
    },
    {
      questionId: 'q_2',
      answerId: 'ans_2',
      status: 'answered',
      confidence: 0.97,
      matchMethod: 'number',
      reasoning: 'Student answered 2 (out of order, after 4). Defines Atomicity, Consistency, Isolation, and Durability.',
      score: 6,
      maxMarks: 6,
      feedback: 'All 4 ACID transaction properties are accurately expanded and defined.',
      evaluation: 'correct',
    },
    {
      questionId: 'q_3a',
      answerId: 'ans_3a',
      status: 'answered',
      confidence: 0.95,
      matchMethod: 'number',
      reasoning: 'Student answered 3(a). Correct mathematical notation X -> Y definition provided.',
      score: 3,
      maxMarks: 3,
      feedback: 'Accurate definition of functional dependency using formal notation.',
      evaluation: 'correct',
    },
    {
      questionId: 'q_3b',
      answerId: 'ans_3b',
      status: 'answered',
      confidence: 0.94,
      matchMethod: 'number',
      reasoning: 'Student answered 3(b) across pages 1 and 2 (multi-page answer). StudentID -> StudentName example verified.',
      score: 3,
      maxMarks: 3,
      feedback: 'Great example demonstrating StudentID -> StudentName relationship across pages 1 and 2.',
      evaluation: 'correct',
    },
    {
      questionId: 'q_4',
      answerId: 'ans_4',
      status: 'answered',
      confidence: 0.96,
      matchMethod: 'number',
      reasoning: 'Student answered 4 before 2 (out-of-order). Explains 1NF, 2NF, 3NF and normalization benefits.',
      score: 8,
      maxMarks: 8,
      feedback: 'Comprehensive breakdown of normal forms and update anomaly prevention.',
      evaluation: 'correct',
    },
    {
      questionId: 'q_5',
      answerId: 'ans_5',
      status: 'answered',
      confidence: 0.96,
      matchMethod: 'number',
      reasoning: 'Student answered 5 on page 2. Differentiates DDL/DML and WHERE clause usage.',
      score: 6,
      maxMarks: 6,
      feedback: 'Clear distinction between row deletion (DELETE/TRUNCATE) and schema removal (DROP).',
      evaluation: 'correct',
    },
    {
      questionId: 'q_6',
      answerId: 'ans_6',
      status: 'answered',
      confidence: 0.98,
      matchMethod: 'number',
      reasoning: 'Student wrote valid SQL query matching conditions.',
      score: 5,
      maxMarks: 5,
      feedback: 'Syntactically valid SQL query with correct WHERE clause filter and column selection.',
      evaluation: 'correct',
    },
    {
      questionId: 'q_7',
      answerId: null,
      status: 'unanswered',
      confidence: 1.0,
      matchMethod: null,
      reasoning: 'No answer found for Question 7 (INNER JOIN vs LEFT JOIN) on the answer sheet.',
      score: 0,
      maxMarks: 7,
      feedback: 'No response found on the student answer sheet for Question 7.',
      evaluation: 'unattempted',
    },
    {
      questionId: 'q_8',
      answerId: null,
      status: 'unanswered',
      confidence: 1.0,
      matchMethod: null,
      reasoning: 'No answer found for Question 8 (Database Indexing pros/cons) on the answer sheet.',
      score: 0,
      maxMarks: 7,
      feedback: 'Student skipped Question 8 on Database Indexing.',
      evaluation: 'unattempted',
    },
  ];

  const unmatchedAnswers = [
    {
      answerId: 'ans_9',
      detectedQuestionNumber: '9',
      answerText: 'Extra answer: this does not correspond to any question in the paper.',
      regions: [
        {
          page: 2,
          boundingBox: { x: 80, y: 510, width: 840, height: 75 },
        },
      ],
    },
  ];

  return {
    id: generateId('assessment_demo'),
    createdAt: new Date().toISOString(),
    questionPaper: {
      fileName: 'DBMS_Assessment_Test_Paper_3.pdf',
      fileSize: 2048576,
      pageCount: qPages.length || 1,
      pages: qPages,
    },
    answerSheet: {
      fileName: 'Student_Answer_Sheet_Set_3.pdf',
      fileSize: 8388608,
      pageCount: aPages.length || 2,
      pages: aPages,
    },
    questions,
    answers,
    mappings,
    unmatchedAnswers,
    summary: computeSummary(questions, mappings),
  };
}
