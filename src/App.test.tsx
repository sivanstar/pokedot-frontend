import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimpleLoginTest } from './pages/auth/SimpleLoginTest';

export const AppTest: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/test-login" element={<SimpleLoginTest />} />
      </Routes>
    </BrowserRouter>
  );
};
