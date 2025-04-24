import api from './api';
import dataLogger from '../utils/DataLogger';

const dictionaryService = {
  /**
   * Pobieranie wszystkich słowników
   * @returns {Promise} - Obiekt zawierający wszystkie słowniki
   */
  getDictionaries: async () => {
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('GET', '/dictionary', null, null);
      
      const response = await api.get('/dictionary');
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('GET', '/dictionary', response.status, response.data, duration);
      
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
      
      const formattedData = {
        departments: formattedDepartments,
        groups: formattedGroups,
        serviceTypes: formattedServiceTypes,
        contractors: formattedContractors,
        costCategories: formattedCostCategories
      };
      
      dataLogger.dataFlow('dictionaryService', 'getDictionaries', 
        {}, 
        { 
          departments: formattedDepartments.length, 
          groups: formattedGroups.length,
          serviceTypes: formattedServiceTypes.length,
          contractors: formattedContractors.length,
          costCategories: formattedCostCategories.length
        }
      );
      
      return formattedData;
    } catch (error) {
      dataLogger.apiError('GET', '/dictionary', error);
      throw new Error(error.response?.data?.message || 'Błąd pobierania słowników');
    }
  },
  
  /**
   * Pobieranie konkretnego słownika
   * @param {string} type - Typ słownika (departments, groups, serviceTypes, contractors, costCategories)
   * @returns {Promise} - Lista elementów słownika
   */
  getDictionaryItems: async (type) => {
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('GET', `/dictionary/${type}`, null, null);
      
      const response = await api.get(`/dictionary/${type}`);
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('GET', `/dictionary/${type}`, response.status, response.data, duration);
      
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
      
      dataLogger.dataFlow('dictionaryService', 'getDictionaryItems', 
        { type }, 
        { itemsCount: formattedItems.length }
      );
      
      return formattedItems;
    } catch (error) {
      dataLogger.apiError('GET', `/dictionary/${type}`, error, { type });
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
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('POST', `/dictionary/${type}`, null, itemData);
      
      const response = await api.post(`/dictionary/${type}`, itemData);
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('POST', `/dictionary/${type}`, response.status, response.data, duration);
      
      dataLogger.dataFlow('dictionaryService', 'addDictionaryItem', 
        { type, itemData }, 
        { result: response.data }
      );
      
      return response.data;
    } catch (error) {
      dataLogger.apiError('POST', `/dictionary/${type}`, error, { type, itemData });
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
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('PUT', `/dictionary/${type}/${id}`, null, itemData);
      
      const response = await api.put(`/dictionary/${type}/${id}`, itemData);
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('PUT', `/dictionary/${type}/${id}`, response.status, response.data, duration);
      
      dataLogger.dataFlow('dictionaryService', 'updateDictionaryItem', 
        { type, id, itemData }, 
        { result: response.data }
      );
      
      return response.data;
    } catch (error) {
      dataLogger.apiError('PUT', `/dictionary/${type}/${id}`, error, { type, id, itemData });
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
    const startTime = Date.now();
    try {
      dataLogger.apiRequest('DELETE', `/dictionary/${type}/${id}`, null, null);
      
      const response = await api.delete(`/dictionary/${type}/${id}`);
      
      const duration = Date.now() - startTime;
      dataLogger.apiResponse('DELETE', `/dictionary/${type}/${id}`, response.status, response.data, duration);
      
      dataLogger.dataFlow('dictionaryService', 'deleteDictionaryItem', 
        { type, id }, 
        { result: response.data }
      );
      
      return response.data;
    } catch (error) {
      dataLogger.apiError('DELETE', `/dictionary/${type}/${id}`, error, { type, id });
      throw new Error(error.response?.data?.message || `Błąd usuwania elementu słownika ${type}`);
    }
  }
};

export default dictionaryService;
