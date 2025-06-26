from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from django.utils import timezone
from django.http import HttpResponse
from datetime import datetime, timedelta
import csv
import io
import stripe

from .models import ParkingSpot, Reservation
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

class ParkingSpotListView(generics.ListAPIView):
    def get(self, request):
        search_query = request.GET.get('search', '')
        queryset = ParkingSpot.objects.filter(is_active=True)
        if search_query:
            queryset = queryset.filter(name__icontains=search_query)
        spots = []
        for spot in queryset:
            spots.append({
                'id': str(spot.id),
                'name': spot.name,
                'address': spot.address,
                'hourly_rate': spot.hourly_rate,
                'daily_rate': spot.daily_rate,
                'image_url': spot.image_url,
                'available': True,
            })
        return Response({'spots': spots})

class ParkingSpotDetailView(generics.RetrieveAPIView):
    def get(self, request, spot_id):
        spot = get_object_or_404(ParkingSpot, id=spot_id)
        return Response({
            'id': str(spot.id),
            'name': spot.name,
            'address': spot.address,
            'hourly_rate': spot.hourly_rate,
            'daily_rate': spot.daily_rate,
            'image_url': spot.image_url,
        })

@api_view(['POST'])
def create_reservation(request):
    data = request.data
    spot = get_object_or_404(ParkingSpot, id=data['parking_spot_id'])
    start_time = datetime.fromisoformat(data['start_time'])
    end_time = datetime.fromisoformat(data['end_time'])
    reservation = Reservation.objects.create(
        parking_spot=spot,
        user_email=data['user_email'],
        user_name=data['user_name'],
        start_time=start_time,
        end_time=end_time,
        total_price=0,
    )
    reservation.total_price = reservation.calculate_price()
    reservation.save()
    return Response({'reservation_id': str(reservation.id), 'total_price': reservation.total_price})

@api_view(['GET'])
def user_reservations(request):
    email = request.GET.get('email')
    reservations = Reservation.objects.filter(user_email=email).select_related('parking_spot')
    data = []
    for r in reservations:
        data.append({
            'id': str(r.id),
            'parking_spot': {
                'name': r.parking_spot.name,
                'address': r.parking_spot.address,
                'image_url': r.parking_spot.image_url,
            },
            'start_time': r.start_time.isoformat(),
            'end_time': r.end_time.isoformat(),
            'total_price': r.total_price,
            'status': r.status,
        })
    return Response({'reservations': data})

@api_view(['POST'])
def create_payment_intent(request):
    data = request.data
    reservation = get_object_or_404(Reservation, id=data['reservation_id'])
    intent = stripe.PaymentIntent.create(
        amount=reservation.total_price,
        currency='jpy',
        metadata={'reservation_id': str(reservation.id)},
    )
    reservation.stripe_payment_intent_id = intent.id
    reservation.save()
    return Response({'client_secret': intent.client_secret})

@api_view(['POST'])
def confirm_payment(request):
    payment_intent_id = request.data.get('payment_intent_id')
    reservation = get_object_or_404(Reservation, stripe_payment_intent_id=payment_intent_id)
    intent = stripe.PaymentIntent.retrieve(payment_intent_id)
    if intent.status == 'succeeded':
        reservation.status = 'confirmed'
        reservation.save()
        return Response({'status': 'confirmed'})
    return Response({'error': 'payment not completed'}, status=400)

@api_view(['GET'])
def admin_dashboard(request):
    total_reservations = Reservation.objects.count()
    total_revenue = Reservation.objects.filter(status__in=['confirmed','paid','completed']).aggregate(Sum('total_price'))['total_price__sum'] or 0
    total_spots = ParkingSpot.objects.count()
    return Response({'total_reservations': total_reservations, 'total_revenue': total_revenue, 'total_spots': total_spots})

@api_view(['GET'])
def admin_reservations(request):
    reservations = Reservation.objects.select_related('parking_spot')
    data = []
    for r in reservations:
        data.append({
            'id': str(r.id),
            'parking_spot_name': r.parking_spot.name,
            'user_email': r.user_email,
            'start_time': r.start_time.isoformat(),
            'end_time': r.end_time.isoformat(),
            'total_price': r.total_price,
            'status': r.status,
        })
    return Response({'reservations': data})

@api_view(['GET'])
def export_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="reservations.csv"'
    writer = csv.writer(response)
    writer.writerow(['ID','Spot','User','Start','End','Price','Status'])
    for r in Reservation.objects.select_related('parking_spot'):
        writer.writerow([r.id, r.parking_spot.name, r.user_email, r.start_time, r.end_time, r.total_price, r.status])
    return response

@api_view(['GET'])
def export_pdf(request):
    buffer = io.BytesIO()
    writer = csv.writer(buffer)
    writer.writerow(['This is a placeholder PDF'])
    buffer.seek(0)
    return HttpResponse(buffer, content_type='application/pdf')
