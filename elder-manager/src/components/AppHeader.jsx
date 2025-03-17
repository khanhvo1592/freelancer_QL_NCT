import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  useTheme,
  Container,
  Paper
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';

import logoImage from '../assets/logo.jpeg';

const AppHeader = () => {
  const theme = useTheme();
  const location = useLocation();

  const menuItems = [
    { text: 'Trang chủ', icon: <HomeIcon />, path: '/' },
    { text: 'Danh sách người cao tuổi', icon: <PeopleIcon />, path: '/elderly-list' },
    { text: 'Thống kê', icon: <BarChartIcon />, path: '/statistics' },
  ];

  return (
    <>
      {/* Spacer to prevent content from hiding behind fixed header */}
      <Box sx={{ height: '100px' }} />
      
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100 }}>
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            borderRadius: 0,
            zIndex: 2
          }}
        >
          <Container maxWidth="xl">
            <Toolbar 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                py: 2,
                minHeight: 80
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Paper
                  elevation={4}
                  sx={{
                    borderRadius: '50%',
                    overflow: 'hidden',
                    mr: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 75,
                    height: 75,
                    border: `2px solid ${theme.palette.primary.main}`
                  }}
                >
                  <Box 
                    component="img"
                    src={logoImage}
                    alt="Logo"
                    sx={{ 
                      height: 65,
                      width: 65,
                      objectFit: 'contain',
                    }}
                  />
                </Paper>
                <Typography 
                  variant="h5" 
                  component="div" 
                  sx={{ 
                    color: theme.palette.primary.main,
                    fontWeight: 'bold',
                    fontSize: '1.7rem',
                    display: { xs: 'none', sm: 'block' },
                    letterSpacing: '0.5px',
                  }}
                >
                  HỘI NGƯỜI CAO TUỔI VIỆT NAM
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Button
                      key={item.text}
                      component={Link}
                      to={item.path}
                      startIcon={<Box sx={{ '& > svg': { fontSize: 22 } }}>{item.icon}</Box>}
                      sx={{
                        color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                        borderRadius: '12px',
                        py: 1.2,
                        px: 2,
                        fontWeight: isActive ? 600 : 500,
                        backgroundColor: isActive ? `${theme.palette.primary.main}14` : 'transparent',
                        textTransform: 'none',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease-in-out',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          backgroundColor: `${theme.palette.primary.main}08`,
                        },
                        '&::after': isActive ? {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '50%',
                          height: '3px',
                          backgroundColor: theme.palette.primary.main,
                          borderRadius: '3px 3px 0 0',
                        } : {}
                      }}
                    >
                      {item.text}
                    </Button>
                  );
                })}
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
        {/* Decorative element */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '5px', 
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.primary.main} 100%)`,
            zIndex: 3
          }} 
        />
        {/* Shadow element */}
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: -10, 
            left: '5%', 
            width: '90%', 
            height: '15px', 
            backgroundColor: '#000',
            opacity: 0.05,
            filter: 'blur(8px)',
            borderRadius: '50%',
            zIndex: 1
          }} 
        />
      </Box>
    </>
  );
};

export default AppHeader; 