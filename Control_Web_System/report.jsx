// 신고 확인 페이지 구성

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, useTheme, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";
import { ClipLoader } from 'react-spinners';

const EmergencyLocation = () => {
  const [closestRoads, setClosestRoads] = useState([]);
  const [closestRoadsData, setClosestRoadsData] = useState([]); 


  useEffect(() => {
    setClosestRoads(closestRoadsData); // 검색된 closestRoadsData로 closestRoads 설정
  }, [closestRoadsData]);

  // 전화 아이콘 클릭 처리
  const handlePhoneClick = (closestRoad) => {
    const phoneNumber = closestRoad.phone_number || '번호 없음';
    window.open(`tel:${phoneNumber}`);
  };
  
  // 이메일 아이콘 클릭 처리
  const handleEmailClick = (closestRoad) => {
    const email = closestRoad.mail || '이메일 없음';
    const fixedMessage = `${date_Time} \n${closestRoad.address}에서 위급상황이 인식 되었습니다. \n${closestRoad.police_office}에 주변 순찰을 요청합니다.`;
    window.open(`mailto:${email}?subject=Subject&body=${encodeURIComponent(fixedMessage)}`)
  };

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [data, setData] = useState([]);
  const [isAccordionClose, setIsAccordionClose] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const [apiLatitude, setApiLatitude] = useState(null);
  const [apiLongitude, setApiLongitude] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [date_Time, setDateInfo] = useState("[관제 시스템 발송]");
  const [selectedReportId, setSelectedReportId] = useState(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // '/api/customers'에서 고객 데이터를 가져와서 상태를 업데이트
    fetch('/api/customers')
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false); // 데이터 가져오기 완료 후 로딩 상태 변경
      })
      .catch((error) => {
        console.error(error);
        setLoading(false); // 에러 발생 시 로딩 상태 변경
      });
  }, []);



  useEffect(() => {
    // '/api/report'에서 신고 데이터를 가져와서 상태를 설정
    fetch('/api/report')
      .then((response) => response.json())
      .then((data) => {
        // 'lat'와 'lon'이 각 객체 내에 직접 키로 있는 것으로 가정합니다.
        console.log('API report 데이터:', data);
  
       // 'lat'와 'lon'이 각 객체 내에 직접 키로 있는 것으로 가정
        const latitude = data.map(item => item.lat);
        const longitude = data.map(item => item.lon);
  
        // 'lat'과 'lon'을 올바르게 가져왔는지 확인
        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);
  
        // 가져온 값을 이용해 'apiLatitude'와 'apiLongitude'를 설정
        setApiLatitude(latitude[0]);
        setApiLongitude(longitude[0]);
  
        // 'data'가 신고 정보의 배열을 포함한다고 가정
        setReportData(data); // 'reportData'를 배열로 설정
      })
      .catch((error) => console.error(error));
  }, []);

// 가장 가까운 위치를 찾는 함수
  const findClosestLocation = (targetLat, targetLon, customersData) => {
    let closestLocation = null;
    let minDistance = Number.MAX_VALUE;
  
    customersData.forEach(customer => {
      const lat = parseFloat(customer.latitude);
      const lon = parseFloat(customer.longitude);
  
      if (!isNaN(lat) && !isNaN(lon)) {
        const latDiff = lat - targetLat;
        const lonDiff = lon - targetLon;
        const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
  
        if (distance < minDistance) {
          minDistance = distance;
          closestLocation = customer;
        }
      }
    });
  
    return closestLocation;
  };
  
  useEffect(() => {
  // 'data', 'reportData', 'apiLatitude', 'apiLongitude'의 변경 시 실행
  // 모든 값이 존재할 때 가장 가까운 위치를 찾고 'closestRoads' 상태를 설정
    if (data.length > 0 && reportData.length > 0 && apiLatitude !== null && apiLongitude !== null) {
      const closestLocations = reportData.map(report => {
        const closestLocation = findClosestLocation(report.lat, report.lon, data);
        return closestLocation;
      });
      setClosestRoads(closestLocations);
      console.log('가장 가까운 위치들:', closestLocations);
    }
  }, [data, reportData, apiLatitude, apiLongitude]);



  const handleConfirmation = (reportId) => {
    setSelectedReportId(reportId); // 선택된 신고 ID 설정
    setIsConfirmationModalOpen(true); // 확인 모달 열기
  };

  const handleConfirmationClose = () => {
    setIsConfirmationModalOpen(false);  // 확인 모달 닫기
  };

  const handleConfirmationSubmit = (reportId) => {
    setIsRefreshing(true); // 새로고침 전 로더 보이기
  
    fetch(`/api/report/${reportId}`, {
      method: 'PUT',
    })
      .then((response) => {
        if (response.status === 200) {
          alert('신고를 확인했습니다.');
          setIsConfirmationModalOpen(false); // 확인 모달 닫기

  
          // 'reportData'의 'checkYN' 값을 Y로 업데이트
          const updatedReportData = reportData.map(report => {
            if (report.id === reportId) {
              return { ...report, checkYN: 'Y' };
            }
            return report;
          });
  
          setReportData(updatedReportData); // 'reportData' 상태 업데이트
  
          // 일정 시간이 지난 후 새로고침 상태를 false로 변경 (본 프로젝트에서는 자정으로 설정)
          setTimeout(() => {
            setIsRefreshing(false);
          }, 2000); // 실제 로직으로 변경
        } else {
          throw new Error('Failed to update report');
        }
      })
      .catch((error) => {
        console.error(error);
        setIsRefreshing(false); // Hide the loader in case of an error
      });
  };

  useEffect(() => {
    // 'api/report'에서 데이터를 가져와 'reportData' 상태를 설정
    fetch('/api/report')
      .then((response) => response.json())
      .then((data) => {
      // 'data'가 신고 정보의 배열을 포함한다고 가정
      // 'date_Time'을 기준으로 데이터를 내림차순으로 정렬
        data.sort((a, b) => new Date(b.date_Time) - new Date(a.date_Time));
        setReportData(data);
      })
      .catch((error) => console.error(error));
  }, []);

  // 현재 날짜를 가져와서 'today' 변수에 할당
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
    <Box m="20px" marginTop="300px">
      <Typography variant="h3" textAlign="center" mt={5}>
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
        <Accordion key={index} defaultExpanded={isAccordionClose}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" justifyContent="space-between" sx={{ width: "100%" }}>
                <Typography color={colors.greenAccent[700]} variant="h3" padding="10px" fontWeight="bold">
                  {`${emergency.date_Time} 위급상황 발생 ${emergency.lat}, ${emergency.lon}`}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box display="flex" justifyContent="space-between">
                <Typography fontSize="20px" padding="10px" sx={{color: colors.grey[100]}}>
                  {`근처 도로: ${closestRoads[index]?.address || '데이터 없음'} | 가장 가까운 경찰서: ${closestRoads[index]?.police_office || '데이터 없음'}`}
                </Typography>
                <Box>
                  {/* Button Components */}
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: colors.greenAccent[700], color: 'black', margin: "0px 5px", padding:"5px 20px", fontSize: "18px", fontWeight: "bold" }} 
                    onClick={() => handlePhoneClick(closestRoads[index])}>
                    전화 걸기
                  </Button>
                  <Button 
                    variant="contained"
                    sx={{ backgroundColor: colors.greenAccent[700], color: 'black', margin: "0px 5px", padding:"5px 20px", fontSize: "18px", fontWeight: "bold" }}
                    onClick={() => handleEmailClick(closestRoads[index])}>
                    메일 보내기
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleConfirmation(emergency.id)}
                    sx={{ backgroundColor: colors.redAccent[500], color: colors.grey[100], margin: "10px 35px", padding: "5px 20px", fontSize: "18px", fontWeight: "bold" }}
                  >
                    신고 확인
                  </Button>
                </Box>
              </Box>
            </AccordionDetails>
        </Accordion>
      ));

    emergencyReports = todayEmergencyReports; // 변수에 할당
  }


  return (
    <Box m="20px">
      <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
      {loading ? (
      <div className='container' style={{ margin: "150px" }}>
        <ClipLoader 
          color="aqua"
          loading={loading}
          size={150}
        />
      </div>
    ) : (
      emergencyReports // 필터링된 긴급 보고서 렌더링
      )}
    </div>

      <Dialog open={isConfirmationModalOpen} onClose={handleConfirmationClose} sx={{ fontSize: "16px", color: colors.grey[100] }}>
        <DialogTitle sx={{ fontSize: "28px" }}>위급상황 확인</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "20px" }}>해당 데이터를 신고 완료 하겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmationSubmit(selectedReportId)} sx={{ background: "white", fontWeight: "bold", fontSize: "16px" }}>확인</Button>
          <Button onClick={handleConfirmationClose} sx={{ background: "grey", fontWeight: "bold", fontSize: "16px" }}>취소</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default EmergencyLocation; 