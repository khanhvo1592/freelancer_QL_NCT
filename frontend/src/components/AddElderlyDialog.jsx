import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Avatar
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import viLocale from 'date-fns/locale/vi';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { format, isValid } from 'date-fns';
import { elderlyApi } from '../services/api';

const AddElderlyDialog = ({ open, onClose, onAdd }) => {
  const today = new Date();
  const [newElderly, setNewElderly] = useState({
    name: '',
    dateOfBirth: null,
    hometown: '',
    gender: 'Nam',
    address: '',
    phone: '',
    joinDate: null,
    cardNumber: '',
    cardIssueDate: null,
    status: 'alive',
    deathDate: null
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewElderly({
      ...newElderly,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleDateChange = (name, date) => {
    if (date && isValid(date)) {
      setNewElderly({
        ...newElderly,
        [name]: format(date, 'yyyy-MM-dd')
      });
    } else {
      setNewElderly({
        ...newElderly,
        [name]: null
      });
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!newElderly.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ và tên';
    }
    
    if (!newElderly.dateOfBirth) {
      newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
    }
    
    if (!newElderly.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ thường trú';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        const formData = new FormData();
        
        // Required fields
        formData.append('name', newElderly.name.trim());
        formData.append('dateOfBirth', newElderly.dateOfBirth);
        formData.append('gender', newElderly.gender);
        formData.append('address', newElderly.address.trim());
        formData.append('status', newElderly.status);

        // Optional fields
        if (newElderly.hometown?.trim()) {
          formData.append('hometown', newElderly.hometown.trim());
        }
        if (newElderly.phone?.trim()) {
          formData.append('phone', newElderly.phone.trim());
        }
        if (newElderly.cardNumber?.trim()) {
          formData.append('cardNumber', newElderly.cardNumber.trim());
        }

        // Date fields
        if (newElderly.joinDate) {
          formData.append('joinDate', newElderly.joinDate);
        }
        if (newElderly.cardIssueDate) {
          formData.append('cardIssueDate', newElderly.cardIssueDate);
        }
        if (newElderly.status === 'deceased' && newElderly.deathDate) {
          formData.append('deathDate', newElderly.deathDate);
        }

        // Photo file
        if (photoFile) {
          formData.append('photo', photoFile);
        }

        const response = await elderlyApi.create(formData);
        
        if (response && response.id) {
          onAdd(response);
          onClose();
        } else {
          throw new Error('Thêm mới không thành công');
        }
      } catch (err) {
        console.error('Error creating elderly:', err);
        alert(err.message || 'Lỗi khi thêm mới');
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Thêm người cao tuổi mới</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={avatarPreview}
                sx={{ width: 120, height: 120, border: '1px solid #eee' }}
              />
              <input
                accept="image/*"
                id="avatar-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload">
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
          </Box>

          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Thông tin cơ bản
          </Typography>
          
          <TextField
            fullWidth
            label="Họ và tên"
            name="name"
            value={newElderly.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
            <DatePicker
              label="Ngày sinh"
              value={newElderly.dateOfBirth ? new Date(newElderly.dateOfBirth) : null}
              onChange={(date) => handleDateChange('dateOfBirth', date)}
              maxDate={today}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: !!errors.dateOfBirth,
                  helperText: errors.dateOfBirth
                }
              }}
            />
          </LocalizationProvider>

          <TextField
            fullWidth
            label="Quê quán"
            name="hometown"
            value={newElderly.hometown}
            onChange={handleChange}
          />

          <FormControl fullWidth>
            <InputLabel>Giới tính</InputLabel>
            <Select
              name="gender"
              value={newElderly.gender}
              onChange={handleChange}
              label="Giới tính"
            >
              <MenuItem value="Nam">Nam</MenuItem>
              <MenuItem value="Nữ">Nữ</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Địa chỉ thường trú"
            name="address"
            value={newElderly.address}
            onChange={handleChange}
            error={!!errors.address}
            helperText={errors.address}
            required
            multiline
            rows={2}
          />
          
          <TextField
            fullWidth
            label="Số điện thoại"
            name="phone"
            value={newElderly.phone}
            onChange={handleChange}
          />

          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, mt: 2 }}>
            Thông tin bổ sung
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              name="status"
              value={newElderly.status}
              onChange={handleChange}
              label="Trạng thái"
            >
              <MenuItem value="alive">Còn sống</MenuItem>
              <MenuItem value="deceased">Đã mất</MenuItem>
            </Select>
          </FormControl>

          {newElderly.status === 'deceased' && (
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
              <DatePicker
                label="Ngày mất"
                value={newElderly.deathDate ? new Date(newElderly.deathDate) : null}
                onChange={(date) => handleDateChange('deathDate', date)}
                maxDate={today}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </LocalizationProvider>
          )}

          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, mt: 2 }}>
            Thông tin Hội Người cao tuổi
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
            <DatePicker
              label="Ngày tham gia"
              value={newElderly.joinDate ? new Date(newElderly.joinDate) : null}
              onChange={(date) => handleDateChange('joinDate', date)}
              maxDate={today}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true
                }
              }}
            />
          </LocalizationProvider>

          <TextField
            fullWidth
            label="Số thẻ"
            name="cardNumber"
            value={newElderly.cardNumber}
            onChange={handleChange}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
            <DatePicker
              label="Ngày cấp thẻ"
              value={newElderly.cardIssueDate ? new Date(newElderly.cardIssueDate) : null}
              onChange={(date) => handleDateChange('cardIssueDate', date)}
              maxDate={today}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true
                }
              }}
            />
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Thêm mới
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddElderlyDialog; 