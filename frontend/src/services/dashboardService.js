import api from './api';

const dashboardService = {
  /**
   * Pobieranie danych do dashboardu
   * @param {Object} filters - Filtry do zastosowania
   * @returns {Promise} - Obiekt z danymi do dashboardu
   */
  getDashboardData: async (filters = {}) => {
    try {
      console.log('Pobieranie danych dashboardu z parametrami:', filters);
      
      // Pobierz dane z endpointu dashboard
      const dashboardResponse = await api.get('/dashboard', { params: filters });
      console.log('Otrzymane dane z /dashboard:', dashboardResponse.data);
      
      // Pobierz dane podsumowania
      const summaryResponse = await api.get('/dashboard/summary', { params: filters });
      console.log('Otrzymane dane z /dashboard/summary:', summaryResponse.data);
      
      // Pobierz dane miesięczne
      const monthlyResponse = await api.get('/dashboard/monthly-data', { params: filters });
      console.log('Otrzymane dane z /dashboard/monthly-data:', monthlyResponse.data);
      
      // Mapuj dane do formatu oczekiwanego przez frontend
      const dashboardData = dashboardResponse.data || {};
      const summaryData = summaryResponse.data || {};
      const monthlyData = monthlyResponse.data || [];
      
      // Przygotuj dane KPI
      const kpis = {
        totalRevenue: summaryData.totalSales || 0,
        totalCosts: (summaryData.totalPurchases || 0) + (summaryData.totalPayroll || 0),
        totalProfit: summaryData.result || 0,
        profitMargin: summaryData.totalSales ? (summaryData.result / summaryData.totalSales) * 100 : 0,
        averageRevenue: summaryData.totalSales ? summaryData.totalSales / 12 : 0,
        averageCost: summaryData.totalPurchases ? (summaryData.totalPurchases + summaryData.totalPayroll) / 12 : 0
      };
      
      // Przygotuj dane wykresów
      const charts = {
        revenueByMonth: monthlyData.map(item => ({
          month: item.month,
          value: item.sales
        })),
        costsByMonth: monthlyData.map(item => ({
          month: item.month,
          value: item.purchases + item.payroll
        })),
        profitByMonth: monthlyData.map(item => ({
          month: item.month,
          value: item.result
        })),
        revenueByDepartment: [],
        costsByDepartment: [],
        profitByDepartment: []
      };
      
      // Przygotuj dane porównawcze
      const comparisons = {
        currentPeriod: dashboardData.currentPeriod || {},
        previousPeriod: dashboardData.previousPeriod || {},
        percentageChange: dashboardData.changes || {}
      };
      
      console.log('Zmapowane dane dashboardu:', { kpis, charts, comparisons });
      
      return {
        kpis,
        charts,
        comparisons
      };
    } catch (error) {
      console.error('Błąd pobierania danych dashboardu:', error);
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
      const response = await api.get('/dashboard/summary', { params: filters });
      const data = response.data || {};
      
      // Mapuj dane do formatu oczekiwanego przez frontend
      return {
        totalRevenue: data.totalSales || 0,
        totalCosts: (data.totalPurchases || 0) + (data.totalPayroll || 0),
        totalProfit: data.result || 0,
        profitMargin: data.totalSales ? (data.result / data.totalSales) * 100 : 0,
        averageRevenue: data.totalSales ? data.totalSales / 12 : 0,
        averageCost: data.totalPurchases ? (data.totalPurchases + data.totalPayroll) / 12 : 0
      };
    } catch (error) {
      console.error('Błąd pobierania danych KPI:', error);
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
      const response = await api.get('/dashboard/monthly-data', { params: filters });
      const monthlyData = response.data || [];
      
      // Mapuj dane do formatu oczekiwanego przez frontend w zależności od typu wykresu
      switch (chartType) {
        case 'revenueByMonth':
          return monthlyData.map(item => ({
            month: item.month,
            value: item.sales
          }));
        case 'costsByMonth':
          return monthlyData.map(item => ({
            month: item.month,
            value: item.purchases + item.payroll
          }));
        case 'profitByMonth':
          return monthlyData.map(item => ({
            month: item.month,
            value: item.result
          }));
        default:
          return [];
      }
    } catch (error) {
      console.error('Błąd pobierania danych wykresu:', error);
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
      const response = await api.get('/dashboard', { params });
      const data = response.data || {};
      
      return {
        currentPeriod: data.currentPeriod || {},
        previousPeriod: data.previousPeriod || {},
        percentageChange: data.changes || {}
      };
    } catch (error) {
      console.error('Błąd pobierania danych porównawczych:', error);
      throw new Error(error.response?.data?.message || 'Błąd pobierania danych porównawczych');
    }
  }
};

export default dashboardService;
