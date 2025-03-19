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
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import generateElderlyWordDocument from '../utils/wordGenerator';
import { useReactToPrint } from 'react-to-print';

// Configure pdfMake
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const defaultAvatarUrl = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

// Function to convert image URL to base64
const getBase64FromUrl = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Return the complete data URL
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

const ElderlyPrintForm = ({ open, onClose, elderly }) => {
  const componentRef = useRef(null);
  const [photoBase64, setPhotoBase64] = useState(null);

  // Load and convert image when component mounts or elderly changes
  useEffect(() => {
    const loadImage = async () => {
      try {
        let imageUrl;
        if (elderly?.photoUrl) {
          imageUrl = `http://localhost:5000${elderly.photoUrl}`;
        } else {
          imageUrl = defaultAvatarUrl;
        }
        const base64 = await getBase64FromUrl(imageUrl);
        if (base64) {
          setPhotoBase64(base64);
        }
      } catch (error) {
        console.error('Error loading image:', error);
      }
    };
    loadImage();
  }, [elderly]);

  // Thêm style in ấn vào head khi component mount
  useEffect(() => {
    const printStyle = document.createElement('style');
    printStyle.setAttribute('id', 'elder-print-style');
    printStyle.innerHTML = `
      @media print {
        @page {
          size: A4 portrait;
          margin: 10mm 5mm 10mm 10mm;
        }

        body * {
          visibility: hidden;
        }

        #elder-print-content,
        #elder-print-content * {
          visibility: visible !important;
          color: black !important;
        }

        #elder-print-content {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 210mm !important;
          min-height: 297mm !important;
          margin: 0 !important;
          padding: 10mm 5mm 10mm 10mm !important;
        }

        .MuiDialog-root {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
        }

        .MuiDialog-container {
          position: static !important;
          transform: none !important;
        }

        .MuiDialog-paper {
          margin: 0 !important;
          box-shadow: none !important;
        }

        .MuiDialogTitle-root,
        .MuiDialogActions-root {
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

  const generatePdfDefinition = () => {
    if (!photoBase64) {
      console.error('Photo not loaded yet');
      return null;
    }

    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [ 40, 30, 40, 40 ],
      content: [
        {
          columns: [
            {
              width: '35%',
              stack: [
                {
                  image: photoBase64,
                  width: 150,
                  height: 200,
                  alignment: 'center'
                }
              ]
            },
            {
              width: '65%',
              stack: [
                { text: 'I. Thông tin cơ bản của công dân', style: 'sectionHeader' },
                { text: `Họ và tên: ${elderly?.name || ''}`, margin: [0, 5] },
                { text: `Ngày tháng năm sinh: ${dayjs(elderly?.dateOfBirth).format('DD/MM/YYYY')}`, margin: [0, 5] },
                { text: `Giới tính: ${elderly?.gender || ''}`, margin: [0, 5] },
                { text: `Nơi đăng ký khai sinh: ${elderly?.address || ''}`, margin: [0, 5] },
                { text: `Nơi đăng ký thường trú: ${elderly?.address || ''}`, margin: [0, 5] }
              ]
            }
          ]
        },
        { text: `Tham gia hội NCT: ${elderly?.joinDate ? 'Có' : 'Không'}`, margin: [0, 10] },
        { text: `Số thẻ: ${elderly?.cardNumber || ''}`, margin: [0, 5] },
        { text: `Ngày cấp: ${elderly?.cardIssueDate ? dayjs(elderly.cardIssueDate).format('DD/MM/YYYY') : ''}`, margin: [0, 5] },
        { text: `Số điện thoại: ${elderly?.phone || ''}`, margin: [0, 5] },
        { text: 'II. Thông tin thuộc Hội Người cao tuổi', style: 'sectionHeader', margin: [0, 10] }
      ],
      styles: {
        sectionHeader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5]
        }
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 12,
        lineHeight: 1.3
      }
    };
  };

  const handlePrint = useCallback(() => {
    try {
      // Clear any text selection
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
        document.getSelection()?.empty();
      }

      // Remove focus from any element
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      // Check if we're in Electron environment
      if (window.electron?.ipcRenderer) {
        console.log('Using Electron print API');
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          throw new Error('Could not open print window');
        }

        // Clone the content to print
        const contentToPrint = componentRef.current.cloneNode(true);
        
        // Replace image with a frame
        const imgContainer = contentToPrint.querySelector('div[style*="border: 1px solid #000"]');
        if (imgContainer) {
          imgContainer.innerHTML = `
            <div style="
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1px dashed #000;
              background-color: #f5f5f5;
              color: #666;
              font-size: 12pt;
              text-align: center;
              padding: 10px;
            ">
              Ảnh 3x4
            </div>
          `;
        }

        // Write content to print window
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print</title>
              <style>
                @page {
                  size: A4 portrait;
                  margin: 10mm 5mm 10mm 10mm;
                }
                body {
                  margin: 0;
                  padding: 0;
                  background-color: white;
                }
                #elder-print-content {
                  width: 210mm;
                  min-height: 297mm;
                  padding: 10mm 5mm 10mm 10mm;
                  margin: 0;
                  background-color: white;
                }
              </style>
            </head>
            <body>
              ${contentToPrint.outerHTML}
            </body>
          </html>
        `);

        // Wait for content to load
        printWindow.document.close();

        // Send print command to main process with full options
        window.electron.ipcRenderer.send('print-to-pdf', {
          silent: false,
          printBackground: true,
          deviceWidth: '210mm',
          deviceHeight: '297mm',
          margins: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 5
          },
          pageSize: 'A4',
          orientation: 'portrait',
          color: true,
          copies: 1,
          collate: true,
          duplex: false,
          dpi: 300,
          showPrintDialog: true,
          showPageSetupDialog: true
        });

        // Listen for print success/failure
        const handlePrintSuccess = () => {
          console.log('Print successful');
          window.electron.ipcRenderer.removeListener('print-success', handlePrintSuccess);
          window.electron.ipcRenderer.removeListener('print-error', handlePrintError);
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        };

        const handlePrintError = (error) => {
          console.error('Print failed:', error);
          window.electron.ipcRenderer.removeListener('print-success', handlePrintSuccess);
          window.electron.ipcRenderer.removeListener('print-error', handlePrintError);
          alert('Có lỗi xảy ra khi in. Vui lòng thử lại.');
          printWindow.close();
        };

        window.electron.ipcRenderer.on('print-success', handlePrintSuccess);
        window.electron.ipcRenderer.on('print-error', handlePrintError);

      } else {
        console.log('Using browser print API');
        window.print();
      }
    } catch (error) {
      console.error('Print error:', error);
      alert('Có lỗi xảy ra khi in. Vui lòng thử lại.');
    }
  }, []);

  // Add noselect style
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      .no-select, button, .MuiButton-root, .MuiIconButton-root {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      @media print {
        body * {
          visibility: hidden;
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }

        #elder-print-content,
        #elder-print-content * {
          visibility: visible !important;
        }

        #elder-print-content {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          background-color: white !important;
        }

        button, .MuiButton-root, .MuiIconButton-root {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
        width: '210mm',
        minHeight: '297mm',
        padding: '10mm 5mm 10mm 10mm',
        margin: '0 auto',
        backgroundColor: 'white',
        color: 'black',
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: '14.4pt',
        lineHeight: '1.3',
        position: 'relative',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
        cursor: 'default',
        pointerEvents: 'none'
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
                backgroundColor: '#f5f5f5'
              }}>
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
                  Ảnh 3x4
                </div>
              </div>
            </td>
            <td style={{ 
              width: '65%',
              verticalAlign: 'middle',
              paddingLeft: '10px'
            }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', fontSize: '16.8pt' }}>
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
        <span style={{ fontWeight: 'bold' }}>Tham gia hội NCT:</span> {elderly?.joinDate ? '' : ''}
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
      
      <p style={{ fontWeight: 'bold', margin: '10px 0 10px 0', fontSize: '16.8pt' }}>
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
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        className="no-select"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" className="no-select">
              Phiếu thông tin người cao tuổi
            </Typography>
            <Box className="no-select">
              <IconButton 
                onClick={handlePrint} 
                color="primary" 
                sx={{ 
                  mr: 1,
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
                className="no-select"
              >
                <PrintIcon />
              </IconButton>
              <IconButton 
                onClick={handleExportWord} 
                color="primary" 
                sx={{ 
                  mr: 1,
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
                className="no-select"
              >
                <DownloadIcon />
              </IconButton>
              <IconButton 
                onClick={onClose}
                sx={{ 
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
                className="no-select"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <PrintContent ref={componentRef} />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={onClose}
            sx={{ 
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
            className="no-select"
          >
            Đóng
          </Button>
          <Button 
            onClick={handlePrint}
            variant="contained" 
            color="primary" 
            startIcon={<PrintIcon />}
            sx={{ 
              mr: 1,
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
            className="no-select"
          >
            In phiếu
          </Button>
          <Button 
            onClick={handleExportWord} 
            variant="contained" 
            color="primary" 
            startIcon={<DownloadIcon />}
            sx={{ 
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
            className="no-select"
          >
            Xuất Word
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ElderlyPrintForm;
