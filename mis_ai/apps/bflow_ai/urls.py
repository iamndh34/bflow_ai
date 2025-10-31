from django.urls import path
from apps.bflow_ai.views import (
    BFlowAIChatbot,
    # BFlowAIQueryOpenAIView,
    BFlowAIQueryGroqView
)

urlpatterns = [
    path('', BFlowAIChatbot.as_view(), name='BFlowAIChatbot'),
    # path('query-open-ai/',  BFlowAIQueryOpenAIView.as_view(), name="BFlowAIQueryOpenAIView"),
    path('query-groq/',  BFlowAIQueryGroqView.as_view(), name="BFlowAIQueryGroqView"),
]
