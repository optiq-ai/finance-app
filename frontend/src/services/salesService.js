import api from './api';

const salesService = {
  /**
   * Pobieranie danych sprzedaży
   * @param {Object} filters - Filtry do zastosowania
   * @param {Object} pagination - Parametry paginacji
   * @returns {Promise} - Obiekt z danymi sprzedaży
   */
  getSales: async (filters = {}, pagination = { page: 0, pageSize: 10 }) => {
    try {
      const response = await api.get('/sales', { 
        params: { 
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize
        } 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd pobierania danych sprzedaży');
    }
  },
  
  /**
   * Pobieranie szczegółów sprzedaży
   * @param {number} id - ID sprzedaży
   * @returns {Promise} - Obiekt ze szczegółami sprzedaży
   */
  getSaleDetails: async (id) => {
    try {
      const response = await api.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd pobierania szczegółów sprzedaży');
    }
  },
  
  /**
   * Dodawanie nowej sprzedaży
   * @param {Object} saleData - Dane nowej sprzedaży
   * @returns {Promise} - Obiekt z dodaną sprzedażą
   */
  addSale: async (saleData) => {
    try {
      const response = await api.post('/sales', saleData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd dodawania sprzedaży');
    }
  },
  
  /**
   * Aktualizacja sprzedaży
   * @param {number} id - ID sprzedaży
   * @param {Object} saleData - Dane do aktualizacji
   * @returns {Promise} - Obiekt z zaktualizowaną sprzedażą
   */
  updateSale: async (id, saleData) => {
    try {
      const response = await api.put(`/sales/${id}`, saleData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd aktualizacji sprzedaży');
    }
  },
  
  /**
   * Usuwanie sprzedaży
   * @param {number} id - ID sprzedaży
   * @returns {Promise} - Komunikat o powodzeniu operacji
   */
  deleteSale: async (id) => {
    try {
      const response = await api.delete(`/sales/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd usuwania sprzedaży');
    }
  }
};

export default salesService;
