import React from 'react';
import { BrowserRouter as Router, Routes, Link, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import Navbar from './components/Navbar';
import './styles/App.css';

function App() {
  return (
    <Router>
      <Navbar/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route path="/CreateEvent" element={<CreateEvent />} />
        </Routes>
    </Router>
  );
}

export default App;
