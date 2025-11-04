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

# --- Khởi tạo model và FAISS index chỉ một lần ---
print("Đang load model SentenceTransformer...")
_model = SentenceTransformer('bkai-foundation-models/vietnamese-bi-encoder')
print("Model loaded thành công!")

_texts = [f"{f['name_vi']} {f['description']} {' '.join(f['keywords'])}" for f in functions]
_embeddings = _model.encode(_texts)
_dimension = _embeddings.shape[1]
_index = faiss.IndexFlatL2(_dimension)
_index.add(np.array(_embeddings).astype('float32'))
print("FAISS index đã sẵn sàng!")

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
