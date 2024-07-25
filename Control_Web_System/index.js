//관제 대시보드 렌더링 지정

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// ReactDOM.createRoot를 사용하여 루트 요소를 생성하고, 해당 요소에 App 컴포넌트를 렌더링
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
{/* BrowserRouter를 사용하여 앱을 브라우저 라우터로 감쌈 */}
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </React.StrictMode>
);
