import json

from sentence_transformers import SentenceTransformer
import numpy as np
import faiss

# Dữ liệu chức năng
functions = [
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

# Product list
product_list = [
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

# --- Khởi tạo model và FAISS index chỉ một lần ---
print("Đang load model SentenceTransformer...")
_model = SentenceTransformer('bkai-foundation-models/vietnamese-bi-encoder')
print("Model loaded thành công!")

# Embedding feature
_texts = [f"{f['name_vi']} {f['description']} {' '.join(f['keywords'])}" for f in functions]
_embeddings = _model.encode(_texts)
_dimension = _embeddings.shape[1]
_index = faiss.IndexFlatL2(_dimension)
_index.add(np.array(_embeddings).astype('float32'))
print("FAISS index đã sẵn sàng cho features!")

# Embedding productions
_texts = [f"{f['code']} {f['name']}" for f in product_list]
_embeddings = _model.encode(_texts)
_dimension = _embeddings.shape[1]
_index = faiss.IndexFlatL2(_dimension)
_index.add(np.array(_embeddings).astype('float32'))
print("FAISS index đã sẵn sàng cho products!")


# --- Hàm chính ---
def rag_feature(user_input: str, top_k: int = 1):
    """
    Trả về chức năng phù hợp nhất với user_input.
    """
    try:
        user_embedding = _model.encode([user_input])
        D, I = _index.search(np.array(user_embedding).astype('float32'), k=top_k)
        print(user_input)
        results = []
        for idx, dist in zip(I[0], D[0]):
            func = functions[idx]
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


def rag_products(product_list_input, top_k=1, threshold=0.6):
    # Reset flag
    for p in product_list:
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
        D, I = _index.search(np.array(user_emb).astype("float32"), k=top_k)

        best_idx = int(I[0][0])
        best_sim = float(D[0][0])
        best_product = product_list[best_idx]

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

    json_output = json.dumps(product_list, ensure_ascii=False, indent=4)
    print("\n Danh sách product_list sau khi match:")
    print(json_output)

    return json_output


