import axios from 'axios';

// W środowisku kontenerowym, używamy proxy NGINX skonfigurowanego w nginx.conf
// W środowisku deweloperskim, używamy localhost
// W środowisku produkcyjnym, używamy zmiennej środowiskowej lub proxy NGINX
export const API_URL = process.env.REACT_APP_API_URL || '/api';

console.log('Using API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Dodajemy withCredentials, aby obsługiwać ciasteczka i nagłówki autoryzacji
  withCredentials: true
});

// Dodajemy logowanie wszystkich żądań i odpowiedzi
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      params: config.params,
      data: config.data
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor do obsługi błędów i logowania odpowiedzi
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    });
    
    // Obsługa wygaśnięcia tokenu
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funkcja pomocnicza do bezpośredniego pobierania danych z API
api.fetchData = async (endpoint, params = {}) => {
  try {
    console.log(`Bezpośrednie pobieranie danych z ${endpoint}`, params);
    const response = await api.get(endpoint, { params });
    console.log(`Otrzymane dane z ${endpoint}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Błąd pobierania danych z ${endpoint}:`, error);
    throw error;
  }
};

export default api;
