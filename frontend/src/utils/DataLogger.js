class DataLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }

  log(source, action, message, data = null) {
    this._addLog(source, action, 'INFO', message, data);
    console.log(`[${source}] ${action}: ${message}`, data || '');
  }

  warn(source, action, message, data = null) {
    this._addLog(source, action, 'WARNING', message, data);
    console.warn(`[${source}] ${action}: ${message}`, data || '');
  }

  error(source, action, error, data = null) {
    const errorMessage = error.message || error.toString();
    this._addLog(source, action, 'ERROR', errorMessage, data, error);
    console.error(`[${source}] ${action}: ${errorMessage}`, error, data || '');
  }

  apiRequest(method, url, params = null, body = null) {
    this._addLog('API', `${method} ${url}`, 'INFO', 'Wysłanie żądania API', { params, body });
    console.log(`[API] ${method} ${url}: Wysłanie żądania API`, { params, body });
  }

  apiResponse(method, url, status, data, duration = null) {
    this._addLog('API', `${method} ${url}`, 'INFO', `Odpowiedź API (${status})`, { 
      status, 
      data, 
      duration: duration ? `${duration}ms` : null 
    });
    console.log(`[API] ${method} ${url}: Odpowiedź API (${status})`, { 
      status, 
      data: typeof data === 'object' ? '(object)' : data, 
      duration: duration ? `${duration}ms` : null 
    });
  }

  apiError(method, url, error, data = null) {
    const status = error.response?.status || 'unknown';
    const errorMessage = error.response?.data?.message || error.message || error.toString();
    
    this._addLog('API', `${method} ${url}`, 'ERROR', `Błąd API (${status}): ${errorMessage}`, data, error);
    console.error(`[API] ${method} ${url}: Błąd API (${status}): ${errorMessage}`, error, data || '');
  }

  dataFlow(source, action, input, output) {
    this._addLog(source, action, 'INFO', 'Przepływ danych', { input, output });
    console.log(`[${source}] ${action}: Przepływ danych`, { input, output });
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    console.log('Logi wyczyszczone');
  }

  _addLog(source, action, level, message, data = null, error = null) {
    const timestamp = new Date().toISOString();
    
    this.logs.unshift({
      timestamp,
      source,
      action,
      level,
      message,
      data,
      error: error ? { 
        message: error.message || error.toString(),
        stack: error.stack
      } : null
    });
    
    // Ograniczenie liczby logów
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }
}

// Eksport instancji singletona
const dataLogger = new DataLogger();
export default dataLogger;
