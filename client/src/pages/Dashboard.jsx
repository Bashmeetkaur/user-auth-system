import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import authService from '../services/authService';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await authService.getDashboard(token);
        setUsername(dashboardData.user.username);
        setRole(dashboardData.user.role);

        const todosData = await authService.getTodos(token);
        setTodos(todosData);

        if (dashboardData.user.role === 'admin') {
          const usersData = await authService.getUsers(token);
          setUsers(usersData);
        }
      } catch (error) {
        console.error('Fetch failed:', error);
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        }
      }
    };
    fetchData();
  }, [token, logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEdit = (user) => {
    setEditingUser({ ...user });
  };

  const handleSaveEdit = async () => {
    try {
      const updates = { username: editingUser.username, role: editingUser.role };
      await authService.editUser(token, editingUser._id, updates);
      setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...updates } : u));
      setEditingUser(null);
    } catch (error) {
      console.error('Edit failed:', error);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await authService.deleteUser(token, userId);
        setUsers(users.filter(u => u._id !== userId));
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    try {
      const todo = await authService.createTodo(token, newTodo);
      setTodos([...todos, todo]);
      setNewTodo('');
    } catch (error) {
      console.error('Add todo failed:', error);
    }
  };

  const handleToggleTodo = async (todoId, completed) => {
    try {
      const updatedTodo = await authService.updateTodo(token, todoId, { completed: !completed });
      setTodos(todos.map(t => t._id === todoId ? updatedTodo : t));
    } catch (error) {
      console.error('Toggle todo failed:', error);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      await authService.deleteTodo(token, todoId);
      setTodos(todos.filter(t => t._id !== todoId));
    } catch (error) {
      console.error('Delete todo failed:', error);
    }
  };

  return (
    <div className="container mt-2">
      <div className="custom-container">
        <h1 className="heading">Dashboard</h1>
        <p>Welcome, {username || 'User'}! You are logged in as a {role || 'user'}.</p>
        <h2>Your Todos</h2>
        <form onSubmit={handleAddTodo} className="mb-3">
          <input
            type="text"
            className="form-input"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo"
            required
          />
          <button type="submit" className="form-button ms-2">Add</button>
        </form>
        <ul className="list-group">
          {todos.map(todo => (
            <li key={todo._id} className="list-group-item d-flex justify-content-between align-items-center">
              <span
                style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
                onClick={() => handleToggleTodo(todo._id, todo.completed)}
              >
                {todo.text}
              </span>
              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteTodo(todo._id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
        <p>Welcome, {username || 'User'}! You are logged in as a {role || 'user'}.</p>

        {role === 'admin' ? (
          <div>
            <h2 className="heading">Admin Panel - User Management</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <button
                        className="form-button me-2"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="form-button"
                        onClick={() => handleDelete(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {editingUser && (
              <div className="mt-3">
                <h3 className="heading">Edit User</h3>
                <input
                  type="text"
                  className="form-input mb-2"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                />
                <select
                  className="form-input mb-2"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <button className="form-button" onClick={handleSaveEdit}>
                  Save
                </button>
                <button
                  className="form-button ms-2"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="para">This is the normal user dashboard. Enjoy your stay!</p>
        )}

        <button className="form-button mt-3" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;