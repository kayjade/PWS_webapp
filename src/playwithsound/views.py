from django.shortcuts import render,redirect,get_object_or_404
from django.templatetags.static import static

from django.http import Http404, HttpResponse, JsonResponse
from django.conf import settings
from django.urls.base import reverse
from django.db import transaction

from wsgiref.util import FileWrapper

from playwithsound.models import *
from playwithsound.forms import *

# Used to create and manually log in a user
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login as auth_login, authenticate

from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_text

import os

# Create your views here.
def home(request):
    return render(request, 'index.html', {})


# Action when people click register button.
@transaction.atomic
def register(request):
    context = {}

    if request.method == "GET":
        context['form'] = RegistrationForm()
        return render(request, 'register.html', context)

    form = RegistrationForm(request.POST)

    context['form'] = form
    if not form.is_valid():
        return render(request, 'register.html', context)
    new_user = User.objects.create_user(username=form.cleaned_data['username'],
                                        first_name=form.cleaned_data['firstname'],
                                        last_name=form.cleaned_data['lastname'],
                                        password=form.cleaned_data['password1'],
                                        email=form.cleaned_data['email'],
                                        is_active=False
                                        )
    new_user.save()
    # each new user has a default album
    Album(user=new_user,album_name="Default").save()
    uidb64 = urlsafe_base64_encode(force_bytes(new_user.pk))
    token = default_token_generator.make_token(new_user)
    email_body = """Welcome to PLAY WITH SOUND! Please click the link below to verify you 
    email address and complete the registration of your account:

    http://%s%s
    """ % (request.get_host(),
           reverse('confirm-email', args=(uidb64, token)))

    send_mail(subject="Verify your email address in Grumblr",
              message=email_body,
              from_email="oreoztl@gmail.com",
              recipient_list=[new_user.email])
    context['email'] = form.cleaned_data['email']
    return render(request, 'registration/needemailvalidation.html', context)


@transaction.atomic
def registeration_confirm(request, uidb64, token):
    uid = force_text(urlsafe_base64_decode(uidb64))
    user = User.objects.filter(pk=uid)[0]
    # Verify if input uidb64 corresponds to a existed user
    if not user:
        return render(request, 'registration/needemailvalidation.html', {})
    if default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        auth_login(request, user)
        return redirect(reverse('home'))
    else:
        return render(request, 'registration/needemailvalidation.html', {})


def mode_1(request):
    context={}
    if request.user.is_authenticated():
        context['albums'] = request.user.album_set.all()
    return render(request, 'modes/mode1.html', context)





def mode_2(request):
    context={}
    return render(request, 'modes/mode2.html', context)


# get the static audio file for convolver
def get_conv_audio(request):
    # the url of the file
    file_url=os.path.join(settings.STATIC_ROOT, 'playwithsound', 'audio', 'abernyte_grain_silo_ir_edit.wav')
    f = open(file_url,"rb")
    response = HttpResponse()
    response.write(f.read())
    response['Content-Type'] ='audio/wav'
    response['Content-Length'] = os.path.getsize(file_url)
    print(os.path.getsize(file_url))
    return response


# homepage of gallery
def gallery_home(request):
    # display at most 6 paintings in the main page og gallery
    images = Painting.objects.all()[:6]
    context={}
    context['images']=images
    if request.user.is_authenticated and Painting.objects.filter(user=request.user):
        # set the cover of my album
        context['cover']=Painting.objects.filter(user=request.user).all()[0]
    return render(request, 'gallery/gallery_home.html', context)


@login_required
@transaction.atomic
def gallery_view(request, page):
    context={}
    return render(request, 'gallery/gallery_view_more.html', context)


@login_required
@transaction.atomic
def gallery_my_album(request):
    context={}
    context['albums']=request.user.album_set.all()
    return render(request, 'gallery/gallery_my_album.html', context)


@login_required
@transaction.atomic
def gallery_view_album(request, album):
    # each user can only view & manage his/her own albums
    if not request.user.album_set.filter(id=album):
        return redirect(reverse('gallery_home'))

    context={}
    view_album = Album.objects.get(id=album)
    context['paintings']=view_album.painting_set.all()
    context['gallery_title']=view_album.album_name + " album"
    return render(request, 'gallery/gallery_view_more.html', context)


@login_required
@transaction.atomic
def saveimage(request):
    if request.method == "POST":
        imagefile= request.FILES['ImageData']
        audiofile=request.FILES['AudioData']
        if not request.user.album_set.filter(album_name=request.POST['Album']):
            raise Http404
        album = request.user.album_set.get(album_name=request.POST['Album'])
        audio = Audio(user = request.user, audio_file = audiofile)
        audio.save()
        painting = Painting(user=request.user,image=imagefile, audio = audio,album=album)
        painting.save()
        return HttpResponse('Success')
    else:
        raise Http404
    #file=open("/Users/flora/Desktop/mioamiao.wav","wb")
    #file.writelines(audiofile.readlines())


# get image from the database
def getimage(request, image_id):
    user = request.user
    if image_id and Painting.objects.filter(id=image_id).exists():
        painting = Painting.objects.filter(id__exact=image_id)[0]
    return HttpResponse(painting.image, content_type='image/png')


# get audio from the database
def getaudio(request, image_id):
    user = request.user
    if image_id and Painting.objects.filter(id=image_id).exists():
        painting = Painting.objects.filter(id__exact=image_id)[0]
    return HttpResponse(painting.audio.audio_file, content_type='audio/wav')


@login_required
@transaction.atomic
# create a new album
def create_new_album(request):
    if request.method == 'POST':
        form = CreateAlbumForm(request.POST)
        if form.is_valid():
            # create a new album
            new_album = Album(album_name = form.cleaned_data['album_name'],
                              user = request.user)
            new_album.save()
            return JsonResponse({'success':True, 'info':'Create new album success!',
                                 'new_album':form.cleaned_data['album_name']})
        else:
            #print(' '.join(form.errors['__all__']))
            return JsonResponse({'success': False, 'info':' '.join(form.errors['__all__'])})