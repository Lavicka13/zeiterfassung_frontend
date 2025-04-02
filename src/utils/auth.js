export function getToken() {
    return localStorage.getItem('token');
}

export function getRolle() {
    return parseInt(localStorage.getItem('rechte_id'), 10) || 0;
}

// 👉 Das hast du vergessen
export function isLoggedIn() {
    return !!getToken();
}
