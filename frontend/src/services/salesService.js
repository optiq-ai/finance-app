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
      console.log('Pobieranie danych sprzedaży z parametrami:', { filters, pagination });
      
      const response = await api.get('/sales', { 
        params: { 
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize
        } 
      });
      
      console.log('Otrzymane dane sprzedaży:', response.data);
      
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
        quantity: item.quantity || 0,
        netAmount: item.netAmount || 0,
        vatAmount: item.vatAmount || 0,
        grossAmount: item.grossAmount || 0,
        documentNumber: item.documentNumber || '-',
        ...item
      }));
      
      console.log('Sformatowane dane sprzedaży:', { 
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
      console.error('Błąd pobierania danych sprzedaży:', error);
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
      console.log(`Pobieranie szczegółów sprzedaży o ID: ${id}`);
      
      const response = await api.get(`/sales/${id}`);
      console.log('Otrzymane szczegóły sprzedaży:', response.data);
      
      // Dodanie domyślnych wartości dla pustych pól
      const sale = response.data || {};
      const formattedSale = {
        id: sale.id || 0,
        date: sale.date || new Date().toISOString(),
        department: sale.department || '-',
        group: sale.group || '-',
        serviceType: sale.serviceType || '-',
        contractor: sale.contractor || '-',
        quantity: sale.quantity || 0,
        netAmount: sale.netAmount || 0,
        vatAmount: sale.vatAmount || 0,
        grossAmount: sale.grossAmount || 0,
        documentNumber: sale.documentNumber || '-',
        ...sale
      };
      
      return formattedSale;
    } catch (error) {
      console.error(`Błąd pobierania szczegółów sprzedaży o ID ${id}:`, error);
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
      console.log('Dodawanie nowej sprzedaży:', saleData);
      
      const response = await api.post('/sales', saleData);
      console.log('Odpowiedź po dodaniu sprzedaży:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Błąd dodawania sprzedaży:', error);
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
      console.log(`Aktualizacja sprzedaży o ID ${id}:`, saleData);
      
      const response = await api.put(`/sales/${id}`, saleData);
      console.log('Odpowiedź po aktualizacji sprzedaży:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Błąd aktualizacji sprzedaży o ID ${id}:`, error);
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
      console.log(`Usuwanie sprzedaży o ID ${id}`);
      
      const response = await api.delete(`/sales/${id}`);
      console.log('Odpowiedź po usunięciu sprzedaży:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Błąd usuwania sprzedaży o ID ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Błąd usuwania sprzedaży');
    }
  }
};

export default salesService;
