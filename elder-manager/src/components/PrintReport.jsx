import React from 'react';
import { Button } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

// Import pdfMake một cách khác
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');

// Khởi tạo pdfMake với fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const PrintReport = ({ data, selectedYear }) => {
  const handlePrint = () => {
    try {
      // Tạo dữ liệu cho bảng
      const tableBody = [
        [
          'Họ và tên',
          'Ngày sinh',
          'Tuổi ' + selectedYear,
          'Địa chỉ',
          'Số điện thoại',
          'Trạng thái'
        ],
        ...data.map(person => {
          const birthDate = new Date(person.dateOfBirth);
          const age = selectedYear - birthDate.getFullYear();
          
          return [
            person.name || '',
            birthDate.toLocaleDateString('vi-VN'),
            age.toString(),
            person.address || '',
            person.phone || '',
            person.deceased ? 'Đã mất' : 'Còn sống'
          ];
        })
      ];

      const docDefinition = {
        content: [
          {
            text: 'DANH SÁCH NGƯỜI CAO TUỔI NĂM ' + selectedYear,
            style: 'header'
          },
          {
            text: `Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}`,
            style: 'subheader'
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', '*', 'auto', 'auto'],
              body: tableBody
            }
          },
          {
            text: `Tổng số: ${data.length} người`,
            style: 'footer'
          }
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },
          subheader: {
            fontSize: 12,
            margin: [0, 0, 0, 10]
          },
          tableHeader: {
            bold: true,
            fontSize: 12,
            fillColor: '#f5f5f5'
          },
          tableCell: {
            fontSize: 11
          },
          footer: {
            fontSize: 12,
            bold: true,
            margin: [0, 10, 0, 0]
          }
        },
        pageOrientation: 'landscape',
        pageMargins: [40, 40, 40, 40]
      };

      // Tạo và tải PDF
      pdfMake.createPdf(docDefinition).download('danh-sach-nguoi-cao-tuoi.pdf');
    } catch (error) {
      console.error('Lỗi khi tạo PDF:', error);
      alert('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại!');
    }
  };

  return (
    <Button
      variant="outlined"
      startIcon={<PrintIcon />}
      onClick={handlePrint}
      fullWidth
      size="small"
      sx={{ height: '40px' }}
    >
      Xuất PDF
    </Button>
  );
};

export default PrintReport; 