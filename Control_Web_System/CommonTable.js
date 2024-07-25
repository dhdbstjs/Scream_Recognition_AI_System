// 신고 기록 게시판 페이지 구성 컴포넌트 Table

import React from 'react';
import './CommonTable.css';
import { Box, useTheme } from '@mui/system';
import { tokens } from '../../theme';

const CommonTable = props => {
  // props에서 headersName 및 children 추출
  const { headersName, children } = props;
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <div className='table-post'>
      {/* 테이블 컨테이너 */}
      <Box m="0px 20px 20px 20px" height="50vh" sx={{}}>
        {/* 테이블 헤더 */}
        <Box height="50vh" sx={{
          textAlign: "center",
          fontSize: "24px",
          borderSpacing: "0",
          backgroundColor: colors.primary[400],
        }}>
          {/* 실제 테이블 */}
          <table className="common-table" style={{ margin: 'auto', width: '100%' }}>
            <thead>
              <tr>
                {/* 헤더 렌더링 */}
                {headersName.map((item, index) => (
                  <th
                    className="common-table-header-column"
                    key={index}
                    style={{
                      backgroundColor: colors.blueAccent[700],
                      color: colors.grey[100],
                      borderBottom: '0.2px solid #e6e6e6',
                      padding: '5px',
                      fontSize: '22px',
                      fontWeight: 'bold',
                    }}
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            {/* 테이블 본문 */}
            <tbody>{children}</tbody>
          </table>
        </Box>
      </Box>
    </div>
  );
};

export default CommonTable;