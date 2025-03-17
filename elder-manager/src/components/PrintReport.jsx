import React from 'react';
import { Button } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PrintReport = ({ selectedYear, elderlyData }) => {
  const currentYear = new Date().getFullYear();
  const yearDiff = selectedYear ? (selectedYear - currentYear) : 0;
  
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Tiêu đề
    doc.setFontSize(18);
    doc.text('BÁO CÁO THỐNG KÊ NGƯỜI CAO TUỔI', 105, 20, { align: 'center' });
    
    if (selectedYear) {
      doc.setFontSize(14);
      doc.text(`Dự báo cho năm ${selectedYear}`, 105, 30, { align: 'center' });
    }
    
    // Thống kê tổng quan
    doc.setFontSize(12);
    
    const projectedData = elderlyData.map(person => ({
      ...person,
      projectedAge: person.age + yearDiff
    }));
    
    const stats = {
      total: elderlyData.length,
      over80: projectedData.filter(e => e.projectedAge >= 80).length,
      age70to80: projectedData.filter(e => e.projectedAge >= 70 && e.projectedAge < 80).length,
      age60to70: projectedData.filter(e => e.projectedAge >= 60 && e.projectedAge < 70).length,
      below60: projectedData.filter(e => e.projectedAge < 60).length,
    };
    
    doc.text('THỐNG KÊ TỔNG QUAN', 14, 40);
    doc.line(14, 42, 196, 42);
    
    doc.text(`Tổng số: ${stats.total}`, 14, 50);
    doc.text(`Trên 80 tuổi: ${stats.over80} (${((stats.over80 / stats.total) * 100).toFixed(1)}%)`, 14, 58);
    doc.text(`70-80 tuổi: ${stats.age70to80} (${((stats.age70to80 / stats.total) * 100).toFixed(1)}%)`, 14, 66);
    doc.text(`60-70 tuổi: ${stats.age60to70} (${((stats.age60to70 / stats.total) * 100).toFixed(1)}%)`, 14, 74);
    doc.text(`Dưới 60 tuổi: ${stats.below60} (${((stats.below60 / stats.total) * 100).toFixed(1)}%)`, 14, 82);
    
    // Bảng danh sách người cao tuổi
    doc.text('DANH SÁCH NGƯỜI CAO TUỔI', 14, 95);
    doc.line(14, 97, 196, 97);
    
    const tableColumn = ["ID", "Họ và tên", `Tuổi năm ${selectedYear || currentYear}`, "Địa chỉ", "Nhóm tuổi"];
    const tableRows = projectedData.map(elderly => {
      const projectedAge = elderly.projectedAge;
      const ageGroup = projectedAge >= 80 ? 'Trên 80 tuổi' :
                      projectedAge >= 70 ? '70-80 tuổi' :
                      projectedAge >= 60 ? '60-70 tuổi' : 'Dưới 60 tuổi';
      return [
        elderly.id,
        elderly.name,
        projectedAge,
        elderly.address,
        ageGroup
      ];
    });

    doc.autoTable({
      startY: 100,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 1,
        overflow: 'linebreak',
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20 },
        3: { cellWidth: 80 },
        4: { cellWidth: 25 },
      },
    });

    // Thời gian xuất báo cáo
    const date = new Date().toLocaleString('vi-VN');
    doc.setFontSize(10);
    const finalY = doc.lastAutoTable.finalY || 150;
    doc.text(`Ngày xuất báo cáo: ${date}`, 14, finalY + 10);

    doc.save('bao-cao-nguoi-cao-tuoi.pdf');
  };

  return (
    <Button
      variant="contained"
      startIcon={<PrintIcon />}
      onClick={generatePDF}
    >
      Xuất PDF
    </Button>
  );
};

export default PrintReport; 