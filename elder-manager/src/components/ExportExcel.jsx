import React from 'react';
import { Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';

const ExportExcel = ({ data, selectedYear }) => {
  const handleExport = () => {
    // Tạo dữ liệu cho file Excel
    const excelData = data.map(person => {
      const birthDate = new Date(person.dateOfBirth);
      const age = selectedYear - birthDate.getFullYear();

      return {
        'Họ và tên': person.name || '',
        'Ngày sinh': birthDate.toLocaleDateString('vi-VN'),
        [`Tuổi ${selectedYear}`]: age,
        'Địa chỉ': person.address || '',
        'Số điện thoại': person.phone || '',
        'Trạng thái': person.deceased ? 'Đã mất' : 'Còn sống'
      };
    });

    // Tạo workbook mới
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Điều chỉnh độ rộng cột
    const colWidths = [
      { wch: 30 }, // Họ và tên
      { wch: 15 }, // Ngày sinh
      { wch: 10 }, // Tuổi
      { wch: 40 }, // Địa chỉ
      { wch: 15 }, // Số điện thoại
      { wch: 12 }  // Trạng thái
    ];
    ws['!cols'] = colWidths;

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách');

    // Xuất file
    XLSX.writeFile(wb, `Danh-sach-nguoi-cao-tuoi-${selectedYear}.xlsx`);
  };

  return (
    <Button
      variant="outlined"
      startIcon={<FileDownloadIcon />}
      onClick={handleExport}
      fullWidth
      size="small"
      sx={{ height: '40px' }}
    >
      Xuất Excel
    </Button>
  );
};

export default ExportExcel; 