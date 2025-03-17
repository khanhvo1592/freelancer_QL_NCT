import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

const DetailedStats = ({ elderlyData, selectedYear }) => {
  // Tính toán dữ liệu thống kê
  const currentYear = new Date().getFullYear();
  const yearDiff = selectedYear - currentYear;
  
  // Lọc danh sách theo năm
  const projectedData = elderlyData.map(person => ({
    ...person,
    projectedAge: person.age + yearDiff
  }));
  
  // Thống kê theo độ tuổi
  const ageStats = {
    above80: projectedData.filter(p => p.projectedAge >= 80).length,
    between70and80: projectedData.filter(p => p.projectedAge >= 70 && p.projectedAge < 80).length,
    between60and70: projectedData.filter(p => p.projectedAge >= 60 && p.projectedAge < 70).length,
    below60: projectedData.filter(p => p.projectedAge < 60).length,
  };
  
  // Top 5 người cao tuổi nhất
  const oldestPeople = [...projectedData]
    .sort((a, b) => b.projectedAge - a.projectedAge)
    .slice(0, 5);
  
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Thống kê chi tiết năm {selectedYear}</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Phân bố độ tuổi:</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nhóm tuổi</TableCell>
                        <TableCell align="right">Số lượng</TableCell>
                        <TableCell align="right">Phần trăm</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Trên 80 tuổi</TableCell>
                        <TableCell align="right">{ageStats.above80}</TableCell>
                        <TableCell align="right">{((ageStats.above80 / elderlyData.length) * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>70-80 tuổi</TableCell>
                        <TableCell align="right">{ageStats.between70and80}</TableCell>
                        <TableCell align="right">{((ageStats.between70and80 / elderlyData.length) * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>60-70 tuổi</TableCell>
                        <TableCell align="right">{ageStats.between60and70}</TableCell>
                        <TableCell align="right">{((ageStats.between60and70 / elderlyData.length) * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Dưới 60 tuổi</TableCell>
                        <TableCell align="right">{ageStats.below60}</TableCell>
                        <TableCell align="right">{((ageStats.below60 / elderlyData.length) * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Top 5 người cao tuổi nhất:</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Họ và tên</TableCell>
                        <TableCell align="right">Tuổi năm {selectedYear}</TableCell>
                        <TableCell>Địa chỉ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {oldestPeople.map((person) => (
                        <TableRow key={person.id}>
                          <TableCell>{person.name}</TableCell>
                          <TableCell align="right">{person.projectedAge}</TableCell>
                          <TableCell>{person.address.substring(0, 30)}...</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DetailedStats; 