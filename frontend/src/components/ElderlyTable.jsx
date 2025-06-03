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

// Safe way to access electron
const ipcRenderer = window.electron?.ipcRenderer;

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

  const handlePrint = async (elderly) => {
    try {
      await ipcRenderer.invoke('print-elderly-info', elderly);
    } catch (error) {
      console.error('Lỗi khi in:', error);
    }
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
      field: 'id',
      headerName: 'STT',
      width: 70,
      flex: 0,
      renderCell: (params) => {
        const index = data.findIndex(item => item.id === params.row.id);
        return index + 1;
      },
    },
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
      sortable: true,
      sortComparator: (v1, v2, param1, param2) => {
        // Lấy tên cuối cùng để so sánh
        const lastName1 = getLastName(v1);
        const lastName2 = getLastName(v2);
        
        // So sánh theo tiếng Việt
        return param1.sortDirection === 'asc' 
          ? lastName1.localeCompare(lastName2, 'vi')
          : lastName2.localeCompare(lastName1, 'vi');
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
        <Tooltip title={params.value || ''} placement="top">
          <Typography sx={{ whiteSpace: 'normal', lineHeight: 1.2 }}>
            {params.value}
          </Typography>
        </Tooltip>
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
        pageSize={20}
        rowsPerPageOptions={[10, 20, 50, 100]}
        disableSelectionOnClick
        sx={{
          height: 'calc(100vh - 200px)',
          minHeight: '600px',
          '& .MuiDataGrid-row': {
            '&:nth-of-type(odd)': {
              backgroundColor: 'action.hover',
            },
            minHeight: '52px !important',
          },
          '& .MuiDataGrid-cell': {
            whiteSpace: 'nowrap',
            padding: '8px 16px',
          },
          '& .MuiDataGrid-virtualScroller': {
            overflow: 'auto',
            marginBottom: '20px',
            minHeight: '400px',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
          },
          '& .MuiDataGrid-virtualScrollerContent': {
            height: '100% !important',
            overflow: 'visible !important',
            minHeight: '100%',
            paddingBottom: '150px',
          },
          '& .MuiDataGrid-footerContainer': {
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'background.paper',
            zIndex: 1,
            borderTop: '1px solid rgba(224, 224, 224, 1)',
            boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.1)',
          },
          '& .MuiDataGrid-main': {
            overflow: 'visible',
            position: 'relative',
            paddingBottom: '100px',
          },
          '& .MuiDataGrid-root': {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
          '& .MuiDataGrid-columnHeaders': {
            position: 'sticky',
            top: 0,
            backgroundColor: 'background.paper',
            zIndex: 1,
            minHeight: '52px !important',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
          '& .MuiDataGrid-columnHeader': {
            padding: '8px 16px',
          },
          '& .MuiDataGrid-footerContainer': {
            minHeight: '52px',
            borderTop: '1px solid rgba(224, 224, 224, 1)',
          },
          '& .MuiDataGrid-virtualScrollerRenderZone': {
            transform: 'none !important',
          },
        }}
        components={{
          Toolbar: CustomToolbar,
        }}
        density="standard"
        autoHeight={false}
        getRowHeight={() => 52}
        componentsProps={{
          footer: {
            sx: {
              borderTop: '1px solid rgba(224, 224, 224, 1)',
              minHeight: '52px',
            },
          },
        }}
        disableColumnMenu
        disableColumnFilter
        disableColumnSelector
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