This repository is for your course final project. Your project team
should complete all project work using this repository.

Before your project demo, add to this file a link to your deployed
web site: [PlayWithSound](https://floravan.com/)


# Project
Our website, PlayWithSound, is an application that can transformed user-input
 audio data into images and let users have fun. Users can input their audio data
 through either microphone recording or uploading audio files. Each mode will
 generate a different kind of image for the user. Our website can be visited at
 the following url: https://floravan.com/
 
# Function
Our website provides two modes for users to generate images from audio. Our 
website also provides access to guests, meaning users do not have to register 
or login to use our website. Guests can also views the images created by other 
users, however, only authenticated users can save and manage their generated 
images.

The two modes are described as follows.

1. Real-Time image generation with microphone recording
In our mode 1, "What You Sing Is What You See", users can record their sound 
through microphone once they grant the permisson of the access to their 
microphone to our website, and we will display an image generated in 
real-time, from which the data are extracted from the user-recorded audio 
stream, and the image we generate can demonstrate the change in the audio 
stream to some extent.

Since the image is generated in real-time, we are unable to conduct calculations
that are too complex, thus the images generated in mode 1 are also relatively 
simpler compared to the images generated in mode 2.

2. More complex image generation with user uploading file
In our mode 2, "It Takes A Song To Be An Artist", users can upload an audio 
file(in *.wav formation), and a more complexed image will be generated after 
some processing and analyzing of the uploaded audio file.

In both modes, after the images are generated, authenticated users can download 
their audio/image to local disk, or save the image with the audio to the server.
 Users are also able to view the images of other users can manage the images of 
their own. Authenticated users can also give kudos to the images in the gallery,
 and images with the highest number of kudos will be shown in the page of 
'Popular Paintings'. Guests can also access our two modes and view the paintings
 of other users, while other functions are provided for authenticated users 
only.

# Model
We have 4 customed models except from the Django's built-in User model.

1. Painting

The Painting model represents the images generated for users.

| field | description |
| :------: | :------: |
| user(ForeignKey) | the authenticated user that creates this painting |
| album(ForeignKey) | the album to which this painting belongs to |
| time | the timestamp at which this painting is created |
| audio(OneToOneField) | the audio object associated with this painting |
| image | the file that contains the content of this painting |
| kudos | the number of like this painting gets |
| kudos_user(ManyToManyField) | the set of users who like this painting | 
| description | the description of the painting |

2。 Album

The Album model represents the albums which are created by the user and used to 
manage the paintings.

| field | description |
| :------: | :------: |
| user(ForeignKey) | the authenticated user that creates this album |
| album_name | the name of this album |
| time | the timestamp at which this painting is created |

3。 Audio

The Audio model wraps up the audio files that are associated one to one with the 
painting objects.

| field | description |
| :------: | :------: |
| user(ForeignKey) | the authenticated user that records or uploads this audio file |
| time | the timestamp at which this audio is created |
| audio_file | the file that contains the content of this audio |

4. TempAudio

The TempAudio is also a wrapper of the audio files, except it does not has a user 
field, and is used to hold the temporary uploaded audio files in mode 2.

| field | description |
| :------: | :------: |
| audio_file | the ile that contains the content of this audio |

# Implementation
In this part we mainly explained how we manage to convert images from audio in our 
two modes.

1. Image generated with real-time microphone recording
Our thought of path for implementing mode 1 is quite straight-forward. This process 
can be divided into 2 steps:

In step 1, we use **[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)** 
to get microphone input and extract data from the audio stream. The time 
domain data and frequency domain of the audio stream is extracted for 
subsequent analysis and data visualization. We also use another 3rd-party 
javascript lib **[Recorder.js](https://github.com/kayjade/Recorderjs)** 
to record the audio stream and export it as *.wav files.

In step 2, we use **[D3.js](https://d3js.org/)** to generate graphics according 
to the data we extracted in step 2. Both cavans and SVG are used.

2. Image generated with uploaded user file

The process of mode 2 can be divided into 2 parts. In part 1, we generated a 
spliced image after analyzing the audio file, then we apply a style transfer 
to the spliced image in part 2 so that different parts of the image could 
share a common feel.

To generate a spliced image from the audio, we split the audio data into 6 
segments, then we take each segment's frequency data and try to match it with 
the spectral data of a small piece of image in our pre-defined database. Finally 
we put all 6 matched piece images together to form a spliced image. This 
process runs in the server and **[OpenCv-python](https://opencv-python-tutroals.readthedocs.io/en/latest/)**
 is used. When trying to match the segment of audio and the piece image, we use 
knn algorithm to find the 'closest' image to the audio segment.

To make the different pieces of image share a common feel in a spliced image, 
we then apply a style transfer to the spliced image and return the stylized 
image to the user. We achieve this by using the javascript SDK provided by 
**[Deep Art Effects API](https://developer.deeparteffects.com/)**. 
Because we would have to send request to the server of Deep Art Effects, we 
use a CORS proxy to deal with the CORS problem.

# Deployment
Our website is deployed on an AWS m4.xlarge EC2 instance, with Linux installed 
on the instance. And we use mysql for the database backend.

# Reference
[alvarotrigo/fullPage.js](https://github.com/alvarotrigo/fullPage.js)

[Hover effect](https://miketricking.github.io/bootstrap-image-hover/)

[Bootstrap 3.3](https://getbootstrap.com/docs/3.3/)

[Popular Blocks](https://bl.ocks.org/)

[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

[Recorder.js](https://github.com/kayjade/Recorderjs)

[D3.js](https://d3js.org/)

[OpenCv-python](https://opencv-python-tutroals.readthedocs.io/en/latest/)

[Deep Art Effects API](https://developer.deeparteffects.com/)

[knn algorithm](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm)

[jcjohnson/fast-neural-style](https://github.com/jcjohnson/fast-neural-style)