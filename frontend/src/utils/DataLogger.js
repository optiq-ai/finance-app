// DataLogger.js - Komponent do monitorowania i logowania przepływu danych w aplikacji

class DataLogger {
  constructor() {
    this.logs = [];
    this.enabled = true;
    this.maxLogs = 1000;
    this.consoleOutput = true;
    this.errorCallback = null;
    
    // Inicjalizacja w konsoli
    console.log('DataLogger: Inicjalizacja systemu logowania danych');
  }
  
  // Włączanie/wyłączanie logowania
  enable() {
    this.enabled = true;
    console.log('DataLogger: Logowanie włączone');
  }
  
  disable() {
    this.enabled = false;
    console.log('DataLogger: Logowanie wyłączone');
  }
  
  // Ustawienie maksymalnej liczby logów
  setMaxLogs(max) {
    this.maxLogs = max;
  }
  
  // Włączanie/wyłączanie wyjścia do konsoli
  setConsoleOutput(enabled) {
    this.consoleOutput = enabled;
  }
  
  // Ustawienie funkcji zwrotnej dla błędów
  setErrorCallback(callback) {
    if (typeof callback === 'function') {
      this.errorCallback = callback;
    }
  }
  
  // Logowanie informacji
  log(source, action, data) {
    if (!this.enabled) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      source,
      action,
      data,
      level: 'info'
    };
    
    this._addLogEntry(logEntry);
    
    if (this.consoleOutput) {
      console.log(`DataLogger [${source}] ${action}:`, data);
    }
  }
  
  // Logowanie ostrzeżeń
  warn(source, action, data) {
    if (!this.enabled) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      source,
      action,
      data,
      level: 'warning'
    };
    
    this._addLogEntry(logEntry);
    
    if (this.consoleOutput) {
      console.warn(`DataLogger [${source}] ${action}:`, data);
    }
  }
  
  // Logowanie błędów
  error(source, action, error, data = {}) {
    if (!this.enabled) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      source,
      action,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      data,
      level: 'error'
    };
    
    this._addLogEntry(logEntry);
    
    if (this.consoleOutput) {
      console.error(`DataLogger [${source}] ${action}:`, error, data);
    }
    
    // Wywołanie funkcji zwrotnej dla błędów, jeśli jest ustawiona
    if (this.errorCallback) {
      this.errorCallback(logEntry);
    }
  }
  
  // Logowanie przepływu danych
  dataFlow(source, action, inputData, outputData) {
    if (!this.enabled) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      source,
      action,
      inputData,
      outputData,
      level: 'data-flow'
    };
    
    this._addLogEntry(logEntry);
    
    if (this.consoleOutput) {
      console.log(`DataLogger [${source}] ${action} Data Flow:`, {
        input: inputData,
        output: outputData
      });
    }
  }
  
  // Logowanie stanu Redux
  reduxState(action, prevState, nextState) {
    if (!this.enabled) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      source: 'Redux',
      action: action.type,
      payload: action.payload,
      prevState,
      nextState,
      level: 'redux'
    };
    
    this._addLogEntry(logEntry);
    
    if (this.consoleOutput) {
      console.log(`DataLogger [Redux] ${action.type}:`, {
        payload: action.payload,
        prevState,
        nextState
      });
    }
  }
  
  // Logowanie żądań API
  apiRequest(method, url, params, data) {
    if (!this.enabled) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      source: 'API',
      action: 'Request',
      method,
      url,
      params,
      data,
      level: 'api'
    };
    
    this._addLogEntry(logEntry);
    
    if (this.consoleOutput) {
      console.log(`DataLogger [API] Request ${method} ${url}:`, {
        params,
        data
      });
    }
  }
  
  // Logowanie odpowiedzi API
  apiResponse(method, url, status, data, duration) {
    if (!this.enabled) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      source: 'API',
      action: 'Response',
      method,
      url,
      status,
      data,
      duration,
      level: 'api'
    };
    
    this._addLogEntry(logEntry);
    
    if (this.consoleOutput) {
      console.log(`DataLogger [API] Response ${method} ${url} (${status}) in ${duration}ms:`, data);
    }
  }
  
  // Logowanie błędów API
  apiError(method, url, error, data = {}) {
    if (!this.enabled) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      source: 'API',
      action: 'Error',
      method,
      url,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      data,
      level: 'api-error'
    };
    
    this._addLogEntry(logEntry);
    
    if (this.consoleOutput) {
      console.error(`DataLogger [API] Error ${method} ${url}:`, error, data);
    }
    
    // Wywołanie funkcji zwrotnej dla błędów, jeśli jest ustawiona
    if (this.errorCallback) {
      this.errorCallback(logEntry);
    }
  }
  
  // Pobieranie wszystkich logów
  getLogs() {
    return [...this.logs];
  }
  
  // Pobieranie logów według poziomu
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }
  
  // Pobieranie logów według źródła
  getLogsBySource(source) {
    return this.logs.filter(log => log.source === source);
  }
  
  // Czyszczenie logów
  clearLogs() {
    this.logs = [];
    if (this.consoleOutput) {
      console.log('DataLogger: Logi wyczyszczone');
    }
  }
  
  // Eksport logów do JSON
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
  
  // Prywatna metoda do dodawania wpisów do logów
  _addLogEntry(entry) {
    this.logs.push(entry);
    
    // Ograniczenie liczby logów
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }
}

// Singleton - jedna instancja dla całej aplikacji
const dataLogger = new DataLogger();
export default dataLogger;
