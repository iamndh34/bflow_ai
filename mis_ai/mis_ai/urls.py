"""system module"""
import os

from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from apps.shared import BreadcrumbView


urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('bflow-ai/', include('apps.bflow_ai.urls')),
    path('bflow_invoice_orc/', include('apps.bflow_invoice_orc.urls')),
]

urlpatterns += static('django-admin-media/', document_root=settings.MEDIA_ROOT)

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# check breadcrumb view exist and reverse successful.
BreadcrumbView.check_view_name()
