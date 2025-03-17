import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import ElderlyIcon from '@mui/icons-material/Elderly';

const Header = () => {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ElderlyIcon 
            sx={{ 
              fontSize: 32, 
              color: '#1976d2',
              mr: 1 
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#1976d2',
              fontWeight: 600,
              fontSize: 20
            }}
          >
            QUẢN LÝ NGƯỜI CAO TUỔI
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 