from django.db import models
from django import forms
from django.utils import timezone

# Use Django's built-in User class for our users
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db.models import Max
from django.utils.html import escape

# Create your models here.

# User can create albums to manage their paintings
class Album(models.Model):
    # The user to whom this album belongs to
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # The name of album
    album_name = models.CharField(max_length=100)
    # The time at which this album is created
    time = models.DateTimeField(default=timezone.now)


    def __unicode__(self):
        return '%s %s' % (self.user.username, self.album_name)
    def __str__(self):
        return self.__unicode__()


# The audio file uploaded by the user
class Audio(models.Model):
    # The user who uploads this painting
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # The time at which this audio file is uploaded
    time = models.DateTimeField(default=timezone.now)
    audio_file = models.FileField(upload_to='audio/')


    def __unicode__(self):
        return self.user.username
    def __str__(self):
        return self.__unicode__()


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
    # the number of kudos
    kudos = models.IntegerField(default=0)
    kudos_user = models.ManyToManyField(User,
                  related_name="kudos_painting",
                  related_query_name="kudos_painting")

    def __unicode__(self):
        return '%s %s %s' % (self.user.username, self.album.album_name,
                              self.id)
    def __str__(self):
        return self.__unicode__()

    @staticmethod
    def getImageIDs(user):
        idList = []
        images = Painting.objects.filter(user=user)
        for image in images:
            idList.append(image.id)
        return idList
