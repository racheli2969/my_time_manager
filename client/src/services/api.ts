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

  private async request(endpoint: string, options: RequestInit = {}) {
    this.refreshToken(); // Refresh token before making a request
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    // If response is 204 No Content, don't try to parse JSON
    if (response.status === 204) {
      return null;
    }

    // Read the body only once
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
      // If error, use parsed data or text as error message
      const errorMsg = (data && data.error) ? data.error : (typeof data === 'string' ? data : 'Request failed');
      throw new Error(errorMsg);
    }

    return data;
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.token = response.token;
    localStorage.setItem('token', response.token);
    return response;
  }

  async register(name: string, email: string, password: string, role = 'user') {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    
    this.token = response.token;
    localStorage.setItem('token', response.token);
    return response;
  }

  /**
   * Authenticate user with Google OAuth credential
   * @param credential - JWT token from Google
   * @returns Authentication response with user data and JWT token
   */
  async loginWithGoogle(credential: string) {
    const response = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    
    this.token = response.token;
    localStorage.setItem('token', response.token);
    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
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