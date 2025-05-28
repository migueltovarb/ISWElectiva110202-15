from django.db import models
from authentication.models import User

class ParkingArea(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    max_capacity = models.IntegerField()
    current_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class Vehicle(models.Model):
    user = models.ForeignKey(User, related_name='vehicles', on_delete=models.CASCADE)
    license_plate = models.CharField(max_length=20)
    brand = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    color = models.CharField(max_length=30)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('user', 'license_plate')
    
    def __str__(self):
        return f"{self.license_plate} - {self.user.username}"

class ParkingAccess(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    parking_area = models.ForeignKey(ParkingArea, on_delete=models.CASCADE)
    valid_from = models.DateField(auto_now_add=True)
    valid_to = models.DateField(null=True, blank=True)
    
    class Meta:
        unique_together = ('vehicle', 'parking_area')
    
    def __str__(self):
        return f"{self.vehicle.license_plate} - {self.parking_area.name}"

class ParkingLog(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    parking_area = models.ForeignKey(ParkingArea, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    direction = models.CharField(max_length=10, choices=[('in', 'Entry'), ('out', 'Exit')])
    status = models.CharField(max_length=10, choices=[('granted', 'Granted'), ('denied', 'Denied')])
    reason = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return f"{self.vehicle.license_plate} - {self.parking_area.name} - {self.timestamp}"
