//관제 대시보드 구성 요소 설정 코드
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Police_office from "./scenes/policeOffice";
import Contacts from "./scenes/contacts";
import Invoices from "./scenes/invoices";
import Form from "./scenes/form";
import Calendar from "./scenes/calendar";
import FAQ from "./scenes/faq";
import Pie from "./scenes/pie";
import Line from "./scenes/line";
import Geography from "./scenes/geography";
import Protected from "./scenes/protected";
import Chart from "./scenes/chart";
import ProtectedScenes from "./scenes/protectedScenes";
import CCTVViewer from "./scenes/ccTVViewer";
import SafeReturnHome from "./scenes/safe_return_home";
import React from 'react';
import SafeReturnRoad from "./scenes/safeReturnRoad";
import BarChart from "./components/BarChart";
import MapKaKao from "./scenes/mapKakao";
import PostApp from "./PostApp";
import PostView from "./page/post/PostView";
import EmergencyModal from "./scenes/modal";
import AudioTest from "./scenes/audio";

function App() {
  // 테마 및 색상 모드 상태 가져오기
  const [theme, colorMode] = useMode();

  // 비상 모달 상태 및 함수 설정
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);


  // 스페이스 바 이벤트 감지 및 처리
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === ' ') {
        setEmergencyModalOpen(true);  // 스페이스 바를 누르면 모달 열기
      }
    };
    
    // 이벤트 리스너 추가
    window.addEventListener('keydown', handleKeyDown);

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
     // 컬러 모드 컨텍스트와 테마 설정
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar />
          <main className="content">
            <Topbar />

            {/* 경로 설정 */}
            
            <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/team" element={<Team />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/form" element={<Form />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/pie" element={<Pie />} />
            <Route path="/line" element={<Line />} />
            <Route path="/police_office" element={<Police_office />} />
            <Route path="/protected" element={<Protected />} />
            <Route path="/geography" element={<Geography />} />
            <Route path="/chart" element={<Chart />} />
            <Route path="/protectedScenes" element={<ProtectedScenes />} />
            <Route path="/cctv" element={<CCTVViewer /> }/>
            <Route path="/returnHome" element={<SafeReturnHome />} />
            <Route path="/returnRoad" element={<SafeReturnRoad />} />
            <Route path="/bar" element={<BarChart />} />
            <Route path="/mapkakao" element={<MapKaKao />} />
            <Route path="/post" element={<PostApp />} />
            <Route path="/post/:no" element={<PostView />} />
            <Route path="/audio" element={<AudioTest />} />
            

            </Routes>
            {/* 비상 모달 */}
            <EmergencyModal open={emergencyModalOpen} onClose={() => setEmergencyModalOpen(false)} />

          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;



[ DB 연결 및 관리 서버 코드 (react-admin/server.js)]
const AWS = require('aws-sdk');

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const { getS3Json } = require('./s3Reader'); // s3Reader 모듈 불러오기
const port = process.env.PORT || 5000;



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));


// Content Security Policy 설정
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' https://api.openweathermap.org");
    next();
});


// 로컬 파일에서 데이터베이스 정보 읽어오기
const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);
const mysql = require('mysql');



// 연결과 관련된 변수 설정(데이터베이스 설정)
const connection = mysql.createConnection({
    host: conf.host, 
    user: conf.user,
    password: conf.password,
    port: conf.port,
    database: conf.database
});

connection.connect();


// MySQL 연결 설정
const multer = require('multer');
const upload = multer({dest: './upload'})

// 관서 목록을 보여주는 api 제작
app.get('/api/customers', (req, res) => {
    connection.query(
        // POLICEINFO 테이블에서 isDeleted가 0인 데이터 조회
        "SELECT * FROM POLICEINFO WHERE isDeleted = 0",
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 안심귀갓길 DB TABLE
app.get('/api/saferoad', (req, res) => {
    connection.query(
        "SELECT * FROM SAFERETURN_ROAD",
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 여성안심지킴이집 DB TABLE
app.get('/api/safehouse', (req, res) => {
    connection.query(
        "SELECT * FROM SAFEGUARDING_HOUSE",
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// CCTV DB TABLE
app.get('/api/cctv', (req, res) => {
    connection.query(
        "SELECT * FROM CCTVINFO",
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 신고 DB TABLE
app.get('/api/report', (req, res) => {
    connection.query(
        "SELECT * FROM REPORT_INFO",
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 파이썬 신고 DB TABLE
app.get('/api/result', (req, res) => {
    connection.query(
        "SELECT * FROM REPORT_INFO",
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});


// 이미지 파일들을 제공하는 정적 파일 경로 설정
app.use('/image', express.static('./upload'));


// 고객 정보를 추가하는 API 엔드포인트
app.post('/api/customers', upload.single('image'), (req, res) => {
    // POLICEINFO 테이블에 새로운 데이터 추가
    let sql = "INSERT INTO POLICEINFO VALUES (null, ?, ?, ?, ?, ?, ?, now(), 0)";
    let police_office = req.body.police_office;
    let address = req.body.address;
    let phone_number = req.body.phone_number;
    let latitude = req.body.latitude;
    let hardness = req.body.hardness;
    let mail = req.body.mail;


    let params = [police_office, address, phone_number, latitude, hardness, mail];
    connection.query(sql, params,
        (err, rows, fields) => {
            res.send(rows);
        })
});


// 고객 정보를 삭제하는 API 엔드포인트
app.delete('/api/customers/:id', (req, res) => {
    // POLICEINFO 테이블에서 id에 해당하는 데이터 삭제
    let sql = "DELETE FROM POLICEINFO WHERE id = ?";
    let params = [req.params.id];
    connection.query(sql, params, (err, rows, fields) => {
        if (!err) {
            res.status(204).end(); // 성공적으로 삭제됨을 나타냄
        } else {
            res.status(500).send('Failed to delete the customer');
        }
    });
});


app.listen(port, () => console.log(`Listening on port ${port}`));



// 신고 정보를 업데이트하는 API 엔드포인트
app.put('/api/report/:id', (req, res) => {
    // REPORT_INFO 테이블에서 id에 해당하는 데이터의 checkYN 필드를 'Y'로 업데이트
    let sql = "UPDATE REPORT_INFO SET checkYN = 'Y' WHERE id = ?";
    let params = [req.params.id];
    connection.query(sql, params, (err, rows, fields) => {
        if (!err) {
            res.status(200).send('Report updated successfully');
        } else {
            res.status(500).send('Failed to update report');
        }
    });
});
