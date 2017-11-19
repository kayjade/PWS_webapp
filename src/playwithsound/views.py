from django.shortcuts import render,redirect
#from django.contrib.staticfiles.templatetags.staticfiles import static
from django.templatetags.static import static

from django.http import HttpResponse
from django.conf import settings
from django.urls.base import reverse

from wsgiref.util import FileWrapper

import os

# Create your views here.
def home(request):
    context={}
    return render(request, 'index.html', context)

def mode_1(request):
    context={}
    return render(request, 'modes/mode1.html', context)

def mode_2(request):
    context={}
    return render(request, 'modes/mode2.html', context)

def mode_3(request):
    context={}
    return render(request, 'modes/mode3.html', context)

def login(request):
    context={}
    return render(request,'login.html',context)

def logout(request):
    logout(request)
    return redirect(reverse('home'))

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
    context={}
    return render(request, 'gallery/gallery_home.html', context)

def gallery_view(request, page):
    context={}
    return render(request, 'gallery/gallery_view_more.html', context)

def gallery_my_album(request):
    context={}
    return render(request, 'gallery/gallery_my_album.html', context)

def saveimage(request):
    blob= request.FILES['fileData']
    #file=open("/Users/flora/Desktop/mioamiao.png","wb")
    file = open("/Users/kayjade/Desktop/mioamiao.png", "wb")
    file.writelines(blob.readlines())
    return HttpResponse()