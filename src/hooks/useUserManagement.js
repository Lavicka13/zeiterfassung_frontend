import { useState } from "react";
import { notifications } from '@mantine/notifications';
import axios from "axios";

export function useUserManagement(refreshCallback) {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCreateUser = async (userData) => {
    // Validierung
    if (!userData.Vorname || !userData.Nachname || !userData.Email || !userData.Passwort) {
      notifications.show({
        title: 'Fehler',
        message: 'Bitte alle Pflichtfelder ausfüllen',
        color: 'red',
      });
      return false;
    }
    
    if (userData.Passwort.length < 6) {
      notifications.show({
        title: 'Fehler',
        message: 'Bitte geben Sie ein gültiges Passwort mit mindestens 6 Zeichen ein.',
        color: 'red',
      });
      return false;
    }
    
    if (!validateEmail(userData.Email)) {
      notifications.show({
        title: 'Fehler',
        message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
        color: 'red',
      });
      return false;
    }
    
    setLoading(true);
    try {
      await axios.post("http://localhost:8080/api/mitarbeiter", userData, {
        headers: { Authorization: token },
      });
      
      notifications.show({
        title: 'Erfolg',
        message: 'Neuer Nutzer erfolgreich angelegt.',
        color: 'green',
      });
      
      if (refreshCallback) {
        refreshCallback();
      }
      return true;
    } catch (err) {
      console.error("Fehler beim Erstellen:", err);
      let errorMessage = 'Fehler beim Erstellen des Nutzers';
      
      if (err.response?.data?.error) {
        if (err.response.data.error.includes('Email')) {
          errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
        } else if (err.response.data.error.includes('Passwort')) {
          errorMessage = 'Bitte geben Sie ein gültiges Passwort mit mindestens 6 Zeichen ein.';
        } else {
          errorMessage = err.response.data.error;
        }
      }
      
      notifications.show({
        title: 'Fehler',
        message: errorMessage,
        color: 'red',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userData) => {
    if (!userData.Vorname || !userData.Nachname || !userData.Email) {
      notifications.show({
        title: 'Fehler',
        message: 'Bitte alle Pflichtfelder ausfüllen',
        color: 'red',
      });
      return false;
    }
    
    if (!validateEmail(userData.Email)) {
      notifications.show({
        title: 'Fehler',
        message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
        color: 'red',
      });
      return false;
    }
    
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:8080/api/mitarbeiter/${userData.ID}`,
        userData,
        { headers: { Authorization: token } }
      );
      
      notifications.show({
        title: 'Erfolg',
        message: 'Nutzer erfolgreich aktualisiert.',
        color: 'green',
      });
      
      if (refreshCallback) {
        refreshCallback();
      }
      return true;
    } catch (err) {
      console.error("Fehler beim Aktualisieren:", err);
      let errorMessage = 'Fehler beim Aktualisieren';
      
      if (err.response?.data?.error) {
        if (err.response.data.error.includes('Email')) {
          errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
        } else {
          errorMessage = err.response.data.error;
        }
      }
      
      notifications.show({
        title: 'Fehler',
        message: errorMessage,
        color: 'red',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!userId) {
      notifications.show({
        title: 'Fehler',
        message: 'Keine gültige Benutzer-ID',
        color: 'red',
      });
      return false;
    }

    setLoading(true);
    try {
      await axios.delete(`http://localhost:8080/api/mitarbeiter/${userId}`, {
        headers: { Authorization: token },
      });
      
      notifications.show({
        title: 'Erfolg',
        message: 'Nutzer erfolgreich gelöscht.',
        color: 'green',
      });
      
      if (refreshCallback) {
        refreshCallback();
      }
      return true;
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
      notifications.show({
        title: 'Fehler',
        message: err.response?.data?.error || 'Fehler beim Löschen des Nutzers',
        color: 'red',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (userId, newPassword) => {
    if (!userId) {
      notifications.show({
        title: 'Fehler',
        message: 'Keine gültige Benutzer-ID',
        color: 'red',
      });
      return false;
    }

    if (!newPassword || newPassword.length < 6) {
      notifications.show({
        title: 'Fehler',
        message: 'Bitte geben Sie ein gültiges Passwort mit mindestens 6 Zeichen ein.',
        color: 'red',
      });
      return false;
    }
    
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:8080/api/mitarbeiter/${userId}/passwort`,
        { passwort: newPassword },
        { headers: { Authorization: token } }
      );
      
      notifications.show({
        title: 'Erfolg',
        message: 'Passwort erfolgreich zurückgesetzt.',
        color: 'green',
      });
      
      return true;
    } catch (err) {
      console.error("Fehler beim Passwort-Reset:", err);
      let errorMessage = 'Fehler beim Zurücksetzen des Passworts';
      
      if (err.response?.data?.error && (
          err.response.data.error.includes('Passwort') || 
          err.response.data.error.includes('passwort'))) {
        errorMessage = 'Bitte geben Sie ein gültiges Passwort mit mindestens 6 Zeichen ein.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      notifications.show({
        title: 'Fehler',
        message: errorMessage,
        color: 'red',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setLoading,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handlePasswordReset
  };
}