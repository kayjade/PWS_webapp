from django.conf.urls import url, include
from django.contrib.auth import views as auth_views
from django.contrib import admin
from playwithsound.views import *

urlpatterns = [
    url(r'^$', home, name='home'),
    url(r'^what-you-sing-is-what-you-see', mode_1, name='mode_1'),
    url(r'^it-takes-a-song-to-be-an-artist', mode_2, name='mode_2'),
    url(r'^login$', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    url(r'^logout$', auth_views.logout_then_login, name='logout'),
    url(r'^get_conv_audio/$', get_conv_audio, name='get_conv_audio'),
    # gallery view
    url(r'^gallery/home/$', gallery_home, name='gallery_home'),
    url(r'^gallery/view/my_album', gallery_my_album, name='gallery_my_album'),
    url(r'^gallery/view/(?P<page>[a-z]+)/$', gallery_view, name='gallery_view'),
    url(r'^gallery/view/album/(?P<album>[0-9]+)/$', gallery_view_album, name='gallery_view_album'),

    url(r'^saveimage', saveimage, name='saveimage'),
    url(r'^register', register, name='register'),
    url(r'^validate/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$', registeration_confirm, name='confirm-email'),
    url(r'^password/reset/$',auth_views.password_reset,{'post_reset_redirect':'resetdone'},name="password_reset"),
    url(r'^password/reset/done/$',auth_views.password_reset_done,name='resetdone'),
    url(r'^password/reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$', auth_views.password_reset_confirm,{'post_reset_redirect':'resetcomplete'},name='reset-confirm'),
    url(r'^password/reset/complete/$', auth_views.password_reset_complete,name='resetcomplete'),
    url(r'^getimage/(?P<image_id>[0-9]+)',getimage, name='getimage'),
    url(r'^getaudio/(?P<image_id>[0-9]+)',getaudio, name='getaudio'),
    # create new album
    url(r'^create-new-album/$', create_new_album, name='create_new_album'),
]