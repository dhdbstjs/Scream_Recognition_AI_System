// 메인 페이지에 수신될 오늘 신고 정보

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, useTheme, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";
import { ClipLoader } from 'react-spinners';

const HourlyData = () => {
  const [closestRoads, setClosestRoads] = useState([]);
  const [closestRoadsData, setClosestRoadsData] = useState([]); 

  // ... 기존의 useEffect 블록을 통해 데이터를 가져오고 처리하는 코드

  // closestRoadsData가 변할 때마다 closestRoads를 업데이트하는 useEffect
  useEffect(() => {
    setClosestRoads(closestRoadsData); // 가져온 closestRoadsData로 closestRoads 업데이트
  }, [closestRoadsData]);



  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [data, setData] = useState([]);
  const [isAccordionClose, setIsAccordionClose] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const [apiLatitude, setApiLatitude] = useState(null);
  const [apiLongitude, setApiLongitude] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);


  // 경찰서 목록 api 호출
  useEffect(() => {
    fetch('/api/customers')
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false); 
      })
      .catch((error) => {
        console.error(error);
        setLoading(false); 
      });
  }, []);


// 신고 정보 및 위치 데이터 가져오기
  useEffect(() => {
     // '/api/report' 엔드포인트에서 신고 정보를 가져옴
    fetch('/api/report')
      .then((response) => response.json())
      .then((data) => {
  
        // 'lat'와 'lon'이라는 키가 데이터 내에 있는 가정하에
        const latitude = data.map(item => item.lat); // 위도 정보 추출
        const longitude = data.map(item => item.lon); // 경도 정보 추출
  
        // 가장 첫 번째 위치 정보를 apiLatitude와 apiLongitude에 설정
        setApiLatitude(latitude[0]);
        setApiLongitude(longitude[0]);
  
        // 'data'가 배열 형태로 존재한다는 가정 하에 reportData state에 저장
        setReportData(data); 
      })
      .catch((error) => console.error(error));
  }, []);

// 확인 작업 후 상태 업데이트
  const handleConfirmationSubmit = (reportId) => {
    setIsRefreshing(true); // 새로고침 전 로더 표시
  
    // '/api/report/:reportId' 엔드포인트로 PUT 요청을 보냄
    fetch(`/api/report/${reportId}`, {
      method: 'PUT',
    })
      .then((response) => {
        if (response.status === 200) {
          alert('신고를 확인했습니다.');  // 확인 완료 시 알림창 표시
          setIsConfirmationModalOpen(false);
  
          // reportData에서 해당하는 신고의 'checkYN' 값을 'Y'로 변경
          const updatedReportData = reportData.map(report => {
            if (report.id === reportId) {
              return { ...report, checkYN: 'Y' };
            }
            return report;
          });
  
          setReportData(updatedReportData); // reportData 업데이트
  
          // 2초 후 새로고침 상태를 false로 설정 (실제 로직으로 대체 필요)
          setTimeout(() => {
            setIsRefreshing(false);
          }, 2000); // Replace this with actual logic
        } else {
          throw new Error('Failed to update report');
        }
      })
      .catch((error) => {
        console.error(error);
        setIsRefreshing(false); // 오류 발생 시 로더 감춤
      });
  };

  // 신고 정보를 시간 기준으로 정렬하여 reportData 업데이트
  useEffect(() => {
    // '/api/report' 엔드포인트에서 데이터 가져오기
    fetch('/api/report')
      .then((response) => response.json())
      .then((data) => {
        // 'data'가 배열 형태로 존재한다는 가정 하에 시간 기준으로 내림차순 정렬
        data.sort((a, b) => new Date(b.date_Time) - new Date(a.date_Time));
        setReportData(data);
      })
      .catch((error) => console.error(error));
  }, []);

  // 오늘 날짜의 문자열 생성
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  console.log('Today:', today);

  // 오늘 날짜의 모든 데이터가 'Y'인지 확인
  const allReportsChecked = reportData
    .filter((emergency) => emergency.date_Time.startsWith(today))
    .every((emergency) => emergency.checkYN === 'Y');

  // 모든 데이터가 'Y'인 경우, '들어온 정보가 없습니다' 표시
if (!loading && allReportsChecked) {
  return (
    <Box m="20px"  display="flex" justifyContent="center" alignItems="center" marginLeft="170px" marginTop="120px">
      <Typography  display="flex" variant="h3" textAlign="center" mt={5}>
        들어온 신고 데이터가 없습니다.
      </Typography>
    </Box>
  );
}

  let emergencyReports = null; // 필터링된 긴급 보고서를 담을 변수

  // 로딩 중일 때 로딩 스피너를 표시, 아닐 때 보고서를 표시
  if (!loading) {
    // 오늘 날짜의 긴급 보고서 필터링 및 매핑
    const todayEmergencyReports = reportData
    .filter((emergency) => {
      const emergencyDate = emergency.date_Time.split(' ')[0]; // Extract date part
      return emergencyDate === today && emergency.checkYN !== 'Y';
    })
      .map((emergency, index) => (
        <Box key={index} >
        <Box m="0px" >
              <Box display="flex" justifyContent="space-between" 
              sx={{ width: "100%" , 
                    margin: "0px"  , 
                    padding: "5px 12px",
                }}
              >
                <Box style={{  backgroundColor: 'rgba(70, 99, 133, 0.5)', padding: '15px 30px', border: `4px solid ${colors.primary[500]}` }}>
  <Typography color={colors.grey[100]} variant="h3" fontWeight="bold">
    {`${emergency.date_Time} 위급상황 발생 ${emergency.lat} | ${emergency.lon}`}
  </Typography>
</Box>
              </Box>
            </Box>
        </Box>
      ));

    emergencyReports = todayEmergencyReports; // 변수에 할당
  }


  // 로딩 중이면 로딩 스피너를, 그 외에는 필터링된 긴급 보고서를 렌더링
  return (
    <Box m="20px">
      <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
      {loading ? (
      <div className='container' style={{ margin: "150px" }}>
        <ClipLoader 
          color="aqua"
          loading={loading}
          size={150}
          marginLeft="170px" marginTop="120px"
        />
      </div>
    ) : (
      emergencyReports // 필터링된 긴급 보고서 렌더링
      )}
    </div>
    </Box>
  );
};

export default HourlyData; 
