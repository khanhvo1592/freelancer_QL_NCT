import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import { elderlyApi } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Statistics = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [elderlyData, setElderlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tạo danh sách năm từ 2025 đến 2030
  const years = Array.from(
    { length: 6 }, 
    (_, i) => 2025 + i
  );

  // Hàm tính tuổi từ ngày sinh và năm dự báo
  const getAgeFromDateOfBirth = (dateOfBirth, projectionYear = null) => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const year = projectionYear || new Date().getFullYear();
    
    // Tính tuổi theo năm dự báo
    let age = year - birthDate.getFullYear();
    
    // Điều chỉnh tuổi dựa trên tháng và ngày
    const birthMonth = birthDate.getMonth();
    const birthDay = birthDate.getDate();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
      age--;
    }
    
    return age;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await elderlyApi.getAll();
        setElderlyData(data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dữ liệu theo nhóm tuổi
  const ageGroups = useMemo(() => {
    // Tính tuổi cho mỗi người theo năm dự báo
    const elderlyWithAge = elderlyData.map(person => ({
      ...person,
      age: getAgeFromDateOfBirth(person.dateOfBirth, selectedYear)
    })).filter(person => person.age !== null);

    return [
      {
        name: 'Trên 100 tuổi',
        value: elderlyWithAge.filter(e => e.age > 100).length
      },
      {
        name: '95-100 tuổi',
        value: elderlyWithAge.filter(e => e.age >= 95 && e.age <= 100).length
      },
      {
        name: '85-90 tuổi',
        value: elderlyWithAge.filter(e => e.age >= 85 && e.age < 90).length
      },
      {
        name: '80-85 tuổi',
        value: elderlyWithAge.filter(e => e.age >= 80 && e.age < 85).length
      },
      {
        name: '75-80 tuổi',
        value: elderlyWithAge.filter(e => e.age >= 75 && e.age < 80).length
      },
      {
        name: '70-75 tuổi',
        value: elderlyWithAge.filter(e => e.age >= 70 && e.age < 75).length
      },
      {
        name: 'Dưới 70 tuổi',
        value: elderlyWithAge.filter(e => e.age < 70).length
      }
    ];
  }, [elderlyData, selectedYear]);

  // Dữ liệu theo trạng thái
  const deceasedData = [
    {
      name: 'Đã mất',
      value: elderlyData.filter(e => e.status === 'deceased').length
    },
    {
      name: 'Còn sống',
      value: elderlyData.filter(e => e.status === 'alive').length
    }
  ];

  // Dữ liệu theo giới tính
  const genderData = [
    {
      name: 'Nam',
      value: elderlyData.filter(e => e.gender === 'Nam').length
    },
    {
      name: 'Nữ',
      value: elderlyData.filter(e => e.gender === 'Nữ').length
    }
  ];

  // Top 5 người cao tuổi nhất
  const oldestPeople = useMemo(() => {
    return [...elderlyData]
      .map(person => ({
        ...person,
        age: getAgeFromDateOfBirth(person.dateOfBirth, selectedYear),
        currentAge: getAgeFromDateOfBirth(person.dateOfBirth)
      }))
      .filter(person => person.age !== null)
      .sort((a, b) => b.age - a.age)
      .slice(0, 5)
      .map(person => ({
        name: person.name,
        age: person.currentAge,
        projectedAge: person.age,
        status: person.deceased ? 'Đã mất' : 'Còn sống',
        address: person.address
      }));
  }, [elderlyData, selectedYear]);

  // Dự báo phân bố độ tuổi theo năm
  const projectionData = useMemo(() => {
    return years.map(year => {
      // Tính tuổi dự báo cho từng người
      const projectedAges = elderlyData
        .map(person => {
          if (!person.dateOfBirth) return null;
          return getAgeFromDateOfBirth(person.dateOfBirth, year);
        })
        .filter(age => age !== null);
      
      return {
        name: year,
        'Trên 100 tuổi': projectedAges.filter(age => age > 100).length,
        '95-100 tuổi': projectedAges.filter(age => age >= 95 && age <= 100).length,
        '85-90 tuổi': projectedAges.filter(age => age >= 85 && age < 90).length,
        '80-85 tuổi': projectedAges.filter(age => age >= 80 && age < 85).length,
        '75-80 tuổi': projectedAges.filter(age => age >= 75 && age < 80).length,
        '70-75 tuổi': projectedAges.filter(age => age >= 70 && age < 75).length,
        'Dưới 70 tuổi': projectedAges.filter(age => age < 70).length,
      };
    });
  }, [elderlyData, years]);

  // Tùy chỉnh tooltip cho biểu đồ tròn
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = elderlyData.filter(e => getAgeFromDateOfBirth(e.dateOfBirth) !== null).length;
      return (
        <Paper sx={{ p: 1.5, boxShadow: 2 }}>
          <Typography variant="subtitle2">{payload[0].name}</Typography>
          <Typography variant="body2">
            Số lượng: <strong>{payload[0].value}</strong>
          </Typography>
          <Typography variant="body2">
            Tỷ lệ: <strong>{((payload[0].value / total) * 100).toFixed(1)}%</strong>
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const exportToExcel = () => {
    // Chuẩn bị dữ liệu cho excel
    const worksheetData = [
      ['BÁO CÁO THỐNG KÊ NGƯỜI CAO TUỔI', '', '', '', ''],
      [`Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}`, '', '', '', ''],
      [`Dự báo cho năm: ${selectedYear}`, '', '', '', ''],
      ['', '', '', '', ''],
      ['THỐNG KÊ TỔNG QUAN', '', '', '', ''],
      ['Tổng số người cao tuổi:', elderlyData.length, '', '', ''],
      ['', '', '', '', ''],
      ['PHÂN BỐ ĐỘ TUỔI', 'Số lượng', 'Tỷ lệ', '', ''],
      ['Trên 100 tuổi:', ageGroups[0].value, `${((ageGroups[0].value / elderlyData.length) * 100).toFixed(1)}%`, '', ''],
      ['95-100 tuổi:', ageGroups[1].value, `${((ageGroups[1].value / elderlyData.length) * 100).toFixed(1)}%`, '', ''],
      ['85-90 tuổi:', ageGroups[2].value, `${((ageGroups[2].value / elderlyData.length) * 100).toFixed(1)}%`, '', ''],
      ['80-85 tuổi:', ageGroups[3].value, `${((ageGroups[3].value / elderlyData.length) * 100).toFixed(1)}%`, '', ''],
      ['75-80 tuổi:', ageGroups[4].value, `${((ageGroups[4].value / elderlyData.length) * 100).toFixed(1)}%`, '', ''],
      ['70-75 tuổi:', ageGroups[5].value, `${((ageGroups[5].value / elderlyData.length) * 100).toFixed(1)}%`, '', ''],
      ['Dưới 70 tuổi:', ageGroups[6].value, `${((ageGroups[6].value / elderlyData.length) * 100).toFixed(1)}%`, '', ''],
      ['', '', '', '', ''],
      ['THỐNG KÊ TRẠNG THÁI', 'Số lượng', 'Tỷ lệ', '', ''],
      ['Đã mất:', deceasedData[0].value, `${((deceasedData[0].value / elderlyData.length) * 100).toFixed(1)}%`, '', ''],
      ['Còn sống:', deceasedData[1].value, `${((deceasedData[1].value / elderlyData.length) * 100).toFixed(1)}%`, '', ''],
      ['', '', '', '', ''],
      ['THỐNG KÊ GIỚI TÍNH', 'Số lượng', 'Tỷ lệ', '', ''],
      ['Nam:', genderData[0].value, `${((genderData[0].value / elderlyData.length) * 100).toFixed(1)}%`, '', ''],
      ['Nữ:', genderData[1].value, `${((genderData[1].value / elderlyData.length) * 100).toFixed(1)}%`, '', ''],
      ['', '', '', '', ''],
      ['TOP 5 NGƯỜI CAO TUỔI NHẤT', '', '', '', ''],
      ['Họ và tên', 'Tuổi hiện tại', `Tuổi năm ${selectedYear}`, 'Địa chỉ', 'Trạng thái'],
      ...oldestPeople.map(p => [
        p.name,
        p.age,
        p.projectedAge,
        p.address || '',
        p.status
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Thống kê');

    // Định dạng tiêu đề
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Tiêu đề chính
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, // Ngày xuất
      { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } }, // Năm dự báo
      { s: { r: 4, c: 0 }, e: { r: 4, c: 4 } }, // Thống kê tổng quan
      { s: { r: 7, c: 0 }, e: { r: 7, c: 4 } }, // Phân bố độ tuổi
      { s: { r: 16, c: 0 }, e: { r: 16, c: 4 } }, // Thống kê trạng thái
      { s: { r: 19, c: 0 }, e: { r: 19, c: 4 } }, // Thống kê giới tính
      { s: { r: 22, c: 0 }, e: { r: 22, c: 4 } }, // Top 5
    ];

    // Điều chỉnh độ rộng cột
    ws['!cols'] = [
      { wch: 30 }, // Họ và tên
      { wch: 15 }, // Tuổi hiện tại
      { wch: 15 }, // Tuổi năm dự báo
      { wch: 40 }, // Địa chỉ
      { wch: 15 }, // Trạng thái
    ];

    // Xuất file
    XLSX.writeFile(wb, `thong-ke-nguoi-cao-tuoi-${selectedYear}.xlsx`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Thống kê người cao tuổi
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<FileDownloadIcon />}
            onClick={exportToExcel}
          >
            Xuất Excel
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Tổng quan
              </Typography>
              <FormControl sx={{ minWidth: 120 }} size="small">
                <InputLabel id="year-select-label">Năm dự báo</InputLabel>
                <Select
                  labelId="year-select-label"
                  id="year-select"
                  value={selectedYear}
                  label="Năm dự báo"
                  onChange={handleYearChange}
                >
                  {years.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Thống kê tổng số: {elderlyData.length} người
                  </Typography>
                  <Typography variant="body2">
                    Trên 100 tuổi: {ageGroups[0].value} người ({((ageGroups[0].value / elderlyData.length) * 100).toFixed(1)}%)
                  </Typography>
                  <Typography variant="body2">
                    95-100 tuổi: {ageGroups[1].value} người ({((ageGroups[1].value / elderlyData.length) * 100).toFixed(1)}%)
                  </Typography>
                  <Typography variant="body2">
                    85-90 tuổi: {ageGroups[2].value} người ({((ageGroups[2].value / elderlyData.length) * 100).toFixed(1)}%)
                  </Typography>
                  <Typography variant="body2">
                    80-85 tuổi: {ageGroups[3].value} người ({((ageGroups[3].value / elderlyData.length) * 100).toFixed(1)}%)
                  </Typography>
                  <Typography variant="body2">
                    75-80 tuổi: {ageGroups[4].value} người ({((ageGroups[4].value / elderlyData.length) * 100).toFixed(1)}%)
                  </Typography>
                  <Typography variant="body2">
                    70-75 tuổi: {ageGroups[5].value} người ({((ageGroups[5].value / elderlyData.length) * 100).toFixed(1)}%)
                  </Typography>
                  <Typography variant="body2">
                    Dưới 70 tuổi: {ageGroups[6].value} người ({((ageGroups[6].value / elderlyData.length) * 100).toFixed(1)}%)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Trạng thái
                  </Typography>
                  <Typography variant="body2">
                    Đã mất: {deceasedData[0].value} người ({((deceasedData[0].value / elderlyData.length) * 100).toFixed(1)}%)
                  </Typography>
                  <Typography variant="body2">
                    Còn sống: {deceasedData[1].value} người ({((deceasedData[1].value / elderlyData.length) * 100).toFixed(1)}%)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Thống kê theo độ tuổi
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={ageGroups}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  outerRadius={100}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  label={false}
                >
                  {ageGroups.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend 
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ paddingLeft: 20 }}
                  payload={
                    ageGroups.map((item, index) => ({
                      id: item.name,
                      type: 'square',
                      value: `${item.name}: ${item.value} người (${((item.value / elderlyData.length) * 100).toFixed(1)}%)`,
                      color: COLORS[index % COLORS.length]
                    }))
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Thống kê trạng thái
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={deceasedData}
                  cx="50%"
                  cy="45%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {deceasedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#9e9e9e' : '#4caf50'} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top 5 người cao tuổi nhất (dự báo cho năm {selectedYear})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={oldestPeople}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 'dataMax + 5']} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={isMobile ? 80 : 120}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <RechartsTooltip 
                    formatter={(value, name, props) => {
                      const age = props.payload.projectedAge;
                      return [`${age} tuổi (${selectedYear}) - ${props.payload.status}`, 'Tuổi'];
                    }}
                  />
                  <Bar 
                    dataKey="projectedAge" 
                    fill="#8884d8" 
                    barSize={30}
                    label={{ 
                      position: 'right', 
                      formatter: (value) => `${value} tuổi`,
                      fontSize: 12
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Dự báo phân bố độ tuổi theo năm
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={projectionData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="Trên 100 tuổi" stackId="1" fill="#FF8042" stroke="#FF8042" />
                  <Area type="monotone" dataKey="95-100 tuổi" stackId="1" fill="#FFBB28" stroke="#FFBB28" />
                  <Area type="monotone" dataKey="85-90 tuổi" stackId="1" fill="#00C49F" stroke="#00C49F" />
                  <Area type="monotone" dataKey="80-85 tuổi" stackId="1" fill="#0088FE" stroke="#0088FE" />
                  <Area type="monotone" dataKey="75-80 tuổi" stackId="1" fill="#8884d8" stroke="#8884d8" />
                  <Area type="monotone" dataKey="70-75 tuổi" stackId="1" fill="#82ca9d" stroke="#82ca9d" />
                  <Area type="monotone" dataKey="Dưới 70 tuổi" stackId="1" fill="#82ca9d" stroke="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Dự báo xu hướng theo năm
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={projectionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Trên 100 tuổi" stroke="#FF8042" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="95-100 tuổi" stroke="#FFBB28" />
                  <Line type="monotone" dataKey="85-90 tuổi" stroke="#00C49F" />
                  <Line type="monotone" dataKey="80-85 tuổi" stroke="#0088FE" />
                  <Line type="monotone" dataKey="75-80 tuổi" stroke="#8884d8" />
                  <Line type="monotone" dataKey="70-75 tuổi" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="Dưới 70 tuổi" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Statistics; 