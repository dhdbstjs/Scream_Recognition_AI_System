# 라즈베리파이로 소리 녹음하는 코드 & 해당 wav 파일 AWS로 업로드 하는 코드

# 필요한 모듈 설치
import os
import subprocess
import boto3

# 같은 이름으로 계속 업로드되므로 기존 경로의 같은 이름의 파일 삭제
if os.path.exists("record.wav"):
    os.remove("record.wav")


# 라즈베리파이 마이크 녹음 명령 실행
command = "arecord -D 'plughw:3,0' -f S16_LE -r 16000 -d 3 -t wav record.wav"
subprocess.run(command, shell=True)


# AWS S3 버킷으로 업로드
ACCESS_KEY = '실제 액세스 키 입력'
SECRET_KEY = '실제 시크릿 키 입력'
REGION_NAME = '실제 리전 네임 입력'

s3 = boto3.client('s3', aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY, region_name=REGION_NAME)

local_file_path = 'record.wav'

bucket_name = '실제 버킷 이름 입력'
s3_file_path = 'record.wav'

with open(local_file_path, "rb") as f:
    s3.upload_fileobj(f, bucket_name, s3_file_path)

#업로드 완료 후 알림 메세지    
print(f"{local_file_path} 파일이 {bucket_name}/{s3_file_path} 경로에 업로드되었습니다.")
