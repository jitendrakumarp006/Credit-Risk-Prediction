// API Service client for Python FastAPI backend integration
// Supports health checks, model catalog, metadata, prediction, and structured error reporting

export function normalizeApiUrl(rawUrl) {
  if (!rawUrl) return 'http://localhost:8000/api';
  let url = String(rawUrl).trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
}

const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api');
const DEFAULT_TIMEOUT_MS = 6000;

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.isBackendConnected = false;
    this.artifactLoaded = false;
    this.backendMode = 'unavailable';
  }

  setBaseUrl(url) {
    if (!url) return;
    this.baseUrl = normalizeApiUrl(url);
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  /**
   * Health check query against GET /api/health
   */
  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        this.isBackendConnected = false;
        this.artifactLoaded = false;
        this.backendMode = 'unavailable';
        return {
          connected: false,
          status: response.status,
          error: `Backend returned HTTP ${response.status}`
        };
      }

      const data = await response.json();
      const isLive = data.artifact_loaded === true && data.mode === 'live';

      this.isBackendConnected = true;
      this.artifactLoaded = data.artifact_loaded === true;
      this.backendMode = data.mode || (isLive ? 'live' : 'unavailable');

      return {
        connected: true,
        status: response.status,
        data,
        isLive,
        artifactLoaded: this.artifactLoaded,
        message: data.message || 'FastAPI service operational'
      };
    } catch (err) {
      this.isBackendConnected = false;
      this.artifactLoaded = false;
      this.backendMode = 'unavailable';
      return {
        connected: false,
        error: err.name === 'AbortError' ? 'Connection timed out' : 'Backend offline (using browser simulation mode)'
      };
    }
  }

  /**
   * Fetch available model catalog from GET /api/models
   */
  async getModels() {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch models: HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      return { models: [], error: err.message };
    }
  }

  /**
   * Fetch metadata from GET /api/metadata
   */
  async getMetadata() {
    try {
      const response = await fetch(`${this.baseUrl}/metadata`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      return { error: err.message };
    }
  }

  /**
   * Translates UI model name to backend model ID
   */
  normalizeModelId(modelType) {
    if (!modelType) return 'random_forest';
    const clean = String(modelType).toLowerCase().trim();
    if (clean.includes('forest') || clean.includes('random')) return 'random_forest';
    if (clean.includes('tree') || clean.includes('decision')) return 'decision_tree';
    if (clean.includes('logistic') || clean.includes('regression')) return 'logistic_regression';
    if (clean.includes('svm') || clean.includes('support')) return 'svm';
    return clean;
  }

  /**
   * Predict risk via POST /api/predict
   */
  async predictRisk(applicantData, modelType = 'Random Forest') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    const modelId = this.normalizeModelId(modelType);

    const payload = {
      applicant: {
        age: Number(applicantData.age),
        sex: String(applicantData.sex).toLowerCase().trim(),
        job: Number(applicantData.job),
        housing: String(applicantData.housing).toLowerCase().trim(),
        savingAccounts: String(applicantData.savingAccounts || 'unknown').toLowerCase().trim(),
        checkingAccount: String(applicantData.checkingAccount || 'unknown').toLowerCase().trim(),
        creditAmount: Number(applicantData.creditAmount),
        duration: Number(applicantData.duration),
        purpose: String(applicantData.purpose).toLowerCase().trim()
      },
      model: modelId
    };

    try {
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorDetail = data.detail || `Server returned HTTP ${response.status}`;
        return {
          success: false,
          status: response.status,
          source: 'live_api_failed',
          error: errorDetail
        };
      }

      return {
        success: true,
        source: 'live_api',
        data
      };
    } catch (err) {
      clearTimeout(timeoutId);
      return {
        success: false,
        status: 0,
        source: 'live_api_failed',
        error: err.name === 'AbortError' ? 'Request timed out after 6s' : err.message
      };
    }
  }
}

export const api = new ApiClient();
