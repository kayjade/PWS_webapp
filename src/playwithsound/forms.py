from django.forms import ModelForm, widgets
from django.contrib.auth.models import User
from playwithsound.models import *
from django import forms

class RegistrationForm(forms.Form):
    username=forms.CharField(max_length=42,required=True,widget=forms.TextInput(attrs={'class': 'form-control','autofocus':True,'placeholder':'Username'}))
    firstname = forms.CharField(max_length=42,required=True,widget=forms.TextInput(attrs={'class': 'form-control name-1','placeholder':'First Name'}))
    lastname = forms.CharField(max_length=42,required=True,widget=forms.TextInput(attrs={'class': 'form-control name-2','placeholder':'Last Name'}))
    password1=forms.CharField(max_length=42,
                              label='Password',
                              widget=forms.PasswordInput(attrs={'class': 'form-control','placeholder':'Password'}))
    password2 = forms.CharField(max_length=42,
                                label='Confirm Password',
                                required=True,
                                widget=forms.PasswordInput(attrs={'class': 'form-control','placeholder':'Password confirm'}))
    email=forms.EmailField(max_length=100,
                           label='Email',
                           required=True,
                           widget=forms.TextInput(attrs={'class': 'form-control','placeholder':'Email'}))
    def clean(self):
        cleaned_data=super(RegistrationForm,self).clean()
        password1=cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 and password2 and password1!=password2:
            raise forms.ValidationError("Passwords did not match.")
        return cleaned_data

    def clean_username(self):
        username=self.cleaned_data.get('username')
        if User.objects.filter(username__exact=username):
            raise forms.ValidationError("Username is already taken.")
        return username


class CreateAlbumForm(forms.Form):
    user_id = forms.IntegerField()
    album_name = forms.CharField(max_length = 42)

    def clean(self):
        cleaned_data = super(CreateAlbumForm, self).clean()
        user_id = cleaned_data.get('user_id')
        album_name = cleaned_data.get('album_name')

        if not User.objects.filter(id=user_id):
            raise forms.ValidationError('user id does not exist!')
        user = User.objects.get(id=user_id)
        # check if the album name already exist or not
        if user.album_set.filter(album_name = album_name):
            raise forms.ValidationError('Album name already exist!')
        return cleaned_data


class AlbumLoadMoreForm(forms.Form):
    last_id = forms.IntegerField()
    album_id = forms.IntegerField()

    def clean(self):
        cleaned_data = super(AlbumLoadMoreForm, self).clean()
        last_id = cleaned_data.get('last_id')
        album_id = cleaned_data.get('album_id')

        if not Album.objects.filter(id=album_id):
            raise forms.ValidationError('album does not exist!')
        if not Painting.objects.filter(id = last_id):
            raise forms.ValidationError('painting does not exist!')
        return cleaned_data


class NewLoadMoreForm(forms.Form):
    last_id = forms.IntegerField()
    view_type = forms.IntegerField()

    def clean(self):
        cleaned_data = super(NewLoadMoreForm, self).clean()
        last_id = cleaned_data.get('last_id')
        view_type = cleaned_data.get('view_type')

        if view_type != 1:
            raise forms.ValidationError("incorrect stream view type!")
        return cleaned_data


class PopularLoadMoreForm(forms.Form):
    painting_num = forms.IntegerField()
    view_type = forms.IntegerField()

    def clean(self):
        cleaned_data = super(PopularLoadMoreForm, self).clean()
        painting_num = cleaned_data.get('painting_num')
        view_type = cleaned_data.get('view_type')

        if view_type != 0:
            raise forms.ValidationError("incorrect stream view type!")
        return cleaned_data