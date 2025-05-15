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
        
        // Überprüfe alle möglichen Schlüssel für die Rolle
        // und konvertiere sie zu einer Zahl
        if (decoded.RechteID !== undefined) {
            return Number(decoded.RechteID);
        } else if (decoded.rechte_id !== undefined) {
            return Number(decoded.rechte_id);
        } else if (decoded.rolle !== undefined) {
            return Number(decoded.rolle);
        } else {
            console.warn("Keine Rolle im Token gefunden");
            return 0;
        }
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