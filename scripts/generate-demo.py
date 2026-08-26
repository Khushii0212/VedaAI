"""
Generate demo images for VedaAI.
Creates a sample question paper and handwritten answer sheet.
"""
from PIL import Image, ImageDraw
import os

OUTPUT_DIR = "public/demo"
W, H = 900, 1200

def get_font(size, bold=False):
    """Try to get a decent font, fall back to default."""
    try:
        from PIL import ImageFont
        if bold:
            return ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", size)
        return ImageFont.truetype("C:/Windows/Fonts/arial.ttf", size)
    except:
        try:
            from PIL import ImageFont
            return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
        except:
            from PIL import ImageFont
            return ImageFont.load_default()

def draw_text_wrapped(draw, text, x, y, max_width, font, fill="#000000"):
    """Draw text with word wrapping. Returns final y position."""
    words = text.split(' ')
    line = ''
    for word in words:
        test = line + word + ' '
        bbox = draw.textbbox((0, 0), test, font=font)
        w = bbox[2] - bbox[0]
        if w > max_width and line:
            draw.text((x, y), line.strip(), font=font, fill=fill)
            y += bbox[3] - bbox[1] + 4
            line = word + ' '
        else:
            line = test
    if line.strip():
        draw.text((x, y), line.strip(), font=font, fill=fill)
        bbox = draw.textbbox((0, 0), line, font=font)
        y += bbox[3] - bbox[1] + 4
    return y


def generate_question_paper():
    img = Image.new('RGB', (W, H), '#ffffff')
    draw = ImageDraw.Draw(img)
    
    # Border
    draw.rectangle([15, 15, W-15, H-15], outline='#1a1a2e', width=3)
    draw.rectangle([22, 22, W-22, H-22], outline='#1a1a2e', width=1)

    # Title
    f_title = get_font(24, bold=True)
    f_header = get_font(16)
    f_bold = get_font(18, bold=True)
    f_regular = get_font(17)
    f_sub = get_font(16)
    f_italic = get_font(15)
    f_small = get_font(13)

    title = "COMPUTER SCIENCE — EXAMINATION PAPER"
    bbox = draw.textbbox((0,0), title, font=f_title)
    tw = bbox[2] - bbox[0]
    draw.text(((W-tw)//2, 40), title, font=f_title, fill='#1a1a2e')

    sub = "Time: 3 Hours                                        Max. Marks: 100"
    bbox2 = draw.textbbox((0,0), sub, font=f_header)
    sw = bbox2[2] - bbox2[0]
    draw.text(((W-sw)//2, 78), sub, font=f_header, fill='#333333')

    # Divider
    draw.rectangle([22, 107, W-22, 110], fill='#1a1a2e')

    # Instructions
    draw.text((40, 122), "Instructions: Answer ALL questions. Sub-questions carry separate marks. Write clearly.", font=f_italic, fill='#444444')
    draw.line([(22, 148), (W-22, 148)], fill='#cccccc', width=1)

    # Questions
    questions = [
        ("1.", "Define the following terms:", "(5 marks)", False),
        ("1(a).", "What is an Operating System? Give two suitable examples.", "(2 marks)", True),
        ("1(b).", "Explain the concept of a Process and describe its five lifecycle states.", "(3 marks)", True),
        ("2.", "Answer the following questions about Computer Networking:", "(10 marks)", False),
        ("2(a).", "Explain the difference between TCP and UDP protocols with examples.", "(5 marks)", True),
        ("2(b).", "What is the OSI model? Name and briefly describe all 7 layers.", "(5 marks)", True),
        ("3.", "Write a detailed note on Database Normalization. Explain 1NF, 2NF and 3NF with examples.", "(15 marks)", False),
        ("4.", "Explain Recursion with a suitable example. Write a recursive function to compute factorial of n.", "(10 marks)", False),
        ("5.", "What are the advantages and disadvantages of Cloud Computing? Give examples of cloud providers.", "(10 marks)", False),
    ]

    y = 165
    for num, text, marks, is_sub in questions:
        indent = 60 if is_sub else 35
        num_font = f_sub if is_sub else f_bold
        text_font = f_regular if is_sub else f_bold

        draw.text((indent, y), num, font=num_font, fill='#000000')
        
        marks_bbox = draw.textbbox((0,0), marks, font=f_italic)
        marks_w = marks_bbox[2] - marks_bbox[0]
        draw.text((W - marks_w - 35, y), marks, font=f_italic, fill='#555555')

        new_y = draw_text_wrapped(draw, text, indent + 75, y, W - indent - 120, text_font, '#111111')
        y = max(new_y, y + 28) + 18

    # Footer
    draw.line([(22, H-55), (W-22, H-55)], fill='#aaaaaa', width=1)
    footer = "— End of Question Paper —   Page 1 of 1"
    bbox_f = draw.textbbox((0,0), footer, font=f_small)
    fw = bbox_f[2] - bbox_f[0]
    draw.text(((W-fw)//2, H-40), footer, font=f_small, fill='#888888')

    img.save(os.path.join(OUTPUT_DIR, "question-paper.jpg"), "JPEG", quality=95)
    print("✓ Generated question-paper.jpg")


def generate_answer_sheet():
    img = Image.new('RGB', (W, H), '#fdfdf8')
    draw = ImageDraw.Draw(img)

    f_title = get_font(22, bold=True)
    f_header = get_font(15)
    f_bold_ans = get_font(21, bold=True)
    f_ans = get_font(18)
    f_code = get_font(15)
    f_small = get_font(13)

    # Margin line (red)
    draw.line([(85, 0), (85, H)], fill='#ff9999', width=2)

    # Hole punches
    for py in [120, H//2, H-120]:
        draw.ellipse([5, py-10, 30, py+10], outline='#cccccc', width=1)

    # Header box
    draw.rectangle([85, 18, W-18, 108], outline='#cccccc', width=1)
    
    title = "ANSWER SHEET"
    bbox = draw.textbbox((0,0), title, font=f_title)
    tw = bbox[2] - bbox[0]
    draw.text(((W-tw)//2, 28), title, font=f_title, fill='#1a1a2e')
    
    draw.text((100, 62), "Name: Ravi Kumar                    Roll No: CS-2024-042", font=f_header, fill='#222222')
    draw.text((100, 84), "Subject: Computer Science           Date: 15 Aug 2024", font=f_header, fill='#222222')

    draw.line([(85, 115), (W-18, 115)], fill='#999999', width=1)

    # Answers — note: Q4 answered before Q2(a), Q3 skipped entirely
    y = 140

    # Answer 1(a)
    draw.text((100, y), "Ans. 1(a)", font=f_bold_ans, fill='#000066')
    y += 32
    y = draw_text_wrapped(draw, "An Operating System is system software that manages hardware and software resources.", 100, y, W-130, f_ans, '#111111')
    y = draw_text_wrapped(draw, "Examples: Microsoft Windows 11, Ubuntu Linux.", 100, y+2, W-130, f_ans, '#111111')
    y += 22
    draw.line([(100, y), (W-30, y)], fill='#eeeeee', width=1)
    y += 15

    # Answer 1(b)
    draw.text((100, y), "Ans. 1(b)", font=f_bold_ans, fill='#000066')
    y += 32
    y = draw_text_wrapped(draw, "A Process is a program in execution. Its lifecycle states are:", 100, y, W-130, f_ans, '#111111')
    for state in ["1. New — being created", "2. Ready — waiting to run", "3. Running — being executed", "4. Waiting — waiting for I/O", "5. Terminated — execution finished"]:
        y = draw_text_wrapped(draw, state, 120, y+2, W-150, f_code, '#222222')
    y += 22
    draw.line([(100, y), (W-30, y)], fill='#eeeeee', width=1)
    y += 15

    # Answer 4 (OUT OF ORDER — student answered this before Q2)
    draw.text((100, y), "Ans. 4", font=f_bold_ans, fill='#000066')
    y += 32
    y = draw_text_wrapped(draw, "Recursion is when a function calls itself to solve a smaller version of the same problem.", 100, y, W-130, f_ans, '#111111')
    y = draw_text_wrapped(draw, "Factorial example:", 100, y+4, W-130, f_ans, '#111111')
    y += 4
    for line in ["def factorial(n):", "    if n == 0:", "        return 1", "    return n * factorial(n - 1)"]:
        draw.text((130, y), line, font=f_code, fill='#333333')
        y += 22
    y += 18
    draw.line([(100, y), (W-30, y)], fill='#eeeeee', width=1)
    y += 15

    # Answer 2(a)
    draw.text((100, y), "Ans. 2(a)", font=f_bold_ans, fill='#000066')
    y += 32
    y = draw_text_wrapped(draw, "TCP (Transmission Control Protocol): Connection-oriented, reliable, uses 3-way handshake.", 100, y, W-130, f_ans, '#111111')
    y = draw_text_wrapped(draw, "UDP (User Datagram Protocol): Connectionless, faster, no guaranteed delivery.", 100, y+3, W-130, f_ans, '#111111')
    y = draw_text_wrapped(draw, "TCP used for: email, HTTP. UDP used for: video streaming, DNS.", 100, y+3, W-130, f_ans, '#111111')
    y += 20

    # Q3 is intentionally not answered (demonstrates unanswered detection)
    # Q2(b) and Q5 also not answered

    # Footer
    draw.line([(85, H-55), (W-18, H-55)], fill='#aaaaaa', width=1)
    footer = "Page 1 / 1   —   VedaAI Demo Assessment"
    bbox_f = draw.textbbox((0,0), footer, font=f_small)
    fw = bbox_f[2] - bbox_f[0]
    draw.text(((W-fw)//2, H-38), footer, font=f_small, fill='#888888')

    img.save(os.path.join(OUTPUT_DIR, "answer-sheet.jpg"), "JPEG", quality=95)
    print("✓ Generated answer-sheet.jpg")


if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    generate_question_paper()
    generate_answer_sheet()
    print(f"\nDemo images saved to {OUTPUT_DIR}/")
    print("Edge cases demonstrated:")
    print("  ✓ Out-of-order answers (Q4 answered before Q2a)")
    print("  ✓ Unanswered questions (Q3, Q2b, Q5 not answered)")
    print("  ✓ Sub-parts (1a, 1b, 2a, 2b)")
    print("  ✓ Multiple questions on one paper")
