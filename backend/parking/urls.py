from django.urls import path
from . import views

urlpatterns = [
    path('spots/', views.ParkingSpotListView.as_view()),
    path('spots/<uuid:spot_id>/', views.ParkingSpotDetailView.as_view()),
    path('reservations/create/', views.create_reservation),
    path('reservations/user/', views.user_reservations),
    path('create-payment-intent/', views.create_payment_intent),
    path('confirm-payment/', views.confirm_payment),
    path('admin/dashboard/', views.admin_dashboard),
    path('admin/reservations/', views.admin_reservations),
    path('admin/export/csv/', views.export_csv),
    path('admin/export/pdf/', views.export_pdf),
]
