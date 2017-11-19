from django.conf.urls import url, include


from playwithsound.views import *

urlpatterns = [
    url(r'^$', home, name='home'),
    url(r'^what-you-sing-is-what-you-see', mode_1, name='mode_1'),
    url(r'^it-takes-a-song-to-be-an-artist', mode_2, name='mode_2'),
    url(r'^is-this-what-you-want', mode_3, name='mode_3'),
    url(r'^login', login, name='login'),
    url(r'logout$', logout, name='logout'),
    url(r'^get_conv_audio/$', get_conv_audio, name='get_conv_audio'),
    url(r'^gallery/home/$', gallery_home, name='gallery_home'),
    url(r'gallery/view/my_album', gallery_my_album, name='gallery_my_album'),
    url(r'gallery/view/(?P<page>[a-z]+)/$', gallery_view, name='gallery_view'),
    url(r'^saveimage', saveimage, name='saveimage'),

]