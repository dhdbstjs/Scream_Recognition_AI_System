// 경찰관서 목록 데이터 추가 코드

import React, { useState } from "react";
import axios from 'axios';
import { Dialog, DialogActions, DialogTitle, DialogContent, TextField, Button } from '@mui/material';
import { useTheme } from "@mui/system";
import { tokens } from "../../theme";
import { theme, colors } from "../../theme"; // theme 파일 경로에 맞게 수정
import Header from "../../components/Header";

const CustomerAdd = (props) => {
  // 상태값 설정
  const [state, setState] = useState({
    police_office: '',
    address: '',
    phone_number: '',
    mail: '',
    open: false
  });

  // 폼 제출 핸들러 함수
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // 사용자가 입력한 데이터를 서버에 추가하고, 상위 컴포넌트에서 데이터를 업데이트
    addCustomer()
      .then((response) => {
        console.log(response.data);
        props.stateRefresh();
      });
    // 입력된 데이터 초기화 및 다이얼로그 닫기
    setState({
      police_office: '',
      address: '',
      phone_number: '',
      mail: '',
      open: false
    });
  }

  // 입력 필드 값 변경 핸들러 함수
  const handleValueChange = (e) => {
    const { name, value } = e.target;
    setState(prevState => ({
      ...prevState,
      [name]: value
    }));
  }
 // 사용자 정보를 서버에 추가하는 함수
  const addCustomer = () => {
    const url = '/api/customers';
    const formData = new FormData();
    formData.append('police_office', state.police_office);
    formData.append('address', state.address);
    formData.append('phone_number', state.phone_number);
    formData.append('mail', state.mail);
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    };
    return axios.post(url, formData, config);
  }

  // 다이얼로그 열기 핸들러 함수
  const handleOpen = () => {
    setState(prevState => ({
      ...prevState,
      open: true
    }));
  }
  
  // 다이얼로그 닫기 핸들러 함수 및 입력된 데이터 초기화
  const handleClose = () => {
    setState(prevState => ({
      ...prevState,
      police_office: '',
      address: '',
      phone_number: '',
      mail: '',
      open: false
    }));
  }

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Header title="경찰청_경찰관서 위치 주소 현황" subtitle="경찰서, 관서명, 지구대,파출소 등의 주소 정보를 제공하고 있으며, 추가 및 삭제 기능으로 관리가 가능합니다. " />
      <Button variant="contained" sx={{ backgroundColor: colors.blueAccent[700], color: theme.palette.common.white, margin: 1.5, padding: 2, fontSize: 14, fontWeight: "bold" }} onClick={handleOpen}>
        경찰 데이터 추가하기
      </Button>
      <Dialog open={state.open} onClose={handleClose}>
        <DialogTitle>목록 추가</DialogTitle>
        <DialogContent>
          <TextField type="text" label="경찰서" name="police_office" value={state.police_office} onChange={handleValueChange} /><br />
          <TextField type="text" label="주소" name="address" value={state.address} onChange={handleValueChange} /><br />
          <TextField type="text" label="전화번호" name="phone_number" value={state.phone_number} onChange={handleValueChange} /><br />
          <TextField type="text" label="메일주소" name="mail" value={state.mail} onChange={handleValueChange} /><br />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleFormSubmit}>추가</Button>
          <Button variant="outlined" sx={{ backgroundColor: theme.palette.common.white, color: colors.primary.main }} onClick={handleClose}>닫기</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CustomerAdd;
