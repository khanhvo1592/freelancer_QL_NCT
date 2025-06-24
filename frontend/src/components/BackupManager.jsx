import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Paper
} from '@mui/material';
import {
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Folder as FolderIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { api } from '../services/api';

const BackupManager = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [customBackupPath, setCustomBackupPath] = useState('');
  const [backupType, setBackupType] = useState('full');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Kiểm tra xem có đang chạy trong Electron không
    setIsElectron(window.electronAPI !== undefined);
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      if (isElectron) {
        // Sử dụng IPC nếu đang chạy trong Electron
        const electronBackups = await window.electronAPI.getBackupList();
        setBackups(electronBackups);
      } else {
        // Sử dụng API nếu đang chạy trên web
        const response = await api.get('/backups/list');
        setBackups(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể tải danh sách backup' });
    } finally {
      setLoading(false);
    }
  };

  const selectBackupDirectory = async () => {
    if (isElectron) {
      const selectedPath = await window.electronAPI.selectBackupDirectory();
      if (selectedPath) {
        setCustomBackupPath(selectedPath);
      }
    }
  };

  const selectBackupFile = async () => {
    if (isElectron) {
      const selectedPath = await window.electronAPI.selectBackupFile();
      if (selectedPath) {
        // Xử lý file backup được chọn
        setSelectedBackup({
          name: 'File được chọn',
          path: selectedPath,
          type: 'file',
          date: new Date().toISOString()
        });
        setRestoreDialogOpen(true);
      }
    }
  };

  const selectBackupFolder = async () => {
    if (isElectron) {
      const selectedPath = await window.electronAPI.selectBackupFolder();
      if (selectedPath) {
        // Xử lý thư mục backup được chọn
        setSelectedBackup({
          name: 'Thư mục được chọn',
          path: selectedPath,
          type: 'folder',
          date: new Date().toISOString()
        });
        setRestoreDialogOpen(true);
      }
    }
  };

  const createBackup = async () => {
    try {
      setLoading(true);
      if (isElectron) {
        // Sử dụng IPC cho Electron
        const result = await window.electronAPI.createBackup({
          type: backupType,
          customPath: customBackupPath || undefined
        });
        setMessage({ type: 'success', text: 'Tạo backup thành công!' });
      } else {
        // Sử dụng API cho web
        const response = await api.post('/backups/create', {
          type: backupType,
          customPath: customBackupPath || undefined
        });
        setMessage({ type: 'success', text: 'Tạo backup thành công!' });
      }
      
      setBackupDialogOpen(false);
      setCustomBackupPath('');
      loadBackups();
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi khi tạo backup' });
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async () => {
    if (!selectedBackup) return;
    
    try {
      setLoading(true);
      if (isElectron) {
        // Sử dụng IPC cho Electron
        const result = await window.electronAPI.restoreBackup(selectedBackup.path);
        setMessage({ type: 'success', text: 'Khôi phục backup thành công!' });
      } else {
        // Sử dụng API cho web
        const response = await api.post('/backups/restore', {
          backupPath: selectedBackup.path
        });
        setMessage({ type: 'success', text: 'Khôi phục backup thành công!' });
      }
      
      setRestoreDialogOpen(false);
      setSelectedBackup(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi khi khôi phục backup' });
    } finally {
      setLoading(false);
    }
  };

  const deleteBackup = async (backupPath) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa backup này?')) return;
    
    try {
      setLoading(true);
      if (isElectron) {
        // Sử dụng IPC cho Electron
        await window.electronAPI.deleteBackup(backupPath);
        setMessage({ type: 'success', text: 'Xóa backup thành công!' });
      } else {
        // Sử dụng API cho web
        await api.delete(`/backups/delete`, { data: { backupPath } });
        setMessage({ type: 'success', text: 'Xóa backup thành công!' });
      }
      loadBackups();
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi khi xóa backup' });
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = async (backupPath) => {
    try {
      if (isElectron) {
        // Sử dụng IPC cho Electron
        await window.electronAPI.downloadBackup(backupPath);
        setMessage({ type: 'success', text: 'Tải backup thành công!' });
      } else {
        // Sử dụng API cho web
        const response = await api.get(`/backups/download`, {
          params: { backupPath },
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `backup-${new Date().toISOString()}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        setMessage({ type: 'success', text: 'Tải backup thành công!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi khi tải backup' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'Không xác định';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const getBackupTypeIcon = (type) => {
    switch (type) {
      case 'full': return <BackupIcon color="primary" />;
      case 'database': return <InfoIcon color="info" />;
      case 'images': return <DownloadIcon color="secondary" />;
      default: return <InfoIcon />;
    }
  };

  const getBackupTypeLabel = (type) => {
    switch (type) {
      case 'full': return 'Sao lưu toàn bộ';
      case 'database': return 'Sao lưu cơ sở dữ liệu';
      case 'images': return 'Sao lưu hình ảnh';
      default: return type;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý Sao lưu & Khôi phục
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            startIcon={<BackupIcon />}
            onClick={() => setBackupDialogOpen(true)}
            fullWidth
            size="large"
          >
            Tạo Backup Mới
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={() => setRestoreDialogOpen(true)}
            fullWidth
            size="large"
            disabled={backups.length === 0}
          >
            Khôi phục từ danh sách
          </Button>
        </Grid>
        {isElectron && (
          <Grid item xs={12} md={4}>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={selectBackupFolder}
              fullWidth
              size="large"
            >
              Chọn thư mục backup
            </Button>
          </Grid>
        )}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Danh sách Backup ({backups.length})
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : backups.length === 0 ? (
            <Alert severity="info">
              Chưa có backup nào được tạo. Hãy tạo backup đầu tiên!
            </Alert>
          ) : (
            <List>
              {backups.map((backup, index) => (
                <React.Fragment key={backup.path}>
                  <ListItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      {getBackupTypeIcon(backup.type)}
                      <Box sx={{ ml: 2, flex: 1 }}>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1">
                                {backup.name}
                              </Typography>
                              <Chip 
                                label={getBackupTypeLabel(backup.type)} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                📅 {formatDate(backup.date)}
                              </Typography>
                              {backup.manifest?.database && (
                                <Typography variant="body2" color="text.secondary">
                                  📊 Database: {backup.manifest.database.exists ? 'Có' : 'Không'}
                                  {backup.manifest.database.records && ` (${backup.manifest.database.records} bản ghi)`}
                                </Typography>
                              )}
                              {backup.manifest?.images && (
                                <Typography variant="body2" color="text.secondary">
                                  🖼️ Hình ảnh: {backup.manifest.images.count} files
                                  {backup.manifest.images.size && ` (${formatSize(backup.manifest.images.size)})`}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </Box>
                      <ListItemSecondaryAction>
                        <Box display="flex" gap={1}>
                          <IconButton
                            onClick={() => downloadBackup(backup.path)}
                            title="Tải backup"
                            color="primary"
                          >
                            <DownloadIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              setSelectedBackup(backup);
                              setRestoreDialogOpen(true);
                            }}
                            title="Khôi phục"
                            color="success"
                          >
                            <RestoreIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => deleteBackup(backup.path)}
                            title="Xóa backup"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </Box>
                  </ListItem>
                  {index < backups.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Dialog tạo backup */}
      <Dialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <BackupIcon />
            Tạo Backup Mới
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Loại Backup</InputLabel>
              <Select
                value={backupType}
                onChange={(e) => setBackupType(e.target.value)}
                label="Loại Backup"
              >
                <MenuItem value="full">Sao lưu toàn bộ (Database + Hình ảnh)</MenuItem>
                <MenuItem value="database">Chỉ sao lưu Database</MenuItem>
                <MenuItem value="images">Chỉ sao lưu Hình ảnh</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Đường dẫn tùy chỉnh"
                value={customBackupPath}
                onChange={(e) => setCustomBackupPath(e.target.value)}
                placeholder="C:\MyBackups hoặc /home/user/backups"
                helperText="Để trống để sử dụng thư mục mặc định"
              />
              {isElectron && (
                <Button
                  variant="outlined"
                  startIcon={<FolderIcon />}
                  onClick={selectBackupDirectory}
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  Chọn thư mục lưu backup
                </Button>
              )}
            </Box>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Lưu ý:</strong> Backup sẽ được tạo với timestamp tự động. 
                {isElectron ? ' Bạn có thể chọn thư mục lưu bằng nút "Chọn thư mục" ở trên.' : ' Nếu không chỉ định đường dẫn tùy chỉnh, backup sẽ được lưu trong thư mục mặc định.'}
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>Hủy</Button>
          <Button 
            onClick={createBackup} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <BackupIcon />}
          >
            {loading ? 'Đang tạo...' : 'Tạo Backup'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog khôi phục backup */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <RestoreIcon />
            Khôi phục Backup
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {selectedBackup ? (
              <Box>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Cảnh báo:</strong> Việc khôi phục sẽ ghi đè dữ liệu hiện tại. 
                    Hãy đảm bảo bạn đã sao lưu dữ liệu quan trọng trước khi tiếp tục.
                  </Typography>
                </Alert>
                
                <Typography variant="h6" gutterBottom>
                  Backup được chọn:
                </Typography>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1">
                    {selectedBackup.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📅 {formatDate(selectedBackup.date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📁 {getBackupTypeLabel(selectedBackup.type)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    🗂️ {selectedBackup.path}
                  </Typography>
                </Paper>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" gutterBottom>
                  Chọn backup để khôi phục:
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Backup</InputLabel>
                  <Select
                    value={selectedBackup?.path || ''}
                    onChange={(e) => {
                      const backup = backups.find(b => b.path === e.target.value);
                      setSelectedBackup(backup);
                    }}
                    label="Backup"
                  >
                    {backups.map((backup) => (
                      <MenuItem key={backup.path} value={backup.path}>
                        {backup.name} - {formatDate(backup.date)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRestoreDialogOpen(false);
            setSelectedBackup(null);
          }}>
            Hủy
          </Button>
          <Button 
            onClick={restoreBackup} 
            variant="contained" 
            color="warning"
            disabled={loading || !selectedBackup}
            startIcon={loading ? <CircularProgress size={20} /> : <RestoreIcon />}
          >
            {loading ? 'Đang khôi phục...' : 'Khôi phục'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BackupManager; 