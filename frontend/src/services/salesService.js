import api from './api';
import dataLogger from '../utils/DataLogger';

const salesService = {
  /**
   * Pobieranie danych sprzedaży
   * @param {Object} filters - Filtry do zastosowania
   * @param {Object} pagination - Parametry paginacji
   * @returns {Promise} - Obiekt z danymi sprzedaży
   */
  getSales: async (filters = {}, pagination = { page: 0, pageSize: 10 }) => {
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('GET', '/sales', { ...filters, ...pagination }, null);
      
      const response = await api.get('/sales', { 
        params: { 
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize
        } 
      });
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('GET', '/sales', response.status, response.data, duration);
      
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
      
      const formattedData = {
        items: formattedItems,
        totalItems: data.totalItems || 0,
        page: data.page || pagination.page,
        pageSize: data.pageSize || pagination.pageSize,
        totalPages: data.totalPages || Math.ceil((data.totalItems || 0) / pagination.pageSize)
      };
      
      dataLogger.dataFlow('salesService', 'getSales', 
        { filters, pagination }, 
        { itemsCount: formattedItems.length, totalItems: formattedData.totalItems }
      );
      
      return formattedData;
    } catch (error) {
      dataLogger.apiError('GET', '/sales', error, { filters, pagination });
      throw new Error(error.response?.data?.message || 'Błąd pobierania danych sprzedaży');
    }
  },
  
  /**
   * Pobieranie szczegółów sprzedaży
   * @param {number} id - ID sprzedaży
   * @returns {Promise} - Obiekt ze szczegółami sprzedaży
   */
  getSaleDetails: async (id) => {
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('GET', `/sales/${id}`, null, null);
      
      const response = await api.get(`/sales/${id}`);
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('GET', `/sales/${id}`, response.status, response.data, duration);
      
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
      
      dataLogger.dataFlow('salesService', 'getSaleDetails', 
        { id }, 
        { sale: formattedSale }
      );
      
      return formattedSale;
    } catch (error) {
      dataLogger.apiError('GET', `/sales/${id}`, error);
      throw new Error(error.response?.data?.message || 'Błąd pobierania szczegółów sprzedaży');
    }
  },
  
  /**
   * Dodawanie nowej sprzedaży
   * @param {Object} saleData - Dane nowej sprzedaży
   * @returns {Promise} - Obiekt z dodaną sprzedażą
   */
  addSale: async (saleData) => {
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('POST', '/sales', null, saleData);
      
      const response = await api.post('/sales', saleData);
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('POST', '/sales', response.status, response.data, duration);
      
      dataLogger.dataFlow('salesService', 'addSale', 
        { saleData }, 
        { result: response.data }
      );
      
      return response.data;
    } catch (error) {
      dataLogger.apiError('POST', '/sales', error, { saleData });
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
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('PUT', `/sales/${id}`, null, saleData);
      
      const response = await api.put(`/sales/${id}`, saleData);
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('PUT', `/sales/${id}`, response.status, response.data, duration);
      
      dataLogger.dataFlow('salesService', 'updateSale', 
        { id, saleData }, 
        { result: response.data }
      );
      
      return response.data;
    } catch (error) {
      dataLogger.apiError('PUT', `/sales/${id}`, error, { id, saleData });
      throw new Error(error.response?.data?.message || 'Błąd aktualizacji sprzedaży');
    }
  },
  
  /**
   * Usuwanie sprzedaży
   * @param {number} id - ID sprzedaży
   * @returns {Promise} - Komunikat o powodzeniu operacji
   */
  deleteSale: async (id) => {
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('DELETE', `/sales/${id}`, null, null);
      
      const response = await api.delete(`/sales/${id}`);
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('DELETE', `/sales/${id}`, response.status, response.data, duration);
      
      dataLogger.dataFlow('salesService', 'deleteSale', 
        { id }, 
        { result: response.data }
      );
      
      return response.data;
    } catch (error) {
      dataLogger.apiError('DELETE', `/sales/${id}`, error, { id });
      throw new Error(error.response?.data?.message || 'Błąd usuwania sprzedaży');
    }
  }
};

export default salesService;
