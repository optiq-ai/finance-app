import api from './api';

const dictionaryService = {
  /**
   * Pobieranie wszystkich słowników
   * @returns {Promise} - Obiekt zawierający wszystkie słowniki
   */
  getDictionaries: async () => {
    try {
      const response = await api.get('/dictionary');
      return response.data;
    } catch (error) {
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
      const response = await api.get(`/dictionary/${type}`);
      return response.data;
    } catch (error) {
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
      const response = await api.post(`/dictionary/${type}`, itemData);
      return response.data;
    } catch (error) {
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
      const response = await api.put(`/dictionary/${type}/${id}`, itemData);
      return response.data;
    } catch (error) {
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
      const response = await api.delete(`/dictionary/${type}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || `Błąd usuwania elementu słownika ${type}`);
    }
  }
};

export default dictionaryService;
