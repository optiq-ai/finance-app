import api from './api';

const authService = {
  /**
   * Logowanie użytkownika (autoryzacja wyłączona)
   * @returns {Promise} - Obiekt z danymi użytkownika i tokenem
   */
  login: async () => {
    try {
      const response = await api.post('/auth/login', {});
      
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
   * Wylogowanie użytkownika (autoryzacja wyłączona)
   */
  logout: () => {
    // Nie usuwamy tokenu, aby użytkownik pozostał zalogowany
    console.log('Wylogowanie wyłączone - autoryzacja jest wyłączona');
  },
  
  /**
   * Sprawdzenie czy użytkownik jest zalogowany (autoryzacja wyłączona)
   * @returns {boolean} - Zawsze zwraca true, ponieważ autoryzacja jest wyłączona
   */
  isAuthenticated: () => {
    return true;
  },
  
  /**
   * Pobranie danych aktualnie zalogowanego użytkownika (autoryzacja wyłączona)
   * @returns {Promise} - Obiekt z danymi użytkownika
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      // Jeśli wystąpi błąd, zwracamy domyślnego użytkownika
      return {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        preferences: {
          darkMode: false,
          notifications: true,
          language: 'pl'
        }
      };
    }
  },
  
  /**
   * Zmiana hasła użytkownika (autoryzacja wyłączona)
   * @returns {Promise} - Komunikat o powodzeniu operacji
   */
  changePassword: async () => {
    try {
      const response = await api.post('/auth/change-password', {});
      return response.data;
    } catch (error) {
      return { message: 'Hasło zostało zmienione' };
    }
  }
};

export default authService;
