from django.db import models
from django.utils import timezone

# Use Django's built-in User class for our users
from django.contrib.auth.models import User

# Create your models here.

# User can create albums to manage their paintings
class Album(models.Model):
    # The user to whom this album belongs to
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # The name of album
    album_name = models.CharField(max_length=100)
    # The time at which this album is created
    time = models.DateTimeField(default=timezone.now)

# The audio file uploaded by the user
class Audio(models.Model):
    # The user who uploads this painting
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # The time at which this audio file is uploaded
    time = models.DateTimeField(default=timezone.now)
    audio_file = models.FileField(upload_to'audio/')


# The paintings created by users
class Painting(models.Model):
	# The user who creates this painting
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # The album to which this painting belongs to
    album = models.ForeignKey(Album, on_delete=models.CASCADE)
    # The time at which this painting is created
    time = models.DateTimeField(default=timezone.now)
    # The audio file which cooresponding to this image
    audio = models.OneToOneField(Audio, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='img/')