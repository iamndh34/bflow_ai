import json

import pdfplumber
import re
from openai import OpenAI

def clean_table(table):
    cleaned = []
    for row in table:
        normalized = [(cell or "").strip() for cell in row]
        cleaned.append(normalized)
    return cleaned


def remove_newlines_in_cells(table):
    cleaned = []
    for row in table:
        cleaned.append([(cell or "").replace("\n", " ").strip() for cell in row])
    return cleaned


def parse_number(value):
    if value is None:
        return None
    s = str(value).strip()
    if not re.search(r'\d', s):
        return value
    s = s.replace('.', '')
    s = s.replace(',', '.')
    if '.' in s:
        try:
            return float(s)
        except:
            return value
    try:
        return int(s)
    except:
        return value


def normalize_table_numbers(table):
    normalized = []
    for row in table:
        new_row = []
        for cell in row:
            cell = (cell or "").strip()
            if re.search(r'[a-zA-Z]', cell):
                new_row.append(cell)
            else:
                new_row.append(parse_number(cell))
        normalized.append(new_row)
    return normalized


def merge_multiline_rows(table):
    merged = []
    buffer = None
    for row in table:
        is_main_row = (row[0] != "") or any(re.search(r'\d', str(cell)) for cell in row[2:])
        if is_main_row:
            if buffer:
                merged.append(buffer)
            buffer = row[:]
        else:
            if buffer:
                buffer[1] += " " + row[1].strip()
    if buffer:
        merged.append(buffer)
    return merged


def get_table_text_set(table):
    """Lấy tất cả text từ bảng để loại bỏ"""
    text_set = set()
    for row in table:
        for cell in row:
            cell_text = str(cell).strip()
            if cell_text and cell_text != "None":
                # Thêm cả cell nguyên gốc và các từ riêng lẻ
                text_set.add(cell_text)
                # Tách thành các từ để matching tốt hơn
                words = cell_text.split()
                for word in words:
                    if len(word) > 1:  # Chỉ thêm từ có độ dài > 1
                        text_set.add(word)
    return text_set


def remove_table_text_from_page(page_text, table_texts_set):
    """Loại bỏ text của bảng khỏi page text"""
    lines = page_text.split("\n")
    filtered_lines = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Kiểm tra xem line có chứa text từ bảng không
        is_table_line = False

        # Kiểm tra exact match hoặc chứa nhiều từ từ bảng
        words_in_line = line.split()
        table_word_count = sum(1 for word in words_in_line if word in table_texts_set)

        # Nếu > 50% từ trong line là từ bảng thì coi như line này thuộc bảng
        if len(words_in_line) > 0 and table_word_count / len(words_in_line) > 0.5:
            is_table_line = True

        # Hoặc nếu line match exact với text trong bảng
        if line in table_texts_set:
            is_table_line = True

        if not is_table_line:
            filtered_lines.append(line)

    return "\n".join(filtered_lines)


def synthesize_answer(user_query, retrieved_texts, api_key):
    """
    Tổng hợp câu trả lời bằng GPT-4o-mini dựa trên thông tin tìm thấy.
    """
    client = OpenAI(api_key=api_key)
    context = "\n\n".join(retrieved_texts)

    prompt = f"""
Người dùng yêu cầu: {user_query}

Dưới đây là nội dung trích xuất từ các trang PDF (gồm text và bảng):

{context}

Nhiệm vụ của bạn:
1. Phân tích dữ liệu và trích xuất các trường chính xác (nếu có thể).
2. Chuyển toàn bộ thông tin này thành **một JSON có cấu trúc rõ ràng**,
Chỉ trả về JSON hợp lệ (không có chú thích hay văn bản khác).
Json có các trường cơ bản như ví dụ này (nếu không có thì để rỗng):

{{
  "invoice": {{
    "serial_number": "1C25MSN",
    "invoice_number": "00000061",
    "date": "18/10/2025",
    "tax_code": "M1-25-MNZLR-00000001968",
    "seller": {{
      "company_name": "CÔNG TY TRÁCH NHIỆM HỮU HẠN CÔNG NGHỆ NƯỚNG YAKI",
      "tax_code": "0312533500",
      "address": "375B Tân Sơn Nhì, Phường Phú Thọ Hòa, TP Hồ Chí Minh",
      "phone": "02838162188",
      "email": "nhahangyaki@gmail.com"
    }},
    "buyer": {{
      "name": "CÔNG TY CỔ PHẦN GIẢI PHÁP MINH TÂM",
      "tax_code": "0317493763",
      "address": "Số 20, đường số 22, khu dân cư Him Lam, ấp 4, Xã Bình Hưng, TP Hồ Chí Minh, Việt Nam",
      "phone": ""
    }},
    "payment_method": "TM/CK"
  }},
  "items": [
    {{
      "no": 1,
      "name": "7 Up",
      "unit": "Lon",
      "quantity": 2.0,
      "unit_price": 20000,
      "amount": 40000,
      "vat_rate": "8%",
      "vat_amount": 3200
    }},
    {{
      "no": 2,
      "name": "Sting",
      "unit": "Lon",
      "quantity": 1.0,
      "unit_price": 20000,
      "amount": 20000,
      "vat_rate": "8%",
      "vat_amount": 1600
    }}
  ],
  "summary": {{
    "total_before_vat": 831000,
    "vat_amount": 66480,
    "total_amount": 897480,
    "total": {{
      "amount": 881000,
      "vat": 71480,
      "grand_total": 952480
    }},
    "total_in_words": "Chín trăm năm mươi hai nghìn bốn trăm tám mươi đồng chẵn."
  }}
}}
"""


    print("\n Đang tổng hợp câu trả lời bằng GPT-4o-mini...\n")
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content.strip()


def convert_json(pdf_path):
    output = {"pages": []}

    with pdfplumber.open(pdf_path) as pdf:
        for page_index, page in enumerate(pdf.pages):
            page_data = {"page_number": page_index + 1, "text": "", "tables": []}

            # Extract text ban đầu
            text = page.extract_text() or ""

            # Extract tables
            tables = page.extract_tables({
                "vertical_strategy": "lines",
                "horizontal_strategy": "lines",
                "intersection_tolerance": 5,
            })

            if not tables:
                tables = page.extract_tables({
                    "vertical_strategy": "text",
                    "horizontal_strategy": "text",
                    "snap_tolerance": 6,
                    "join_tolerance": 6
                })

            # Process tables và thu thập text từ bảng
            all_table_texts = set()

            for t in tables:
                t = clean_table(t)
                t = remove_newlines_in_cells(t)

                # Thu thập text TRƯỚC KHI normalize số
                table_texts = get_table_text_set(t)
                all_table_texts.update(table_texts)

                # Sau đó mới xử lý số
                t = merge_multiline_rows(t)
                t = normalize_table_numbers(t)
                t = [row for row in t if any(str(cell).strip() for cell in row)]
                page_data["tables"].append(t)

            # Loại bỏ text của bảng khỏi page text
            if all_table_texts:
                text = remove_table_text_from_page(text, all_table_texts)

            page_data["text"] = "\n".join([line.strip() for line in text.split("\n") if line.strip()])
            output["pages"].append(page_data)

    # Sau khi xử lý xong các page
    for page in output["pages"]:
        # Chuyển TEXT thành list dòng
        page["text"] = [line.strip() for line in page["text"].split("\n") if line.strip()]

    try:
        result = synthesize_answer(
            output["pages"][0],
            output["pages"][0],
            api_key="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"
        )
        print(result)
        return result
    except Exception as e:
        print(f"Lỗi khi synthesize_answer: {e}")
        return json.dumps(output, ensure_ascii=False, indent=2)