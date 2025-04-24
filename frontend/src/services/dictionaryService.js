import api from './api';

const dictionaryService = {
  /**
   * Pobieranie wszystkich słowników
   * @returns {Promise} - Obiekt zawierający wszystkie słowniki
   */
  getDictionaries: async () => {
    try {
      console.log('Wywołanie API: /dictionary');
      const response = await api.get('/dictionary');
      console.log('Odpowiedź API słowników:', response.data);
      
      // Sprawdź, czy dane są w oczekiwanym formacie
      const data = response.data || {};
      
      // Przygotuj domyślne wartości dla każdego słownika
      const departments = Array.isArray(data.departments) ? data.departments : [];
      const groups = Array.isArray(data.groups) ? data.groups : [];
      const serviceTypes = Array.isArray(data.serviceTypes) ? data.serviceTypes : [];
      const contractors = Array.isArray(data.contractors) ? data.contractors : [];
      const costCategories = Array.isArray(data.costCategories) ? data.costCategories : [];
      
      // Dodanie domyślnych wartości dla pustych pól w każdym słowniku
      const formattedDepartments = departments.map(item => ({
        id: item.id || 0,
        name: item.name || '-',
        code: item.code || '-',
        ...item
      }));
      
      const formattedGroups = groups.map(item => ({
        id: item.id || 0,
        name: item.name || '-',
        departmentId: item.departmentId || null,
        departmentName: item.departmentName || '-',
        ...item
      }));
      
      const formattedServiceTypes = serviceTypes.map(item => ({
        id: item.id || 0,
        name: item.name || '-',
        groupId: item.groupId || null,
        groupName: item.groupName || '-',
        ...item
      }));
      
      const formattedContractors = contractors.map(item => ({
        id: item.id || 0,
        name: item.name || '-',
        nip: item.nip || '-',
        address: item.address || '-',
        ...item
      }));
      
      const formattedCostCategories = costCategories.map(item => ({
        id: item.id || 0,
        name: item.name || '-',
        code: item.code || '-',
        ...item
      }));
      
      console.log('Sformatowane dane słowników:', { 
        departments: formattedDepartments.length, 
        groups: formattedGroups.length,
        serviceTypes: formattedServiceTypes.length,
        contractors: formattedContractors.length,
        costCategories: formattedCostCategories.length
      });
      
      return {
        departments: formattedDepartments,
        groups: formattedGroups,
        serviceTypes: formattedServiceTypes,
        contractors: formattedContractors,
        costCategories: formattedCostCategories
      };
    } catch (error) {
      console.error('Błąd pobierania słowników:', error);
      throw new Error(error.response?.data?.message || 'Błąd pobierania słowników');
    }
  },
  
  /**
   * Pobieranie konkretnego słownika
   * @param {string} type - Typ słownika (departments, groups, serviceTypes, contractors, costCategories)
   * @returns {Promise} - Lista elementów słownika
   */
  getDictionaryItems: async (type) => {
    try {
      console.log(`Wywołanie API: /dictionary/${type}`);
      const response = await api.get(`/dictionary/${type}`);
      console.log(`Odpowiedź API słownika ${type}:`, response.data);
      
      // Sprawdź, czy dane są w oczekiwanym formacie
      const items = Array.isArray(response.data) ? response.data : [];
      
      // Dodanie domyślnych wartości dla pustych pól w zależności od typu słownika
      let formattedItems = [];
      
      switch (type) {
        case 'departments':
          formattedItems = items.map(item => ({
            id: item.id || 0,
            name: item.name || '-',
            code: item.code || '-',
            ...item
          }));
          break;
        case 'groups':
          formattedItems = items.map(item => ({
            id: item.id || 0,
            name: item.name || '-',
            departmentId: item.departmentId || null,
            departmentName: item.departmentName || '-',
            ...item
          }));
          break;
        case 'serviceTypes':
          formattedItems = items.map(item => ({
            id: item.id || 0,
            name: item.name || '-',
            groupId: item.groupId || null,
            groupName: item.groupName || '-',
            ...item
          }));
          break;
        case 'contractors':
          formattedItems = items.map(item => ({
            id: item.id || 0,
            name: item.name || '-',
            nip: item.nip || '-',
            address: item.address || '-',
            ...item
          }));
          break;
        case 'costCategories':
          formattedItems = items.map(item => ({
            id: item.id || 0,
            name: item.name || '-',
            code: item.code || '-',
            ...item
          }));
          break;
        default:
          formattedItems = items.map(item => ({
            id: item.id || 0,
            name: item.name || '-',
            ...item
          }));
      }
      
      console.log(`Sformatowane dane słownika ${type}:`, { 
        ilość: formattedItems.length,
        przykład: formattedItems.length > 0 ? formattedItems[0] : null
      });
      
      return formattedItems;
    } catch (error) {
      console.error(`Błąd pobierania słownika ${type}:`, error);
      throw new Error(error.response?.data?.message || `Błąd pobierania słownika ${type}`);
    }
  },
  
  /**
   * Dodawanie nowego elementu do słownika
   * @param {string} type - Typ słownika (departments, groups, serviceTypes, contractors, costCategories)
   * @param {Object} itemData - Dane nowego elementu
   * @returns {Promise} - Dodany element słownika
   */
  addDictionaryItem: async (type, itemData) => {
    try {
      console.log(`Dodawanie nowego elementu do słownika ${type}:`, itemData);
      
      const response = await api.post(`/dictionary/${type}`, itemData);
      console.log(`Odpowiedź po dodaniu elementu do słownika ${type}:`, response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Błąd dodawania elementu do słownika ${type}:`, error);
      throw new Error(error.response?.data?.message || `Błąd dodawania elementu do słownika ${type}`);
    }
  },
  
  /**
   * Aktualizacja elementu słownika
   * @param {string} type - Typ słownika (departments, groups, serviceTypes, contractors, costCategories)
   * @param {number} id - ID elementu
   * @param {Object} itemData - Dane do aktualizacji
   * @returns {Promise} - Zaktualizowany element słownika
   */
  updateDictionaryItem: async (type, id, itemData) => {
    try {
      console.log(`Aktualizacja elementu słownika ${type} o ID ${id}:`, itemData);
      
      const response = await api.put(`/dictionary/${type}/${id}`, itemData);
      console.log(`Odpowiedź po aktualizacji elementu słownika ${type}:`, response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Błąd aktualizacji elementu słownika ${type} o ID ${id}:`, error);
      throw new Error(error.response?.data?.message || `Błąd aktualizacji elementu słownika ${type}`);
    }
  },
  
  /**
   * Usuwanie elementu słownika
   * @param {string} type - Typ słownika (departments, groups, serviceTypes, contractors, costCategories)
   * @param {number} id - ID elementu
   * @returns {Promise} - Komunikat o powodzeniu operacji
   */
  deleteDictionaryItem: async (type, id) => {
    try {
      console.log(`Usuwanie elementu słownika ${type} o ID ${id}`);
      
      const response = await api.delete(`/dictionary/${type}/${id}`);
      console.log(`Odpowiedź po usunięciu elementu słownika ${type}:`, response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Błąd usuwania elementu słownika ${type} o ID ${id}:`, error);
      throw new Error(error.response?.data?.message || `Błąd usuwania elementu słownika ${type}`);
    }
  }
};

export default dictionaryService;
