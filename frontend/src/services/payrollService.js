import api from './api';

const payrollService = {
  /**
   * Pobieranie danych wypłat
   * @param {Object} filters - Filtry do zastosowania
   * @param {Object} pagination - Parametry paginacji
   * @returns {Promise} - Obiekt z danymi wypłat
   */
  getPayroll: async (filters = {}, pagination = { page: 0, pageSize: 10 }) => {
    try {
      const response = await api.get('/payroll', { 
        params: { 
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize
        } 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd pobierania danych wypłat');
    }
  },
  
  /**
   * Pobieranie szczegółów wypłaty
   * @param {number} id - ID wypłaty
   * @returns {Promise} - Obiekt ze szczegółami wypłaty
   */
  getPayrollDetails: async (id) => {
    try {
      const response = await api.get(`/payroll/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd pobierania szczegółów wypłaty');
    }
  },
  
  /**
   * Dodawanie nowej wypłaty
   * @param {Object} payrollData - Dane nowej wypłaty
   * @returns {Promise} - Obiekt z dodaną wypłatą
   */
  addPayroll: async (payrollData) => {
    try {
      const response = await api.post('/payroll', payrollData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd dodawania wypłaty');
    }
  },
  
  /**
   * Aktualizacja wypłaty
   * @param {number} id - ID wypłaty
   * @param {Object} payrollData - Dane do aktualizacji
   * @returns {Promise} - Obiekt z zaktualizowaną wypłatą
   */
  updatePayroll: async (id, payrollData) => {
    try {
      const response = await api.put(`/payroll/${id}`, payrollData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd aktualizacji wypłaty');
    }
  },
  
  /**
   * Usuwanie wypłaty
   * @param {number} id - ID wypłaty
   * @returns {Promise} - Komunikat o powodzeniu operacji
   */
  deletePayroll: async (id) => {
    try {
      const response = await api.delete(`/payroll/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd usuwania wypłaty');
    }
  }
};

export default payrollService;
