//도시 목록 버튼 코드

import React, {useState, useEffect} from 'react';
import { Button } from '@mui/material';
import { tokens } from "../../theme";
import { useTheme } from "@mui/system";

const WeatherBtn = ({ cities, setCity, updateWeather, cctvData }) => {
  // 페이지당 표시할 도시 수 및 현재 페이지 관리 상태 값
    const pageSize = 9;
    const [currentPage, setCurrentPage] = useState(1);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
  
    // 전체 페이지 수 및 현재 페이지에서 보여질 도시의 범위 계산
    const totalPages = Math.ceil(cities.length / pageSize);
    const start = (currentPage - 1) * pageSize;
    const end = currentPage * pageSize;
  
     // 현재 페이지에서 보여질 도시 목록 추출
    const visibleCities = cities.slice(start, end);
  
    // 다음 페이지로 이동하는 함수
    const handleNextPage = () => {
      setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };
  
    // 이전 페이지로 이동하는 함수
    const handlePreviousPage = () => {
      setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    
  // 버튼 UI 및 페이지 관리 부분
    return (
      <div>
        {/* 현재 페이지가 1보다 크면 이전 버튼 표시 */}
        {currentPage > 1 && (
          <Button variant="contained" onClick={handlePreviousPage} sx={{ padding: '0 15px', fontSize: '16px', marginBottom: '10px', background: colors.blueAccent[600] }}>
            Previous
          </Button>
        )}
  
        {/* 현재 페이지에 해당하는 도시 목록 표시 */}
        {visibleCities.map((item) => (
          <Button
            key={item}
            variant="contained"
            onClick={() => setCity(item)}
            sx={{ padding: '0 15px', fontSize: '16px', marginBottom: '10px', marginRight: '1px' }}
          >
            {item}
          </Button>
        ))}
  
        {/* 현재 페이지가 마지막 페이지가 아니면 다음 버튼 표시 */}
        {currentPage < totalPages && (
          <Button variant="contained" onClick={handleNextPage} sx={{ padding: '0 15px', fontSize: '16px', marginBottom: '10px', background: colors.blueAccent[600]}}>
            Next
          </Button>
        )}
      </div>
    );
};

export default WeatherBtn;
