import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { notifications } from '@mantine/notifications';
import axios from "axios";
import { getRolle } from "../utils/auth";

export function useDashboardData() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [mitarbeiterListe, setMitarbeiterListe] = useState([]);
  const [selectedMitarbeiter, setSelectedMitarbeiter] = useState(null);
  const [loading, setLoading] = useState(false);

  const decoded = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch (e) {
      console.error("Ungültiges Token:", e);
      return null;
    }
  }, [token]);

  const userRole = useMemo(() => {
    const rolleFromToken = decoded?.rolle || decoded?.RechteID || decoded?.rechte_id;
    return rolleFromToken !== undefined ? rolleFromToken : getRolle();
  }, [decoded]);

  const isAdmin = useMemo(() => {
    const role = typeof userRole === 'string' ? parseInt(userRole) : userRole;
    return role >= 3;
  }, [userRole]);

  const isVorgesetzter = useMemo(() => {
    const role = typeof userRole === 'string' ? parseInt(userRole) : userRole;
    return role >= 2;
  }, [userRole]);

  useEffect(() => {
    const fetchMitarbeiter = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8080/api/mitarbeiter", {
          headers: { Authorization: token }
        });
        setMitarbeiterListe(response.data);

        const tokenId = String(decoded?.nutzer_id);
        const user = response.data.find((u) => String(u.ID) === tokenId);

        if (user) {
          setSelectedMitarbeiter(user);
        } else if (response.data.length > 0) {
          console.warn("Nutzer aus Token nicht in Mitarbeiterliste gefunden. Fallback auf ersten.");
          setSelectedMitarbeiter(response.data[0]);
        } else {
          console.warn("Keine Mitarbeiterdaten verfügbar.");
          setSelectedMitarbeiter(null);
        }

      } catch (error) {
        console.error("Fehler beim Laden der Mitarbeiter:", error);
        notifications.show({
          title: 'Fehler',
          message: 'Mitarbeiter konnten nicht geladen werden.',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    if (token && decoded) fetchMitarbeiter();
  }, [token, decoded]);

  return {
    mitarbeiterListe,
    selectedMitarbeiter,
    setSelectedMitarbeiter,
    loading,
    setLoading,
    decoded,
    userRole,
    isAdmin,
    isVorgesetzter
  };
}
export default useDashboardData;