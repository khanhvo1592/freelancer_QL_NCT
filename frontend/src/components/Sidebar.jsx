import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  useTheme,
  Typography,
  Tooltip,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import logoImage from '../assets/logo.jpeg';

const drawerWidth = 280;

const Sidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const menuItems = [
    { text: 'Trang chủ', icon: <HomeIcon />, path: '/' },
    { text: 'Danh sách người cao tuổi', icon: <PeopleIcon />, path: '/elderly-list' },
    { text: 'Thống kê', icon: <BarChartIcon />, path: '/statistics' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : 65,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 65,
            boxSizing: 'border-box',
            transition: theme.transitions.create(['width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'flex-start' : 'center',
            padding: theme.spacing(1, 1),
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            minHeight: 64,
          }}
        >
          {open && (
            <Box 
              component="img"
              src={logoImage}
              alt="Logo"
              sx={{ 
                height: 36,
                width: 36,
                ml: 2,
                mr: 2,
                objectFit: 'contain'
              }}
            />
          )}
          
          {open && (
            <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2, fontSize: '0.9rem' }}>
                              QUẢN LÝ HỘI VIÊN NGƯỜI CAO TUỔI
            </Typography>
          )}
          
          <IconButton 
            onClick={handleDrawerToggle} 
            color="inherit"
            sx={{ ml: open ? 'auto' : 0 }}
          >
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ mt: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 1 }}>
                <Tooltip title={open ? "" : item.text} placement="right">
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      backgroundColor: isActive ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                      borderRadius: '0 24px 24px 0',
                      mr: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: isActive ? theme.palette.primary.main : 'inherit',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      sx={{ 
                        opacity: open ? 1 : 0,
                        '& .MuiTypography-root': {
                          fontSize: '1.05rem',
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? theme.palette.primary.main : 'inherit',
                        }
                      }} 
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    </Box>
  );
};

export default Sidebar; 