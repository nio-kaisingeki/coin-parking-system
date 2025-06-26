# 🚗 コインパーキングシステム - 完全ファイル構成

## 📁 プロジェクト構造

```
coin-parking-system/
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
├── LICENSE
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── parking_project/
│   │   ├── __init__.py
│   │   ├── settings/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── parking/
│       ├── __init__.py
│       ├── models.py
│       ├── views.py
│       ├── urls.py
│       ├── admin.py
│       ├── apps.py
│       └── migrations/
│           └── __init__.py
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   └── src/
│       ├── index.js
│       ├── App.js
│       ├── index.css
│       └── components/
│           ├── CoinParkingSystem.js
│           └── StripePayment.js
├── deploy/
│   ├── nginx.conf
│   └── docker-compose.prod.yml
└── docs/
    ├── API.md
    └── DEPLOYMENT.md
```

---

## 📄 ファイル内容一覧

### **ルートディレクトリ**

#### `README.md`
```markdown
# 🚗 スマートコインパーキング予約システム

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-v3.11+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/react-v18.2+-blue.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/docker-required-blue.svg)](https://www.docker.com/)

## 📋 概要

Web上で駐車場の検索・予約・決済が完結する、次世代コインパーキングシステムです。

### ✨ 主要機能
- 🔍 駐車場検索・地図表示
- 📅 リアルタイム予約システム
- 💳 セキュア決済機能
- 📱 レスポンシブデザイン
- 👤 ユーザーマイページ
- 🔧 管理者ダッシュボード
- 📊 売上分析・レポート機能

### 🛠️ 技術スタック
- **フロントエンド**: React, Tailwind CSS
- **バックエンド**: Django REST Framework
- **データベース**: PostgreSQL
- **決済**: カスタム決済システム（Stripe対応）
- **インフラ**: Docker, Docker Compose

## 🚀 クイックスタート

### 前提条件
```bash
# 必要なソフトウェア
- Docker & Docker Compose
- Git
- Node.js 18+ (ローカル開発時)
- Python 3.11+ (ローカル開発時)
```

### 1. リポジトリクローン
```bash
git clone https://github.com/YOUR_USERNAME/coin-parking-system.git
cd coin-parking-system
```

### 2. 環境変数設定
```bash
cp .env.example .env
# .envファイルを編集してAPIキーを設定
```

### 3. システム起動
```bash
# Docker環境で起動
docker-compose up --build

# 別ターミナルで初期設定
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### 4. アクセス
- **フロントエンド**: http://localhost:3000
- **Django Admin**: http://localhost:8000/admin
- **API**: http://localhost:8000/api/

## 📖 ドキュメント

- [API仕様書](docs/API.md)
- [デプロイメント手順](docs/DEPLOYMENT.md)

## 🧪 テスト実行

```bash
# バックエンドテスト
docker-compose exec backend python manage.py test

# フロントエンドテスト（ローカル環境）
cd frontend && npm test
```

## 📊 ビジネスモデル

### 収益構造
- **手数料**: 駐車料金の10-15%
- **月額プラン**: 駐車場オーナー向け ¥5,000-20,000/月
- **プレミアム機能**: 優先予約 ¥500/月

## 🤝 コントリビューション

1. フォーク
2. フィーチャーブランチ作成: `git checkout -b feature/AmazingFeature`
3. コミット: `git commit -m 'Add some AmazingFeature'`
4. プッシュ: `git push origin feature/AmazingFeature`
5. プルリクエスト作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 📞 サポート

- 📧 Email: support@parking-system.com
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR_USERNAME/coin-parking-system/issues)

---

**開発者**: Your Name  
**バージョン**: v1.0.0  
**最終更新**: 2025年6月26日
```

#### `.gitignore`
```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
env.bak/
venv.bak/
.venv
*.egg-info/
dist/
build/

# Django
*.log
local_settings.py
db.sqlite3
db.sqlite3-journal
media/
staticfiles/

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# Docker
.dockerignore

# OS
Thumbs.db
.DS_Store

# Logs
logs
*.log

# Database
*.sqlite
*.db

# Temporary files
*.tmp
*.temp

# Coverage reports
htmlcov/
.coverage
.coverage.*
coverage.xml
```

#### `.env.example`
```env
# Django設定
DEBUG=1
SECRET_KEY=your-super-secret-key-change-this-in-production
DATABASE_URL=postgresql://postgres:postgres123@db:5432/parking_db

# 決済設定（本番では実際のキーに変更）
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Google Maps API（オプション）
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# メール送信設定（SendGrid等）
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your_sendgrid_api_key
FROM_EMAIL=noreply@your-domain.com

# Redis（セッション・キャッシュ用）
REDIS_URL=redis://redis:6379/0

# 本番環境用
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

#### `docker-compose.yml`
```yaml
version: '3.8'

services:
  # PostgreSQLデータベース
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: parking_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Django バックエンド
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DEBUG=1
      - DATABASE_URL=postgresql://postgres:postgres123@db:5432/parking_db
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend:/app
    command: >
      sh -c "python manage.py migrate &&
             python manage.py collectstatic --noinput &&
             python manage.py runserver 0.0.0.0:8000"

  # React フロントエンド
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

  # Redis (セッション・キャッシュ用)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

#### `LICENSE`
```
MIT License

Copyright (c) 2025 Coin Parking System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

### **backend/ ディレクトリ**

#### `backend/Dockerfile`
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# システム依存関係
RUN apt-get update && apt-get install -y \
    postgresql-client \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Python依存関係
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコード
COPY . .

# 静的ファイル用ディレクトリ
RUN mkdir -p /app/staticfiles

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

#### `backend/requirements.txt`
```
Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.1
psycopg2-binary==2.9.7
python-decouple==3.8
gunicorn==21.2.0
whitenoise==6.6.0
Pillow==10.1.0
reportlab==4.0.4
celery==5.3.4
redis==5.0.1
```

#### `backend/manage.py`
```python
#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

if __name__ == '__main__':
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'parking_project.settings.base')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
```

#### `backend/parking_project/__init__.py`
```python
# This file makes Python treat the directory as a package
```

#### `backend/parking_project/settings/__init__.py`
```python
# Settings package
```

#### `backend/parking_project/settings/base.py`
```python
"""
Django settings for parking_project project.
"""

import os
from pathlib import Path
from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'parking',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'parking_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'parking_project.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='parking_db'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='postgres123'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'ja'
TIME_ZONE = 'Asia/Tokyo'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# CORS
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000'
).split(',')

CORS_ALLOW_CREDENTIALS = True

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Cache
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://127.0.0.1:6379/1'),
    }
}
```

#### `backend/parking_project/settings/production.py`
```python
from .base import *

DEBUG = False

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='your-domain.com').split(',')

# セキュリティ設定
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# 静的ファイル
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ログ設定
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/app/logs/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

#### `backend/parking_project/urls.py`
```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('parking.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

#### `backend/parking_project/wsgi.py`
```python
"""
WSGI config for parking_project project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'parking_project.settings.base')

application = get_wsgi_application()
```

#### `backend/parking/__init__.py`
```python
# Parking app
```

#### `backend/parking/apps.py`
```python
from django.apps import AppConfig

class ParkingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'parking'
    verbose_name = '駐車場管理'
```

#### `backend/parking/admin.py`
```python
from django.contrib import admin
from .models import ParkingSpot, Reservation

@admin.register(ParkingSpot)
class ParkingSpotAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'hourly_rate', 'daily_rate', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'address')
    list_editable = ('is_active',)

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('id', 'parking_spot', 'user_email', 'start_time', 'end_time', 'total_price', 'status')
    list_filter = ('status', 'created_at', 'start_time')
    search_fields = ('user_email', 'user_name', 'parking_spot__name')
    readonly_fields = ('created_at', 'updated_at')
```

#### `backend/parking/migrations/__init__.py`
```python
# Migrations package
```

---

### **frontend/ ディレクトリ**

#### `frontend/Dockerfile`
```dockerfile
FROM node:18-alpine

WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係インストール
RUN npm install

# アプリケーションコードをコピー
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

#### `frontend/package.json`
```json
{
  "name": "coin-parking-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1",
    "web-vitals": "^3.3.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "react-scripts": "5.0.1"
  },
  "proxy": "http://localhost:8000"
}
```

#### `frontend/public/index.html`
```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="スマートコインパーキング予約システム" />
    <title>コインパーキング予約システム</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <noscript>JavaScriptを有効にしてください。</noscript>
    <div id="root"></div>
  </body>
</html>
```

#### `frontend/public/favicon.ico`
```
# 実際のfaviconファイル（バイナリ）
# 車のアイコンなどを使用
```

#### `frontend/src/index.js`
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### `frontend/src/App.js`
```jsx
import React from 'react';
import CoinParkingSystem from './components/CoinParkingSystem';

function App() {
  return (
    <div className="App">
      <CoinParkingSystem />
    </div>
  );
}

export default App;
```

#### `frontend/src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

/* カスタムスタイル */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

---

### **deploy/ ディレクトリ**

#### `deploy/nginx.conf`
```nginx
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name localhost;

    # フロントエンド
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静的ファイル
    location /static/ {
        proxy_pass http://backend;
    }
}
```

#### `deploy/docker-compose.prod.yml`
```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - backend
      - frontend

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: 
      context: ../backend
      dockerfile: Dockerfile
    environment:
      - DEBUG=0
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
    depends_on:
      - db
    command: gunicorn parking_project.wsgi:application --bind 0.0.0.0:8000

  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile
    environment:
      - REACT_APP_API_URL=https://your-domain.com
    command: npm run build && npx serve -s build

volumes:
  postgres_data:
```

---

### **docs/ ディレクトリ**

#### `docs/API.md`
```markdown
# API仕様書

## エンドポイント一覧

### 駐車場関連

#### GET /api/spots/
駐車場一覧取得

**パラメータ:**
- `search`: 検索キーワード（任意）
- `start_time`: 開始時間（任意）
- `end_time`: 終了時間（任意）

**レスポンス:**
```json
{
  "spots": [
    {
      "id": "uuid",
      "name": "駐車場名",
      "address": "住所",
      "hourly_rate": 300,
      "daily_rate": 2000,
      "available": true,
      "image_url": "https://..."
    }
  ]
}
```

#### GET /api/spots/{id}/
駐車場詳細取得

### 予約関連

#### POST /api/reservations/create/
予約作成

**リクエスト:**
```json
{
  "parking_spot_id": "uuid",
  "user_email": "user@example.com",
  "user_name": "山田太郎",
  "start_time": "2025-06-26T10:00:00Z",
  "end_time": "2025-06-26T18:00:00Z"
}
```

#### GET /api/reservations/user/
ユーザー予約履歴

#### POST /api/reservations/{id}/cancel/
予約キャンセル

### 決済関連

#### POST /api/create-payment-intent/
決済意図作成

#### POST /api/confirm-payment/
決済確認

### 管理者関連

#### GET /api/admin/dashboard/
ダッシュボードデータ

#### GET /api/admin/reservations/
予約一覧

#### GET /api/admin/export/csv/
CSV出力

#### GET /api/admin/export/pdf/
PDF出力
```

#### `docs/DEPLOYMENT.md`
```markdown
# デプロイメント手順

## 本番環境セットアップ

### 1. サーバー準備
```bash
# Ubuntu 22.04 LTS推奨
sudo apt update
sudo apt install docker.io