import api from './api';

const authService = {
  /**
   * Logowanie użytkownika
   * @param {string} username - Nazwa użytkownika
   * @param {string} password - Hasło użytkownika
   * @returns {Promise} - Obiekt z danymi użytkownika i tokenem
   */
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      // Zapisz token w localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd logowania');
    }
  },
  
  /**
   * Wylogowanie użytkownika
   */
  logout: () => {
    localStorage.removeItem('token');
  },
  
  /**
   * Sprawdzenie czy użytkownik jest zalogowany
   * @returns {boolean} - Czy użytkownik jest zalogowany
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  /**
   * Pobranie danych aktualnie zalogowanego użytkownika
   * @returns {Promise} - Obiekt z danymi użytkownika
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd pobierania danych użytkownika');
    }
  },
  
  /**
   * Zmiana hasła użytkownika
   * @param {string} currentPassword - Aktualne hasło
   * @param {string} newPassword - Nowe hasło
   * @returns {Promise} - Komunikat o powodzeniu operacji
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd zmiany hasła');
    }
  }
};

export default authService;
