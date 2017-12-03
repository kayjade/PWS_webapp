
# import the necessary packages
from __future__ import print_function
import cv2
from Tkinter import *
import wave as wav
import numpy as np
import math
import random
import os, codecs
from sklearn.cluster import KMeans
from matplotlib import pyplot as plt
import joblib
from PIL import Image
from scipy import misc
import knntrain

w=80
h=62
###Read and transform wav data###
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

def transform_classify(data):
    data=np.asarray(data)
    data=np.ndarray.flatten(data)
    figure=np.zeros([h,w])
    figure=np.add(figure,127)
    l=len(data)
    l=int(round(l/w))
    if l>h:
        l=h

    for i in range(0,l):
            figure[i]=data[i*w:(i+1)*w:1]
    figure=figure.astype(int)
    return knntrain.main(figure)

def classify(data):
    data=data.astype(int)
    data = norm_range(data,min(data)[0],max(data)[0],0,255)
    length = w * h
    d1=data[0:length-1:1]
    d2=data[length:2*length-1:1]
    d3=data[length*2::1]
    p1=transform_classify(d1)
    p2=transform_classify(d2)
    p3=transform_classify(d3)
    img1=cv2.imread(p1)
    img2=cv2.imread(p2)
    img3=cv2.imread(p3)
    merge=np.hstack((img1,img2,img3))
    return merge

def norm_range(data,lmin,lmax,rmin,rmax):
    scale=float(rmax-rmin)/float(lmax-lmin)
    data=data*scale
    data=data+(rmax-rmin)/2
    data=data.astype(int)
    return data

def systematic_sampling(dataMat, num):
    k = int(len(dataMat)/num)
    samples = [random.sample(dataMat[i*k:(i+1)*k], 1) for i in range(num)]
    return np.array(samples)

def main(path="/Users/flora/Documents/CMU/CLASSES/15637Web/Team330/src/media/tmp/2017-12-03T20_42_07.117Z.wav"):
    wav_data,time=read_wav_data(path)

    left_data=wav_data[0]
    left_data=systematic_sampling(left_data,3*w * h)

    right_data=wav_data[1]
    right_data=systematic_sampling(right_data,3*w * h)
    p1=classify(left_data)
    p2=classify(right_data)
    vmerge = np.vstack((p1, p2))
    plt.imshow(vmerge), plt.show()
    p='../../../../media/mode2/'+path.split('.',1)[0]+'png'
    misc.toimage(vmerge, cmin=0, cmax=255).save(p)

if __name__ == "__main__":
    main()

