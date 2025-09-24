import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StyleGuideDashboard from './pages/StyleGuideDashboard';
import ComponentShowcase from './pages/ComponentShowcase';
import TokenSystemPage from './pages/TokenSystemPage';

/**
 * Style Guide Dashboard Routes
 * 스타일 가이드 대시보드의 라우팅 시스템
 */
const StyleDashRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<StyleGuideDashboard />} />
      <Route path="/components" element={<ComponentShowcase />} />
      <Route path="/tokens" element={<TokenSystemPage />} />
    </Routes>
  );
};

export default StyleDashRoutes;