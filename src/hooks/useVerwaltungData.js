import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { notifications } from '@mantine/notifications';
import axios from "axios";
import { isLoggedIn, getRolle } from "../utils/auth";

export function useVerwaltungData() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [mitarbeiter, setMitarbeiter] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortField, setSortField] = useState("Nachname");
  const [activeTab, setActiveTab] = useState("alle");

  // Filtere und sortiere Mitarbeiter
  const filteredMitarbeiter = useMemo(() => {
    if (!mitarbeiter || mitarbeiter.length === 0) {
      return [];
    }
    
    let result = [...mitarbeiter];
    
    // Nach Rolle filtern
    if (activeTab !== "alle") {
      result = result.filter(m => {
        const rolle = m.Rolle || m.RechteID || "";
        const rolleStr = String(rolle).toLowerCase();
        
        if (activeTab === "admin") {
          return rolleStr === "admin" || rolleStr === "3";
        } else if (activeTab === "vorgesetzter") {
          return rolleStr === "vorgesetzter" || rolleStr === "2";
        } else if (activeTab === "mitarbeiter") {
          return rolleStr === "mitarbeiter" || rolleStr === "1";
        }
        return true;
      });
    }
    
    // Nach Suchbegriff filtern
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(m => 
        (m.Vorname && m.Vorname.toLowerCase().includes(searchLower)) ||
        (m.Nachname && m.Nachname.toLowerCase().includes(searchLower)) ||
        (m.Email && m.Email.toLowerCase().includes(searchLower))
      );
    }
    
    // Sortieren
    result.sort((a, b) => {
      const fieldA = (a[sortField] || "").toString().toLowerCase();
      const fieldB = (b[sortField] || "").toString().toLowerCase();
      
      if (sortDirection === "asc") {
        return fieldA.localeCompare(fieldB);
      } else {
        return fieldB.localeCompare(fieldA);
      }
    });
    
    return result;
  }, [mitarbeiter, activeTab, searchTerm, sortField, sortDirection]);

  const fetchMitarbeiter = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/mitarbeiter", {
        headers: { Authorization: token },
      });
      setMitarbeiter(res.data || []);
    } catch (err) {
      console.error("Fehler beim Laden:", err);
      notifications.show({
        title: 'Fehler',
        message: 'Mitarbeiterdaten konnten nicht geladen werden.',
        color: 'red',
      });
      setMitarbeiter([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshMitarbeiter = () => {
    fetchMitarbeiter();
  };

  useEffect(() => {
    // Überprüfe Zugriffsberechtigungen
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    
    const role = getRolle();
    if (role < 2) {
      notifications.show({
        title: 'Zugriff verweigert',
        message: 'Sie haben keine Berechtigung für diesen Bereich.',
        color: 'red',
      });
      navigate("/dashboard");
      return;
    }
    
    fetchMitarbeiter();
  }, [navigate, token]);

  return {
    mitarbeiter,
    filteredMitarbeiter,
    loading,
    setLoading,
    searchTerm,
    setSearchTerm,
    sortDirection,
    setSortDirection,
    sortField,
    setSortField,
    activeTab,
    setActiveTab,
    refreshMitarbeiter
  };
}