import api from './api';

const uploadService = {
  /**
   * Przesyłanie pliku Excel
   * @param {File} file - Plik do przesłania
   * @param {string} fileType - Typ pliku (purchases, payroll, sales)
   * @returns {Promise} - Obiekt z informacjami o przetworzonym pliku
   */
  uploadFile: async (file, fileType) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', fileType);
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd przesyłania pliku');
    }
  },
  
  /**
   * Pobieranie historii przesłanych plików
   * @returns {Promise} - Lista przesłanych plików
   */
  getUploadHistory: async () => {
    try {
      const response = await api.get('/upload/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching upload history:', error);
      throw new Error(error.response?.data?.message || 'Błąd pobierania historii przesłanych plików');
    }
  },
  
  /**
   * Pobieranie szczegółów przesłanego pliku
   * @param {number} id - ID przesłanego pliku
   * @returns {Promise} - Obiekt ze szczegółami przesłanego pliku
   */
  getUploadDetails: async (id) => {
    try {
      const response = await api.get(`/upload/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd pobierania szczegółów przesłanego pliku');
    }
  },
  
  /**
   * Usuwanie przesłanego pliku i powiązanych danych
   * @param {number} id - ID przesłanego pliku
   * @returns {Promise} - Komunikat o powodzeniu operacji
   */
  deleteUpload: async (id) => {
    try {
      const response = await api.delete(`/upload/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd usuwania przesłanego pliku');
    }
  }
};

export default uploadService;
