import os

import numpy as np
import json
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from groq import Groq
from numpy.linalg import norm
# from openai import OpenAI
from rest_framework import status
from sentence_transformers import SentenceTransformer
from apps.shared import mask_view, ServerAPI, ApiURL
from pymongo import MongoClient
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from apps.shared.utils.rag_utils import RAGFeature, RAGProduct, RAGAccounting, RAGDocument
from apps.shared.utils.invoice_ocr import convert_json


# openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)


class BFlowAIChatbot(View):
    @mask_view(
        template='bflow_ai/bflow_chatbot.html'
    )
    def get(self, request, *args, **kwargs):
        return {}, status.HTTP_200_OK


# class BFlowAIQueryOpenAIView(APIView):
#     permission_classes = [IsAuthenticated]
#
#     def post(self, request):
#         question = request.data.get("question")
#         user = request.user
#
#         # Gửi prompt cho GPT
#         mongo_query = self.generate_query(question, user)
#
#         # Thực thi MongoDB
#         client = MongoClient(settings.MONGO_URI)
#         db = client["bflow_ai"]
#         collection = db["sales_account"]
#
#         try:
#             results = list(collection.find(mongo_query).limit(10))
#         except Exception as e:
#             return JsonResponse({'data': {}, 'status': 400})
#
#         # Trả kết quả
#         answer = self.generate_natural_answer(question, results)
#         return JsonResponse({'data': {'answer': answer}, 'status': 200})
#
#     def generate_query(self, question, user):
#         system_prompt = f"""
#         Bạn là một trợ lý AI giúp sinh truy vấn MongoDB từ câu hỏi người dùng.
#         Dữ liệu nằm trong collection `sales_account` có các field:
#         - name (string), email (string), total_order (int), revenue_year (int), revenue_average (int), manager (string)
#
#         Lưu ý:
#         - Chỉ truy vấn dữ liệu có `tenant_id = {user.tenant_id}` và `company_id = {user.company_id}`.
#         - Trả về filter MongoDB JSON (không cần explain).
#         """
#
#         response = openai_client.chat.completions.create(
#             model="gpt-3.5-turbo",
#             messages=[
#                 {"role": "system", "content": system_prompt},
#                 {"role": "user", "content": question}
#             ],
#             temperature=0.3,
#             max_tokens=150
#         )
#         result = response["choices"][0]["message"]["content"]
#         return eval(result)
#
#     def generate_natural_answer(self, question, results):
#         prompt = f"""
#         Câu hỏi: "{question}"
#         Dữ liệu: {json.dumps(results, ensure_ascii=False)}
#
#         Hãy trả lời người dùng bằng tiếng Việt, ngắn gọn, dễ hiểu.
#         """
#
#         response = openai_client.chat.completions.create(
#             model="gpt-3.5-turbo",
#             messages=[
#                 {"role": "user", "content": prompt}
#             ],
#             temperature=0.5,
#             max_tokens=150
#         )
#         return response["choices"][0]["message"]["content"]


class BFlowAIQueryGroqView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

    @staticmethod
    def cosine_similarity(a, b):
        return np.dot(a, b) / (norm(a) * norm(b))

    def get_top_result(self, data, question, top_k):
        # Tạo embedding cho câu hỏi
        question_vector = self.embedding_model.encode(question)
        # Tính cosine similarity
        for doc in data:
            if "embedding" in doc:
                doc["similarity"] = self.cosine_similarity(question_vector, np.array(doc["embedding"]))
            else:
                doc["similarity"] = 0.0
        # Sắp xếp theo similarity giảm dần
        data = sorted(data, key=lambda x: x["similarity"], reverse=True)
        # Lấy top kq
        data = data[:top_k]
        return data

    def post(self, request):
        question = request.data.get("question")
        app = request.data.get("app")
        user = request.user

        # hiện tại chỉ hỗ trợ admin
        if user.is_admin_tenant:
            # Khởi tạo Groq client
            groq_client = Groq(api_key=settings.GROQ_API_KEY)

            if app:
                # Kết nối MongoDB và lấy dữ liệu
                mongo_client = MongoClient(settings.MONGO_URI)
                db = mongo_client["bflow_ai"]
                if app == "app-account":
                    collection = db["sales_account"]
                elif app == "app-opportunity":
                    collection = db["sales_opportunity"]
                else:
                    collection = []

                # Truy vấn dữ liệu (filter theo tenant_id, company_id nếu cần)
                mongo_query = {
                    "tenant_id": str(user.tenant_id),
                    "company_id": str(user.company_id)
                }
                data = list(collection.find(mongo_query, {'_id': 0}))

                data = self.get_top_result(data, question, 5)

                for item in data:
                    del item["embedding"]

                prompt = f"""
                Bạn là một trợ lý AI nội bộ trong hệ thống ERP, có nhiệm vụ hỗ trợ người dùng doanh nghiệp đưa ra phân tích, nhận định từ dữ liệu có sẵn.
                Dưới đây là dữ liệu hệ thống, bao gồm các thông tin liên quan đến hoạt động kinh doanh của doanh nghiệp: {json.dumps(data, ensure_ascii=False)}
                Câu hỏi của người dùng: {question}
                Yêu cầu đối với bạn:
                0. Trả lời theo dạng danh sách liệt kê tách dòng cho dễ nhìn, hiển thị ngày dạng DD/MM/YYYY
                1. Trả lời bằng tiếng Việt hoặc tiếng Anh tùy theo ngôn ngữ hiện tại của câu hỏi.
                2. Trả lời ngắn gọn, rõ ràng, súc tích, không chi tiết thừa, theo phong cách tư vấn nghiệp vụ.
                3. Chỉ sử dụng thông tin trong dữ liệu được cung cấp. Không được suy luận hoặc tạo ra thông tin không tồn tại.
                4. Tuyệt đối không tiết lộ bất kỳ chi tiết kỹ thuật nào như tên cột, định dạng JSON, cấu trúc bảng,...
                5. Nếu câu hỏi không liên quan trực tiếp đến dữ liệu, bạn có thể trả lời một cách sáng tạo, phù hợp với vai trò của trợ lý AI doanh nghiệp.
                6. Nếu dữ liệu không đủ để đưa ra câu trả lời hợp lý, hãy trả lời: "Xin lỗi, tôi chưa thể trả lời câu hỏi này dựa vào dữ liệu của hệ thống hiện tại."
                Hãy đưa ra phản hồi dưới dạng một đoạn tư vấn nghiệp vụ súc tích, dễ hiểu, thân thiện và hữu ích.
                """
            else:
                prompt = f"""
                Bạn là một trợ lý AI trong hệ thống ERP, có nhiệm vụ hỗ trợ người dùng doanh nghiệp đưa ra phân tích và quyết định.
                Câu hỏi của người dùng: {question}
                Yêu cầu đối với bạn:
                1. Trả lời bằng tiếng Việt hoặc tiếng Anh tùy theo ngôn ngữ hiện tại của câu hỏi.
                2. Trả lời ngắn gọn, rõ ràng, súc tích, không chi tiết thừa, theo phong cách tư vấn nghiệp vụ.
                Hãy đưa ra phản hồi dưới dạng một đoạn tư vấn nghiệp vụ súc tích, dễ hiểu, thân thiện và hữu ích.
                """

            chat_completion = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
            )

            answer = chat_completion.choices[0].message.content
            return JsonResponse({'data': {'answer': answer}, 'status': 200})
        return JsonResponse(
            {'data': {'answer': 'Bạn không phải admin. Hiện tại BFlow AI chỉ hỗ trợ user admin!'}, 'status': 200})


class BAIAskDemo(View):
    def get(self, request, *args, **kwargs):
        return JsonResponse({'data': {'answer': 'hello'}, 'status': 200})

    def post(self, request, *args, **kwargs):
        try:
            # Parse JSON body
            data = json.loads(request.body.decode("utf-8"))
            user_input = data.get("context", "").strip()

            # Validate input
            if not user_input:
                return JsonResponse({
                    "status": 400,
                    "message": "Thiếu tham số 'context' trong body JSON."
                }, status=400)

            # Gọi hàm RAG
            result = RAGFeature.rag_feature(user_input=user_input, top_k=3)

            if not result:
                return JsonResponse({
                    "status": 404,
                    "message": "Không tìm thấy kết quả phù hợp.",
                    "data": None
                }, status=404)

            # Trả kết quả
            return JsonResponse({
                "status": 200,
                "message": "Thành công.",
                "data": result
            }, status=200)

        except json.JSONDecodeError:
            return JsonResponse({
                "status": 400,
                "message": "Body phải là JSON hợp lệ."
            }, status=400)

        except Exception as e:
            print("Lỗi API /ask:", e)
            return JsonResponse({
                "status": 500,
                "message": "Lỗi server nội bộ.",
                "error": str(e)
            }, status=500)


class BAIAskDoc(View):
    def post(self, request, *args, **kwargs):
        try:
            # Parse JSON body
            data = json.loads(request.body.decode("utf-8"))
            user_input = data.get("context", "").strip()

            # Validate input
            if not user_input:
                return JsonResponse({
                    "status": 400,
                    "message": "Thiếu tham số 'context' trong body JSON."
                }, status=400)

            # Gọi hàm RAG
            api_key = settings.OPENAI_API_KEY
            retrieved_text = RAGDocument.find_best(user_input=user_input, top_k=3)
            result = RAGDocument.synthesize_answer(user_query=user_input, retrieved_texts=retrieved_text, api_key=api_key)

            if not result:
                return JsonResponse({
                    "status": 404,
                    "message": "Không tìm thấy kết quả phù hợp.",
                    "data": None
                }, status=404)

            # Trả kết quả
            return JsonResponse({
                "status": 200,
                "message": "Thành công.",
                "data": result
            }, status=200)

        except json.JSONDecodeError:
            return JsonResponse({
                "status": 400,
                "message": "Body phải là JSON hợp lệ."
            }, status=400)

        except Exception as e:
            print("Lỗi API /ask:", e)
            return JsonResponse({
                "status": 500,
                "message": "Lỗi server nội bộ.",
                "error": str(e)
            }, status=500)


class BAIOcrInvoice(View):
    def get(self, request, *args, **kwargs):
        result = convert_json()
        return JsonResponse({'data': {'result': result}, 'status': 200})

    def post(self, request, *args, **kwargs):
        """
        Nhận file PDF từ AJAX và lưu tạm vào thư mục /media/invoices/
        """
        uploaded_file = request.FILES.get('invoice_pdf')

        if not uploaded_file:
            return JsonResponse({'error': 'Không có file được upload'}, status=400)

        upload_dir = os.path.join(settings.MEDIA_ROOT, 'statics/invoices')
        os.makedirs(upload_dir, exist_ok=True)

        file_path = os.path.join(upload_dir, uploaded_file.name)

        with open(file_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)

        print(f"File đã được lưu tại: {file_path}")

        result = convert_json(file_path)
        return JsonResponse({'data': {'result': result}, 'status': 200})

class BAIRagProduct(View):
    def post(self, request, *args, **kwargs):
        try:
            body_unicode = request.body.decode('utf-8')
            data = json.loads(body_unicode)

            if not data or not isinstance(data, list):
                return JsonResponse({'error': 'Danh sách rỗng hoặc không hợp lệ!'}, status=400)

            result = RAGProduct.rag_products(data, top_k=1, threshold=0.5)

            return JsonResponse({'data': {'result': result}}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Dữ liệu gửi lên không phải JSON hợp lệ!'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

class BAIOcrInvoiceView(View):
    @mask_view(
        template='bflow_ai/bflow_invoice_ocr.html',
    )
    def get(self, request, *args, **kwargs):
        return {}, status.HTTP_200_OK

# Accounting
class BAIAccounting(View):
    @mask_view(
        template='bflow_ai/bflow_accounting.html',
    )
    def get(self, request, *args, **kwargs):
        return {}, status.HTTP_200_OK

@method_decorator(csrf_exempt, name='dispatch')
class BAIAccountingApi(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body.decode("utf-8"))
            user_input = data.get("context", "").strip()

            if not user_input:
                return JsonResponse({"status": 400, "message": "Thiếu tham số 'context' trong body JSON."}, status=400)

            result = RAGAccounting.rag_accounting(user_input=user_input, top_k=5)

            if not result:
                return JsonResponse({"status": 200, "message": "Không tìm thấy kết quả phù hợp.", "data": None}, status=200)

            return JsonResponse({"status": 200, "message": "Thành công.", "data": result}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"status": 400, "message": "Body phải là JSON hợp lệ."}, status=400)
        except Exception as e:
            print("Lỗi API /ask:", e)
            return JsonResponse({"status": 500, "message": "Lỗi server nội bộ.", "error": str(e)}, status=500)