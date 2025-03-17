import React from 'react';
import { Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';

const ExportExcel = ({ data, selectedYear }) => {
  const handleExport = () => {
    // Chuẩn bị dữ liệu cho excel
    const excelData = data.map(item => ({
      'ID': item.id,
      'Họ và tên': item.name,
      [`Tuổi năm ${selectedYear}`]: item.projectedAge,
      'Địa chỉ': item.address,
      'Số điện thoại': item.phone || '',
      'Trạng thái': item.deceased ? 'Đã mất' : 'Còn sống',
      'Ngày mất': item.deceased ? (item.deceasedDate || 'Không rõ') : '',
      'Nhóm tuổi': item.ageGroup
    }));

    // Tạo workbook và worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Điều chỉnh độ rộng cột
    const colWidths = [
      { wch: 5 },  // ID
      { wch: 25 }, // Họ và tên
      { wch: 15 }, // Tuổi năm xxxx
      { wch: 40 }, // Địa chỉ
      { wch: 15 }, // Số điện thoại
      { wch: 12 }, // Trạng thái
      { wch: 15 }, // Ngày mất
      { wch: 15 }, // Nhóm tuổi
    ];
    ws['!cols'] = colWidths;

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách người cao tuổi');

    // Tạo tên file với timestamp
    const fileName = `danh-sach-nguoi-cao-tuoi-${new Date().toISOString().split('T')[0]}.xlsx`;

    // Xuất file
    XLSX.writeFile(wb, fileName);
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