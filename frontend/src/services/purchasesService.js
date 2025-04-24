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
      console.log('Pobieranie danych zakupów z parametrami:', { filters, pagination });
      
      const response = await api.get('/purchases', { 
        params: { 
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize
        } 
      });
      
      console.log('Otrzymane dane zakupów:', response.data);
      
      // Sprawdź, czy dane są w oczekiwanym formacie
      const data = response.data || {};
      const items = Array.isArray(data.items) ? data.items : [];
      
      // Dodanie domyślnych wartości dla pustych pól
      const formattedItems = items.map(item => ({
        id: item.id || 0,
        date: item.date || new Date().toISOString(),
        department: item.department || '-',
        group: item.group || '-',
        serviceType: item.serviceType || '-',
        contractor: item.contractor || '-',
        costCategory: item.costCategory || '-',
        netAmount: item.netAmount || 0,
        vatAmount: item.vatAmount || 0,
        grossAmount: item.grossAmount || 0,
        documentNumber: item.documentNumber || '-',
        description: item.description || '-',
        ...item
      }));
      
      console.log('Sformatowane dane zakupów:', { 
        totalItems: data.totalItems || 0, 
        items: formattedItems.length, 
        przykład: formattedItems.length > 0 ? formattedItems[0] : null 
      });
      
      return {
        totalItems: data.totalItems || 0,
        items: formattedItems,
        page: data.page || pagination.page,
        pageSize: data.pageSize || pagination.pageSize,
        totalPages: data.totalPages || Math.ceil((data.totalItems || 0) / pagination.pageSize)
      };
    } catch (error) {
      console.error('Błąd pobierania danych zakupów:', error);
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
      console.log(`Pobieranie szczegółów zakupu o ID: ${id}`);
      
      const response = await api.get(`/purchases/${id}`);
      console.log('Otrzymane szczegóły zakupu:', response.data);
      
      // Dodanie domyślnych wartości dla pustych pól
      const purchase = response.data || {};
      const formattedPurchase = {
        id: purchase.id || 0,
        date: purchase.date || new Date().toISOString(),
        department: purchase.department || '-',
        group: purchase.group || '-',
        serviceType: purchase.serviceType || '-',
        contractor: purchase.contractor || '-',
        costCategory: purchase.costCategory || '-',
        netAmount: purchase.netAmount || 0,
        vatAmount: purchase.vatAmount || 0,
        grossAmount: purchase.grossAmount || 0,
        documentNumber: purchase.documentNumber || '-',
        description: purchase.description || '-',
        ...purchase
      };
      
      return formattedPurchase;
    } catch (error) {
      console.error(`Błąd pobierania szczegółów zakupu o ID ${id}:`, error);
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
      console.log('Dodawanie nowego zakupu:', purchaseData);
      
      const response = await api.post('/purchases', purchaseData);
      console.log('Odpowiedź po dodaniu zakupu:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Błąd dodawania zakupu:', error);
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
      console.log(`Aktualizacja zakupu o ID ${id}:`, purchaseData);
      
      const response = await api.put(`/purchases/${id}`, purchaseData);
      console.log('Odpowiedź po aktualizacji zakupu:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Błąd aktualizacji zakupu o ID ${id}:`, error);
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
      console.log(`Usuwanie zakupu o ID ${id}`);
      
      const response = await api.delete(`/purchases/${id}`);
      console.log('Odpowiedź po usunięciu zakupu:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Błąd usuwania zakupu o ID ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Błąd usuwania zakupu');
    }
  }
};

export default purchasesService;
