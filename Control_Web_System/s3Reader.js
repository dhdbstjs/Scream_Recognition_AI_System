// S3 버킷과 DB 연동과 인공지능 모델 동작 및 결과 저장 코드

const express = require('express');
const AWS = require('aws-sdk');
const fs = require('fs');
const { execFile } = require('child_process');
const mysql = require('mysql');

const app = express();
let isProcessing = false;

// AWS SDK 설정
// aws_key.json 파일에서 AWS 액세스 키 정보 읽어오기
const data = fs.readFileSync('./aws_key.json');
const conf = JSON.parse(data);
const config = {
  aws_reg: 'us-east-1',
  aws_key: conf.accessKeyId,
  aws_sec: conf.secretAccessKey,
};


// S3 클라이언트 생성
const s3 = new AWS.S3({
  accessKeyId: config.aws_key,
  secretAccessKey: config.aws_sec,
  region: config.aws_reg,
});

// 파일 및 데이터베이스 경로 설정
const filePath = './temp/record.wav';
const dataDB = fs.readFileSync('./database.json');
const confDB = JSON.parse(dataDB);

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: confDB.host,
  user: confDB.user,
  password: confDB.password,
  port: confDB.port,
  database: confDB.database,
});


// MySQL 연결 확인
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

// 주기적으로 S3 버킷 확인 함수
const checkS3BucketPeriodically = async () => {
  if (isProcessing) {
    console.log('결과를 기다립니다. Waiting...');
    return;
  }

  isProcessing = true;

  // S3 버킷에서 WAV 파일 및 TXT 파일 확인
  const wavParams = {
    Bucket: 'chuldongedact',
    Key: 'record.wav',
  };

  const txtParams = {
    Bucket: 'chuldongedact',
    Key: 's3://chuldongedact/processing/results/result.txt',
  };

  try {
    // WAV 파일 다운로드 및 Python 파일 실행
    const wavData = await s3.getObject(wavParams).promise();
    fs.writeFileSync(filePath, wavData.Body, 'binary');

    // Python 실행 후 처리 로직
    execFile('python', ['test.py'], { encoding: 'utf-8' }, async (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        console.error('Error occurred while executing the Python file.');
        isProcessing = false;
        return;
      }

      // 파이썬 파일 실행 결과 출력
      console.log(stdout);
      console.log('Python file executed successfully.');


      // s3 버킷의 txt 파일 읽어오기
      let txtData;
      while (true) {
        try {
          txtData = await s3.getObject(txtParams).promise();
          break;
        } catch (err) {
          if (err.code !== 'NoSuchKey') {
            console.error(err);
          }
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }

      // 글씨 깨짐 방지
      fs.writeFileSync('./temp/result.txt', txtData.Body, 'utf-8');
      const txtContent = fs.readFileSync('./temp/result.txt', 'utf-8');

      // txt 파일의 내용 출력
      console.log(txtContent);


      // 파이썬 결과가 '위급상황입니다.' 또는 txt 파일에 'True'가 포함되어 있을 경우 DB에 추가
      if (stdout.includes('위급상황입니다.') || txtContent.includes('True')) {
        // 현재 날짜와 시간을 계산해서 추가
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

        const insertQuery = `INSERT INTO REPORT_INFO (result, date_Time, lat, lon, checkYN) VALUES ('위급상황', '${formattedDate}', '37.5584642', '127.0491664', 'N')`;

        connection.query(insertQuery, (err, result) => {
          if (err) {
            console.error('Error saving to database:', err);
          } else {
            console.log('DB에 저장되었습니다.');
            // DB에 저장한 후 S3버킷과 로컬에 있는 레코드 파일과 txt 파일 삭제
            deleteAudioFile(filePath);
            deleteLocalTxtFile('./temp/result.txt');
            deleteS3Object(wavParams);
            deleteS3Object(txtParams);
          }
        });
      } else {
        // 환경소음이라 판단할 경우에도 S3버킷과 로컬에 있는 레코드 파일과 txt 파일 삭제
        console.log('No emergency situation detected');
        deleteAudioFile(filePath);
        deleteLocalTxtFile('./temp/result.txt');
        deleteS3Object(wavParams);
        deleteS3Object(txtParams);
      }

      isProcessing = false; // 처리 완료
    });
  } catch (err) {
    if (err.code === 'NoSuchKey') {
      console.error('WAV File does not exist in the S3 bucket.');
    } else {
      console.error(err);
    }
    isProcessing = false;
    return;
  }
};


// wav 파일 삭제
function deleteAudioFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
    } else {
      console.log('Audio file deleted');
    }
  });
}

// txt 파일 삭제
function deleteLocalTxtFile(filePath) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting local text file:', err);
      } else {
        console.log('Local text file deleted');
      }
    });
  }

  function deleteS3Object(s3Params) {
    s3.deleteObject(s3Params, (err, data) => {
      if (err) {
        console.error('Error deleting object from S3:', err);
      } else {
        console.log('File deleted from S3 bucket');
      }
    });
  }

setInterval(checkS3BucketPeriodically, 10000);

// 주소 설정
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
