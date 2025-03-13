// client/src/services/authService.js
import axios from 'axios';

const API_URL = '/api/auth';

const authService = {
  register: async (username, email, password) => {
    const response = await axios.post(`${API_URL}/register`, { username, email, password });
    return response.data.token;
  },

  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data.token;
  },

  getDashboard: async (token) => {
    const response = await axios.get(`${API_URL}/dashboard`, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  },

  getUsers: async (token) => {
    const response = await axios.get(`${API_URL}/users`, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  },

  editUser: async (token, userId, updates) => {
    const response = await axios.put(`${API_URL}/users/${userId}`, updates, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  },

  deleteUser: async (token, userId) => {
    const response = await axios.delete(`${API_URL}/users/${userId}`, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  },

  requestPasswordReset: async (email) => {
    const response = await axios.post(`${API_URL}/reset-password-request`, { email });
    return response.data;
  },
  
  resetPassword: async (token, password) => {
    const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
    return response.data;
  },

  createTodo: async (token, text) => {
    const response = await axios.post(`${API_URL}/todos`, { text }, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  },
  
  getTodos: async (token) => {
    const response = await axios.get(`${API_URL}/todos`, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  },
  
  updateTodo: async (token, todoId, updates) => {
    const response = await axios.put(`${API_URL}/todos/${todoId}`, updates, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  },
  
  deleteTodo: async (token, todoId) => {
    const response = await axios.delete(`${API_URL}/todos/${todoId}`, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  },

};

export default authService;