import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { viVN } from '@mui/material/locale';
import AppHeader from './components/AppHeader';
import Home from './pages/Home';
import ElderlyList from './pages/ElderlyList';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import './styles/global.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Tạo theme với ngôn ngữ tiếng Việt
const theme = createTheme({
  palette: {
    primary: {
      main: '#d32f2f',
      light: '#ff6659',
      dark: '#9a0007',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#fff0f3',
      paper: '#ffffff',
    },
    text: {
      primary: '#212529',
      secondary: '#495057',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
}, viVN);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <CssBaseline />
          <AppHeader />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              backgroundColor: '#fff0f3',
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/elderly-list" element={<ElderlyList />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 