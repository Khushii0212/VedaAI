const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// This script generates demo images for VedaAI
// Run with: node scripts/generate-demo.js
// NOTE: Requires 'canvas' npm package: npm install canvas

const OUTPUT_DIR = path.join(__dirname, '../public/demo');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function drawQuestionPaper(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Header border
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // Title
  ctx.fillStyle = '#1a1a2e';
  ctx.font = 'bold 28px serif';
  ctx.textAlign = 'center';
  ctx.fillText('COMPUTER SCIENCE — EXAMINATION PAPER', W / 2, 70);
  ctx.font = '18px serif';
  ctx.fillText('Time: 3 Hours                                                    Max. Marks: 100', W / 2, 100);
  
  // Horizontal rule
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(20, 115, W - 40, 2);

  // Instructions
  ctx.fillStyle = '#333';
  ctx.font = 'italic 16px serif';
  ctx.textAlign = 'left';
  ctx.fillText('Instructions: Answer ALL questions. Write clearly. Sub-questions carry separate marks.', 40, 145);

  // Questions
  ctx.fillStyle = '#000';
  ctx.textAlign = 'left';

  const questions = [
    { num: '1.', text: 'Define the following terms:', marks: '(5 marks)', sub: null },
    { num: '1(a).', text: 'What is an Operating System? Give two examples.', marks: '(2 marks)', sub: true },
    { num: '1(b).', text: 'Explain the concept of a Process and its lifecycle states.', marks: '(3 marks)', sub: true },
    { num: '2.', text: 'Answer the following questions about Networking:', marks: '(10 marks)', sub: null },
    { num: '2(a).', text: 'Explain the difference between TCP and UDP protocols.', marks: '(5 marks)', sub: true },
    { num: '2(b).', text: 'What is the OSI model? Name all 7 layers.', marks: '(5 marks)', sub: true },
    { num: '3.', text: 'Write a short note on Database Normalization. Explain 1NF, 2NF, and 3NF with examples.', marks: '(15 marks)', sub: null },
    { num: '4.', text: 'Explain Recursion with a suitable example. Write a recursive function for factorial.', marks: '(10 marks)', sub: null },
    { num: '5.', text: 'What are the advantages and disadvantages of cloud computing?', marks: '(10 marks)', sub: null },
  ];

  let y = 185;
  for (const q of questions) {
    if (!q.sub) {
      ctx.font = 'bold 20px serif';
      ctx.fillStyle = '#000';
    } else {
      ctx.font = '18px serif';
      ctx.fillStyle = '#222';
    }

    const indent = q.sub ? 60 : 40;
    ctx.fillText(q.num, indent, y);
    
    // Wrap text
    ctx.font = q.sub ? '18px serif' : 'bold 18px serif';
    const words = q.text.split(' ');
    let line = '';
    let textX = indent + 60;
    let textY = y;
    const maxWidth = W - textX - 160;

    for (const word of words) {
      const testLine = line + word + ' ';
      if (ctx.measureText(testLine).width > maxWidth && line !== '') {
        ctx.fillText(line, textX, textY);
        line = word + ' ';
        textY += 26;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, textX, textY);

    // Marks
    ctx.font = 'italic 15px serif';
    ctx.fillStyle = '#555';
    ctx.textAlign = 'right';
    ctx.fillText(q.marks, W - 45, y);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#222';

    y = textY + 40;
  }

  // Footer
  ctx.font = '14px serif';
  ctx.fillStyle = '#888';
  ctx.textAlign = 'center';
  ctx.fillText('— End of Question Paper — Page 1 of 1 —', W / 2, H - 35);
}

function drawAnswerSheet(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // Off-white background (like real exam paper)
  ctx.fillStyle = '#fdfdf8';
  ctx.fillRect(0, 0, W, H);

  // Margin line
  ctx.strokeStyle = '#ffaaaa';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(80, H);
  ctx.stroke();

  // Header
  ctx.fillStyle = '#1a1a2e';
  ctx.font = 'bold 22px serif';
  ctx.textAlign = 'center';
  ctx.fillText('ANSWER SHEET', W / 2, 45);
  ctx.font = '16px serif';
  ctx.textAlign = 'left';
  ctx.fillText('Name: Ravi Kumar               Roll No: CS-2024-042', 100, 75);
  ctx.fillText('Subject: Computer Science       Date: 15 Aug 2024', 100, 98);

  // Horizontal line
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 112);
  ctx.lineTo(W - 20, 112);
  ctx.stroke();

  // Handwritten-style answers (simulated)
  const handwritingStyle = (size = 18) => {
    ctx.font = `${size}px "Courier New", monospace`;
    ctx.fillStyle = '#1a1a7a';
  };

  const boldAnswer = (size = 20) => {
    ctx.font = `bold ${size}px "Courier New", monospace`;
    ctx.fillStyle = '#000080';
  };

  // Answer 1(a) - written first  
  let y = 140;
  boldAnswer(22);
  ctx.fillText('Ans. 1(a)', 100, y);
  y += 30;
  handwritingStyle();
  ctx.fillText('An Operating System is system software that manages computer hardware', 100, y); y += 26;
  ctx.fillText('and software resources. Examples: Windows 11, Ubuntu Linux.', 100, y); y += 40;

  // Answer 1(b)
  boldAnswer(22);
  ctx.fillText('Ans. 1(b)', 100, y);
  y += 30;
  handwritingStyle();
  ctx.fillText('A Process is a program in execution. States: New, Ready, Running,', 100, y); y += 26;
  ctx.fillText('Waiting, Terminated. The OS manages transitions between these states', 100, y); y += 26;
  ctx.fillText('using scheduling algorithms.', 100, y); y += 45;

  // Answer 4 - out of order!
  boldAnswer(22);
  ctx.fillText('Ans. 4', 100, y);
  y += 30;
  handwritingStyle();
  ctx.fillText('Recursion is when a function calls itself to solve smaller subproblems.', 100, y); y += 26;
  ctx.fillText('Factorial example:', 100, y); y += 26;
  ctx.font = '16px "Courier New", monospace';
  ctx.fillStyle = '#333';
  ctx.fillText('  def factorial(n):', 100, y); y += 22;
  ctx.fillText('    if n == 0: return 1', 100, y); y += 22;
  ctx.fillText('    return n * factorial(n-1)', 100, y); y += 45;

  // Answer 2(a)
  boldAnswer(22);
  ctx.fillStyle = '#000080';
  ctx.fillText('Ans. 2(a)', 100, y);
  y += 30;
  handwritingStyle();
  ctx.fillText('TCP (Transmission Control Protocol) is connection-oriented, reliable,', 100, y); y += 26;
  ctx.fillText('uses 3-way handshake. UDP is connectionless, faster but unreliable.', 100, y); y += 26;
  ctx.fillText('TCP: email, web browsing. UDP: video streaming, gaming.', 100, y); y += 45;

  // Footer - Q3 intentionally NOT answered (skipped)
  ctx.strokeStyle = '#aaa';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(80, H - 50);
  ctx.lineTo(W - 20, H - 50);
  ctx.stroke();

  ctx.font = '13px serif';
  ctx.fillStyle = '#999';
  ctx.textAlign = 'center';
  ctx.fillText('Page 1 / 1   —   VedaAI Demo Assessment', W / 2, H - 30);
}

// Generate images
const W = 900;
const H = 1200;

try {
  const qCanvas = createCanvas(W, H);
  drawQuestionPaper(qCanvas);
  const qBuffer = qCanvas.toBuffer('image/jpeg', { quality: 0.95 });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'question-paper.jpg'), qBuffer);
  console.log('✓ Generated question-paper.jpg');

  const aCanvas = createCanvas(W, H);
  drawAnswerSheet(aCanvas);
  const aBuffer = aCanvas.toBuffer('image/jpeg', { quality: 0.95 });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'answer-sheet.jpg'), aBuffer);
  console.log('✓ Generated answer-sheet.jpg');

  console.log('\nDemo images generated in public/demo/');
} catch (err) {
  console.error('Error generating demo images (requires canvas package):', err.message);
  console.log('Alternative: Place your own question-paper.jpg and answer-sheet.jpg in public/demo/');
}
