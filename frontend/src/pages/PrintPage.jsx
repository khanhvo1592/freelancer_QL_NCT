import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

// Thêm CSS toàn trang để tối ưu việc in
const globalPrintStyles = `
  @media print {
    body {
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      height: 100%;
      overflow: hidden;
    }
    #root, #print-content {
      height: auto !important;
      overflow: visible !important;
    }
    .MuiAppBar-root, header, footer, nav, .no-print {
      display: none !important;
    }
  }
`;

const PrintPage = () => {
  const [printData, setPrintData] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);

  useEffect(() => {
    // Thêm CSS cho in ấn
    const style = document.createElement('style');
    style.innerHTML = globalPrintStyles;
    document.head.appendChild(style);

    // Đăng ký lắng nghe sự kiện từ main process
    if (window.electron && window.electron.onPrintData) {
      window.electron.onPrintData((data) => {
        console.log('Nhận dữ liệu in:', data);
        setPrintData(data);
        
        // Lấy ảnh base64 nếu có
        if (data.photoBase64) {
          setPhotoBase64(data.photoBase64);
        } else if (data.photoUrl) {
          console.log('Có URL ảnh nhưng không có dữ liệu base64');
        }
      });
    } else {
      console.error('Không có hàm lắng nghe dữ liệu in');
    }

    // Đánh dấu trang đã sẵn sàng in
    console.log('Trang in đã tải xong và sẵn sàng nhận dữ liệu');
    if (window.electron && window.electron.printReady) {
      window.electron.printReady();
    }

    // Clean up khi unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Format date để hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  if (!printData) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <Typography variant="h5">Đang chuẩn bị dữ liệu để in...</Typography>
        <Typography variant="body1">Trang này sẽ tự động in khi dữ liệu được tải xong.</Typography>
      </Box>
    );
  }

  return (
    <Box
      id="print-content"
      sx={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '10mm 5mm 10mm 10mm',
        backgroundColor: 'white',
        color: 'black',
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: '14pt',
        lineHeight: 1.3,
        position: 'relative',
        '@media print': {
          margin: 0,
          boxShadow: 'none',
        }
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
        <tbody>
          <tr>
            <td style={{ 
              width: '35%', 
              verticalAlign: 'middle',
              padding: '0 10px 0 0'
            }}>
              <div style={{ 
                border: '1px solid #000', 
                height: '70mm', 
                width: '50mm',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                backgroundColor: '#f5f5f5',
                overflow: 'hidden'
              }}>
                {photoBase64 ? (
                  <img 
                    src={photoBase64} 
                    alt="Ảnh người cao tuổi"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed #000',
                    color: '#666',
                    fontSize: '12pt',
                    textAlign: 'center',
                    padding: '10px'
                  }}>
                    Ảnh 5x7
                  </div>
                )}
              </div>
            </td>
            <td style={{ 
              width: '65%',
              verticalAlign: 'middle',
              paddingLeft: '10px'
            }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', fontSize: '16pt' }}>
                I. Thông tin cơ bản của công dân
              </p>
              
              <p style={{ margin: '0 0 5px 0' }}>
                <span style={{ fontWeight: 'bold' }}>Họ và tên:</span> {printData?.name || ''}
              </p>
              
              <p style={{ margin: '0 0 5px 0' }}>
                <span style={{ fontWeight: 'bold' }}>Ngày tháng năm sinh:</span> {formatDate(printData?.dateOfBirth) || ''}
              </p>
              
              <p style={{ margin: '0 0 5px 0' }}>
                <span style={{ fontWeight: 'bold' }}>Giới tính:</span> {printData?.gender || ''}
              </p>
              
              <p style={{ margin: '0 0 5px 0' }}>
                <span style={{ fontWeight: 'bold' }}>Nơi đăng ký khai sinh:</span> {printData?.address || ''}
              </p>
              
              <p style={{ margin: '0 0 5px 0' }}>
                <span style={{ fontWeight: 'bold' }}>Nơi đăng ký thường trú:</span> {printData?.address || ''}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      
      <p style={{ margin: '10px 0 5px 0' }}>
        <span style={{ fontWeight: 'bold' }}>Tham gia hội NCT:</span> {printData?.joinDate ? 'Có' : ''}
      </p>
      
      <p style={{ margin: '0 0 5px 0' }}>
        <span style={{ fontWeight: 'bold' }}>Số thẻ:</span> {printData?.cardNumber || ''}
      </p>
      
      <p style={{ margin: '0 0 5px 0' }}>
        <span style={{ fontWeight: 'bold' }}>Ngày cấp:</span> {printData?.cardIssueDate ? formatDate(printData.cardIssueDate) : ''}
      </p>
      
      <p style={{ margin: '0 0 10px 0' }}>
        <span style={{ fontWeight: 'bold' }}>Số điện thoại:</span> {printData?.phone || ''}
      </p>
      
      <p style={{ fontWeight: 'bold', margin: '10px 0 10px 0', fontSize: '16pt' }}>
        II. Thông tin thuộc Hội Người cao tuổi
      </p>
      
      <p style={{ margin: '0 0 5px 0' }}>
        <span style={{ marginRight: '5px' }}>1</span>
        <span style={{ fontWeight: 'bold' }}>Chức danh trong Hội Người cao tuổi:</span> {printData?.position || ''}
      </p>
      
      <p style={{ margin: '5px 0 5px 0' }}>
        <span style={{ marginRight: '5px' }}>2</span>
        <span style={{ fontWeight: 'bold' }}>Về bảo vệ Người cao tuổi:</span>
      </p>
      
      <div style={{ marginLeft: '15px', marginBottom: '5px' }}>
        <p style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'flex-start' }}>
          <span style={{ 
            display: 'inline-block', 
            width: '13px', 
            height: '13px', 
            border: '1px solid black', 
            marginRight: '5px',
            marginTop: '3px',
            flexShrink: 0
          }}></span> 
          <span>Được bảo vệ quyền và lợi ích hợp pháp dành cho người cao tuổi</span>
        </p>
        
        <p style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'flex-start' }}>
          <span style={{ 
            display: 'inline-block', 
            width: '13px', 
            height: '13px', 
            border: '1px solid black', 
            marginRight: '5px',
            marginTop: '3px',
            flexShrink: 0
          }}></span>
          <span>
          Được chúc thọ, mừng thọ theo độ tuổi quy định và hưởng trợ cấp xã hội<br/>
          chính sách người có công hàng tháng theo quy định của nhà nước
          </span>
        </p>
        
        <p style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'flex-start' }}>
          <span style={{ 
            display: 'inline-block', 
            width: '13px', 
            height: '13px', 
            border: '1px solid black', 
            marginRight: '5px',
            marginTop: '3px',
            flexShrink: 0
          }}></span>
          <span>Được khám sức khỏe định kỳ hàng tháng</span>
        </p>
      </div>
      
      {/* Tiếp tục phần còn lại của mẫu in tương tự như trong ElderlyPrintForm.jsx */}
      {/* Phần chữ ký */}
      <div style={{ width: '100%', marginTop: '30px' }}>
        <div style={{ width: '50%', float: 'right', textAlign: 'center', marginBottom: '10px' }}>
          <p style={{ margin: '0 0 10px 0' }}>
            <span>, ngày </span>
            <span style={{ display: 'inline-block', width: '30px', borderBottom: '1px dotted #000' }}></span>
            <span> tháng </span>
            <span style={{ display: 'inline-block', width: '30px', borderBottom: '1px dotted #000' }}></span>
            <span> năm </span>
            <span style={{ display: 'inline-block', width: '40px', borderBottom: '1px dotted #000' }}></span>
          </p>
        </div>
        <div style={{ clear: 'both' }}></div>
      </div>
      
      <table style={{ width: '100%' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>
                Lãnh đạo Hội Người cao tuổi cấp xã
              </p>
              <p style={{ fontStyle: 'italic', margin: '0 0 50px 0' }}>
                (Xác nhận)
              </p>
            </td>
            <td style={{ width: '50%', textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>
                Người cung cấp thông tin
              </p>
              <p style={{ fontStyle: 'italic', margin: '0 0 50px 0' }}>
                (Ký ghi rõ họ tên)
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </Box>
  );
};

export default PrintPage; 