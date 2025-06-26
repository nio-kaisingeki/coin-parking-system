# 🚗 スマートコインパーキング予約システム

Web上で駐車場の検索・予約・決済を行えるフルスタックサンプルです。React と Django REST Framework を組み合わせ、Stripe を利用した決済処理や管理ダッシュボードを備えています。

## ✨ 主な機能
- 駐車場検索と地図表示
- 予約作成と履歴管理
- Stripe 決済連携
- 管理者用ダッシュボード

## 🛠️ 技術スタック
- **フロントエンド**: React + Tailwind CSS
- **バックエンド**: Django REST Framework
- **データベース**: PostgreSQL
- **決済**: Stripe
- **インフラ**: Docker Compose

## 🚀 クイックスタート

### 1. リポジトリクローン
```bash
git clone <this-repo>
cd coin-parking-system
```

### 2. 環境変数設定
```bash
cp .env.example .env
# .env を編集してキーを設定
```

### 3. Docker で起動
```bash
docker-compose up --build
```

### 4. 初期設定
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

フロントエンド: http://localhost:3000
Django 管理画面: http://localhost:8000/admin
API: http://localhost:8000/api/
