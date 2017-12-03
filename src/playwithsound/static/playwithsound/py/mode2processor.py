
# import the necessary packages
from __future__ import print_function
import cv2
from Tkinter import *
import wave as wav
import numpy as np
from matplotlib import pyplot as plt


def read_wav_data(file_path):
    f=wav.open(file_path,"rb")
    params=f.getparams()
    nchannels, sampwidth, framerate, nframes = params[:4]
    str_data = f.readframes(nframes)
    f.close()
    wav_data = np.fromstring(str_data, dtype=np.short)
    wav_data.shape = -1, 2
    wav_data = wav_data.T
    time = np.arange(0, nframes) * (1.0 / framerate)
    return wav_data,time

def transform_data(data):
    l=data.shape[0]
    figure=np.random.randint(0,5,[250,320])
    l=int(round(l/320))
    if l>250:
        l=250

    for i in range(0,l):
            figure[i,:]=data[i*320:(i+1)*320:1]

    plt.imshow(figure)

def main():
    path="/Users/flora/Documents/CMU/CLASSES/15637Web/Team330/src/media/music/2017-12-02T19_55_28.929Z.wav"
    wav_data,time=read_wav_data(path)
    size=wav_data.shape[1]
    length=int(round(size/3,0))
    left_data=wav_data[0]
    right_data=wav_data[1]
    l1=left_data[0:length-1:1]
    l2=left_data[length:2*length-1:1]
    l3=left_data[length*2::1]
    r1 = right_data[0:length - 1:1]
    r2 = right_data[length:2 * length - 1:1]
    r3 = right_data[length * 2::1]
    transform_data(l1)

    # load the image and convert it to grayscale
    image = cv2.imread("carton.jpg")
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    cv2.imshow("Original", image)

    # initialize the AKAZE descriptor, then detect keypoints and extract
    # local invariant descriptors from the image
    detector = cv2.AKAZE_create()
    (kps, descs) = detector.detectAndCompute(gray, None)
    print("keypoints: {}, descriptors: {}".format(len(kps), descs.shape))

    # draw the keypoints and show the output image
    cv2.drawKeypoints(image, kps, image, (0, 255, 0))
    cv2.imshow("Output", image)
    cv2.waitKey(0)

if __name__ == "__main__":
    main()
