import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  TextField,
  IconButton,
  FormControlLabel,
  Switch,
  Chip,
  Avatar
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import CakeIcon from '@mui/icons-material/Cake';
import HomeIcon from '@mui/icons-material/Home';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import EventIcon from '@mui/icons-material/Event';
import WcIcon from '@mui/icons-material/Wc';
import ElderlyPrintForm from './ElderlyPrintForm';
import { elderlyApi } from '../services/api';
import viLocale from 'date-fns/locale/vi';

const defaultAvatarUrl = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
};

const ElderlyDetailDialog = ({ open, onClose, elderly, onRefresh, defaultEditing = false }) => {
  const [isEditing, setIsEditing] = useState(defaultEditing);
  const [editedData, setEditedData] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [openPrintForm, setOpenPrintForm] = useState(false);

  useEffect(() => {
    if (elderly) {
      setEditedData({
        ...elderly,
        dateOfBirth: elderly.dateOfBirth ? dayjs(elderly.dateOfBirth) : null,
        deceasedDate: elderly.deceasedDate ? dayjs(elderly.deceasedDate) : null,
        joinDate: elderly.joinDate ? dayjs(elderly.joinDate) : null,
        cardIssueDate: elderly.cardIssueDate ? dayjs(elderly.cardIssueDate) : null
      });
      setAvatarPreview(elderly.photoUrl ? `http://localhost:5000${elderly.photoUrl}` : null);
    }
  }, [elderly]);

  useEffect(() => {
    if (open) {
      setIsEditing(defaultEditing);
    }
  }, [open, defaultEditing]);

  if (!elderly || !editedData) return null;

  const getAgeGroup = (age) => {
    if (age >= 80) return { text: 'Trên 80 tuổi', color: '#c62828', bgColor: '#ffebee' };
    if (age >= 75) return { text: '75-80 tuổi', color: '#d81b60', bgColor: '#fce4ec' };
    if (age >= 70) return { text: '70-75 tuổi', color: '#7b1fa2', bgColor: '#f3e5f5' };
    if (age >= 65) return { text: '65-70 tuổi', color: '#1565c0', bgColor: '#e3f2fd' };
    if (age >= 60) return { text: '60-65 tuổi', color: '#2e7d32', bgColor: '#e8f5e9' };
    return { text: 'Dưới 60 tuổi', color: '#e65100', bgColor: '#fff3e0' };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setEditedData(prev => ({
          ...prev,
          photoFile: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      
      // Cập nhật thông tin cơ bản
      const basicInfo = {
        name: editedData.name,
        dateOfBirth: editedData.dateOfBirth ? editedData.dateOfBirth.format('YYYY-MM-DD') : null,
        hometown: editedData.hometown,
        gender: editedData.gender,
        address: editedData.address,
        phone: editedData.phone,
        cardNumber: editedData.cardNumber,
        joinDate: editedData.joinDate ? editedData.joinDate.format('YYYY-MM-DD') : null,
        cardIssueDate: editedData.cardIssueDate ? editedData.cardIssueDate.format('YYYY-MM-DD') : null,
        status: editedData.status,
        deceasedDate: editedData.deceasedDate ? editedData.deceasedDate.format('YYYY-MM-DD') : null
      };

      Object.keys(basicInfo).forEach(key => {
        if (basicInfo[key] !== null && basicInfo[key] !== undefined) {
          formData.append(key, basicInfo[key]);
        }
      });

      // Cập nhật ảnh nếu có
      if (editedData.photoFile) {
        formData.append('photo', editedData.photoFile);
      } else if (elderly.photoUrl) {
        formData.append('photoUrl', elderly.photoUrl);
      }

      const response = await elderlyApi.update(elderly.id, formData);
      
      if (onRefresh) {
        onRefresh();
      }
      setIsEditing(false);
      onClose();
    } catch (err) {
      console.error('Error updating elderly:', err);
      alert(err.response?.data?.error || 'Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  const handlePrint = () => {
    setOpenPrintForm(true);
  };

  const handleClosePrintForm = () => {
    setOpenPrintForm(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {isEditing ? 'Chỉnh sửa thông tin' : 'Thông tin chi tiết'}
            </Typography>
            <Box>
              {!isEditing && (
                <>
                  <IconButton onClick={handlePrint} color="primary" sx={{ mr: 1 }}>
                    <PrintIcon />
                  </IconButton>
                  <IconButton onClick={() => setIsEditing(true)}>
                    <EditIcon />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {isEditing ? (
            <Box component="form" noValidate autoComplete="off" sx={{ p: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} display="flex" justifyContent="center" mb={2}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={avatarPreview || defaultAvatarUrl}
                      sx={{ width: 120, height: 120, border: '1px solid #eee' }}
                    />
                    <input
                      accept="image/*"
                      id="avatar-upload-edit"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handleAvatarChange}
                    />
                    <label htmlFor="avatar-upload-edit">
                      <IconButton
                        component="span"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          },
                        }}
                      >
                        <AddPhotoAlternateIcon />
                      </IconButton>
                    </label>
                  </Box>
                </Grid>
                
                {/* Thông tin cơ bản */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Thông tin cơ bản
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    name="name"
                    value={editedData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quê quán"
                    name="hometown"
                    value={editedData.hometown || ''} 
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={viLocale}>
                    <DatePicker
                      label="Ngày sinh"
                      value={editedData.dateOfBirth}
                      onChange={(newValue) => handleDateChange('dateOfBirth', newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth required />}
                      format="DD/MM/YYYY"
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Giới tính"
                    name="gender"
                    value={editedData.gender || ''}
                    onChange={handleInputChange}
                    select
                    SelectProps={{
                      native: true
                    }}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WcIcon color="action" />
                    <Typography>
                      Giới tính: {editedData.gender || 'Chưa cập nhật'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <LocationOnIcon color="action" />
                    <Typography sx={{ flex: 1 }}>
                      Quê quán: {editedData.hometown || 'Chưa cập nhật'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Địa chỉ thường trú"
                    name="address"
                    value={editedData.address || ''}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phone"
                    value={editedData.phone || ''}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                {/* Thông tin Hội NCT */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Thông tin Hội Người cao tuổi
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Ngày tham gia hội NCT"
                      value={editedData.joinDate}
                      onChange={(date) => handleDateChange('joinDate', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số thẻ"
                    name="cardNumber"
                    value={editedData.cardNumber || ''}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Ngày cấp thẻ"
                      value={editedData.cardIssueDate}
                      onChange={(date) => handleDateChange('cardIssueDate', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                {/* Trạng thái */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Trạng thái
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editedData.status === 'deceased'}
                        onChange={(e) => setEditedData(prev => ({
                          ...prev,
                          status: e.target.checked ? 'deceased' : 'alive'
                        }))}
                      />
                    }
                    label={editedData.status === 'deceased' ? "Đã mất" : "Còn sống"}
                  />
                </Grid>
                
                {editedData.status === 'deceased' && (
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Ngày mất"
                        value={editedData.deceasedDate}
                        onChange={(date) => handleDateChange('deceasedDate', date)}
                        slotProps={{
                          textField: {
                            fullWidth: true
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                )}
              </Grid>
            </Box>
          ) : (
            <Box sx={{ p: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 300,
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        display: 'block',
                        paddingTop: '140%',
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={avatarPreview || defaultAvatarUrl}
                      alt={elderly.name}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultAvatarUrl;
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h5" component="div" sx={{ 
                        fontWeight: 500,
                        color: elderly.status === 'deceased' ? 'text.secondary' : 'text.primary',
                        textDecoration: elderly.status === 'deceased' ? 'line-through' : 'none',
                        fontStyle: elderly.status === 'deceased' ? 'italic' : 'normal',
                      }}>
                        {elderly.name}
                      </Typography>
                      {elderly.status === 'deceased' && (
                        <Chip 
                          label="Đã mất" 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(0, 0, 0, 0.08)',
                            color: 'text.secondary'
                          }} 
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CakeIcon color="action" />
                      <Typography>
                        Ngày sinh: {editedData.dateOfBirth ? dayjs(editedData.dateOfBirth).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WcIcon color="action" />
                      <Typography>
                        Giới tính: {editedData.gender || 'Chưa cập nhật'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <LocationOnIcon color="action" />
                      <Typography sx={{ flex: 1 }}>
                        Quê quán: {editedData.hometown || 'Chưa cập nhật'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <HomeIcon color="action" />
                      <Typography sx={{ flex: 1 }}>
                        Địa chỉ thường trú: {editedData.address || 'Chưa cập nhật'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ContactPhoneIcon color="action" />
                      <Typography>
                        Số điện thoại: {editedData.phone || 'Chưa cập nhật'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventIcon color="action" />
                      <Typography>
                        Ngày tham gia hội NCT: {editedData.joinDate ? dayjs(editedData.joinDate).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CardMembershipIcon color="action" />
                      <Typography>
                        Số thẻ: {editedData.cardNumber || 'Chưa cập nhật'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventIcon color="action" />
                      <Typography>
                        Ngày cấp thẻ: {editedData.cardIssueDate ? dayjs(editedData.cardIssueDate).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                      </Typography>
                    </Box>

                    {elderly.age && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          Tuổi hiện tại: 
                          <Chip
                            label={`${elderly.age} tuổi`}
                            size="small"
                            sx={{
                              bgcolor: elderly.status === 'deceased' ? 'rgba(0, 0, 0, 0.08)' : getAgeGroup(elderly.age).bgColor,
                              color: elderly.status === 'deceased' ? 'text.secondary' : getAgeGroup(elderly.age).color,
                              fontWeight: 'medium',
                            }}
                          />
                        </Typography>
                      </Box>
                    )}

                    {elderly.status === 'deceased' && editedData.deceasedDate && (
                      <Box sx={{ 
                        mt: 2, 
                        p: 2, 
                        bgcolor: 'rgba(0, 0, 0, 0.04)', 
                        borderRadius: 1,
                        border: '1px solid rgba(0, 0, 0, 0.12)'
                      }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Thông tin mất
                        </Typography>
                        <Typography>
                          Ngày mất: {dayjs(editedData.deceasedDate).format('DD/MM/YYYY')}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)}>Hủy</Button>
              <Button onClick={handleSave} variant="contained">Lưu</Button>
            </>
          ) : (
            <>
              <Button onClick={onClose}>Đóng</Button>
              <Button 
                onClick={handlePrint} 
                variant="contained" 
                startIcon={<PrintIcon />}
                color="primary"
              >
                In phiếu
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <ElderlyPrintForm
        open={openPrintForm}
        onClose={handleClosePrintForm}
        elderly={elderly}
      />
    </>
  );
};

export default ElderlyDetailDialog; 