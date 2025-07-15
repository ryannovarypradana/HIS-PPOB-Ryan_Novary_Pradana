import axios from 'axios';
import { ApiResponse } from '../types/api';

const BASE_URL = 'https://take-home-test-api.nutech-integrasi.com';


const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
const apis = axios.create({
  baseURL: BASE_URL,
  headers: {
  },
});


api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken'); 
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
apis.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken'); 
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


export const postData = async <T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
  try {
    const response = await api.post<ApiResponse<T>>(endpoint, data);
    const responseData = response.data;

    if (responseData.status !== 0) {
      throw new Error(responseData.message || 'Terjadi kesalahan pada server');
    }
    return responseData;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData: ApiResponse = error.response.data;
      throw new Error(errorData.message || 'Terjadi kesalahan pada server.');
    } else {
      throw new Error(error.message || 'Gagal terhubung ke server.');
    }
  }
};


export const getData = async <T = any>(endpoint: string, params?: any): Promise<ApiResponse<T>> => {
  try {
    const response = await api.get<ApiResponse<T>>(endpoint, { params });
    const responseData = response.data;

    if (responseData.status !== 0) {
      throw new Error(responseData.message || 'Terjadi kesalahan pada server');
    }
    return responseData;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData: ApiResponse = error.response.data;
      throw new Error(errorData.message || 'Terjadi kesalahan pada server.');
    } else {
      throw new Error(error.message || 'Gagal terhubung ke server.');
    }
  }
};


export const putData = async <T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
  try {
    const response = await api.put<ApiResponse<T>>(endpoint, data);
    const responseData = response.data;

    if (responseData.status !== 0) {
      throw new Error(responseData.message || 'Terjadi kesalahan pada server');
    }
    return responseData;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData: ApiResponse = error.response.data;
      throw new Error(errorData.message || 'Terjadi kesalahan pada server.');
    } else {
      throw new Error(error.message || 'Gagal terhubung ke server.');
    }
  }
};



export const putBinaryData = async <T = any>(endpoint: string, file: File): Promise<ApiResponse<T>> => {
  try {
    const formData = new FormData();
    formData.append('file', file); 
    
    
    
    const response = await apis.put<ApiResponse<T>>(endpoint, formData);

    const responseData = response.data;

    if (responseData.status !== 0) {
      throw new Error(responseData.message || `API error with status ${responseData.status}`);
    }
    return responseData;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData: ApiResponse = error.response.data;
      throw new Error(errorData?.message || `Terjadi kesalahan pada server: ${error.response.status}`);
    } else {
      throw new Error(error.message || 'Gagal terhubung ke server.');
    }
  }
};