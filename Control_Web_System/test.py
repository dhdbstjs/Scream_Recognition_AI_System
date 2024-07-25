# 음향 모델 동작 코드

import librosa
import numpy as np
import tensorflow as tf
from keras.models import load_model
from tensorflow.keras.optimizers import Adam
import sys


sys.stdout.reconfigure(encoding='utf-8')

# GPU 사용 비활성화
tf.config.set_visible_devices([], 'GPU')

# 모델 불러오기
loaded_model = load_model('C:\\model.h5', compile=False)
loaded_model.compile(loss='categorical_crossentropy', metrics=['accuracy'], optimizer=Adam())


# 음성 파일 불러오기 및 MFCC 특성 추출
def load_and_preprocess_audio(audio_file_path):
    audio_data, sr = librosa.load(audio_file_path, sr=None)
    mfccs = librosa.feature.mfcc(y=audio_data, sr=sr, n_mfcc=13, n_fft=512, hop_length=256)
    
    target_shape = (13, 136)
    if mfccs.shape[1] < target_shape[1]:
        pad_width = target_shape[1] - mfccs.shape[1]
        mfccs = np.pad(mfccs, pad_width=((0, 0), (0, pad_width)))

    if mfccs.shape[1] > target_shape[1]:
        mfccs = mfccs[:, :target_shape[1]]

    mfccs = np.expand_dims(mfccs, axis=-1)
    return mfccs

# 새로운 음성 파일 예측
def predict_audio(audio_file_path, model):
    preprocessed_audio = load_and_preprocess_audio(audio_file_path)
    preprocessed_audio = np.expand_dims(preprocessed_audio, axis=0)
    prediction = model.predict(preprocessed_audio)
    predicted_class = np.argmax(prediction)

    if predicted_class == 0:
        print("위급상황입니다.")
    else:
        print("환경소음입니다.")
        
# 새로운 음성 파일을 분류
audio_file_path = './temp/record.wav'  # 저장할 음성 파일 경로로 대체
predict_audio(audio_file_path, loaded_model)
