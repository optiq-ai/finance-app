import api from './api';
import dataLogger from '../utils/DataLogger';

const payrollService = {
  /**
   * Pobieranie danych wypłat
   * @param {Object} filters - Filtry do zastosowania
   * @param {Object} pagination - Parametry paginacji
   * @returns {Promise} - Obiekt z danymi wypłat
   */
  getPayroll: async (filters = {}, pagination = { page: 0, pageSize: 10 }) => {
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('GET', '/payroll', { ...filters, ...pagination }, null);
      
      const response = await api.get('/payroll', { 
        params: { 
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize
        } 
      });
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('GET', '/payroll', response.status, response.data, duration);
      
      // Sprawdź, czy dane są w oczekiwanym formacie
      const data = response.data || {};
      const items = Array.isArray(data.items) ? data.items : [];
      
      // Dodanie domyślnych wartości dla pustych pól
      const formattedItems = items.map(item => ({
        id: item.id || 0,
        date: item.date || new Date().toISOString(),
        department: item.department || '-',
        group: item.group || '-',
        employeeName: item.employeeName || '-',
        position: item.position || '-',
        grossAmount: item.grossAmount || 0,
        netAmount: item.netAmount || 0,
        taxAmount: item.taxAmount || 0,
        ...item
      }));
      
      const formattedData = {
        items: formattedItems,
        totalItems: data.totalItems || 0,
        page: data.page || pagination.page,
        pageSize: data.pageSize || pagination.pageSize,
        totalPages: data.totalPages || Math.ceil((data.totalItems || 0) / pagination.pageSize)
      };
      
      dataLogger.dataFlow('payrollService', 'getPayroll', 
        { filters, pagination }, 
        { itemsCount: formattedItems.length, totalItems: formattedData.totalItems }
      );
      
      return formattedData;
    } catch (error) {
      dataLogger.apiError('GET', '/payroll', error, { filters, pagination });
      throw new Error(error.response?.data?.message || 'Błąd pobierania danych wypłat');
    }
  },
  
  /**
   * Pobieranie szczegółów wypłaty
   * @param {number} id - ID wypłaty
   * @returns {Promise} - Obiekt ze szczegółami wypłaty
   */
  getPayrollDetails: async (id) => {
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('GET', `/payroll/${id}`, null, null);
      
      const response = await api.get(`/payroll/${id}`);
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('GET', `/payroll/${id}`, response.status, response.data, duration);
      
      // Dodanie domyślnych wartości dla pustych pól
      const payroll = response.data || {};
      const formattedPayroll = {
        id: payroll.id || 0,
        date: payroll.date || new Date().toISOString(),
        department: payroll.department || '-',
        group: payroll.group || '-',
        employeeName: payroll.employeeName || '-',
        position: payroll.position || '-',
        grossAmount: payroll.grossAmount || 0,
        netAmount: payroll.netAmount || 0,
        taxAmount: payroll.taxAmount || 0,
        ...payroll
      };
      
      dataLogger.dataFlow('payrollService', 'getPayrollDetails', 
        { id }, 
        { payroll: formattedPayroll }
      );
      
      return formattedPayroll;
    } catch (error) {
      dataLogger.apiError('GET', `/payroll/${id}`, error);
      throw new Error(error.response?.data?.message || 'Błąd pobierania szczegółów wypłaty');
    }
  },
  
  /**
   * Dodawanie nowej wypłaty
   * @param {Object} payrollData - Dane nowej wypłaty
   * @returns {Promise} - Obiekt z dodaną wypłatą
   */
  addPayroll: async (payrollData) => {
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('POST', '/payroll', null, payrollData);
      
      const response = await api.post('/payroll', payrollData);
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('POST', '/payroll', response.status, response.data, duration);
      
      dataLogger.dataFlow('payrollService', 'addPayroll', 
        { payrollData }, 
        { result: response.data }
      );
      
      return response.data;
    } catch (error) {
      dataLogger.apiError('POST', '/payroll', error, { payrollData });
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
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('PUT', `/payroll/${id}`, null, payrollData);
      
      const response = await api.put(`/payroll/${id}`, payrollData);
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('PUT', `/payroll/${id}`, response.status, response.data, duration);
      
      dataLogger.dataFlow('payrollService', 'updatePayroll', 
        { id, payrollData }, 
        { result: response.data }
      );
      
      return response.data;
    } catch (error) {
      dataLogger.apiError('PUT', `/payroll/${id}`, error, { id, payrollData });
      throw new Error(error.response?.data?.message || 'Błąd aktualizacji wypłaty');
    }
  },
  
  /**
   * Usuwanie wypłaty
   * @param {number} id - ID wypłaty
   * @returns {Promise} - Komunikat o powodzeniu operacji
   */
  deletePayroll: async (id) => {
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('DELETE', `/payroll/${id}`, null, null);
      
      const response = await api.delete(`/payroll/${id}`);
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('DELETE', `/payroll/${id}`, response.status, response.data, duration);
      
      dataLogger.dataFlow('payrollService', 'deletePayroll', 
        { id }, 
        { result: response.data }
      );
      
      return response.data;
    } catch (error) {
      dataLogger.apiError('DELETE', `/payroll/${id}`, error, { id });
      throw new Error(error.response?.data?.message || 'Błąd usuwania wypłaty');
    }
  }
};

export default payrollService;
