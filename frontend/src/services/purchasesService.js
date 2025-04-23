import api from './api';

const purchasesService = {
  /**
   * Pobieranie danych zakupów
   * @param {Object} filters - Filtry do zastosowania
   * @param {Object} pagination - Parametry paginacji
   * @returns {Promise} - Obiekt z danymi zakupów
   */
  getPurchases: async (filters = {}, pagination = { page: 0, pageSize: 10 }) => {
    try {
      const response = await api.get('/purchases', { 
        params: { 
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize
        } 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd pobierania danych zakupów');
    }
  },
  
  /**
   * Pobieranie szczegółów zakupu
   * @param {number} id - ID zakupu
   * @returns {Promise} - Obiekt ze szczegółami zakupu
   */
  getPurchaseDetails: async (id) => {
    try {
      const response = await api.get(`/purchases/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd pobierania szczegółów zakupu');
    }
  },
  
  /**
   * Dodawanie nowego zakupu
   * @param {Object} purchaseData - Dane nowego zakupu
   * @returns {Promise} - Obiekt z dodanym zakupem
   */
  addPurchase: async (purchaseData) => {
    try {
      const response = await api.post('/purchases', purchaseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd dodawania zakupu');
    }
  },
  
  /**
   * Aktualizacja zakupu
   * @param {number} id - ID zakupu
   * @param {Object} purchaseData - Dane do aktualizacji
   * @returns {Promise} - Obiekt z zaktualizowanym zakupem
   */
  updatePurchase: async (id, purchaseData) => {
    try {
      const response = await api.put(`/purchases/${id}`, purchaseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd aktualizacji zakupu');
    }
  },
  
  /**
   * Usuwanie zakupu
   * @param {number} id - ID zakupu
   * @returns {Promise} - Komunikat o powodzeniu operacji
   */
  deletePurchase: async (id) => {
    try {
      const response = await api.delete(`/purchases/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd usuwania zakupu');
    }
  }
};

export default purchasesService;
