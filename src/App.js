import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import Dashboard from './Pages/Dashboard';
import Verwaltung from './Pages/Verwaltung';
import PasswortVergessen from "./Pages/PasswortVergessen";
import { isLoggedIn } from './utils/auth';
import '@mantine/core/styles.css';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={
                    isLoggedIn() ? <Dashboard /> : <Navigate to="/login" />
                } />
                 <Route path="/verwaltung" element={<Verwaltung />} />
                 <Route path="/passwort-vergessen" element={<PasswortVergessen />} />
                
                {/* Hier kannst du später weitere protected pages hinzufügen */}
            </Routes>
        </Router>
    );
}

export default App;
