/* eslint-disable no-unused-vars */

import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Sala from './pages/Sala.jsx'
// import './App.css';
import Partida from './pages/Partida.jsx'
import History  from './pages/History.jsx';
import Signup from './pages/Signup.jsx';

function App() {
  return (
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/sala" element={<Sala />} />
        <Route path="/partida" element={<Partida />} />
        <Route path="/history" element={<History />} />
        <Route path="/signup" element={<Signup />} />

      </Routes>
  );
}

export default App;

