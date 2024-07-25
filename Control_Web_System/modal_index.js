//신고 알림 팝업 코드

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useTheme } from "@mui/system";
import { tokens } from "../../theme";

const EmergencyModal = () => {
  // React Router의 네비게이션 함수 가져오기
  const navigate = useNavigate();
  // 모달 열기/닫기 상태 관리
  const [open, setOpen] = useState(false);

  // MUI 테마 및 색상 토큰 가져오기
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

   // 모달 닫기 함수
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    let previousCount = null; // 이전 레코드 수를 저장할 변수 초기화

    const checkForNewRecords = async () => {
      try {
        const response = await fetch('/api/report');
        const data = await response.json();
        const currentCount = data.length;

        // 이전 레코드 수와 현재 레코드 수 비교하여 새로운 레코드가 있는지 확인
        if (previousCount !== null && currentCount > previousCount) {
          setOpen(true);  // 새로운 레코드가 있으면 모달 열기
        } else {
          console.log('새로운 레코드 없음.');   // 새로운 레코드가 없을 경우 로그 출력
        }

        previousCount = currentCount;  // 이전 레코드 수 갱신
      } catch (error) {
        console.error('데이터를 불러오는 중 오류 발생:', error);  // 데이터 불러오는 중 오류 발생 시 에러 출력
      }
    };

    const interval = setInterval(checkForNewRecords, 10000);  // 10초마다 새로운 레코드 확인

    // 컴포넌트가 마운트된 후에 주기적으로 데이터를 확인하도록 변경
    checkForNewRecords();

    return () => clearInterval(interval);   // 컴포넌트가 언마운트될 때 interval 해제
  }, []);


  // 신고 페이지로 이동하는 함수
  const handleMoveToFAQ = () => {
    console.log('Moving to /faq'); // 콘솔에 이동 로그 출력
    navigate('/faq');  // 신고 페이지로 이동
    setOpen(false);  // 모달 닫기
  };

  return (
    // 위급 상황을 알리는 모달 창
    <Dialog open={open} onClose={handleClose} style={{ fontSize: '16px', color: colors.grey[100] }}>
      <DialogTitle style={{ fontSize: '24px', textAlign: 'center' }}>
        위급 상황 안내
      </DialogTitle>
      <DialogContent style={{ fontSize: '18px', textAlign: 'center' }}>
        <p>위급 상황이 발생했습니다.</p>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'center' }}>
        {/* 신고 페이지로 이동하는 버튼 */}
        <Button
          onClick={handleMoveToFAQ}
          style={{
            backgroundColor: colors.redAccent[500],
            color: 'white',
            fontSize: '18px',
          }}
        >
          이동
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmergencyModal;
