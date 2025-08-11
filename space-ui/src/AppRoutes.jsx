// src/AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Missions from './pages/Missions';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Missions />} />
      <Route path="/missions" element={<Missions />} />
    </Routes>
  );
};

export default AppRoutes;
