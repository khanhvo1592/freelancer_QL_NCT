import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: '64px',
            ml: '0px',
            backgroundColor: '#f5f5f5',
            minHeight: 'calc(100vh - 64px)',
            position: 'relative',
            borderLeft: 0,
            paddingLeft: 2,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 