# Sử dụng image Python chính thức
FROM python:3.12-slim

# Thiết lập biến môi trường cho Django chạy ổn định
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Tạo thư mục app trong container
WORKDIR /app

# Cài các gói cần thiết của hệ thống
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy file requirements (hoặc req.txt của bạn)
COPY req.txt /app/requirements.txt

# Cài dependencies Python
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy toàn bộ project vào container
COPY . /app

# Mở port Django server
EXPOSE 8010

# Lệnh mặc định khi chạy container
CMD ["python", "manage.py", "runserver", "0.0.0.0:8010"]
