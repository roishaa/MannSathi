import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Sessions from './pages/Sessions';
import MoodTracker from './pages/MoodTracker';
import Counselors from './pages/Counselors';
import Settings from './pages/Settings';
import DashboardLayout from './components/layout/DashboardLayout';

const App = () => {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/mood-tracker" element={<MoodTracker />} />
          <Route path="/counselors" element={<Counselors />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
};

export default App;