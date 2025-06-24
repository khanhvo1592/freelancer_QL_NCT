import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Tạo instance axios chung
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

export const elderlyApi = {
  // Lấy danh sách người cao tuổi
  getAll: async () => {
    const response = await axios.get(`${API_URL}/elderly`);
    return response.data.data;
  },

  // Thêm người cao tuổi mới
  create: async (formData) => {
    try {
      console.log('Making API call to create elderly...');
      
      const response = await axios.post(`${API_URL}/elderly`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      console.log('API response received:', response);
      
      if (!response.data) {
        throw new Error('Invalid response format from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Create elderly error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Cập nhật thông tin
  update: async (id, formData) => {
    try {
      if (!id) {
        throw new Error('Missing elderly ID');
      }

      console.log('Making API call to update elderly...');
      console.log('Elderly ID:', id);
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await axios.put(`${API_URL}/elderly/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log('API response received:', response);
      
      if (!response.data) {
        throw new Error('Invalid response format from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Update elderly error details:', {
        id,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Cập nhật trạng thái
  updateStatus: async (id, status, deathDate = null) => {
    const response = await axios.patch(`${API_URL}/elderly/${id}/status`, {
      status,
      deathDate
    });
    return response.data;
  },

  // Cập nhật ảnh
  updatePhoto: async (id, photoFile) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    const response = await axios.patch(`${API_URL}/elderly/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  },

  // Xóa người cao tuổi
  delete: async (id) => {
    await axios.delete(`${API_URL}/elderly/${id}`);
  }
};

// Export api instance cho các API khác
export { api }; 