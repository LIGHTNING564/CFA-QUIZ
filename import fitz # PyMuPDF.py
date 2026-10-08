import fitz  # PyMuPDF
import re
import json

def parse_pdf_to_json(pdf_path, output_json_path):
    # Open the PDF document
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"

    # Split document into individual question blocks using "Question #X of Y"
    question_blocks = re.split(r'(?=Question\s+#\d+\s+of\s+\d+)', full_text)
    
    questions_list = []

    for block in question_blocks:
        if not block.strip():
            continue

        # Extract Question Number and Total Questions
        q_num_match = re.search(r'Question\s+#(\d+)\s+of\s+(\d+)', block)
        if not q_num_match:
            continue
        
        q_num = int(q_num_match.group(1))
        total_q = int(q_num_match.group(2))

        # Extract Question ID
        q_id_match = re.search(r'Question\s+ID:\s*(\d+)', block)
        q_id = int(q_id_match.group(1)) if q_id_match else None

        # Extract Explanation and Reference section
        exp_match = re.search(r'Explanation\s*\n([\s\S]*?)(?=Module\s+[\d\.]+|LOS\s+[\w\.]+|\Z)', block)
        ref_match = re.search(r'(Module\s+[\d\.]+(?:,\s*LOS\s+[\w\.]+)*)', block)

        explanation_text = ""
        if exp_match:
            raw_exp = exp_match.group(1).strip()
            # Split explanation into clean lines/paragraphs to handle long step-by-step answers on new lines
            lines = [line.strip() for line in raw_exp.split('\n') if line.strip()]
            explanation_text = "\n".join(lines)

        reference_text = ref_match.group(1).strip() if ref_match else ""

        # Extract Options (A, B, C)
        options = []
        opt_matches = re.findall(r'([A-C])\)\s*(.*?)(?=\s+[A-C]\)|\s+Explanation|\Z)', block, re.DOTALL)
        for label, val in opt_matches:
            clean_val = " ".join(val.split())  # remove extra spaces/newlines inside options
            options.append({"label": label, "value": clean_val})

        # Find Correct Answer based on Explanation text or options pattern
        correct_answer = ""
        correct_match = re.search(r'Explanation\s*\n\s*([A-C])\b', block)
        if correct_match:
            correct_answer = correct_match.group(1)

        # Extract Main Question Text
        # Text lies between "Question ID: X" and Option A)
        text_match = re.search(r'Question\s+ID:\s*\d+\s*\n([\s\S]*?)(?=[A-C]\))', block)
        if text_match:
            q_text = " ".join(text_match.group(1).split())
        else:
            q_text = ""

        # Build JSON item
        question_data = {
            "question_number": q_num,
            "total_questions": total_q,
            "question_id": q_id,
            "text": q_text,
            "options": options,
            "correct_answer": correct_answer,
            "explanation": explanation_text,
            "reference": reference_text
        }

        questions_list.append(question_data)

    # Save to JSON file
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(questions_list, f, indent=2, ensure_ascii=False)

    print(f"Successfully processed {len(questions_list)} questions into {output_json_path}")


# Example usage for one PDF at a time:
if __name__ == "__main__":
    pdf_file = "Reading 1 Rates and Returns - Answers.pdf"
    json_output = "Reading_1_Rates_and_Returns.json"
    
    parse_pdf_to_json(pdf_file, json_output)