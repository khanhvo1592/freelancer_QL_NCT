import React, { useState, useEffect } from 'react';
import { elderlyApi } from '../services/api';
import { handleApiError } from '../utils/errorHandler';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Grid,
  Stack,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import dayjs from 'dayjs';

const ElderlyList = () => {
  const [elderlyData, setElderlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchElderlyData = async () => {
    try {
      setLoading(true);
      const data = await elderlyApi.getAll();
      setElderlyData(data);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElderlyData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa không?')) {
      try {
        await elderlyApi.delete(id);
        await fetchElderlyData(); // Refresh list after deletion
      } catch (err) {
        const errorMessage = handleApiError(err);
        alert(errorMessage);
      }
    }
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
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Họ và tên</TableCell>
              <TableCell>Tuổi</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {elderlyData.map((elderly) => (
              <TableRow key={elderly.id}>
                <TableCell>{elderly.name}</TableCell>
                <TableCell>{dayjs().diff(dayjs(elderly.birthDate), 'year')}</TableCell>
                <TableCell>{elderly.address}</TableCell>
                <TableCell>{elderly.phone}</TableCell>
                <TableCell>
                  {elderly.deceased ? (
                    <Typography color="error">Đã mất</Typography>
                  ) : (
                    <Typography color="success.main">Còn sống</Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleView(elderly)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton onClick={() => handleEdit(elderly)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handlePrint(elderly)}>
                    <PrintIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(elderly.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ElderlyList; 