import cv2
import numpy as np
import random
import os
w=80
h=62
def get_file_name(path):
    filenames = os.listdir(path)
    path_filenames = []
    filename_list = []
    for file in filenames:
        if not file.startswith('.'):
            path_filenames.append(os.path.join(path, file))
            filename_list.append(file)
    return path_filenames

def knn_detect(files, data):
    distance=[]
    sift = cv2.xfeatures2d.SIFT_create()
    for file in files:
        img=cv2.imread(file,cv2.IMREAD_GRAYSCALE)
        img=cv2.resize(img,(w,h), interpolation=cv2.INTER_CUBIC)
        #plt.imshow(img), plt.show()
        dist = np.linalg.norm(np.ndarray.flatten(img) - np.ndarray.flatten(data))
        distance.append(dist)

    k=20
    ind = np.argpartition(distance, k)[:k]
    #index = distance.index(min(distance))
    return files[ind[random.randint(0,len(ind)-1)]]


def main(data):
    path_filenames = get_file_name("/Users/flora/Documents/CMU/CLASSES/15637Web/Data/Data/")
    file=knn_detect(path_filenames, data)
    return file

if __name__ == "__main__":
    main()