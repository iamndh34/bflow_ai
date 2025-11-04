# Ingestion
import re
import numpy as np
import faiss
import torch
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from openai import OpenAI

files = [
    ("statics/tutorial-documents/user_login_tutorial.txt", "auth")
]

chunks = []
texts = []

# Đọc từng file và tách chunk
for file_path, doc_name in files:
    print(doc_name)
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    print(f"\n✅ Đọc file '{file_path}' thành công ({len(text)} ký tự)")

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

print(f"\n✅ Tổng số chunks sau khi tách: {len(chunks)}")

# output_path = "chunks_output.txt"
# with open(output_path, "w", encoding="utf-8") as f:
#     for i, c in enumerate(chunks):
#         f.write(f"### Chunk {i + 1} (source={c['source']})\n{c['text']}\n\n")
#
# print(f"✅ Đã lưu các chunks vào: {output_path}")

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"\n⚙️ Đang chạy trên: {device.upper()}")

print("\n⏳ Đang load model embedding tiếng Việt (có thể mất vài giây)...")
model = SentenceTransformer("bkai-foundation-models/vietnamese-bi-encoder", device=device)

# Tạo embedding cho từng chunk
texts = [c["text"] for c in chunks]
embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=True)

# Tạo FAISS index
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)

# Nếu có GPU thì chuyển index sang GPU
if device == "cuda":
    res = faiss.StandardGpuResources()
    index = faiss.index_cpu_to_gpu(res, 0, index)
    print("✅ FAISS index đang chạy trên GPU!")
else:
    print("✅ FAISS index đang chạy trên CPU.")

# Thêm embedding vào index
index.add(np.array(embeddings).astype("float32"))
print("✅ FAISS index đã được tạo thành công!")



def find_best(user_input, top_k=3, doc=None):
    query_vec = model.encode([user_input])
    distances, indices = index.search(np.array(query_vec).astype("float32"), len(chunks))
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
