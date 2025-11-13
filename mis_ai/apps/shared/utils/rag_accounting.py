import pandas as pd
import os
import json
from sentence_transformers import SentenceTransformer
import numpy as np
import faiss

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

print("Đang load model SentenceTransformer...")
_model = SentenceTransformer('bkai-foundation-models/vietnamese-bi-encoder')
print("Model loaded thành công!")

_texts = [
    f"Tài khoản {d['AccountNumber']}, Tên tiếng việt {d['VietnameseName']}, tên tiếng anh {d['EnglishName']}, Ý nghĩa {d['Meaning']}, Sử dụng {d['Usage']}"
    for d in data_json]
_embeddings = _model.encode(_texts)
_dimension = _embeddings.shape[1]
_index = faiss.IndexFlatL2(_dimension)
_index.add(np.array(_embeddings).astype('float32'))
print("FAISS index đã sẵn sàng cho features!")


def rag_accounting(user_input, top_k=1, threshold=50):
    try:
        user_embedding = _model.encode([user_input])
        D, I = _index.search(np.array(user_embedding).astype('float32'), k=top_k)
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