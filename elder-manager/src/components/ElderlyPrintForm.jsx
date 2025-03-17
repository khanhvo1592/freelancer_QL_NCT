import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
  IconButton,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';
import generateElderlyWordDocument from '../utils/wordGenerator';

const defaultAvatarUrl = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

const ElderlyPrintForm = ({ open, onClose, elderly }) => {
  const componentRef = useRef(null);

  // Thêm style in ấn vào head khi component mount
  useEffect(() => {
    const printStyle = document.createElement('style');
    printStyle.setAttribute('id', 'elder-print-style');
    printStyle.innerHTML = `
      @media print {
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
        
        body * {
          visibility: hidden;
        }
        
        #elder-print-content, #elder-print-content * {
          visibility: visible;
        }
        
        #elder-print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        
        /* Điều chỉnh checkbox để không bị chồng lấp */
        .checkbox-empty {
          display: inline-block;
          width: 13px;
          height: 13px;
          border: 1px solid black;
          margin-right: 5px;
          position: relative;
          background-color: white;
        }
        
        /* Ẩn các phần không cần thiết */
        .MuiDialogTitle-root,
        .MuiDialogActions-root,
        button {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(printStyle);
    
    return () => {
      const styleElement = document.getElementById('elder-print-style');
      if (styleElement) document.head.removeChild(styleElement);
    };
  }, []);

  const handleExportWord = async () => {
    try {
      const result = await generateElderlyWordDocument(elderly);
      if (result) {
        console.log('Xuất file Word thành công');
        alert('Xuất file Word thành công!');
      } else {
        alert('Không thể xuất file Word. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Lỗi khi xuất file Word:', error);
      alert(`Lỗi khi xuất file Word: ${error.message}`);
    }
  };

  // Cập nhật hàm in để đảm bảo tất cả nội dung được hiển thị
  const handlePrintDirect = () => {
    console.log('Printing document...');
    
    // Đảm bảo tất cả nội dung đã được render
    setTimeout(() => {
      window.print();
    }, 300);
  };

  if (!elderly) return null;

  // Format date to display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    return dayjs().diff(dayjs(birthDate), 'year');
  };

  // Tạo số thẻ ngẫu nhiên
  const generateCardNumber = () => {
    return `HP-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  // Lấy thông tin thôn/xã từ địa chỉ
  const getVillageAndCommune = (address) => {
    if (!address) return { village: '', commune: '' };
    const parts = address.split(' ');
    return {
      village: parts[0] || '',
      commune: parts[1] || ''
    };
  };

  const { village, commune } = getVillageAndCommune(elderly.address);

  // Định nghĩa style chung cho font Times New Roman
  const timesNewRomanStyle = {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '14pt'
  };

  // Style cho tiêu đề
  const headingStyle = {
    ...timesNewRomanStyle,
    fontWeight: 'bold',
    fontSize: '16pt'
  };

  // Style cho label
  const labelStyle = {
    ...timesNewRomanStyle,
    fontWeight: 'bold',
    width: 200
  };

  // Style cho nội dung
  const contentStyle = {
    ...timesNewRomanStyle
  };

  // Style cho trường trống
  const emptyFieldStyle = {
    minWidth: '150px',
    display: 'inline-block',
    borderBottom: '1px dotted #000',
    height: '14px',
    mx: 1,
    backgroundColor: 'transparent'
  };

  // Hàm hiển thị giá trị hoặc trường trống
  const displayValueOrEmpty = (value) => {
    if (!value) {
      return <Box component="span" className="empty-field" sx={emptyFieldStyle}></Box>;
    }
    return value;
  };

  // Tạo một component riêng cho nội dung cần in
  const PrintContent = React.forwardRef((props, ref) => (
    <div 
      ref={ref} 
      id="elder-print-content" 
      style={{ 
        width: '100%', 
        padding: '15mm',
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: '12pt',
        lineHeight: '1.3',
        backgroundColor: 'white'
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
                margin: '0 auto'
              }}>
                <img 
                  src={elderly.photoUrl ? `http://localhost:5000${elderly.photoUrl}` : defaultAvatarUrl}
                  alt="Elderly photo"
                  style={{
                    width: '50mm',
                    height: '70mm',
                    objectFit: 'cover'
                  }}
                />
              </div>
            </td>
            <td style={{ 
              width: '65%',
              verticalAlign: 'middle',
              paddingLeft: '10px'
            }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 10px 0' }}>
                I. Thông tin cơ bản của công dân
              </p>
              
              <p style={{ margin: '0 0 5px 0' }}>
                <span style={{ fontWeight: 'bold' }}>Họ và tên:</span> {elderly?.name || ''}
              </p>
              
              <p style={{ margin: '0 0 5px 0' }}>
                <span style={{ fontWeight: 'bold' }}>Ngày tháng năm sinh:</span> {formatDate(elderly?.dateOfBirth) || ''}
              </p>
              
              <p style={{ margin: '0 0 5px 0' }}>
                <span style={{ fontWeight: 'bold' }}>Giới tính:</span> {elderly?.gender || ''}
              </p>
              
              <p style={{ margin: '0 0 5px 0' }}>
                <span style={{ fontWeight: 'bold' }}>Nơi đăng ký khai sinh:</span> {elderly?.address || ''}
              </p>
              
              <p style={{ margin: '0 0 5px 0' }}>
                <span style={{ fontWeight: 'bold' }}>Nơi đăng ký thường trú:</span> {elderly?.address || ''}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      
      <p style={{ margin: '10px 0 5px 0' }}>
        <span style={{ fontWeight: 'bold' }}>Tham gia hội NCT:</span> {elderly?.joinDate ? 'Có' : ''}
      </p>
      
      <p style={{ margin: '0 0 5px 0' }}>
        <span style={{ fontWeight: 'bold' }}>Số thẻ:</span> {elderly?.cardNumber || ''}
      </p>
      
      <p style={{ margin: '0 0 5px 0' }}>
        <span style={{ fontWeight: 'bold' }}>Ngày cấp:</span> {elderly?.cardIssueDate ? formatDate(elderly.cardIssueDate) : ''}
      </p>
      
      <p style={{ margin: '0 0 10px 0' }}>
        <span style={{ fontWeight: 'bold' }}>Số điện thoại:</span> {elderly?.phone || ''}
      </p>
      
      <p style={{ fontWeight: 'bold', margin: '10px 0 10px 0' }}>
        II. Thông tin thuộc Hội Người cao tuổi
      </p>
      
      <p style={{ margin: '0 0 5px 0' }}>
        <span style={{ marginRight: '5px' }}>1</span>
        <span style={{ fontWeight: 'bold' }}>Chức danh trong Hội Người cao tuổi:</span> {elderly?.position || ''}
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
      
      <p style={{ margin: '5px 0 5px 0' }}>
        <span style={{ marginRight: '5px' }}>3</span>
        <span style={{ fontWeight: 'bold' }}>Văn hóa thể dục thể thao:</span>
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
          <span>
          Được tham gia các câu lạc bộ, thể dục, thể thao, văn hóa, văn nghệ hoạt<br/>
          động tại các thôn.
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
          <span>
            Được tặng quà và tiền mặt, thăng hành động vì Người cao tuổi ngày 1 tháng<br/>
          10 hàng năm.
          </span>
        </p>
      </div>
      
      <p style={{ margin: '5px 0 5px 0' }}>
        <span style={{ marginRight: '5px' }}>4</span>
        <span style={{ fontWeight: 'bold' }}>Về phát huy vai trò Người cao tuổi</span>
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
          <span>Tham gia công tác xã hội của đảng, chính quyền tại địa phương</span>
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
          <span>Người cao tuổi làm kinh tế</span>
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
          <span>Tham gia bảo vệ môi trường và xây dựng nông thôn mới</span>
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
          <span>Được tuyên truyền, tập huấn các chính sách mới của nhà nước</span>
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
          <span>Ứng hộ tiền hoặc đóng góp cho những công tác xã hội tại địa phương.</span>
        </p>
      </div>
      
      <p style={{ margin: '5px 0 5px 0' }}>
        <span style={{ marginRight: '5px' }}>5</span>
        <span style={{ fontWeight: 'bold' }}>Người cao tuổi tham gia phòng chống tội phạm, trật tự an ninh, vì an ninh tổ quốc:</span>
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
          <span>Tham gia duy trì hoạt động an ninh thôn, xóm.</span>
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
          <span>Tham gia hệ thống chính trị cấp cơ sở.</span>
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
          <span>Tham gia tổ hòa giải tại thôn, xóm.</span>
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
          <span>Tham gia công tác bảo vệ biên giới biển đảo và các tệ nạn xã hội.</span>
        </p>
      </div>
      
      <p style={{ margin: '5px 0 5px 0' }}>
        <span style={{ marginRight: '5px' }}>6</span>
        <span style={{ fontWeight: 'bold' }}>Câu lạc bộ liên thế hệ tự giúp nhau:</span>
      </p>
      
      <div style={{ marginLeft: '15px', marginBottom: '10px' }}>
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
          <span>Là thành viên câu lạc bộ liên thế hệ tự giúp nhau</span>
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
          <span>Được tập huấn thường xuyên tại các câu lạc bộ liên thế hệ tự giúp nhau</span>
        </p>
      </div>
      
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
    </div>
  ));

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Phiếu thông tin người cao tuổi
          </Typography>
          <Box>
            <IconButton onClick={handlePrintDirect} color="primary" sx={{ mr: 1 }}>
              <PrintIcon />
            </IconButton>
            <IconButton onClick={handleExportWord} color="primary" sx={{ mr: 1 }}>
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <PrintContent ref={componentRef} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button 
          onClick={handlePrintDirect}
          variant="contained" 
          color="primary" 
          startIcon={<PrintIcon />}
          sx={{ mr: 1 }}
        >
          In
        </Button>
        <Button 
          onClick={handleExportWord} 
          variant="contained" 
          color="primary" 
          startIcon={<DownloadIcon />}
        >
          Xuất Word
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ElderlyPrintForm; 