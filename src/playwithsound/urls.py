from django.conf.urls import url, include

from playwithsound.views import *

urlpatterns = [
    url(r'^$', home, name='home'),
]