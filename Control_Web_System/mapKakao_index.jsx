//안심지킴이집 페이지

import React, { useEffect, useState } from 'react';
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { Box, Button } from "@mui/material";
import { useTheme } from "@mui/system";
import Header from '../../components/Header';

const MapKaKao = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // 팝업 창 크기 및 위치 설정
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const popupWidth = 500;
  const popupHeight = 500;

  const left = (screenWidth - popupWidth) / 2;
  const top = (screenHeight - popupHeight) / 2;

  // 데이터 테이블 열 구성
  const columns = [
    { field: "store_name", headerName: "점포명", flex: 1 },
    { field: "map_name_address", headerName: "소재지 도로명주소", flex: 1.5 },
    { field: "number_address", headerName: "소재지 지번주소", flex: 1.5, cellClassName: "name-column-cell" },
    { field: "house_phone_num", headerName: "여성안심지킴이집 번호", flex: 1 },
    { field: "police_signature", headerName: "관할경찰서명", flex: 1 },
    {
      field: "view_on_map",
      headerName: "위치 보기",
      flex: 1,
      sortable: false,
      filterable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Button
          variant="contained"
          onClick={() => handleViewOnMapClick(params.row)}
        >
          지도 열기
        </Button>
      ),
    },
  ];

  const [data, setData] = useState([]);

  // 새로운 스크립트 로드 함수
  const new_script = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.addEventListener('load', () => {
        resolve();
      });
      script.addEventListener('error', (e) => {
        reject(e);
      });
      document.head.appendChild(script);
    });
  };

  // "지도 열기" 버튼 클릭 시 호출되는 함수
  const handleViewOnMapClick = (rowData) => {
    // 팝업 창 열기
    const mapPopup = window.open('', 'MapPopup', `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`);

    // HTML 페이지 생성
    const popupDocument = mapPopup.document;
    const popupBody = popupDocument.body;

    // 카카오 맵 API 호출을 위한 지도 컨테이너 생성
    const mapContainer = popupDocument.createElement('div');
    mapContainer.id = 'map-popup';
    mapContainer.className = 'map-popup';
    mapContainer.style.width = '100%';
    mapContainer.style.height = '100%';
    popupBody.appendChild(mapContainer);

    // 카카오 맵 API 호출
    new_script('https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=ffac9283b27e961ec1731b8e13ea1a39').then(() => {
      const kakao = window.kakao;

      // 팝업 내에서 카카오 맵 로드
      kakao.maps.load(() => {
        const options = {
          center: new kakao.maps.LatLng(rowData.latitude, rowData.hardness),
          level: 3,
        };
        const map = new kakao.maps.Map(mapContainer, options);

        // 마커 추가
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(rowData.latitude, rowData.hardness),
          map: map,
        });

        // 인포윈도우 추가
        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${rowData.store_name}</div>`,
        });
        infowindow.open(map, marker);
      });
    });
  };

  // 카카오 맵 스크립트 로드
  useEffect(() => {
    new_script('https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=ffac9283b27e961ec1731b8e13ea1a39').then(() => {
        const kakao = window.kakao;
  
        // 안심지킴이집 데이터 가져오기
        fetch('/api/safehouse')
          .then(response => response.json())
          .then(data => {
            setData(data);
  
            // 카카오 맵 로드 후 데이터 표시
            kakao.maps.load(() => {
              const mapContainer = document.getElementById('map');
              const options = {
                center: new kakao.maps.LatLng(37.5603507, 127.0490812), // 중심 위치
                level: 12, // 확대 수준
              };
              const map = new kakao.maps.Map(mapContainer, options);
  
              // 안심지킴이집 위치에 마커 표시
              data.forEach(location => {
                const markerPosition = new kakao.maps.LatLng(location.latitude, location.hardness);
                const marker = new kakao.maps.Marker({
                  position: markerPosition,
                });
                marker.setMap(map);
              });
            });
          })
          .catch(error => {
            console.error('Error fetching data from the server:', error);
          });
      });
    }, []);

  return (
    <div className='protectedScenes'>
      <Header title="여성안심지킴이집 위치" subtitle="24시간 운영 편의점을 대상으로 비상벨을 누르면 경찰이 출동해 보호하는 여성안심지킴이집 위치를 제공합니다. (데이터 제공: 공공 데이터 포털)" />
      <div className='protectedTop'>
        <div className='protectedTopLeft'>
          <Box 
            m="7px 0 0 0" 
            height="75vh" 
            sx={{
              width: "100%",
              "& .MuiDataGrid-root": {
                border: "none",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "none",
              },
              "& .MuiDataGrid-columnHeader": {
                color: colors.greenAccent[300],
                borderBottom: "none",
                fontSize: "16px",
                fontWeight: "bold"
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: colors.primary[400],
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "none",
              },
              "& .MuiDataGrid-virtaulScroller": {
                backgroundColor: colors.primary[400],
              },
              "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                color: `${colors.grey[100]} !important`,
              },
            }}
          >
            <DataGrid
              rows={data}
              columns={columns}
            />
          </Box>
        </div>
        {/* 팝업 창에 표시되는 지도 컨테이너 */}
        <div className="MapKaKao">
          <Box m="0px 10px 20px 20px" height="30vh" sx={{ marginTop: '29px', textAlign: "center"}}>
            <Box height="30vh">
              <div id="map" className="map" style={{ width: '650px', height: '750px' }} />
            </Box>
          </Box>
        </div>
        <div id="map-popup" className="map-popup" style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default MapKaKao;
