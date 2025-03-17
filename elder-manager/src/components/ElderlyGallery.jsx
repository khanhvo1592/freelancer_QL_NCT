import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CardActionArea,
} from '@mui/material';

const defaultAvatarUrl = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

const ElderlyGallery = ({ data, onElderlyClick }) => {
  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {data.map((elderly) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={elderly.id}>
          <Card 
            sx={{ 
              height: '100%',
              bgcolor: elderly.deceased ? 'rgba(0, 0, 0, 0.04)' : 'background.paper',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
              },
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <CardActionArea 
              onClick={() => onElderlyClick(elderly)}
              sx={{ 
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch'
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    display: 'block',
                    paddingTop: '140%', // 5:7 aspect ratio
                  },
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }}
              >
                <Box
                  component="img"
                  src={elderly.photoUrl || defaultAvatarUrl}
                  alt={elderly.name}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    textDecoration: elderly.deceased ? 'line-through' : 'none',
                    color: elderly.deceased ? 'text.secondary' : 'text.primary',
                    fontStyle: elderly.deceased ? 'italic' : 'normal',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    lineHeight: 1.2,
                  }}
                >
                  {elderly.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {elderly.birthDate ? new Date(elderly.birthDate).toLocaleDateString('vi-VN') : ''} 
                  {elderly.birthDate && elderly.projectedAge ? ' - ' : ''}
                  {elderly.projectedAge ? `${elderly.projectedAge} tuổi` : ''}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontStyle: elderly.deceased ? 'italic' : 'normal',
                    fontSize: '0.875rem',
                    mt: 0.5
                  }}
                >
                  {elderly.address}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ElderlyGallery; 