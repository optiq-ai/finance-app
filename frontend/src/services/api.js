import axios from 'axios';

// W środowisku kontenerowym, backend jest dostępny pod nazwą serwisu 'backend'
// W środowisku deweloperskim, używamy localhost
// W środowisku produkcyjnym, używamy zmiennej środowiskowej
const API_URL = process.env.REACT_APP_API_URL || 
                (process.env.NODE_ENV === 'production' ? 'http://backend:3001/api' : 'http://localhost:3001/api');

console.log('Using API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Dodajemy withCredentials, aby obsługiwać ciasteczka i nagłówki autoryzacji
  withCredentials: true
});

// Interceptor do dodawania tokenu autoryzacyjnego
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor do obsługi błędów
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Obsługa wygaśnięcia tokenu
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
