# 🚀 コインパーキングシステム - GitHub セットアップ手順

## 📁 プロジェクト構造

まず、以下のフォルダ構造でプロジェクトを作成してください：

```
coin-parking-system/
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
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
│       └── apps.py
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── index.js
│       └── components/
│           ├── CoinParkingSystem.js
│           └── StripePayment.js
└── deploy/
    └── nginx.conf
```

## 🔧 ステップ1: ローカル環境準備

### 1-1. フォルダ作成
```bash
mkdir coin-parking-system
cd coin-parking-system
mkdir backend frontend deploy
mkdir backend/parking_project backend/parking_project/settings backend/parking
mkdir frontend/public frontend/src frontend/src/components
```

### 1-2. ファイル作成

各ファイルの内容は、先ほど作成したアーティファクトからコピーしてください。

**重要なファイル一覧:**
- `backend/models.py` → Django バックエンド API から
- `backend/views.py` → Django バックエンド API から  
- `backend/urls.py` → Django バックエンド API から
- `frontend/src/components/CoinParkingSystem.js` → メインシステムから
- `frontend/src/components/StripePayment.js` → Stripe決済統合から
- `docker-compose.yml` → Docker Setup から
- その他設定ファイル → Docker Setup から

## 🌐 ステップ2: GitHub リポジトリ作成

### 2-1. GitHubでリポジトリ作成
1. https://github.com にアクセス
2. 「New repository」をクリック
3. Repository name: `coin-parking-system`
4. Description: `スマートコインパーキング予約システム - Web予約・決済・管理機能完備`
5. Public または Private を選択
6. 「Create repository」をクリック

### 2-2. ローカルGit初期化
```bash
# プロジェクトフォルダで実行
git init
git branch -M main
```

## 📝 ステップ3: 必要ファイル作成

### 3-1. .gitignore 作成
```bash
cat > .gitignore << 'EOF'
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
EOF
```

### 3-2. README.md 作成
```bash
cat > README.md << 'EOF'
# 🚗 スマートコインパーキング予約システム

## 📋 概要

Web上で駐車場の検索・予約・決済が完結する、次世代コインパーキングシステムです。

### ✨ 主要機能
- 🔍 駐車場検索・地図表示
- 📅 リアルタイム予約システム
- 💳 Stripe決済連携
- 📱 レスポンシブデザイン
- 👤 ユーザーマイページ
- 🔧 管理者ダッシュボード
- 📊 売上分析・レポート機能

### 🛠️ 技術スタック
- **フロントエンド**: React, Tailwind CSS
- **バックエンド**: Django REST Framework
- **データベース**: PostgreSQL
- **決済**: Stripe
- **インフラ**: Docker, Docker Compose

## 🚀 クイックスタート

### 前提条件
- Docker & Docker Compose
- Git

### 1. リポジトリクローン
```bash
git clone https://github.com/YOUR_USERNAME/coin-parking-system.git
cd coin-parking-system
```

### 2. 環境変数設定
```bash
cp .env.example .env
# .envファイルを編集してStripeキーを設定
```

### 3. システム起動
```bash
docker-compose up --build
```

### 4. 初期設定
```bash
# 管理者ユーザー作成
docker-compose exec backend python manage.py createsuperuser

# サンプルデータ投入（オプション）
docker-compose exec backend python manage.py loaddata sample_data.json
```

### 5. アクセス
- **フロントエンド**: http://localhost:3000
- **Django Admin**: http://localhost:8000/admin
- **API**: http://localhost:8000/api/

## 📖 API ドキュメント

### 駐車場検索
```
GET /api/spots/?search=渋谷&start_time=2025-06-26T10:00&end_time=2025-06-26T18:00
```

### 予約作成
```
POST /api/reservations/create/
{
  "parking_spot_id": "uuid",
  "user_email": "user@example.com",
  "user_name": "山田太郎",
  "start_time": "2025-06-26T10:00:00Z",
  "end_time": "2025-06-26T18:00:00Z"
}
```

### 決済
```
POST /api/create-payment-intent/
{
  "reservation_id": "uuid"
}
```

## 🏗️ 本番デプロイ

### AWS ECS Fargate
```bash
# ECS設定
aws configure
aws ecs create-cluster --cluster-name parking-system
```

### Vercel + Railway
```bash
# フロントエンド: Vercel
vercel --prod

# バックエンド: Railway
railway login
railway deploy
```

## 🧪 テスト実行

```bash
# バックエンドテスト
docker-compose exec backend python manage.py test

# フロントエンドテスト
docker-compose exec frontend npm test
```

## 📊 ビジネスモデル

### 収益構造
- **手数料**: 駐車料金の10-15%
- **月額プラン**: 駐車場オーナー向け ¥5,000-20,000/月
- **プレミアム機能**: 優先予約 ¥500/月

### ターゲット市場
- 都市部の月極駐車場空きスペース活用
- イベント会場周辺の一時駐車需要
- 商業施設・オフィス街での短時間駐車

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
- 📚 Documentation: https://docs.parking-system.com
- 🐛 Issues: GitHub Issues

---

**開発者**: あなたの名前
**バージョン**: v1.0.0
**最終更新**: 2025年6月26日
EOF
```

### 3-3. .env.example 作成
```bash
cat > .env.example << 'EOF'
# Django設定
DEBUG=1
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/parking_db

# Stripe設定（要変更）
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Google Maps API（要変更）
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# SendGrid メール送信（要変更）
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@your-domain.com

# Redis
REDIS_URL=redis://localhost:6379/0

# 本番環境用
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
EOF
```

## 📤 ステップ4: GitHub にコミット

### 4-1. ファイル追加・コミット
```bash
# 全ファイル追加
git add .

# 初回コミット
git commit -m "🎉 Initial commit: Smart Coin Parking System

✨ Features:
- 🔍 Parking spot search and listing
- 📅 Real-time reservation system  
- 💳 Stripe payment integration
- 📱 Responsive design
- 👤 User dashboard with booking history
- 🔧 Admin dashboard with analytics
- 📊 Sales reporting (CSV/PDF export)
- 🐳 Docker containerization

🛠️ Tech Stack:
- Frontend: React + Tailwind CSS
- Backend: Django REST Framework
- Database: PostgreSQL  
- Payment: Stripe
- Infrastructure: Docker Compose

🚀 Ready for production deployment!"
```

### 4-2. リモートリポジトリ接続
```bash
# GitHubリポジトリのURLを設定（YOUR_USERNAMEを実際のユーザー名に変更）
git remote add origin https://github.com/YOUR_USERNAME/coin-parking-system.git
```

### 4-3. プッシュ
```bash
# メインブランチにプッシュ
git push -u origin main
```

## 🏷️ ステップ5: リリースタグ作成

```bash
# v1.0.0 タグ作成
git tag -a v1.0.0 -m "🚀 Version 1.0.0: Full-featured parking system release

🎯 This release includes:
- Complete parking reservation system
- Stripe payment integration  
- Admin dashboard with analytics
- Production-ready Docker setup
- Comprehensive API documentation

💼 Business ready: 
- Revenue model implemented
- Scalable architecture
- Security best practices
- Performance optimized"

# タグをプッシュ
git push origin v1.0.0
```

## 🔄 ステップ6: 継続的な開発フロー

### ブランチ戦略
```bash
# 新機能開発
git checkout -b feature/google-maps-integration
git add .
git commit -m "✨ Add Google Maps integration"
git push origin feature/google-maps-integration

# バグ修正
git checkout -b hotfix/payment-validation
git add .
git commit -m "🐛 Fix payment validation issue"
git push origin hotfix/payment-validation

# リリース準備
git checkout -b release/v1.1.0
git add .
git commit -m "🔖 Prepare release v1.1.0"
git push origin release/v1.1.0
```

## 📋 ステップ7: GitHub Actions CI/CD (オプション)

`.github/workflows/ci.yml` を作成:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres123
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        cd backend
        python manage.py test
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install frontend dependencies
      run: |
        cd frontend
        npm install
    
    - name: Run frontend tests
      run: |
        cd frontend
        npm test -- --coverage --watchAll=false

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to production
      run: |
        echo "🚀 Deploying to production..."
        # ここに実際のデプロイスクリプトを追加
```

## ✅ 完了チェックリスト

- [ ] ローカル環境でDocker起動確認
- [ ] GitHubリポジトリ作成完了
- [ ] 全ファイルコミット・プッシュ完了
- [ ] README.mdの内容確認・更新
- [ ] .env.exampleの設定項目確認
- [ ] リリースタグ作成完了
- [ ] GitHub Actions設定（オプション）

## 🎯 次のステップ

1. **Stripeアカウント設定**: テストキー → 本番キー
2. **ドメイン取得**: your-domain.com
3. **本番デプロイ**: AWS/Vercel/Railway
4. **駐車場オーナー営業開始**
5. **ユーザーテスト開始**

---

これで、あなたのコインパーキングシステムが完全にGitHubで管理され、他の開発者との協力やバージョン管理が可能になります！🎉