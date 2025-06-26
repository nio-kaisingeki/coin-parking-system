# models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid


class ParkingSpot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, verbose_name="駐車場名")
    address = models.TextField(verbose_name="住所")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, verbose_name="緯度")
    longitude = models.DecimalField(max_digits=9, decimal_places=6, verbose_name="経度")
    hourly_rate = models.IntegerField(validators=[MinValueValidator(0)], verbose_name="時間料金")
    daily_rate = models.IntegerField(validators=[MinValueValidator(0)], verbose_name="日額料金")
    description = models.TextField(blank=True, verbose_name="説明")
    image_url = models.URLField(blank=True, verbose_name="画像URL")
    is_active = models.BooleanField(default=True, verbose_name="利用可能")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "駐車場"
        verbose_name_plural = "駐車場"

    def __str__(self):
        return self.name

    def is_available(self, start_time, end_time):
        """指定時間帯に利用可能かチェック"""
        overlapping_reservations = self.reservations.filter(
            status__in=['confirmed', 'paid'],
            start_time__lt=end_time,
            end_time__gt=start_time
        )
        return not overlapping_reservations.exists()


class Reservation(models.Model):
    STATUS_CHOICES = [
        ('pending', '支払い待ち'),
        ('paid', '支払い完了'),
        ('confirmed', '予約確定'),
        ('cancelled', 'キャンセル'),
        ('completed', '利用完了'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parking_spot = models.ForeignKey(ParkingSpot, on_delete=models.CASCADE, related_name='reservations')
    user_email = models.EmailField(verbose_name="利用者メール")
    user_name = models.CharField(max_length=100, verbose_name="利用者名")
    user_phone = models.CharField(max_length=20, blank=True, verbose_name="電話番号")
    start_time = models.DateTimeField(verbose_name="開始時間")
    end_time = models.DateTimeField(verbose_name="終了時間")
    total_price = models.IntegerField(verbose_name="合計料金")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Stripe関連
    stripe_payment_intent_id = models.CharField(max_length=200, blank=True)
    stripe_charge_id = models.CharField(max_length=200, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "予約"
        verbose_name_plural = "予約"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.parking_spot.name} - {self.user_email}"

    def calculate_price(self):
        """料金計算"""
        duration_hours = (self.end_time - self.start_time).total_seconds() / 3600
        # 1時間未満は1時間として計算
        duration_hours = max(1, int(duration_hours) + (1 if duration_hours % 1 > 0 else 0))
        
        # 24時間以上なら日額料金を適用
        if duration_hours >= 24:
            days = int(duration_hours / 24)
            remaining_hours = duration_hours % 24
            total = (days * self.parking_spot.daily_rate) + (remaining_hours * self.parking_spot.hourly_rate)
        else:
            total = duration_hours * self.parking_spot.hourly_rate
            
        return int(total)


# views.py
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum, Count
from django.utils import timezone
from django.http import HttpResponse, JsonResponse
from datetime import datetime, timedelta
import stripe
import csv
import json
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfutils
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
import io

# Stripe設定
stripe.api_key = 'sk_test_...'  # 実際のStripeシークレットキーを設定


class ParkingSpotListView(generics.ListAPIView):
    """駐車場一覧API"""
    
    def get(self, request):
        # 検索パラメータ
        search_query = request.GET.get('search', '')
        lat = request.GET.get('lat')
        lng = request.GET.get('lng')
        start_time = request.GET.get('start_time')
        end_time = request.GET.get('end_time')
        
        queryset = ParkingSpot.objects.filter(is_active=True)
        
        # テキスト検索
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) | Q(address__icontains=search_query)
            )
        
        # 位置情報での絞り込み（簡易版）
        if lat and lng:
            # 実際は距離計算を実装
            pass
        
        spots_data = []
        for spot in queryset:
            # 利用可能性チェック
            available = True
            if start_time and end_time:
                try:
                    start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                    end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
                    available = spot.is_available(start_dt, end_dt)
                except:
                    pass
            
            spots_data.append({
                'id': str(spot.id),
                'name': spot.name,
                'address': spot.address,
                'latitude': float(spot.latitude),
                'longitude': float(spot.longitude),
                'hourly_rate': spot.hourly_rate,
                'daily_rate': spot.daily_rate,
                'description': spot.description,
                'image_url': spot.image_url or f'https://via.placeholder.com/300x200?text={spot.name}',
                'available': available
            })
        
        return Response({'spots': spots_data})


class ParkingSpotDetailView(generics.RetrieveAPIView):
    """駐車場詳細API"""
    
    def get(self, request, spot_id):
        spot = get_object_or_404(ParkingSpot, id=spot_id)
        
        return Response({
            'id': str(spot.id),
            'name': spot.name,
            'address': spot.address,
            'latitude': float(spot.latitude),
            'longitude': float(spot.longitude),
            'hourly_rate': spot.hourly_rate,
            'daily_rate': spot.daily_rate,
            'description': spot.description,
            'image_url': spot.image_url or f'https://via.placeholder.com/300x200?text={spot.name}',
        })


@api_view(['POST'])
def create_reservation(request):
    """予約作成API"""
    try:
        data = request.data
        
        # バリデーション
        required_fields = ['parking_spot_id', 'user_email', 'user_name', 'start_time', 'end_time']
        for field in required_fields:
            if field not in data:
                return Response({'error': f'{field}は必須です'}, status=status.HTTP_400_BAD_REQUEST)
        
        spot = get_object_or_404(ParkingSpot, id=data['parking_spot_id'])
        start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
        
        # 利用可能性チェック
        if not spot.is_available(start_time, end_time):
            return Response({'error': '指定時間は既に予約されています'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 予約作成
        reservation = Reservation.objects.create(
            parking_spot=spot,
            user_email=data['user_email'],
            user_name=data['user_name'],
            user_phone=data.get('user_phone', ''),
            start_time=start_time,
            end_time=end_time,
            total_price=0,  # 後で計算
            status='pending'
        )
        
        # 料金計算
        reservation.total_price = reservation.calculate_price()
        reservation.save()
        
        return Response({
            'reservation_id': str(reservation.id),
            'total_price': reservation.total_price,
            'message': '予約を作成しました。決済にお進みください。'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def create_payment_intent(request):
    """Stripe PaymentIntent作成API"""
    try:
        data = request.data
        reservation_id = data.get('reservation_id')
        
        if not reservation_id:
            return Response({'error': 'reservation_idは必須です'}, status=status.HTTP_400_BAD_REQUEST)
        
        reservation = get_object_or_404(Reservation, id=reservation_id)
        
        # PaymentIntent作成
        intent = stripe.PaymentIntent.create(
            amount=reservation.total_price,
            currency='jpy',
            metadata={
                'reservation_id': str(reservation.id),
                'parking_spot_name': reservation.parking_spot.name,
                'user_email': reservation.user_email
            }
        )
        
        # PaymentIntentIDを保存
        reservation.stripe_payment_intent_id = intent.id
        reservation.save()
        
        return Response({
            'client_secret': intent.client_secret,
            'amount': reservation.total_price
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def confirm_payment(request):
    """支払い確認API（Webhookまたは手動確認）"""
    try:
        data = request.data
        payment_intent_id = data.get('payment_intent_id')
        
        if not payment_intent_id:
            return Response({'error': 'payment_intent_idは必須です'}, status=status.HTTP_400_BAD_REQUEST)
        
        reservation = get_object_or_404(Reservation, stripe_payment_intent_id=payment_intent_id)
        
        # Stripeで支払い状況確認
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status == 'succeeded':
            reservation.status = 'confirmed'
            reservation.stripe_charge_id = intent.latest_charge
            reservation.save()
            
            return Response({
                'message': '支払いが完了しました',
                'reservation_id': str(reservation.id),
                'status': 'confirmed'
            })
        else:
            return Response({'error': '支払いが完了していません'}, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def user_reservations(request):
    """ユーザー予約履歴API"""
    email = request.GET.get('email')
    if not email:
        return Response({'error': 'emailパラメータは必須です'}, status=status.HTTP_400_BAD_REQUEST)
    
    reservations = Reservation.objects.filter(user_email=email).select_related('parking_spot')
    
    reservations_data = []
    for reservation in reservations:
        reservations_data.append({
            'id': str(reservation.id),
            'parking_spot': {
                'name': reservation.parking_spot.name,
                'address': reservation.parking_spot.address,
                'image_url': reservation.parking_spot.image_url or f'https://via.placeholder.com/300x200?text={reservation.parking_spot.name}'
            },
            'start_time': reservation.start_time.isoformat(),
            'end_time': reservation.end_time.isoformat(),
            'total_price': reservation.total_price,
            'status': reservation.status,
            'created_at': reservation.created_at.isoformat()
        })
    
    return Response({'reservations': reservations_data})


@api_view(['POST'])
def cancel_reservation(request, reservation_id):
    """予約キャンセルAPI"""
    try:
        reservation = get_object_or_404(Reservation, id=reservation_id)
        
        if reservation.status == 'cancelled':
            return Response({'error': '既にキャンセル済みです'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 開始時間の24時間前までキャンセル可能
        if reservation.start_time - timezone.now() < timedelta(hours=24):
            return Response({'error': '開始時間の24時間前までキャンセル可能です'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Stripe返金処理（必要に応じて）
        if reservation.stripe_charge_id:
            try:
                stripe.Refund.create(charge=reservation.stripe_charge_id)
            except stripe.error.StripeError as e:
                return Response({'error': f'返金処理エラー: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        reservation.status = 'cancelled'
        reservation.save()
        
        return Response({'message': 'キャンセルが完了しました'})
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# 管理者API
@api_view(['GET'])
def admin_dashboard(request):
    """管理者ダッシュボードAPI"""
    # 基本統計
    total_reservations = Reservation.objects.count()
    total_revenue = Reservation.objects.filter(status__in=['confirmed', 'paid', 'completed']).aggregate(Sum('total_price'))['total_price__sum'] or 0
    total_spots = ParkingSpot.objects.filter(is_active=True).count()
    
    # 月別売上（過去12ヶ月）
    monthly_sales = []
    for i in range(12):
        month_start = timezone.now().replace(day=1) - timedelta(days=30 * i)
        month_end = month_start + timedelta(days=30)
        monthly_revenue = Reservation.objects.filter(
            created_at__range=[month_start, month_end],
            status__in=['confirmed', 'paid', 'completed']
        ).aggregate(Sum('total_price'))['total_price__sum'] or 0
        
        monthly_sales.append({
            'month': month_start.strftime('%Y-%m'),
            'revenue': monthly_revenue
        })
    
    return Response({
        'total_reservations': total_reservations,
        'total_revenue': total_revenue,
        'total_spots': total_spots,
        'monthly_sales': monthly_sales[::-1]  # 古い順に並び替え
    })


@api_view(['GET'])
def admin_reservations(request):
    """管理者予約一覧API"""
    # フィルタパラメータ
    email = request.GET.get('email', '')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    status_filter = request.GET.get('status', '')
    
    queryset = Reservation.objects.select_related('parking_spot')
    
    if email:
        queryset = queryset.filter(user_email__icontains=email)
    if start_date:
        queryset = queryset.filter(created_at__gte=start_date)
    if end_date:
        queryset = queryset.filter(created_at__lte=end_date)
    if status_filter:
        queryset = queryset.filter(status=status_filter)
    
    reservations_data = []
    for reservation in queryset:
        reservations_data.append({
            'id': str(reservation.id),
            'parking_spot_name': reservation.parking_spot.name,
            'user_email': reservation.user_email,
            'user_name': reservation.user_name,
            'start_time': reservation.start_time.isoformat(),
            'end_time': reservation.end_time.isoformat(),
            'total_price': reservation.total_price,
            'status': reservation.status,
            'created_at': reservation.created_at.isoformat()
        })
    
    return Response({'reservations': reservations_data})


@api_view(['GET'])
def export_csv(request):
    """CSV出力API"""
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    queryset = Reservation.objects.select_related('parking_spot')
    if start_date:
        queryset = queryset.filter(created_at__gte=start_date)
    if end_date:
        queryset = queryset.filter(created_at__lte=end_date)
    
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="reservations.csv"'
    
    # BOM追加（Excel対応）
    response.write('\ufeff')
    
    writer = csv.writer(response)
    writer.writerow(['予約ID', '駐車場名', '利用者メール', '利用者名', '開始時間', '終了時間', '料金', 'ステータス', '予約日時'])
    
    for reservation in queryset:
        writer.writerow([
            str(reservation.id),
            reservation.parking_spot.name,
            reservation.user_email,
            reservation.user_name,
            reservation.start_time.strftime('%Y-%m-%d %H:%M'),
            reservation.end_time.strftime('%Y-%m-%d %H:%M'),
            reservation.total_price,
            reservation.get_status_display(),
            reservation.created_at.strftime('%Y-%m-%d %H:%M')
        ])
    
    return response


@api_view(['GET'])
def export_pdf(request):
    """PDF出力API"""
    email = request.GET.get('email', '')
    
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # 日本語フォント設定（実際の運用では適切なフォントファイルを使用）
    p.setFont("Helvetica", 12)
    
    y = 750
    p.drawString(50, y, f"Parking Reservations Report")
    y -= 30
    
    if email:
        reservations = Reservation.objects.filter(user_email=email).select_related('parking_spot')
        p.drawString(50, y, f"User: {email}")
        y -= 30
    else:
        reservations = Reservation.objects.select_related('parking_spot')[:50]  # 最新50件
    
    for reservation in reservations:
        if y < 100:  # 新しいページ
            p.showPage()
            y = 750
            p.setFont("Helvetica", 12)
        
        text = f"{reservation.parking_spot.name} - {reservation.user_email} - Y{reservation.total_price}"
        p.drawString(50, y, text)
        y -= 20
    
    p.save()
    buffer.seek(0)
    
    response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="reservations.pdf"'
    
    return response


# urls.py
from django.urls import path, include
from . import views

urlpatterns = [
    # 駐車場関連
    path('api/spots/', views.ParkingSpotListView.as_view(), name='parking-spots'),
    path('api/spots/<uuid:spot_id>/', views.ParkingSpotDetailView.as_view(), name='parking-spot-detail'),
    
    # 予約関連
    path('api/reservations/create/', views.create_reservation, name='create-reservation'),
    path('api/reservations/user/', views.user_reservations, name='user-reservations'),
    path('api/reservations/<uuid:reservation_id>/cancel/', views.cancel_reservation, name='cancel-reservation'),
    
    # 決済関連
    path('api/create-payment-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('api/confirm-payment/', views.confirm_payment, name='confirm-payment'),
    
    # 管理者関連
    path('api/admin/dashboard/', views.admin_dashboard, name='admin-dashboard'),
    path('api/admin/reservations/', views.admin_reservations, name='admin-reservations'),
    path('api/admin/export/csv/', views.export_csv, name='export-csv'),
    path('api/admin/export/pdf/', views.export_pdf, name='export-pdf'),
]


# settings.py（重要な設定のみ）
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'parking',  # あなたのアプリ名
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS設定
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React開発サーバー
    "https://your-domain.com",  # 本番ドメイン
]

# Stripe設定
STRIPE_PUBLISHABLE_KEY = 'pk_test_...'  # パブリックキー
STRIPE_SECRET_KEY = 'sk_test_...'  # シークレットキー

# データベース設定（PostgreSQL）
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'parking_db',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# REST Framework設定
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # 開発用、本番では適切な認証を設定
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}