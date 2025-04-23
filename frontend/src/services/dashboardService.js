import api from './api';

const dashboardService = {
  /**
   * Pobieranie danych do dashboardu
   * @param {Object} filters - Filtry do zastosowania
   * @returns {Promise} - Obiekt z danymi do dashboardu
   */
  getDashboardData: async (filters = {}) => {
    try {
      const response = await api.get('/dashboard', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd pobierania danych dashboardu');
    }
  },
  
  /**
   * Pobieranie danych KPI
   * @param {Object} filters - Filtry do zastosowania
   * @returns {Promise} - Obiekt z danymi KPI
   */
  getKpiData: async (filters = {}) => {
    try {
      const response = await api.get('/dashboard/kpi', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd pobierania danych KPI');
    }
  },
  
  /**
   * Pobieranie danych do wykresów
   * @param {Object} filters - Filtry do zastosowania
   * @returns {Promise} - Obiekt z danymi do wykresów
   */
  getChartData: async (chartType, filters = {}) => {
    try {
      const response = await api.get(`/dashboard/charts/${chartType}`, { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd pobierania danych wykresu');
    }
  },
  
  /**
   * Pobieranie danych porównawczych dla okresów
   * @param {Object} params - Parametry porównania
   * @returns {Promise} - Obiekt z danymi porównawczymi
   */
  getComparisonData: async (params) => {
    try {
      const response = await api.post('/dashboard/comparison', params);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Błąd pobierania danych porównawczych');
    }
  }
};

export default dashboardService;
