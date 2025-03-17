import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import ElderlyDetailDialog from '../components/ElderlyDetailDialog';
import { elderlyApi } from '../services/api';
import { handleApiError } from '../utils/errorHandler';
import dayjs from 'dayjs';

const getRandomColor = (name) => {
  // Tạo màu ngẫu nhiên nhưng nhất quán cho mỗi tên
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', 
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffc107', '#ff9800', '#ff5722', '#795548'
  ];
  
  // Handle null or undefined name
  if (!name) {
    return colors[0]; // Return first color as default
  }
  
  // Tạo một số từ tên để chọn màu
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  
  return colors[sum % colors.length];
};

const getInitials = (name) => {
  // Handle null or undefined name
  if (!name) {
    return 'NA'; // Return 'NA' for Not Available
  }
  
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ageFilter, setAgeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedElderly, setSelectedElderly] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [elderlyData, setElderlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await elderlyApi.getAll();
      const processedData = data.map(elder => ({
        ...elder,
        age: elder.dateOfBirth ? calculateAge(new Date(elder.dateOfBirth)) : null,
      }));
      setElderlyData(processedData);
      setError(null);
    } catch (err) {
      setError(handleApiError(err));
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getAgeGroup = (age) => {
    if (age >= 100) return { text: 'Trên 100 tuổi', color: '#c62828', bgColor: '#ffebee' };
    if (age >= 95) return { text: '95 đến 100 tuổi', color: '#d81b60', bgColor: '#fce4ec' };
    if (age >= 90) return { text: '90 đến 95 tuổi', color: '#7b1fa2', bgColor: '#f3e5f5' };
    if (age >= 85) return { text: '85 đến 90 tuổi', color: '#1565c0', bgColor: '#e3f2fd' };
    if (age >= 80) return { text: '80 đến 85 tuổi', color: '#2e7d32', bgColor: '#e8f5e9' };
    if (age >= 75) return { text: '75 đến 80 tuổi', color: '#e65100', bgColor: '#fff3e0' };
    if (age >= 70) return { text: '70 đến 75 tuổi', color: '#455a64', bgColor: '#eceff1' };
    return { text: 'Dưới 70 tuổi', color: '#757575', bgColor: '#eeeeee' };
  };

  const filteredData = useMemo(() => {
    return elderlyData.filter(elder => {
      const matchesSearch = 
        ((elder.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        (elder.address || '').toLowerCase().includes((searchTerm || '').toLowerCase()));

      let matchesAge = true;
      if (ageFilter !== 'all' && elder.age) {
        switch(ageFilter) {
          case 'over100':
            matchesAge = elder.age >= 100;
            break;
          case '95-100':
            matchesAge = elder.age >= 95 && elder.age < 100;
            break;
          case '90-95':
            matchesAge = elder.age >= 90 && elder.age < 95;
            break;
          case '85-90':
            matchesAge = elder.age >= 85 && elder.age < 90;
            break;
          case '80-85':
            matchesAge = elder.age >= 80 && elder.age < 85;
            break;
          case '75-80':
            matchesAge = elder.age >= 75 && elder.age < 80;
            break;
          case '70-75':
            matchesAge = elder.age >= 70 && elder.age < 75;
            break;
          case 'under70':
            matchesAge = elder.age < 70;
            break;
          default:
            matchesAge = true;
        }
      }

      let matchesStatus = true;
      if (statusFilter !== 'all') {
        matchesStatus = statusFilter === 'deceased' ? elder.status === 'deceased' : elder.status === 'alive';
      }

      return matchesSearch && matchesAge && matchesStatus;
    });
  }, [elderlyData, searchTerm, ageFilter, statusFilter]);

  const handleCardClick = (elderly) => {
    setSelectedElderly(elderly);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedElderly(null);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleReset = () => {
    setSearchTerm('');
    setAgeFilter('all');
    setStatusFilter('all');
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
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()} 
          sx={{ mt: 2 }}
        >
          Tải lại trang
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Danh sách người cao tuổi
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Độ tuổi</InputLabel>
              <Select
                value={ageFilter}
                label="Độ tuổi"
                onChange={(e) => setAgeFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="over100">Trên 100 tuổi</MenuItem>
                <MenuItem value="95-100">95 đến 100 tuổi</MenuItem>
                <MenuItem value="90-95">90 đến 95 tuổi</MenuItem>
                <MenuItem value="85-90">85 đến 90 tuổi</MenuItem>
                <MenuItem value="80-85">80 đến 85 tuổi</MenuItem>
                <MenuItem value="75-80">75 đến 80 tuổi</MenuItem>
                <MenuItem value="70-75">70 đến 75 tuổi</MenuItem>
                <MenuItem value="under70">Dưới 70 tuổi</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="alive">Còn sống</MenuItem>
                <MenuItem value="deceased">Đã mất</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm="auto">
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              size="small"
              sx={{ height: '40px' }}
            >
              Đặt lại
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <Typography variant="subtitle1" gutterBottom>
        Hiển thị {filteredData.length} người cao tuổi
      </Typography>
      
      <Grid container spacing={2}>
        {filteredData.map((elderly) => {
          const ageGroup = getAgeGroup(elderly.age || 0);
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={elderly.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  opacity: elderly.status === 'deceased' ? 0.8 : 1,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => handleCardClick(elderly)}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        position: 'relative',
                        width: 70,
                        height: 98, // 70mm x 98mm ratio for photos
                        backgroundColor: elderly.photoUrl ? 'transparent' : getRandomColor(elderly.name),
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: elderly.status === 'deceased' ? 0.6 : 1
                      }}
                    >
                      {elderly.photoUrl ? (
                        <img
                          src={`http://localhost:5000${elderly.photoUrl}`}
                          alt={elderly.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(elderly.name)}&background=${getRandomColor(elderly.name).substring(1)}&color=fff`;
                          }}
                        />
                      ) : (
                        <Typography
                          sx={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: 'white',
                            userSelect: 'none',
                          }}
                        >
                          {getInitials(elderly.name)}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ ml: 2, flex: 1, overflow: 'hidden' }}>
                      <Typography 
                        variant="subtitle1" 
                        component="h3" 
                        sx={{ 
                          mb: 0.5,
                          textDecoration: elderly.status === 'deceased' ? 'line-through' : 'none',
                          color: elderly.status === 'deceased' ? 'text.secondary' : 'text.primary',
                          fontStyle: elderly.status === 'deceased' ? 'italic' : 'normal',
                          fontWeight: 'medium',
                        }}
                      >
                        {elderly.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {elderly.dateOfBirth ? dayjs(elderly.dateOfBirth).format('DD/MM/YYYY') : ''} 
                        {elderly.dateOfBirth && elderly.age ? ' - ' : ''}
                        {elderly.age ? `${elderly.age} tuổi` : ''}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          fontStyle: elderly.status === 'deceased' ? 'italic' : 'normal',
                          mb: 1,
                        }}
                      >
                        {elderly.address}
                      </Typography>

                      <Chip
                        label={getAgeGroup(elderly.age || 0).text}
                        size="small"
                        sx={{
                          backgroundColor: getAgeGroup(elderly.age || 0).bgColor,
                          color: getAgeGroup(elderly.age || 0).color,
                          fontWeight: 'medium',
                        }}
                      />
                    </Box>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      
      {filteredData.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy người cao tuổi nào phù hợp với điều kiện tìm kiếm
          </Typography>
        </Box>
      )}
      
      <ElderlyDetailDialog
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
        elderly={selectedElderly}
        onRefresh={handleRefresh}
      />
    </Box>
  );
};

export default Home; 