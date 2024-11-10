/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import '../style/Signup.css'; 

const Signup = () => {
  const [adminToken, setAdminToken] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Función para obtener el token de administrador
    const fetchAdminToken = async () => {
      const params = new URLSearchParams();
      params.append('client_id', 'bingo-backEnd');
      params.append('client_secret', 'KAYxA2v8YYmswj6NgtJXe8kFKPk5TlGi');
      params.append('scope', 'openid');
      params.append('username', 'admin');
      params.append('password', 'admin');
      params.append('grant_type', 'password');

      try {
        const response = await fetch('http://localhost:8080/realms/bingo/protocol/openid-connect/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        });

        if (!response.ok) {
          throw new Error('Error al obtener el token');
        }

        const data = await response.json();
        setAdminToken(data.access_token);
      } catch (error) {
        setError('No se pudo obtener el token de administrador');
      }
    };

    fetchAdminToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!username || !email || !firstName || !lastName || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }

    const userData = {
      username,
      email,
      firstName,
      lastName,
      enabled: true,
      emailVerified: false,
      credentials: [
        {
          type: 'password',
          value: password,
          temporary: false,
        },
      ],
    };

    try {
      const response = await fetch('http://localhost:8080/admin/realms/bingo/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        alert('Usuario registrado exitosamente');
        // Limpiar campos
        setUsername('');
        setEmail('');
        setFirstName('');
        setLastName('');
        setPassword('');
      } else {
        throw new Error('Error al registrar el usuario');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="signup-container">
      <h2>Formulario de Registro</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="signup-form">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="submit-btn">Registrar Usuario</button>
      </form>
    </div>
  );
};

export default Signup;
