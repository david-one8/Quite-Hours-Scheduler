// lib/api.ts
import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = 'https://quite-hours-scheduler-1.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Base Types - MUST BE EXPORTED
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
}

export interface StudySchedule {
  _id: string;
  studyTopic: string;
  studyTime: string;
  days: string[];
  description?: string;
  isActive: boolean;
  reminderSent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  active?: boolean;
  search?: string;
}

export interface PaginationInfo {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }): Promise<AxiosResponse<ApiResponse<{ token: string; user: User }>>> =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }): Promise<AxiosResponse<ApiResponse<{ token: string; user: User }>>> =>
    api.post('/auth/login', data),
  getProfile: (): Promise<AxiosResponse<ApiResponse<{ user: User }>>> =>
    api.get('/auth/profile'),
};

// Study Schedule API
export const studyAPI = {
  create: (data: Partial<StudySchedule>): Promise<AxiosResponse<ApiResponse<{ schedule: StudySchedule }>>> =>
    api.post('/study-schedules', data),
  getAll: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<{ schedules: StudySchedule[]; pagination: PaginationInfo }>>> =>
    api.get('/study-schedules', { params }),
  getById: (id: string): Promise<AxiosResponse<ApiResponse<{ schedule: StudySchedule }>>> =>
    api.get(`/study-schedules/${id}`),
  update: (id: string, data: Partial<StudySchedule>): Promise<AxiosResponse<ApiResponse<{ schedule: StudySchedule }>>> =>
    api.put(`/study-schedules/${id}`, data),
  delete: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/study-schedules/${id}`),
  toggle: (id: string): Promise<AxiosResponse<ApiResponse<{ schedule: StudySchedule }>>> =>
    api.patch(`/study-schedules/${id}/toggle`),
};

// Health check API
export const healthAPI = {
  check: (): Promise<AxiosResponse<ApiResponse<{ status: string; timestamp: string }>>> =>
    api.get('/health'),
};

// Utility function for handling API errors
export function handleApiError(error: unknown): string {
  if (error && typeof error === 'object') {
    const err = error as { 
      response?: { 
        data?: { 
          message?: string; 
          errors?: Array<{ message: string }> 
        } 
      }; 
      message?: string 
    };
    
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    
    if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
      return err.response.data.errors
        .map(e => e.message)
        .join(', ');
    }
    
    if (err.message) {
      return err.message;
    }
  }
  
  return 'An unexpected error occurred';
}

// Helper functions for formatting
export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function formatDays(days: string[]): string {
  if (!days || days.length === 0) return 'No days selected';
  
  const dayNames: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue', 
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  };
  
  return days.map(day => dayNames[day]).join(', ');
}

export default api;
