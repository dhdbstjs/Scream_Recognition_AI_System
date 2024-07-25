// 경찰청 목록 데이터 삭제 코드

import React from 'react';
import { Dialog, DialogActions, DialogTitle, DialogContent, Button, Typography } from '@mui/material';
import { tokens, themeSettings } from "../../theme";

class CustomerDelete extends React.Component {
    constructor(props) {
        // 다이얼로그의 열림/닫힘 상태를 관리하는 상태값 초기화
        super(props);
        this.state = {
            open: false
        };
    }

    // 다이얼로그 열기 핸들러 함수
    handleClickOpen = () => {
        this.setState({
            open: true
        });
    }

    // 다이얼로그 닫기 핸들러 함수
    handleClose = () => {
        this.setState({
            open: false
        });
    }

    // 고객 정보 삭제 함수
    deleteCustomer(id) {
        const url = '/api/customers/' + id;
        fetch(url, {
            method: 'DELETE'
        })
        .then(() => {
            // 삭제 후 상위 컴포넌트에서 데이터를 업데이트하는 함수 호출
            this.props.stateRefresh();
        })
        .catch(error => {
            console.error('Error deleting customer:', error);
        });
    }

    render() {
        // 테마 모드에 따라 색상 정보 가져오기
        const colors = tokens(themeSettings('dark').palette.mode); // 'dark' 또는 'light' 모드를 선택할 수 있습니다.

        return (
            <div>
                <Button variant="contained" sx={{ backgroundColor: colors.redAccent[500], color: 'white' }} onClick={this.handleClickOpen}> 삭제</Button>
                <Dialog open={this.state.open} onClose={this.handleClose}>
                    <DialogTitle onClose={this.handleClose}>
                        삭제 경고
                    </DialogTitle>
                    <DialogContent>
                        <Typography gutterBottom>
                            선택한 정보가 삭제됩니다.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" color="primary" onClick={(e) => { this.deleteCustomer(this.props.id) }}>삭제</Button>
                        <Button variant="outlined" sx={{ backgroundColor: 'white', color: colors.blueAccent[800] }} onClick={this.handleClose}>닫기</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default CustomerDelete;
