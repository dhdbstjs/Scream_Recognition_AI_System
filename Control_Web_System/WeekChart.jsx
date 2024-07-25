// 차트 페이지 구성 지난 주 대비 신고량 차트

import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import React, { useState, useEffect } from 'react';

const WeekChart = ({ isCustomLineColors = false, isDashboard = false }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [weekData, setWeekData] = useState([]);

    const weekChartColors = {
      thisWeek: '#D169C7', // 이번 주 차트 색상을 파란색으로 설정
      lastWeek: '#00B9D6', // 지난 주 차트 색상을 빨간색으로 설정
    };

    const nivoColors = Object.values(weekChartColors); // 색상 값들만을 배열로 추출

    // nivo의 scheme로 변환된 색상 배열
    const nivoScheme = nivoColors.map(color => ({ color }));

  
    useEffect(() => {
      // API에서 데이터 가져오기
      fetch('/api/report')
        .then((response) => response.json())
        .then((data) => {
          // API 응답에 따라 데이터 가공
          const processedData = processDataFromAPI(data); // 실제 API에서 받은 데이터를 가공하는 함수
  
          setWeekData(processedData); // 가공된 데이터를 state에 설정
        })
        .catch((error) => console.error(error));
    }, []);
  
    // API에서 가져온 데이터를 처리하는 함수
    const processDataFromAPI = (data) => {
      // 현재 날짜를 가져옴
      const currentDate = new Date();
      // 이번 주의 시작일과 종료일 계산
      const startOfCurrentWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay());
      const endOfCurrentWeek = new Date(startOfCurrentWeek);
      endOfCurrentWeek.setDate(endOfCurrentWeek.getDate() + 6);
  
      // 지난 주의 시작일과 종료일 계산
      const startOfPreviousWeek = new Date(startOfCurrentWeek);
      startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);
      const endOfPreviousWeek = new Date(endOfCurrentWeek);
      endOfPreviousWeek.setDate(endOfPreviousWeek.getDate() - 7);
  
      // 이번 주와 지난 주의 데이터를 담을 배열 초기화
      const thisWeekData = Array(7).fill(0);
      const lastWeekData = Array(7).fill(0);
  
      // 데이터를 이용하여 이번 주와 지난 주의 카운트 계산
      data.forEach((item) => {
        const dateInfo = new Date(item.date_Time);
    
        if (dateInfo >= startOfCurrentWeek && dateInfo <= endOfCurrentWeek) {
            thisWeekData[dateInfo.getDay()] += 1;
        } else if (dateInfo >= startOfPreviousWeek && dateInfo <= endOfPreviousWeek) {
            lastWeekData[dateInfo.getDay()] += 1;
        }
    });
  
    // 이번 주와 지난 주의 데이터를 객체 배열로 반환
      return [
          { id: "thisWeek", color: tokens("dark").blueAccent[300], data: mapToWeekData(thisWeekData) },
          { id: "lastWeek", color: tokens("dark").greenAccent[500], data: mapToWeekData(lastWeekData) },
      ];
  };
  
  // 요일별 데이터를 객체 배열로 매핑하는 함수 (일주일의 시작을 일요일로 설정)
  const mapToWeekData = (weekData) => {
      return [
          { x: "Sun", y: weekData[0] },
          { x: "Mon", y: weekData[1] },
          { x: "Tue", y: weekData[2] },
          { x: "Wed", y: weekData[3] },
          { x: "Thu", y: weekData[4] },
          { x: "Fri", y: weekData[5] },
          { x: "Sat", y: weekData[6] },
      ];
  };


  return (
    <ResponsiveLine
      data={weekData}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            color: colors.primary[500],
          },
        },
      }}
      colors={isDashboard ? { datum: "color" } : nivoScheme.map(item => item.color)} // 수정된 부분
      lineWidth={3} // 원하는 두께로 설정
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "0",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        orient: "left",
        tickValues: 0, // added
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "count", // added
        legendOffset: -40,
        legendPosition: "middle",
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

export default WeekChart;
