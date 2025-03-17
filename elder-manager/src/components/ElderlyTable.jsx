import React, { useState } from 'react';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Avatar,
  Select,
  MenuItem,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import viLocale from 'date-fns/locale/vi';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import dayjs from 'dayjs';
import ElderlyDetailDialog from './ElderlyDetailDialog';
import ElderlyPrintForm from './ElderlyPrintForm';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { elderlyApi } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

const ElderlyTable = ({ data, selectedYear = new Date().getFullYear(), onRefresh }) => {
  const [selectedElderly, setSelectedElderly] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openPrintForm, setOpenPrintForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleView = (elderly) => {
    setSelectedElderly(elderly);
    setIsEditing(false);
    setOpenDetailDialog(true);
  };

  const handleEdit = (elderly) => {
    setSelectedElderly(elderly);
    setIsEditing(true);
    setOpenDetailDialog(true);
  };

  const handlePrint = (elderly) => {
    setSelectedElderly(elderly);
    setOpenPrintForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người cao tuổi này?')) {
      try {
        await elderlyApi.delete(id);
        onRefresh();
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDetailDialog(false);
    setSelectedElderly(null);
    setIsEditing(false);
  };

  const handleClosePrintForm = () => {
    setOpenPrintForm(false);
    setSelectedElderly(null);
  };

  const getAgeFromDateOfBirth = (dateOfBirth, year = new Date().getFullYear()) => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const birthYear = birthDate.getFullYear();
    const birthMonth = birthDate.getMonth();
    const birthDay = birthDate.getDate();
    
    let age = year - birthYear;
    
    // Kiểm tra xem đã đến ngày sinh trong năm dự báo chưa
    const hasHadBirthday = new Date(year, birthMonth, birthDay) <= new Date(year, 11, 31);
    if (!hasHadBirthday) {
      age--;
    }
    
    return age;
  };

  const getLastName = (fullName) => {
    if (!fullName) return '';
    const nameParts = fullName.trim().split(' ');
    return nameParts[nameParts.length - 1];
  };

  const columns = [
    {
      field: 'photoUrl',
      headerName: 'Ảnh',
      width: 80,
      flex: 0,
      renderCell: (params) => (
        <Avatar
          src={params.row.photoUrl ? `http://localhost:5000${params.row.photoUrl}` : null}
          sx={{ width: 40, height: 40 }}
        />
      ),
    },
    { 
      field: 'name', 
      headerName: 'Họ và tên', 
      flex: 1,
      minWidth: 200,
      sortComparator: (v1, v2) => {
        const lastName1 = getLastName(v1);
        const lastName2 = getLastName(v2);
        return lastName1.localeCompare(lastName2, 'vi');
      },
      renderCell: (params) => (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
              color: 'primary.main'
            }
          }}
          onClick={() => handleView(params.row)}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: params.row.status === 'alive' ? 'success.main' : 'error.main',
            }}
          />
          <Typography noWrap>{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'dateOfBirth',
      headerName: 'Ngày sinh',
      width: 120,
      flex: 0,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return dayjs(params.value).format('DD/MM/YYYY');
      },
    },
    {
      field: 'age',
      headerName: 'Tuổi',
      width: 120,
      flex: 0,
      renderCell: (params) => {
        const currentAge = getAgeFromDateOfBirth(params.row.dateOfBirth);
        const projectedAge = getAgeFromDateOfBirth(params.row.dateOfBirth, selectedYear);
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2">{currentAge} tuổi</Typography>
            <Typography variant="caption" color="text.secondary">
              ({projectedAge} tuổi - {selectedYear})
            </Typography>
          </Box>
        );
      },
    },
    { 
      field: 'gender', 
      headerName: 'Giới tính', 
      width: 100,
      flex: 0 
    },
    { 
      field: 'address', 
      headerName: 'Địa chỉ', 
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography noWrap>{params.value}</Typography>
      )
    },
    { 
      field: 'phone', 
      headerName: 'Số điện thoại', 
      width: 130,
      flex: 0 
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Thao tác',
      width: 100,
      flex: 0,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Sửa"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<PrintIcon />}
          label="In"
          onClick={() => handlePrint(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Xóa"
          onClick={() => handleDelete(params.row.id)}
        />,
      ],
    },
  ];

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
    </GridToolbarContainer>
  );

  return (
    <>
      <DataGrid
        rows={data}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        disableSelectionOnClick
        autoHeight
        disableExtendRowFullWidth
        initialState={{
          sorting: {
            sortModel: [{ field: 'name', sort: 'asc' }],
          },
        }}
        components={{
          Toolbar: CustomToolbar,
        }}
        sx={{
          '& .MuiDataGrid-row': {
            '&:nth-of-type(odd)': {
              backgroundColor: 'action.hover',
            },
          },
          '& .MuiDataGrid-cell': {
            whiteSpace: 'nowrap',
          },
        }}
      />

      <ElderlyDetailDialog
        open={openDetailDialog}
        onClose={handleCloseDialog}
        elderly={selectedElderly}
        onRefresh={onRefresh}
        defaultEditing={isEditing}
      />

      <ElderlyPrintForm
        open={openPrintForm}
        onClose={handleClosePrintForm}
        elderly={selectedElderly}
      />
    </>
  );
};

export default ElderlyTable; 