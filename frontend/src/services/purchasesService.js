import api from './api';
import dataLogger from '../utils/DataLogger';

const purchasesService = {
  /**
   * Pobieranie danych zakupów
   * @param {Object} filters - Filtry do zastosowania
   * @param {Object} pagination - Parametry paginacji
   * @returns {Promise} - Obiekt z danymi zakupów
   */
  getPurchases: async (filters = {}, pagination = { page: 0, pageSize: 10 }) => {
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('GET', '/purchases', { ...filters, ...pagination }, null);
      
      const response = await api.get('/purchases', { 
        params: { 
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize
        } 
      });
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('GET', '/purchases', response.status, response.data, duration);
      
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
        ...item
      }));
      
      const formattedData = {
        items: formattedItems,
        totalItems: data.totalItems || 0,
        page: data.page || pagination.page,
        pageSize: data.pageSize || pagination.pageSize,
        totalPages: data.totalPages || Math.ceil((data.totalItems || 0) / pagination.pageSize)
      };
      
      dataLogger.dataFlow('purchasesService', 'getPurchases', 
        { filters, pagination }, 
        { itemsCount: formattedItems.length, totalItems: formattedData.totalItems }
      );
      
      return formattedData;
    } catch (error) {
      dataLogger.apiError('GET', '/purchases', error, { filters, pagination });
      throw new Error(error.response?.data?.message || 'Błąd pobierania danych zakupów');
    }
  },
  
  /**
   * Pobieranie szczegółów zakupu
   * @param {number} id - ID zakupu
   * @returns {Promise} - Obiekt ze szczegółami zakupu
   */
  getPurchaseDetails: async (id) => {
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('GET', `/purchases/${id}`, null, null);
      
      const response = await api.get(`/purchases/${id}`);
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('GET', `/purchases/${id}`, response.status, response.data, duration);
      
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
        ...purchase
      };
      
      dataLogger.dataFlow('purchasesService', 'getPurchaseDetails', 
        { id }, 
        { purchase: formattedPurchase }
      );
      
      return formattedPurchase;
    } catch (error) {
      dataLogger.apiError('GET', `/purchases/${id}`, error);
      throw new Error(error.response?.data?.message || 'Błąd pobierania szczegółów zakupu');
    }
  },
  
  /**
   * Dodawanie nowego zakupu
   * @param {Object} purchaseData - Dane nowego zakupu
   * @returns {Promise} - Obiekt z dodanym zakupem
   */
  addPurchase: async (purchaseData) => {
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('POST', '/purchases', null, purchaseData);
      
      const response = await api.post('/purchases', purchaseData);
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('POST', '/purchases', response.status, response.data, duration);
      
      dataLogger.dataFlow('purchasesService', 'addPurchase', 
        { purchaseData }, 
        { result: response.data }
      );
      
      return response.data;
    } catch (error) {
      dataLogger.apiError('POST', '/purchases', error, { purchaseData });
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
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('PUT', `/purchases/${id}`, null, purchaseData);
      
      const response = await api.put(`/purchases/${id}`, purchaseData);
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('PUT', `/purchases/${id}`, response.status, response.data, duration);
      
      dataLogger.dataFlow('purchasesService', 'updatePurchase', 
        { id, purchaseData }, 
        { result: response.data }
      );
      
      return response.data;
    } catch (error) {
      dataLogger.apiError('PUT', `/purchases/${id}`, error, { id, purchaseData });
      throw new Error(error.response?.data?.message || 'Błąd aktualizacji zakupu');
    }
  },
  
  /**
   * Usuwanie zakupu
   * @param {number} id - ID zakupu
   * @returns {Promise} - Komunikat o powodzeniu operacji
   */
  deletePurchase: async (id) => {
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('DELETE', `/purchases/${id}`, null, null);
      
      const response = await api.delete(`/purchases/${id}`);
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('DELETE', `/purchases/${id}`, response.status, response.data, duration);
      
      dataLogger.dataFlow('purchasesService', 'deletePurchase', 
        { id }, 
        { result: response.data }
      );
      
      return response.data;
    } catch (error) {
      dataLogger.apiError('DELETE', `/purchases/${id}`, error, { id });
      throw new Error(error.response?.data?.message || 'Błąd usuwania zakupu');
    }
  }
};

export default purchasesService;
