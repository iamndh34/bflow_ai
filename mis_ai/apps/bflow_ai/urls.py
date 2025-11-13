from django.urls import path
from apps.bflow_ai.views import (
    BFlowAIChatbot,
    # BFlowAIQueryOpenAIView,
    BFlowAIQueryGroqView, BAIAskDemo, BAIAskDoc, BAIOcrInvoice, BAIOcrInvoiceView, BAIRagProduct, BAIAccounting,
    BAIAccountingApi
)


urlpatterns = [
    path('', BFlowAIChatbot.as_view(), name='BFlowAIChatbot'),
    # path('query-open-ai/',  BFlowAIQueryOpenAIView.as_view(), name="BFlowAIQueryOpenAIView"),
    path('query-groq/',  BFlowAIQueryGroqView.as_view(), name="BFlowAIQueryGroqView"),
    path('ask-demo/',  BAIAskDemo.as_view(), name="BAIAskDemo"),
    path('ask-doc/', BAIAskDoc.as_view(), name="BAIAskDoc"),
    path('invoice/', BAIOcrInvoice.as_view(), name="BAIOcrInvoice"),
    path('invoice-view/', BAIOcrInvoiceView.as_view(), name="BAIOcrInvoiceView"),
    path('rag-products/', BAIRagProduct.as_view(), name="BAIOcrInvoiceRagProducts"),
    path('accounting-view/', BAIAccounting.as_view(), name="BAIAccounting"),
    path('accounting-api/', BAIAccountingApi.as_view(), name="BAIAccountingApi"),
]
