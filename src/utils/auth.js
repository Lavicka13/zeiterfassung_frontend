import { jwtDecode } from "jwt-decode";

export function getToken() {
    return localStorage.getItem('token');
}

export function getRolle() {
    const token = getToken();
    
    if (!token) {
        return 0; // Nicht eingeloggt
    }
    
    try {
        const decoded = jwtDecode(token);
        return decoded.RechteID || 0;
    } catch (error) {
        console.error("Fehler beim Dekodieren des Tokens:", error);
        return 0;
    }
}

export function isLoggedIn() {
    return !!getToken();
}

export function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}