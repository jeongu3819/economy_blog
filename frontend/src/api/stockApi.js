import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const stockApi = {
  // 블로그 원고 생성 (스크래핑 -> 자동화 -> 변환)
  generateBlog: async (ticker) => {
    const response = await api.post('/stock/generate', { ticker });
    return response.data;
  },

  // 세션 상태 확인
  checkSession: async () => {
    const response = await api.get('/stock/check-session');
    return response.data;
  },

  // 건강 상태 확인
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};
