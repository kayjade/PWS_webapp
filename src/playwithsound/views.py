from django.shortcuts import render

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