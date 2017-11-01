from django.conf.urls import url, include

from playwithsound.views import *

urlpatterns = [
    url(r'^$', home, name='home'),
    url(r'^what-you-sing-is-what-you-see', mode_1, name='mode_1'),
    url(r'^it-takes-a-song-to-be-an-artist', mode_2, name='mode_2'),
    url(r'^is-this-what-you-want', mode_3, name='mode_3'),
    url(r'^login', login, name='login'),
]