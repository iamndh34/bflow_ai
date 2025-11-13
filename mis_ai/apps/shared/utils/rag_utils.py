import json
import os
import re

from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
import pandas as pd
import torch
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from openai import OpenAI


# Dữ liệu chức năng
features = [
    {
        "key": "sale_dashboard_revenue",
        "name_vi": "Doanh thu tổng quan",
        "description": "Xem biểu đồ và thống kê doanh thu tổng thể theo thời gian.",
        "keywords": ["doanh thu", "revenue", "thống kê", "biểu đồ", "dashboard"],
        "url": "https://docs.bflow.vn/sale/dashboard/revenue/"
    },
    {
        "key": "sale_dashboard_pipeline",
        "name_vi": "Pipeline bán hàng",
        "description": "Theo dõi tiến trình và trạng thái các cơ hội bán hàng trong pipeline.",
        "keywords": ["pipeline", "cơ hội", "giai đoạn", "bán hàng"],
        "url": "https://docs.bflow.vn/sale/dashboard/pipeline/"
    },
    {
        "key": "sale_revenue_plan",
        "name_vi": "Kế hoạch doanh thu",
        "description": "Lập kế hoạch doanh thu, mục tiêu bán hàng theo tháng/quý.",
        "keywords": ["doanh thu", "mục tiêu", "doanh số", "dự báo", "plan"],
        "url": "https://docs.bflow.vn/sale/revenue-plan/"
    },
    {
        "key": "sale_contact",
        "name_vi": "Liên hệ",
        "description": "Quản lý thông tin liên hệ và khách hàng tiềm năng.",
        "keywords": ["liên hệ", "khách hàng", "contact", "crm"],
        "url": "https://docs.bflow.vn/sale/contact/"
    },
    {
        "key": "sale_account",
        "name_vi": "Tài khoản khách hàng",
        "description": "Lưu trữ thông tin khách hàng doanh nghiệp, nhóm, phân loại.",
        "keywords": ["account", "khách hàng", "doanh nghiệp", "thông tin"],
        "url": "https://docs.bflow.vn/sale/account-tai-khoan/"
    },
    {
        "key": "sale_opportunity",
        "name_vi": "Cơ hội kinh doanh",
        "description": "Quản lý cơ hội kinh doanh của khách hàng, giai đoạn chốt deal và pipeline.",
        "keywords": ["cơ hội", "deal", "pipeline", "bán hàng", "khách hàng"],
        "url": "https://docs.bflow.vn/sale/opportunity/"
    },
    {
        "key": "sale_quotation",
        "name_vi": "Báo giá",
        "description": "Tạo, chỉnh sửa và gửi báo giá cho khách hàng.",
        "keywords": ["báo giá", "quotation", "giá", "đề xuất"],
        "url": "https://docs.bflow.vn/sale/quotation/"
    },
    {
        "key": "sale_order",
        "name_vi": "Đơn hàng",
        "description": "Theo dõi đơn hàng từ báo giá tới giao hàng, thanh toán.",
        "keywords": ["đơn hàng", "sale order", "bán hàng", "giao hàng"],
        "url": "https://docs.bflow.vn/sale/order/"
    },
    {
        "key": "sale_invoice",
        "name_vi": "Hóa đơn bán hàng",
        "description": "Xuất hóa đơn, ghi nhận công nợ và thanh toán từ khách hàng.",
        "keywords": ["hóa đơn", "invoice", "thanh toán", "công nợ"],
        "url": "https://docs.bflow.vn/sale/invoice/"
    },
    {
        "key": "sale_contract",
        "name_vi": "Hợp đồng",
        "description": "Tạo và quản lý hợp đồng bán hàng với khách hàng.",
        "keywords": ["hợp đồng", "contract", "ký kết", "bán hàng"],
        "url": "https://docs.bflow.vn/sale/contract/"
    },
    {
        "key": "sale_product",
        "name_vi": "Sản phẩm",
        "description": "Quản lý danh mục sản phẩm, mã SKU và giá bán.",
        "keywords": ["sản phẩm", "product", "hàng hóa", "giá bán"],
        "url": "https://docs.bflow.vn/sale/product/"
    }
]

# Dữ liệu cho documents
files = [
    ("statics/tutorial-documents/user_login_tutorial.txt", "auth")
]

chunks = []
docs_texts = []

# Đọc từng file và tách chunk
for file_path, doc_name in files:
    print(doc_name)
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    print(f"\nĐọc file '{file_path}' thành công ({len(text)} ký tự)")

    # Tách theo section lớn (theo tiêu đề # ...)
    sections = re.split(r'(?=\n# )', text)
    sections = [s.strip() for s in sections if s.strip()]

    # Bộ chia nhỏ chi tiết hơn
    sub_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        length_function=len,
        separators=["\n## ", "\n\n", "\n", ". ", " "]
    )

    for section in sections:
        if len(section) > 800:
            sub_chunks = sub_splitter.split_text(section)
            for sc in sub_chunks:
                chunks.append({"text": sc, "source": doc_name})
        else:
            chunks.append({"text": section, "source": doc_name})

print(f"\nTổng số chunks sau khi tách: {len(chunks)}")

# Dữ liệu cho danh sách sản phẩm
products = [
    {"code": "M001", "name": "7 Up", "selected": False},
    {"code": "M002", "name": "Sting", "selected": False},
    {"code": "M003", "name": "Tiger Bạc Lon Lớn 330ml", "selected": False},
    {"code": "M004", "name": "Khăn lạnh", "selected": False},
    {"code": "M005", "name": "Hàu nướng phô mai", "selected": False},
    {"code": "M006", "name": "Nghêu hấp sả", "selected": False},
    {"code": "M007", "name": "Bê thui (bò tơ) (thăn, quế, bắp, gù)", "selected": False},
    {"code": "M008", "name": "Bánh tráng nướng", "selected": False},
    {"code": "M009", "name": "Gỏi bò tơ bóp thấu", "selected": False},
    {"code": "M010", "name": "Bạch tuộc nướng sa tế", "selected": False},
    {"code": "M011", "name": "Rau thêm Bê thui", "selected": False},
    {"code": "M012", "name": "Miến xào hải sản", "selected": False},
    {"code": "M013", "name": "Cơm chiên hải sản", "selected": False},
    {"code": "M014", "name": "Mực chiên nước mắm", "selected": False},
    {"code": "M015", "name": "Tôm nướng muối ớt", "selected": False},
    {"code": "M016", "name": "Cá lóc nướng trui", "selected": False},
    {"code": "M017", "name": "Lẩu thái hải sản", "selected": False},
    {"code": "M018", "name": "Ốc hương nướng mọi", "selected": False},
    {"code": "M019", "name": "Sò điệp nướng mỡ hành", "selected": False},
    {"code": "M020", "name": "Tàu hủ chiên giòn", "selected": False},
    {"code": "M021", "name": "Rau muống xào tỏi", "selected": False},
    {"code": "M022", "name": "Canh chua cá bông lau", "selected": False}
]

# Dữ liệu cho accounting
path = r"statics/accounting_docs/account.xlsx"

data_json = []

if not os.path.exists(path):
    print("Không tìm thấy file:", path)
else:
    df = pd.read_excel(path, header=0)

    df = df.dropna(how='all')
    df.columns = df.columns.str.strip()

    df = df.fillna("")
    data_json = df.to_dict(orient='records')

print(data_json)


# --- Khởi tạo model và FAISS index chỉ một lần ---
print("Đang load model SentenceTransformer...")
_model = SentenceTransformer('bkai-foundation-models/vietnamese-bi-encoder')
print("Model loaded thành công!")


# Embedding feature
features_texts = [f"{f['name_vi']} {f['description']} {' '.join(f['keywords'])}" for f in features]
features_embeddings = _model.encode(features_texts)
features_dimension = features_embeddings.shape[1]
features_index = faiss.IndexFlatL2(features_dimension)
features_index.add(np.array(features_embeddings).astype('float32'))
print("FAISS index đã sẵn sàng cho features!")


# Embedding documents
docs_texts = [c["text"] for c in chunks]
docs_embeddings = _model.encode(docs_texts, convert_to_numpy=True, show_progress_bar=True)
docs_dimension = docs_embeddings.shape[1]
docs_index = faiss.IndexFlatL2(docs_dimension)
docs_index.add(np.array(docs_embeddings).astype("float32"))
print("FAISS index đã sẵn sàng cho documents!")


# Embedding productions
products_texts = [f"{f['code']} {f['name']}" for f in products]
products_embeddings = _model.encode(products_texts)
products_dimension = products_embeddings.shape[1]
products_index = faiss.IndexFlatL2(products_dimension)
products_index.add(np.array(products_embeddings).astype('float32'))
print("FAISS index đã sẵn sàng cho products!")

# Embedding accouting
accounting_texts = [
    f"Tài khoản {d['AccountNumber']}, Tên tiếng việt {d['VietnameseName']}, tên tiếng anh {d['EnglishName']}, Ý nghĩa {d['Meaning']}, Sử dụng {d['Usage']}"
    for d in data_json]
accounting_embeddings = _model.encode(accounting_texts)
accounting_dimension = accounting_embeddings.shape[1]
accounting_index = faiss.IndexFlatL2(accounting_dimension)
accounting_index.add(np.array(accounting_embeddings).astype('float32'))
print("FAISS index đã sẵn sàng cho accounting!")


# --- Hàm chính ---
class RAGFeature:
    @classmethod
    def rag_feature(cls, user_input: str, top_k: int = 1):
        try:
            user_embedding = _model.encode([user_input])
            D, I = features_index.search(np.array(user_embedding).astype('float32'), k=top_k)
            print(user_input)
            results = []
            for idx, dist in zip(I[0], D[0]):
                func = features[idx]
                results.append({
                    "key": func["key"],
                    "name_vi": func["name_vi"],
                    "description": func["description"],
                    "url": func["url"],
                    "distance": float(dist)
                })

            for result in results:
                print(result)
            return results[0] if results else None

        except Exception as e:
            print("Lỗi RAG:", e)
            return None

class RAGDocument:
    @classmethod
    def find_best(cls, user_input, top_k=3, doc=None):
        query_vec = _model.encode([user_input])
        distances, indices = docs_index.search(np.array(query_vec).astype("float32"), len(chunks))
        results = []
        for i, idx in enumerate(indices[0]):
            result = {
                "distance": float(distances[0][i]),
                "text": chunks[idx]["text"],
                "source": chunks[idx]["source"]
            }
            print(result)
            results.append(result)
        if doc:
            results = [r for r in results if r["source"] == doc]

        results = sorted(results, key=lambda x: x["distance"])[:top_k]
        return [r["text"] for r in results]

    @classmethod
    def synthesize_answer(user_query, retrieved_texts, api_key):
        """
        Tổng hợp câu trả lời bằng GPT-4o-mini dựa trên thông tin tìm thấy.
        """
        client = OpenAI(api_key=api_key)
        context = "\n\n".join(retrieved_texts)

        prompt = f"""
    Người dùng hỏi: {user_query}

    Dưới đây là các đoạn nội dung tài liệu có liên quan:

    {context}

    Hãy tổng hợp một câu trả lời sinh động, chính xác, tự nhiên bằng tiếng Việt dưới dạng html thật đẹp không cần thẻ html đầu, không cần chỉnh color.
    Nếu thông tin không đủ, hãy nói rõ "Tôi không tìm thấy thông tin chính xác trong tài liệu."
    """

        print("\n Đang tổng hợp câu trả lời bằng GPT-4o-mini...\n")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()

class RAGProduct:
    @classmethod
    def rag_products(cls, product_list_input, top_k=1, threshold=0.6):
        # Reset flag
        for p in products:
            p["selected"] = False
            p["unit"] = ""
            p["quantity"] = 0
            p["unit_price"] = 0
            p["vat_amount"] = 0
            p["vat_rate"] = "0"
            p["similarity"] = 0.0

        # Dò tìm match
        for item in product_list_input:
            name = item.get("name", "").strip()
            if not name:
                continue

            user_emb = _model.encode([name], normalize_embeddings=True)
            D, I = products_index.search(np.array(user_emb).astype("float32"), k=top_k)

            best_idx = int(I[0][0])
            best_sim = float(D[0][0])
            best_product = products[best_idx]

            print(f"\n🔹 OCR: {name}")
            print(f"- Match: {best_product['name']} (similarity={best_sim:.4f})")

            if best_sim >= threshold:
                best_product["selected"] = True
                best_product["unit"] = item.get("unit", "")
                best_product["quantity"] = item.get("quantity", 0)
                best_product["unit_price"] = item.get("unit_price", 0)
                best_product["vat_amount"] = item.get("vat_amount", 0)
                best_product["vat_rate"] = item.get("vat_rate", "0")
                best_product["similarity"] = round(best_sim, 4)

        json_output = json.dumps(products, ensure_ascii=False, indent=4)
        print("\n Danh sách product sau khi match:")
        print(json_output)

        return json_output

class RAGAccounting:
    @classmethod
    def rag_accounting(cls, user_input, top_k=1, threshold=50):
        try:
            user_embedding = _model.encode([user_input])
            D, I = accounting_index.search(np.array(user_embedding).astype('float32'), k=top_k)
            print(user_input)
            results = []
            for idx, dist in zip(I[0], D[0]):
                if dist < threshold:
                    da = data_json[idx]
                    results.append({
                        "AccountNumber": da["AccountNumber"],
                        "VietnameseName": da["VietnameseName"],
                        "EnglishName": da["EnglishName"],
                        "Meaning": da["Meaning"],
                        "AccountingMethod": da["AccountingMethod"],
                        "Usage": da["Usage"],
                        "CorrespondingAccounts": da["CorrespondingAccounts"],

                        "distance": float(dist)
                    })

            for result in results:
                print(result)
            return results[0] if results else None

        except Exception as e:
            print("Lỗi RAG:", e)
            return None

