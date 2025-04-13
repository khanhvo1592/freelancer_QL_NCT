export const handleApiError = (error) => {
  if (error.response) {
    // Lỗi từ server
    console.error('Server error:', error.response.data.error);
    return error.response.data.error || 'Có lỗi xảy ra từ máy chủ';
  } else if (error.request) {
    // Không thể kết nối đến server
    console.error('Network error');
    return 'Không thể kết nối đến máy chủ';
  } else {
    console.error('Error:', error.message);
    return 'Đã xảy ra lỗi không xác định';
  }
}; 