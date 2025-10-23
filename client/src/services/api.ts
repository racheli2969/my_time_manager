const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  async getTasksByUserOrAssigned(userId: string, page?: number, pageSize?: number) {
    // Backend should support filtering by createdBy or assignedTo
    let url = `/tasks?userId=${userId}`;
    if (page !== undefined && pageSize !== undefined) {
      url += `&page=${page}&pageSize=${pageSize}`;
    }
    return this.request(url);
  }
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  // Ensure token is refreshed from localStorage on every request
  private refreshToken() {
    this.token = localStorage.getItem('token');
  }

  private async refreshAuthToken(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.request('/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      // Store new tokens using consistent property names with backend response
      this.token = response.accessToken;
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    } catch (error) {
      console.error('Failed to refresh auth token:', error);
      this.logout();
      throw error; // Re-throw to prevent infinite refresh loops
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = localStorage.getItem('token');
    this.token = token;

    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized
      if (response.status === 401 && endpoint !== '/auth/refresh') {
        try {
          await this.refreshAuthToken();
          // Retry the original request with new token
          return this.request(endpoint, options);
        } catch (refreshError) {
          // If refresh fails, log out and throw error
          this.logout();
          throw new Error('Authentication failed. Please log in again.');
        }
      }

      if (response.status === 204) {
        return null;
      }

      const text = await response.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      if (!response.ok) {
        const errorMsg = (data && data.error) ? data.error : (typeof data === 'string' ? data : 'Request failed');
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store tokens using consistent property names with backend response
    if (response.accessToken && response.refreshToken) {
      this.token = response.accessToken;
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response;
  }

  async register(name: string, email: string, password: string, role = 'user') {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    
    // Store tokens using consistent property names with backend response
    if (response.accessToken && response.refreshToken) {
      this.token = response.accessToken;
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response;
  }

  /**
   * Authenticate user with Google OAuth credential
   * 
   * Sends Google JWT credential to backend for verification and user creation/login.
   * 
   * @param credential - JWT token from Google OAuth (@react-oauth/google)
   * @returns Authentication response with user data and JWT tokens
   */
  async loginWithGoogle(credential: string) {
    const response = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    
    // Store tokens using consistent property names with backend response
    if (response.accessToken && response.refreshToken) {
      this.token = response.accessToken;
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    // Optionally, you might want to redirect to login page or trigger a global logout event
    window.dispatchEvent(new Event('logout'));
  }

  // Task methods
  async getTasks(page?: number, pageSize?: number) {
    let url = '/tasks';
    if (page !== undefined && pageSize !== undefined) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }
    return this.request(url);
  }

  async createTask(task: any) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: any) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async splitTask(id: string, intervals: number) {
    return this.request(`/tasks/${id}/split`, {
      method: 'POST',
      body: JSON.stringify({ intervals }),
    });
  }

  // Team methods
  async getTeams() {
    return this.request('/teams');
  }

  async createTeam(team: any) {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(team),
    });
  }

  async updateTeam(id: string, team: any) {
    return this.request(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(team),
    });
  }

  async deleteTeam(id: string) {
    return this.request(`/teams/${id}`, {
      method: 'DELETE',
    });
  }


  // User methods
  async getUsers() {
    return this.request('/users');
  }

  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(profile: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // Schedule methods
  async generateSchedule(userId: string, options: any = {}) {
    return this.request('/schedule/generate', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async getSchedule() {
    return this.request('/schedule');
  }

  async updateScheduleEntry(entryId: string, updates: any) {
    return this.request(`/schedule/entry/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getScheduleConflicts() {
    return this.request('/schedule/conflicts');
  }

  async resolveConflict(conflictId: string, resolutionAction: string) {
    return this.request(`/schedule/conflicts/${conflictId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ resolutionAction }),
    });
  }

  async getSchedulePreferences() {
    return this.request('/schedule/preferences');
  }

  async updateSchedulePreferences(preferences: any) {
    return this.request('/schedule/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async addPersonalEvent(event: any) {
    return this.request('/schedule/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async getPersonalEvents(startDate?: string, endDate?: string) {
    let url = '/schedule/events';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return this.request(url);
  }

  async deletePersonalEvent(eventId: string) {
    return this.request(`/schedule/events/${eventId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();