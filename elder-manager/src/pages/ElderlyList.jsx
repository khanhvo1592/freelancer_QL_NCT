import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  Typography,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tooltip,
  IconButton,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ElderlyTable from '../components/ElderlyTable';
import PrintReport from '../components/PrintReport';
import PeopleIcon from '@mui/icons-material/People';
import ElderlyIcon from '@mui/icons-material/Elderly';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import ExportExcel from '../components/ExportExcel';
import AddElderlyDialog from '../components/AddElderlyDialog';
import { elderlyApi } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

const ElderlyList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ageFilter, setAgeFilter] = useState('all');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elderlyData, setElderlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await elderlyApi.getAll();
      setElderlyData(data);
      setError(null);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cập nhật thời gian hiện tại mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  // Tạo danh sách năm từ 2025 đến 2030
  const years = Array.from(
    { length: 6 }, 
    (_, i) => 2025 + i
  );

  const filteredData = useMemo(() => {
    return elderlyData.map(elder => {
      // Calculate age from dateOfBirth
      const birthDate = new Date(elder.dateOfBirth);
      const currentYear = new Date().getFullYear();
      const currentAge = currentYear - birthDate.getFullYear();
      const ageDiff = selectedYear - currentYear;
      const projectedAge = currentAge + ageDiff;

      return {
        ...elder,
        age: currentAge,
        projectedAge
      };
    }).filter(elder => {
      const matchesSearch = 
        ((elder.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        (elder.address || '').toLowerCase().includes((searchTerm || '').toLowerCase()));

      let matchesAge = true;
      if (ageFilter !== 'all') {
        if (ageFilter === 'under70') {
          matchesAge = elder.projectedAge < 70;
        } else {
          const targetAge = parseInt(ageFilter, 10);
          matchesAge = elder.projectedAge === targetAge;
        }
      }

      return matchesSearch && matchesAge;
    });
  }, [elderlyData, searchTerm, ageFilter, selectedYear]);

  // Update stats calculation
  const stats = useMemo(() => ({
    total: elderlyData.length,
    age75: filteredData.filter(e => e.projectedAge === 75).length,
    age70: filteredData.filter(e => e.projectedAge === 70).length,
  }), [filteredData]);

  const handleAddNew = () => {
    setOpenAddDialog(true);
  };

  const handleRefresh = async () => {
    setSearchTerm('');
    setAgeFilter('all');
    await fetchData();
  };

  const handleAddElderly = async (newElderly) => {
    await fetchData(); // Refresh the list after adding
    setOpenAddDialog(false);
  };

  // Format thời gian
  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Format ngày tháng
  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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
      <Typography variant="h5" component="h1" gutterBottom>
        Danh sách người cao tuổi
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <PeopleAltIcon color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Tổng số người cao tuổi</Typography>
                <Typography variant="h4">{elderlyData.length}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <AccessTimeIcon color="secondary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Thời gian hiện tại</Typography>
                <Typography variant="h5">{formatTime(currentTime)}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CalendarMonthIcon color="success" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Ngày hiện tại</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'normal' }}>{formatDate(currentTime)}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm theo tên, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Độ tuổi</InputLabel>
              <Select
                value={ageFilter}
                label="Độ tuổi"
                onChange={(e) => setAgeFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="100">100 tuổi</MenuItem>
                <MenuItem value="95">95 tuổi</MenuItem>
                <MenuItem value="90">90 tuổi</MenuItem>
                <MenuItem value="85">85 tuổi</MenuItem>
                <MenuItem value="80">80 tuổi</MenuItem>
                <MenuItem value="75">75 tuổi</MenuItem>
                <MenuItem value="under70">Dưới 70 tuổi</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Năm dự báo</InputLabel>
              <Select
                value={selectedYear}
                label="Năm dự báo"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              fullWidth
              size="small"
              sx={{ height: '40px' }}
            >
              Đặt lại
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={1.5}>
            <ExportExcel data={filteredData} selectedYear={selectedYear} />
          </Grid>
          
          <Grid item xs={12} sm={6} md={1.5}>
            <PrintReport 
              data={filteredData}
              selectedYear={selectedYear}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={1.5}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              fullWidth
              size="small"
              sx={{ height: '40px' }}
            >
              Thêm mới
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper 
        sx={{ 
          height: 'calc(100vh - 350px)', 
          width: '100%', 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          '& .MuiDataGrid-root': {
            border: 'none',
            '& .MuiDataGrid-virtualScroller': {
              overflow: 'auto !important',
              '&:focus': {
                outline: 'none',
              },
            },
          },
        }}
        tabIndex={-1}
      >
        <Box sx={{ flex: 1, width: '100%', height: '100%', overflow: 'hidden' }}>
          <ElderlyTable 
            data={filteredData} 
            selectedYear={selectedYear}
            onRefresh={fetchData}
          />
        </Box>
      </Paper>
      
      <AddElderlyDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onAdd={handleAddElderly}
      />
    </Box>
  );
};

export default ElderlyList; 