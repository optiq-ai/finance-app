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
      console.log('Pobieranie danych wypłat z parametrami:', { filters, pagination });
      
      const response = await api.get('/payroll', { 
        params: { 
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize
        } 
      });
      
      console.log('Otrzymane dane wypłat:', response.data);
      
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
        taxAmount: item.taxAmount || 0,
        netAmount: item.netAmount || 0,
        ...item
      }));
      
      console.log('Sformatowane dane wypłat:', { 
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
      console.error('Błąd pobierania danych wypłat:', error);
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
      console.log(`Pobieranie szczegółów wypłaty o ID: ${id}`);
      
      const response = await api.get(`/payroll/${id}`);
      console.log('Otrzymane szczegóły wypłaty:', response.data);
      
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
        taxAmount: payroll.taxAmount || 0,
        netAmount: payroll.netAmount || 0,
        ...payroll
      };
      
      return formattedPayroll;
    } catch (error) {
      console.error(`Błąd pobierania szczegółów wypłaty o ID ${id}:`, error);
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
      console.log('Dodawanie nowej wypłaty:', payrollData);
      
      const response = await api.post('/payroll', payrollData);
      console.log('Odpowiedź po dodaniu wypłaty:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Błąd dodawania wypłaty:', error);
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
      console.log(`Aktualizacja wypłaty o ID ${id}:`, payrollData);
      
      const response = await api.put(`/payroll/${id}`, payrollData);
      console.log('Odpowiedź po aktualizacji wypłaty:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Błąd aktualizacji wypłaty o ID ${id}:`, error);
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
      console.log(`Usuwanie wypłaty o ID ${id}`);
      
      const response = await api.delete(`/payroll/${id}`);
      console.log('Odpowiedź po usunięciu wypłaty:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Błąd usuwania wypłaty o ID ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Błąd usuwania wypłaty');
    }
  }
};

export default payrollService;
