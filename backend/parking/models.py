from django.db import models
from decimal import Decimal
from django.core.validators import MinValueValidator
import uuid

class ParkingSpot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    hourly_rate = models.IntegerField(validators=[MinValueValidator(0)])
    daily_rate = models.IntegerField(validators=[MinValueValidator(0)])
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def is_available(self, start_time, end_time):
        overlapping = self.reservations.filter(
            status__in=['confirmed', 'paid'],
            start_time__lt=end_time,
            end_time__gt=start_time,
        )
        return not overlapping.exists()

class Reservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'pending'),
        ('paid', 'paid'),
        ('confirmed', 'confirmed'),
        ('cancelled', 'cancelled'),
        ('completed', 'completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parking_spot = models.ForeignKey(ParkingSpot, on_delete=models.CASCADE, related_name='reservations')
    user_email = models.EmailField()
    user_name = models.CharField(max_length=100)
    user_phone = models.CharField(max_length=20, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    total_price = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    stripe_payment_intent_id = models.CharField(max_length=200, blank=True)
    stripe_charge_id = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.parking_spot.name} - {self.user_email}"

    def calculate_price(self):
        duration_hours = (self.end_time - self.start_time).total_seconds() / 3600
        duration_hours = max(1, int(duration_hours) + (1 if duration_hours % 1 > 0 else 0))
        if duration_hours >= 24:
            days = int(duration_hours / 24)
            remaining = duration_hours % 24
            total = days * self.parking_spot.daily_rate + remaining * self.parking_spot.hourly_rate
        else:
            total = duration_hours * self.parking_spot.hourly_rate
        return int(total)
