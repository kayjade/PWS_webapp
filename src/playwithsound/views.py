from django.shortcuts import render,redirect,get_object_or_404
from django.templatetags.static import static
from django.template.loader import render_to_string

from django.http import Http404, HttpResponse, JsonResponse
from django.conf import settings
from django.urls.base import reverse
from django.db import transaction

from wsgiref.util import FileWrapper

from django.contrib.auth.models import User
from playwithsound.forms import *
from playwithsound.models import *

# Used to create and manually log in a user
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login as auth_login, authenticate

from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_text
import os
import time
import mode2processor

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
    paintings = Painting.objects.all()[:6]
    context={}
    context['paintings']=paintings
    if request.user.is_authenticated and Painting.objects.filter(user=request.user):
        # set the cover of my album
        context['cover']=Painting.objects.filter(user=request.user).all()[0]
    return render(request, 'gallery/gallery_home.html', context)


@login_required
@transaction.atomic
def like_painting(request, paintingId):
    # check paintingId exist
    if not Painting.objects.filter(id=paintingId):
        return HttpResponse("")
    p = Painting.objects.get(id=paintingId)
    # cannot like the same painting repeatedly
    if request.user in p.kudos_user.all():
        return HttpResponse("")

    p.kudos_user.add(request.user)
    p.kudos = p.kudos + 1
    p.save()
    return HttpResponse(p.kudos)


@login_required
@transaction.atomic
def unlike_painting(request, paintingId):
    # check paintingId exist
    if not Painting.objects.filter(id=paintingId):
        return HttpResponse("")
    p = Painting.objects.get(id=paintingId)
    # cannot unlike the painting if the user hasnt given kudos
    if not request.user in p.kudos_user.all():
        return HttpResponse("")

    p.kudos_user.remove(request.user)
    p.kudos = p.kudos - 1
    p.save()
    return HttpResponse(p.kudos)


@transaction.atomic
def gallery_view_popular(request):
    context={}
    context['gallery_title'] = "Popular Paintings"
    context['paintings']=Painting.objects.all().order_by('-kudos')[:6]
    context['view_type']=0
    return render(request, 'gallery/gallery_view_more.html', context)


@transaction.atomic
def gallery_popular_load_more(request):
    if request.method =='POST':
        form = PopularLoadMoreForm(request.POST)
        context={}
        if form.is_valid():
            context['success'] = True
            painting_ids = form.cleaned_data['painting_ids']
            id_list = painting_ids.split('_')
            id_list = map(int, id_list)
            paintings = Painting.objects.all().exclude(id__in=id_list).order_by('-kudos')[:6]
            context['paintings'] = paintings

        rendered = render_to_string('gallery/paintings.json', context)
        return JsonResponse(rendered, safe=False)


@transaction.atomic
def gallery_view_new(request):
    context={}
    context['gallery_title']="New Paintings"
    context['paintings']=Painting.objects.all()[:6]
    context['view_type']=1
    return render(request, 'gallery/gallery_view_more.html', context)


@transaction.atomic
def gallery_new_load_more(request):
    if request.method=='POST':
        form = NewLoadMoreForm(request.POST)
        context={}
        if form.is_valid():
            context['success']=True
            paintings = Painting.objects.filter(id__lt=form.cleaned_data['last_id'])[:6]
            context['paintings']=paintings

        rendered = render_to_string('gallery/paintings.json', context)
        return JsonResponse(rendered, safe=False)


@login_required
@transaction.atomic
def gallery_my_album(request):
    context={}
    context['albums']=request.user.album_set.all()
    return render(request, 'gallery/gallery_my_album.html', context)


@login_required
@transaction.atomic
def gallery_view_my_album(request, album):
    # each user can only view & manage his/her own albums
    if not request.user.album_set.filter(id=album):
        return redirect(reverse('gallery_home'))

    context={}
    view_album = Album.objects.get(id=album)
    if view_album.painting_set.all():
        context['paintings']=view_album.painting_set.all()[:6]
        context['album_id']=album
    else:
        context['info'] = "This album is empty."
    context['gallery_title']=view_album.album_name + " album"
    return render(request, 'gallery/gallery_view_my_album.html', context)


def gallery_album_load_more(request):
    if request.method =='POST':
        form = AlbumLoadMoreForm(request.POST)
        context={}
        if form.is_valid():
            context['success'] = True
            album = Album.objects.get(id = form.cleaned_data['album_id'])
            paintings = Painting.objects.filter(album=album,
                                                id__lt=form.cleaned_data['last_id'])[:6]
            context['paintings'] = paintings

        rendered = render_to_string('gallery/paintings.json', context)
        return JsonResponse(rendered, safe=False)


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
        context={}
        form = CreateAlbumForm(request.POST)
        if form.is_valid():
            # create a new album
            new_album = Album(album_name = form.cleaned_data['album_name'],
                              user = request.user)
            new_album.save()
            context['success'] = True
            context['info']='Create new album success!'
            context['album_id'] = new_album.id
            context['new_album']=form.cleaned_data['album_name']
        else:
            context['info']=' '.join(form.errors['__all__'])

        rendered = render_to_string('gallery/new_album.json', context)
        return JsonResponse(rendered, safe=False)


@login_required
@transaction.atomic
# delete a album
def delete_album(request, album_id):
    if request.method == 'POST':
        # a user could only delete his/her own album
        if not Album.objects.filter(id=album_id, user=request.user):
            return HttpResponse("")

        to_be_delete = Album.objects.get(id=album_id)
        to_be_delete.delete()
        return HttpResponse("success")


# upload an audio file to the server
@transaction.atomic
def upload_audio(request):
    if request.method == "POST":
        audiofile= request.FILES['audio']
        tmp = TempAudio(data = audiofile)
        tmp.save()
        name=tmp.data.name
        # call other process method
        img=mode2processor.main(name)
        print(img)
        return HttpResponse(tmp.data.name)