// API Service Configuration for BideyaBoost
const API_CONFIG = {
  // Base URLs for different services
  BACKEND_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  AI_URL: process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000',
  
  // API Endpoints
  ENDPOINTS: {
    // AI Recommendations
    RECOMMENDATIONS: '/api/recommand',
    PSYCHO_PROFILE: '/api/v1/riasec/score',
    FEEDBACK: '/api/feedback',
    UNIVERSITIES: '/api/recommand',
    
    // Backend Auth
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      PROFILE: '/api/auth/profile',
      REFRESH_TOKEN: '/api/auth/refresh',
    },
    
    // Programs
    PROGRAMS: '/api/programs',
    
    // Contact
    CONTACT: '/api/contact',
  },
  
  TIMEOUT: 30000, // 30 seconds
};

class ApiService {
  private token: string | null = null;
  private backendURL: string;
  private aiURL: string;
  private timeout: number;

  constructor() {
    this.backendURL = API_CONFIG.BACKEND_URL;
    this.aiURL = API_CONFIG.AI_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Generic request method
  async request<T>(
    baseURL: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string; status?: number }> {
    const url = `${baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      return {
        success: true,
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
        status: 500,
      };
    }
  }

  // Backend API methods
  async get<T>(endpoint: string, params: Record<string, string> = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request<T>(this.backendURL, url);
  }

  async post<T>(endpoint: string, data: unknown = {}) {
    return this.request<T>(this.backendURL, endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown = {}) {
    return this.request<T>(this.backendURL, endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string) {
    return this.request<T>(this.backendURL, endpoint, {
      method: 'DELETE',
    });
  }

  // AI Service methods
  async aiPost<T>(endpoint: string, data: unknown = {}) {
    return this.request<T>(this.aiURL, endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async aiGet<T>(endpoint: string, params: Record<string, string> = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request<T>(this.aiURL, url);
  }

  // Specific API methods for university recommendations
  async getRecommendations(requestData: {
    bac_type: string;
    bac_score: number;
    psycho_vector?: Record<string, number>;
    interests?: string[];
    learning_style?: string;
    limit?: number;
  }) {
    return this.aiPost(API_CONFIG.ENDPOINTS.RECOMMENDATIONS, requestData);
  }

  async submitFeedback(feedbackData: {
    user_id: string;
    program_id: string;
    feedback_type: 'accept' | 'reject' | 'save';
    bac_type: string;
    bac_score: number;
    psycho_vector?: Record<string, number>;
  }) {
    return this.aiPost(API_CONFIG.ENDPOINTS.FEEDBACK, feedbackData);
  }

  async getPsychometricProfile(answers: { question_id: number; answer: boolean }[]) {
    return this.aiPost(API_CONFIG.ENDPOINTS.PSYCHO_PROFILE, { answers });
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.post<{ token: string; user: unknown }>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      { email, password }
    );
    
    if (response.success && response.data) {
      const data = response.data as { token: string };
      this.setToken(data.token);
    }
    
    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
  }

  async getProfile() {
    return this.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
  }

  async getPrograms(filters?: {
    domain?: string;
    minScore?: number;
    bacType?: string;
  }) {
    const params: Record<string, string> = {};
    if (filters) {
      if (filters.domain) params.domain = filters.domain;
      if (filters.minScore) params.minScore = filters.minScore.toString();
      if (filters.bacType) params.bacType = filters.bacType;
    }
    return this.get(API_CONFIG.ENDPOINTS.PROGRAMS, params);
  }

  async submitContact(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    return this.post(API_CONFIG.ENDPOINTS.CONTACT, contactData);
  }

  logout() {
    this.setToken(null);
  }
}

// Create singleton instance
const apiService = new ApiService();

export { apiService, API_CONFIG };
export default apiService;
