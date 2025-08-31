import { useAuthStore } from '@/state/auth-store'
import { Guardian, Child } from '@ai-education/schemas'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// API Response types
interface LoginResponse {
  guardian: Guardian
  accessToken: string
  refreshToken: string
  expiresIn: number
}

interface ProgressData {
  childId: string
  totalSessions: number
  totalTimeMinutes: number
  currentLevel: string
  totalLessons: number
  completedLessons: number
  averageScore: number
  streakDays: number
}

interface ProgressReport {
  childId: string
  period: string
  reportPeriod: string
  summary: string
  detailedProgress: any[]
  achievements: string[]
  recommendations: string[]
}

interface SessionData {
  id: string
  childId: string
  lessonId: string
  subject: string
  agentId: string
  status: string
  startTime: string
  startedAt: string
  endedAt?: string
  score?: number
  feedback?: string
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api/v1${endpoint}`
    
    const { accessToken } = useAuthStore.getState()
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
    termsAccepted: boolean
  }): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  async getCurrentUser(): Promise<Guardian> {
    return this.request<Guardian>('/auth/me')
  }

  // Children endpoints
  async getChildren(): Promise<Child[]> {
    return this.request<Child[]>('/children/')
  }

  async createChild(childData: {
    firstName: string
    birthDate: string
    ageGroup: string
    preferredLanguage?: string
  }): Promise<Child> {
    return this.request<Child>('/children/', {
      method: 'POST',
      body: JSON.stringify(childData),
    })
  }

  async getChild(childId: string): Promise<Child> {
    return this.request<Child>(`/children/${childId}`)
  }

  async updateChild(childId: string, childData: {
    firstName?: string
    lastName?: string
    dateOfBirth?: string
    gender?: string
    preferredLanguage?: string
    learningLevel?: string
    interests?: string[]
    specialNeeds?: string
    isActive?: boolean
  }): Promise<Child> {
    return this.request<Child>(`/children/${childId}`, {
      method: 'PUT',
      body: JSON.stringify(childData),
    })
  }

  async deleteChild(childId: string): Promise<void> {
    return this.request<void>(`/children/${childId}`, {
      method: 'DELETE',
    })
  }

  // Sessions endpoints
  async startSession(sessionData: {
    childId: string
    lessonId: string
    agentId: string
    subject?: string
  }): Promise<SessionData> {
    return this.request<SessionData>('/sessions/start', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    })
  }

  async sendMessage(sessionId: string, messageData: {
    content: string
    contentType?: string
  }): Promise<any> {
    return this.request<any>(`/sessions/${sessionId}/message`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    })
  }

  async getSessionMessages(sessionId: string): Promise<any[]> {
    return this.request<any[]>(`/sessions/${sessionId}/messages`)
  }

  async endSession(sessionId: string): Promise<SessionData> {
    return this.request<SessionData>(`/sessions/${sessionId}/end`, {
      method: 'POST',
    })
  }

  async getSession(sessionId: string): Promise<SessionData> {
    return this.request<SessionData>(`/sessions/${sessionId}`)
  }

  // Agents endpoints
  async getAgents() {
    return this.request('/agents/')
  }

  async getAgent(agentId: string) {
    return this.request(`/agents/${agentId}`)
  }

  async chatWithAgent(agentId: string, messageData: {
    content: string
    childName?: string
  }) {
    return this.request(`/agents/${agentId}/chat`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    })
  }

  // Lessons endpoints
  async getLessons(filters?: {
    subject?: string
    ageGroup?: string
  }) {
    const queryParams = new URLSearchParams()
    if (filters?.subject) queryParams.append('subject', filters.subject)
    if (filters?.ageGroup) queryParams.append('age_group', filters.ageGroup)
    
    const query = queryParams.toString()
    return this.request(`/lessons/${query ? `?${query}` : ''}`)
  }

  async getLesson(lessonId: string) {
    return this.request(`/lessons/${lessonId}`)
  }

  async seedLessons() {
    return this.request('/lessons/seed', {
      method: 'POST',
    })
  }

  // Assessment endpoints
  async getChildProgress(childId: string): Promise<ProgressData> {
    return this.request<ProgressData>(`/assessments/child/${childId}/progress`)
  }

  async generateProgressReport(childId: string, days: number = 7): Promise<ProgressReport> {
    return this.request<ProgressReport>(`/assessments/child/${childId}/report?days=${days}`)
  }
}

export const apiClient = new ApiClient()
export default apiClient
