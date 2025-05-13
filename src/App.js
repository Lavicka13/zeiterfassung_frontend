import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider, Box, AppShell } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import LoginPage from './Pages/LoginPage';
import Dashboard from './Pages/Dashboard';
import Verwaltung from './Pages/Verwaltung';
import PasswortVergessen from "./Pages/PasswortVergessen";
import Footer from './components/Footer';
import { isLoggedIn, getRolle } from './utils/auth';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

function App() {
    return (
        <MantineProvider>
            <Notifications position="top-right" />
            <AppShell
                padding="md"
                footer={<Footer />}
                styles={{
                    main: {
                        paddingBottom: '50px', // Platz für den Footer
                    },
                }}
            >
                <Router>
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/dashboard" element={
                            isLoggedIn() ? <Dashboard /> : <Navigate to="/login" />
                        } />
                        <Route path="/verwaltung" element={
                            isLoggedIn() && getRolle() >= 2 ? <Verwaltung /> : <Navigate to="/login" />
                        } />
                        <Route path="/passwort-vergessen" element={<PasswortVergessen />} />
                    </Routes>
                </Router>
            </AppShell>
        </MantineProvider>
    );
}

export default App;