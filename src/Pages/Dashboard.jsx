import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Title,
  Button,
  Table,
  Group,
  Badge,
  Menu,
  TextInput,
  Modal,
  Text,
  LoadingOverlay,
  ActionIcon,
  Card,
  SimpleGrid,
  Drawer,
  Stack,
  useMantineTheme,
  Box
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { MonthPicker, DatesProvider, TimeInput } from "@mantine/dates";
import { notifications } from '@mantine/notifications';
import { jwtDecode } from "jwt-decode";
import { IconMenu2, IconClock, IconUser, IconPencil, IconCalendarStats } from '@tabler/icons-react';
import "dayjs/locale/de";
import "@mantine/dates/styles.css";
import axios from "axios";
import dayjs from "dayjs";
import { getRolle } from "../utils/auth";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const decoded = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch (e) {
      console.error("Ungültiges Token:", e);
      return null;
    }
  }, [token]);

const userRole = useMemo(() => {
  // Überprüfen Sie sowohl "rolle" als auch "RechteID" im Token
  const rolleFromToken = decoded?.rolle || decoded?.RechteID || decoded?.rechte_id;
  
  // Debugging-Log - können Sie später entfernen
  console.log("Token Rolle:", rolleFromToken);
  console.log("getRolle():", getRolle());
  
  // Wenn keine gültige Rolle im Token ist, nutzen Sie getRolle() als Fallback
  return rolleFromToken !== undefined ? rolleFromToken : getRolle();
}, [decoded]);

// Ändere die Prüfung für Admin/Vorgesetzter-Berechtigungen
// Wandle Stringwerte in Zahlen um, falls nötig
const isAdmin = useMemo(() => {
  const role = typeof userRole === 'string' ? parseInt(userRole) : userRole;
  return role >= 3;
}, [userRole]);

const isVorgesetzter = useMemo(() => {
  const role = typeof userRole === 'string' ? parseInt(userRole) : userRole;
  return role >= 2;
}, [userRole]);
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isExtraSmall = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);
  const [endzeitError, setEndzeitError] = useState("");
  const [mitarbeiterListe, setMitarbeiterListe] = useState([]);
  const [selectedMitarbeiter, setSelectedMitarbeiter] = useState(null);
  const [selectedMonat, setSelectedMonat] = useState(dayjs());
  const [arbeitszeiten, setArbeitszeiten] = useState([]);
  const [startzeit, setStartzeit] = useState("");
  const [endzeit, setEndzeit] = useState("");
  const istAktuellerMonat = selectedMonat.isSame(dayjs(), "month");
  const hatHeuteEintrag = arbeitszeiten.some(
    (a) => dayjs(a.datum).isSame(dayjs(), "day")
  );
  const [heutigerEintrag, setHeutigerEintrag] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileSidebarOpened, { toggle: toggleMobileSidebar }] = useDisclosure(false);
  const [editModal, setEditModal] = useState({ open: false, arbeitszeit: null, anfangszeit: "", endzeit: "" });
  const [monatlicheStatistik, setMonatlicheStatistik] = useState({
  gesamtStunden: 0,
  arbeitsTage: 0,
  durchschnittProTag: 0,
});

  const centerTextStyle = { textAlign: 'center' };

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
  useEffect(() => {
    if (!selectedMitarbeiter || !selectedMonat) return;
    
    setLoading(true);
    const monthString = selectedMonat.format("YYYY-MM");
    axios
      .get(
        `http://localhost:8080/api/arbeitszeiten/${selectedMitarbeiter.ID}?monat=${monthString}`,
        { headers: { Authorization: token } }
      )
      .then((res) => {
        setArbeitszeiten(res.data);
        
        // Finde den Eintrag für heute, falls vorhanden
        const heutiger = res.data.find(a => dayjs(a.datum).isSame(dayjs(), "day"));
        setHeutigerEintrag(heutiger || null);
        
        // Setze die Startzeit, wenn ein heutiger Eintrag ohne Endzeit existiert
        if (heutiger && !heutiger.endzeit) {
          setStartzeit(dayjs(heutiger.anfangszeit).format("HH:mm"));
        } else {
          setStartzeit("");
          setEndzeit("");
        }
      })
      .catch((err) => {
        setArbeitszeiten([]);
        notifications.show({
          title: 'Fehler',
          message: 'Arbeitszeiten konnten nicht geladen werden.',
          color: 'red',
        });
      })
      .finally(() => setLoading(false));
  }, [selectedMitarbeiter, selectedMonat, token]);

  const handleExport = async (type) => {
    if (!selectedMitarbeiter) {
      notifications.show({
        title: 'Hinweis',
        message: 'Bitte wählen Sie zuerst einen Mitarbeiter aus.',
        color: 'blue',
      });
      return;
    }

    setLoading(true);
    const year = selectedMonat.year();
    const month = selectedMonat.month() + 1;
    const userID = selectedMitarbeiter.ID;
    const nachname = selectedMitarbeiter.Nachname;

    let url = "";
    let filename = "";

    if (type === "csv_monat") {
      url = `http://localhost:8080/api/export/monat?year=${year}&month=${month}&user=${userID}&nachname=${nachname}`;
      filename = `Monatsbericht_${nachname}_${month}_${year}.csv`;
    } else if (type === "csv_jahr") {
      url = `http://localhost:8080/api/export/jahr?year=${year}&user=${userID}&nachname=${nachname}`;
      filename = `Jahresbericht_${nachname}_${year}.csv`;
    } else if (type === "pdf_monat") {
      url = `http://localhost:8080/api/export/monat/pdf?year=${year}&month=${month}&user=${userID}&nachname=${nachname}`;
      filename = `Monatsbericht_${nachname}_${month}_${year}.pdf`;
    } else if (type === "pdf_jahr") {
      url = `http://localhost:8080/api/export/jahr/pdf?year=${year}&user=${userID}&nachname=${nachname}`;
      filename = `Jahresbericht_${nachname}_${year}.pdf`;
    } else {
      notifications.show({
        title: 'Fehler',
        message: 'Export-Typ unbekannt: ' + type,
        color: 'red',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(url, {
        headers: { Authorization: token },
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      
      notifications.show({
        title: 'Erfolg',
        message: `${filename} wurde erfolgreich exportiert.`,
        color: 'green',
      });
    } catch (err) {
      console.error("Fehler beim Export:", err);
      notifications.show({
        title: 'Fehler',
        message: 'Der Export konnte nicht durchgeführt werden.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Zuerst fügen wir eine neue Funktion zum Löschen eines Arbeitszeit-Eintrags hinzu
const handleDeleteArbeitszeit = async (id) => {
  if (!id) return;
  
  setLoading(true);
  try {
    // Verbesserte Fehlerbehandlung und Logging
    console.log("Versuche Arbeitszeit mit ID zu löschen:", id);
    
    // Versuche einen anderen API-Pfad, der konsistent mit deinen anderen API-Endpunkten ist
    const response = await axios.delete(`http://localhost:8080/api/arbeitszeiten/${id}`, {
      headers: { Authorization: token }
    });
    
    console.log("Antwort vom Server:", response.data);
    
    notifications.show({
      title: 'Erfolg',
      message: 'Arbeitszeit-Eintrag wurde erfolgreich gelöscht.',
      color: 'green',
    });
    
    setEditModal({ open: false, arbeitszeit: null, anfangszeit: "", endzeit: "" });
    await refreshArbeitszeiten();
  } catch (error) {
    // Verbesserte Fehlerprotokollierung
    console.error("Fehler beim Löschen:", error);
    console.error("Fehlerdetails:", error.response?.data);
    console.error("Status-Code:", error.response?.status);
    
    notifications.show({
      title: 'Fehler',
      message: error.response?.data?.error || 'Fehler beim Löschen des Eintrags',
      color: 'red',
    });
  } finally {
    setLoading(false);
  }
};

  const handleEdit = (arbeitszeit) => {
    // Modal mit den Daten des ausgewählten Eintrags öffnen
    const anfangszeitFormatted = arbeitszeit.anfangszeit ? 
      dayjs(arbeitszeit.anfangszeit).format('HH:mm') : '';
    const endzeitFormatted = arbeitszeit.endzeit ? 
      dayjs(arbeitszeit.endzeit).format('HH:mm') : '';
      
    setEditModal({
      open: true,
      arbeitszeit: arbeitszeit,
      anfangszeit: anfangszeitFormatted,
      endzeit: endzeitFormatted
    });
  };
  
const handleSaveEdit = async () => {
  if (!editModal.arbeitszeit) return;
  
  // Validierung
  if (!editModal.anfangszeit) {
    notifications.show({
      title: 'Fehler',
      message: 'Bitte geben Sie eine Anfangszeit ein.',
      color: 'red',
    });
    return;
  }
  
  setLoading(true);
  try {
    // Datum aus dem arbeitszeit-Objekt extrahieren
    const datum = dayjs(editModal.arbeitszeit.datum);
    
    // Anfangszeit mit dem korrekten Datum kombinieren und in ISO-Format mit Z konvertieren
    // Go erwartet RFC3339-Format: "2006-01-02T15:04:05Z07:00"
    const anfangszeit = datum
      .hour(parseInt(editModal.anfangszeit.split(':')[0]))
      .minute(parseInt(editModal.anfangszeit.split(':')[1]))
      .second(0)
      .toISOString(); // Format: 2025-05-14T08:00:00.000Z
    
    // Payload vorbereiten
    const payload = {
      id: editModal.arbeitszeit.id,
      anfangszeit: anfangszeit,
      bearbeiter_id: decoded?.nutzer_id,
    };
    
    // Endzeit nur hinzufügen, wenn sie tatsächlich einen Wert hat
    if (editModal.endzeit && editModal.endzeit.trim() !== '') {
      const endzeit = datum
        .hour(parseInt(editModal.endzeit.split(':')[0]))
        .minute(parseInt(editModal.endzeit.split(':')[1]))
        .second(0)
        .toISOString(); // Format: 2025-05-14T16:30:00.000Z
      
      payload.endzeit = endzeit;
    }
    
    console.log("Sende Daten an Backend:", JSON.stringify(payload, null, 2));
    
    const response = await axios({
      method: 'put',
      url: 'http://localhost:8080/api/arbeitszeit/update',
      headers: { 
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      data: payload,
      validateStatus: function (status) {
        return status < 500; // Akzeptiere auch Fehlerstatus für Debug-Zwecke
      }
    });
    
    console.log("Server-Antwort:", response.status, response.data);
    
    if (response.status !== 200) {
      throw new Error(response.data.error || "Unbekannter Fehler");
    }

    notifications.show({
      title: 'Erfolg',
      message: 'Änderungen wurden gespeichert.',
      color: 'green',
    });
    
    setEditModal({ open: false, arbeitszeit: null, anfangszeit: "", endzeit: "" });
    await refreshArbeitszeiten();
  } catch (error) {
    console.error("Fehler beim Bearbeiten:", error);
    
    if (error.response) {
      console.error("Server Antwort:", error.response.status, error.response.data);
    }
    
    notifications.show({
      title: 'Fehler',
      message: error.response?.data?.error || error.message || 'Fehler beim Bearbeiten der Arbeitszeit',
      color: 'red',
    });
  } finally {
    setLoading(false);
  }
};

const berechneMontlicheStatistik = () => {
  let gesamtStunden = 0;
  let arbeitsTage = 0;

    const abgeschlosseneZeiten = arbeitszeiten.filter(a => a.endzeit);

     abgeschlosseneZeiten.forEach(zeit => {
    // Berechne die Arbeitszeit in Stunden
    const start = dayjs(zeit.anfangszeit);
    const ende = dayjs(zeit.endzeit);
    
    // Berechne die Differenz in Stunden und ziehe die Pause ab
    const pauseInStunden = zeit.pause / 60;
    const stundenDifferenz = ende.diff(start, 'hour', true) - pauseInStunden;
    
    if (stundenDifferenz > 0) {
      gesamtStunden += stundenDifferenz;
      arbeitsTage++;
    }
  });

  const durchschnittProTag = arbeitsTage > 0 ? gesamtStunden / arbeitsTage : 0;

  setMonatlicheStatistik({
    gesamtStunden: gesamtStunden.toFixed(2),
    arbeitsTage,
    durchschnittProTag: durchschnittProTag.toFixed(2)
  });
};

// Füge diesen useEffect nach dem useEffect hinzu, der die Arbeitszeiten lädt
useEffect(() => {
  if (arbeitszeiten.length > 0) {
    berechneMontlicheStatistik();
  }
}, [arbeitszeiten]);


  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Überarbeitete Funktion für das Speichern der Arbeitszeit
const handleSaveArbeitszeit = async () => {
  // Prüfen, ob ein Mitarbeiter ausgewählt ist
  if (!selectedMitarbeiter) {
    notifications.show({
      title: 'Fehler',
      message: 'Kein Mitarbeiter ausgewählt. Bitte wählen Sie einen Mitarbeiter aus.',
      color: 'red',
    });
    return;
  }
  
  // Wenn keine Startzeit eingegeben wurde, aktuelle Zeit verwenden
  if (!startzeit) {
    setStartzeit(dayjs().format("HH:mm"));
  }
  
  setLoading(true);
  try {
    // Wenn bereits ein Eintrag für heute existiert und keine Endzeit hat
    if (heutigerEintrag && !heutigerEintrag.endzeit) {
      // Aktualisiere den bestehenden Eintrag mit der Endzeit
      const endzeitToSave = endzeit || dayjs().format("HH:mm");
      
      // Anfangszeit aus dem bestehenden Eintrag erhalten
      const anfangszeitDate = dayjs(heutigerEintrag.anfangszeit);
      
      // Endzeit als ISO-String erstellen 
      const endeDate = dayjs()
        .hour(parseInt(endzeitToSave.split(':')[0]))
        .minute(parseInt(endzeitToSave.split(':')[1]))
        .second(0);
      
      const payload = {
        id: heutigerEintrag.id,
        anfangszeit: anfangszeitDate.toISOString(), // ISO-Format: 2025-05-14T08:00:00.000Z
        endzeit: endeDate.toISOString(), // ISO-Format: 2025-05-14T16:30:00.000Z
        bearbeiter_id: decoded?.nutzer_id,
      };
      
      console.log("Aktualisiere Eintrag:", JSON.stringify(payload, null, 2));
      
      const response = await axios({
        method: 'put',
        url: 'http://localhost:8080/api/arbeitszeit/update',
        headers: { 
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        data: payload
      });
      
      notifications.show({
        title: 'Erfolg',
        message: 'Endzeit wurde erfolgreich gespeichert.',
        color: 'green',
      });
    } else {
      // Erstelle einen neuen Eintrag
      const startzeitToSave = startzeit || dayjs().format("HH:mm");
      const heute = dayjs();
      
      // Anfangszeit als ISO-String erstellen
      const anfangDate = heute
        .hour(parseInt(startzeitToSave.split(':')[0]))
        .minute(parseInt(startzeitToSave.split(':')[1]))
        .second(0);
      
      const payload = {
        nutzer_id: selectedMitarbeiter.ID,
        datum: heute.format("YYYY-MM-DD"),
        anfangszeit: anfangDate.toISOString(), // ISO-Format: 2025-05-14T08:00:00.000Z
      };

      if (endzeit) {
        const endeDate = heute
          .hour(parseInt(endzeit.split(':')[0]))
          .minute(parseInt(endzeit.split(':')[1]))
          .second(0);
        
        payload.endzeit = endeDate.toISOString(); // ISO-Format: 2025-05-14T16:30:00.000Z
      }
      
      console.log("Erstelle neuen Eintrag:", JSON.stringify(payload, null, 2));
      
      await axios.post("http://localhost:8080/api/arbeitszeiten", payload, {
        headers: { 
          Authorization: token,
          'Content-Type': 'application/json'
        },
      });
      
      notifications.show({
        title: 'Erfolg',
        message: 'Arbeitszeit wurde erfolgreich gespeichert.',
        color: 'green',
      });
    }
    
    await refreshArbeitszeiten();
    setStartzeit("");
    setEndzeit("");
  } catch (err) {
    console.error("Fehler beim Speichern der Zeiten:", err);
    
    if (err.response) {
      console.error("Server Antwort:", err.response.status, err.response.data);
    }
    
    notifications.show({
      title: 'Fehler',
      message: err.response?.data?.error || 'Fehler beim Speichern der Arbeitszeit',
      color: 'red',
    });
  } finally {
    setLoading(false);
  }
};

  // Funktion zum Aktualisieren der Arbeitszeiten mit Duplifikaterkennung
const refreshArbeitszeiten = async () => {
  if (!selectedMitarbeiter || !selectedMonat) return;
  
  setLoading(true);
  const monthString = selectedMonat.format("YYYY-MM");
  try {
    const response = await axios.get(
      `http://localhost:8080/api/arbeitszeiten/${selectedMitarbeiter.ID}?monat=${monthString}`,
      { headers: { Authorization: token } }
    );
    
    // Entferne doppelte Einträge (basierend auf dem Datum)
    const uniqueEntries = {};
    response.data.forEach(item => {
      const datumKey = dayjs(item.datum).format("YYYY-MM-DD");
      
      // Wenn bereits ein Eintrag für dieses Datum existiert:
      if (uniqueEntries[datumKey]) {
        // Wenn der aktuelle Eintrag eine Endzeit hat, aber der bereits vorhandene nicht, 
        // dann verwende den aktuellen
        if (item.endzeit && !uniqueEntries[datumKey].endzeit) {
          uniqueEntries[datumKey] = item;
        } 
        // Wenn beide eine Endzeit haben oder beide keine haben, 
        // nehme den mit der höheren ID (neueren Eintrag)
        else if ((item.endzeit && uniqueEntries[datumKey].endzeit) || 
                (!item.endzeit && !uniqueEntries[datumKey].endzeit)) {
          if (item.id > uniqueEntries[datumKey].id) {
            uniqueEntries[datumKey] = item;
          }
        }
      } else {
        // Wenn noch kein Eintrag für dieses Datum existiert, füge den aktuellen hinzu
        uniqueEntries[datumKey] = item;
      }
    });
    
    // Konvertiere zurück zu einem Array
    const uniqueArbeitszeiten = Object.values(uniqueEntries);
    setArbeitszeiten(uniqueArbeitszeiten);
    
    // Aktualisiere den heutigen Eintrag
    const heuteDatumKey = dayjs().format("YYYY-MM-DD");
    const heutiger = uniqueEntries[heuteDatumKey] || null;
    setHeutigerEintrag(heutiger);
    
    // Aktualisiere die Startzeit-Anzeige
    if (heutiger && !heutiger.endzeit) {
      setStartzeit(dayjs(heutiger.anfangszeit).format("HH:mm"));
    } else {
      setStartzeit("");
      setEndzeit("");
    }
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Arbeitszeiten:", error);
    notifications.show({
      title: 'Fehler',
      message: 'Arbeitszeiten konnten nicht aktualisiert werden.',
      color: 'red',
    });
  } finally {
    setLoading(false);
  }
};

  // Nutzer kann nur sich selbst sehen, es sei denn, er ist Vorgesetzter oder Admin
  const filteredMitarbeiter = useMemo(() => {
    if (isVorgesetzter || isAdmin) {
      return mitarbeiterListe;
    } else {
      return mitarbeiterListe.filter(m => m.ID === decoded?.nutzer_id);
    }
  }, [mitarbeiterListe, decoded?.nutzer_id, isVorgesetzter, isAdmin]);

  // Sidebar-Inhalt, wiederverwendbar für Desktop und Mobile
  const SidebarContent = () => (
    <>
      {filteredMitarbeiter.length > 1 && (
      <Title order={4} mb="md">Mitarbeiter</Title>
    )}
      {filteredMitarbeiter.map((m) => (
        <Button
          key={m.ID}
          fullWidth
          mt="xs"
          variant={
            selectedMitarbeiter?.ID === m.ID ? "filled" : "light"
          }
          onClick={() => {
            setSelectedMitarbeiter(m);
            setSelectedMonat(dayjs());
            if (mobileSidebarOpened) toggleMobileSidebar();
          }}
        >
          {m.Vorname} {m.Nachname}
        </Button>
      ))}
      <Group position="center" mt="xl">
      <MonthPicker
        value={selectedMonat ? selectedMonat.toDate() : null}
        onChange={(d) => d && setSelectedMonat(dayjs(d))}
      />
      </Group>
      
      {/* Nur Vorgesetzte und Admins sehen den Button zur Nutzerverwaltung */}
      {(isVorgesetzter || isAdmin) && (
        <Button 
          fullWidth 
          mt="xl" 
          onClick={() => {
            navigate("/verwaltung");
            if (mobileSidebarOpened) toggleMobileSidebar();
          }}
          leftSection={<IconUser size={16} />}
        >
          Nutzer verwalten
        </Button>
      )}
      
      <Button
        fullWidth
        mt="xl"
        variant="outline"
        color="red"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </>
  );

  const MainContent = () => (
    <Paper p={isMobile ? "xs" : "md"} withBorder shadow="sm">
      <Group position="apart" mb="md" wrap="nowrap">
        <Title order={3} size={isMobile ? "h4" : "h3"}>
          {selectedMitarbeiter
            ? `${selectedMitarbeiter.Vorname} ${selectedMitarbeiter.Nachname}`
            : "Mitarbeiter auswählen"}
        </Title>
      </Group>

      {/* Export-Menu für Monatsbericht - nur auf größeren Bildschirmen */}
      <Group position="center" mt="md" mb="sm">
        {!isExtraSmall && (
          <Menu shadow="md" width={220}>
            <Menu.Target>
              <Button size={isMobile ? "xs" : "sm"}>Monatsbericht</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => handleExport("pdf_monat")}>
                PDF
              </Menu.Item>
              <Menu.Item onClick={() => handleExport("csv_monat")}>
                CSV
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          
        )}
        {/* Export-Menu für Jahresbericht - nur auf größeren Bildschirmen */}
        {!isExtraSmall && (
          <Menu shadow="md" width={220}>
            <Menu.Target>
              <Button size={isMobile ? "xs" : "sm"}>Jahresbericht</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => handleExport("pdf_jahr")}>
                PDF
              </Menu.Item>
              <Menu.Item onClick={() => handleExport("csv_jahr")}>
                CSV
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
      
      {/* Mobile Export Buttons - nur auf kleinen Bildschirmen */}
      {isExtraSmall && (
        <SimpleGrid cols={2} spacing="xs" mb="md">
          <Menu shadow="md" width={160}>
            <Menu.Target>
              <Button size="xs" fullWidth>Monatsbericht</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => handleExport("pdf_monat")}>PDF</Menu.Item>
              <Menu.Item onClick={() => handleExport("csv_monat")}>CSV</Menu.Item>
            </Menu.Dropdown>
          </Menu>
          
          <Menu shadow="md" width={160}>
            <Menu.Target>
              <Button size="xs" fullWidth>Jahresbericht</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => handleExport("pdf_jahr")}>PDF</Menu.Item>
              <Menu.Item onClick={() => handleExport("csv_jahr")}>CSV</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </SimpleGrid>
      )}

      {/* Desktop-Tabelle (versteckt auf Mobilgeräten) */}
    {!isMobile && (
  <>
    <Box mb="md">
      <Paper p="md" withBorder shadow="xs" style={{ backgroundColor: '#f9fafb' }}>
        <Group position="apart">
          <Group>
            <IconCalendarStats size={24} color={theme.colors.blue[6]} />
           <Title order={5}>Monatsübersicht {selectedMonat.locale('de').format("MMMM YYYY")}</Title>
          </Group>
          <Group>
            <Badge color="blue" size="lg">
              Gesamtarbeitszeit: {monatlicheStatistik.gesamtStunden} Stunden
            </Badge>
            <Badge color="teal" size="lg">
              Arbeitstage: {monatlicheStatistik.arbeitsTage}
            </Badge>
            <Badge color="grape" size="lg">
              Ø pro Tag: {monatlicheStatistik.durchschnittProTag} Stunden
            </Badge>
          </Group>
        </Group>
      </Paper>
    </Box>
  
    <Table highlightOnHover withBorder withColumnBorders>
      <thead>
        <tr>
          <th style={centerTextStyle}>Datum</th>
          <th style={centerTextStyle}>Start</th>
          <th style={centerTextStyle}>Ende</th>
          <th style={centerTextStyle}>Pause</th>
          <th style={centerTextStyle}>Arbeitszeit</th>
          <th style={centerTextStyle}>Aktion</th>
        </tr>
      </thead>
      <tbody>
        {/* Aktuelle Eingabezeile nur anzeigen, wenn kein heutiger Eintrag existiert oder wenn der heutige Eintrag noch keine Endzeit hat */}
        {istAktuellerMonat && (!heutigerEintrag || !heutigerEintrag.endzeit) && (
          <tr>
            <td style={centerTextStyle}>{dayjs().format("DD.MM.YYYY")}</td>
            <td style={centerTextStyle}>
              {heutigerEintrag && !heutigerEintrag.endzeit ? (
                <Text>{startzeit}</Text>
              ) : (
                <TimeInput
                  value={startzeit}
                  onChange={(e) => setStartzeit(e.target.value)}
                  placeholder="08:00"
                />
              )}
            </td>
            <td style={centerTextStyle}>
              {heutigerEintrag && !heutigerEintrag.endzeit ? (
                <TimeInput
                  value={endzeit}
                  onChange={(e) => setEndzeit(e.target.value)}
                  placeholder="16:30"
                />
              ) : (
                <TimeInput
                  value={endzeit}
                  onChange={(e) => setEndzeit(e.target.value)}
                  placeholder="16:30"
                  disabled={!heutigerEintrag && !startzeit}
                />
              )}
            </td>
            <td style={centerTextStyle}>auto</td>
            <td style={centerTextStyle}>-</td>
            <td style={centerTextStyle}>
              <Button size="xs" onClick={handleSaveArbeitszeit}>
                {heutigerEintrag && !heutigerEintrag.endzeit ? "Ende speichern" : "Start speichern"}
              </Button>
            </td>
          </tr>
        )}

        {/* Liste der Arbeitszeiten, aber nur Einträge anzeigen, die nicht der aktuelle Tag sind oder die bereits eine Endzeit haben */}
        {arbeitszeiten.length > 0 ? (
          arbeitszeiten
            .slice()
            .sort((a, b) => dayjs(b.datum).diff(dayjs(a.datum)))
            .filter(a => {
              // Wenn es der heutige Tag ist und kein heutigerEintrag existiert, trotzdem anzeigen
              if (dayjs(a.datum).isSame(dayjs(), "day") && !heutigerEintrag) {
                return true;
              }
              // Wenn es der heutige Tag ist und der Eintrag eine Endzeit hat, anzeigen
              if (dayjs(a.datum).isSame(dayjs(), "day") && a.endzeit) {
                return true;
              }
              // Wenn es der heutige Tag ist und der Eintrag keine Endzeit hat, aber nicht der heutigerEintrag ist, nicht anzeigen
              if (dayjs(a.datum).isSame(dayjs(), "day") && !a.endzeit && heutigerEintrag && a.id !== heutigerEintrag.id) {
                return false;
              }
              // Wenn es kein heutiger Tag ist, immer anzeigen
              return !dayjs(a.datum).isSame(dayjs(), "day");
            })
            .map((a, index) => {
              // Berechne die Arbeitszeit in Stunden, wenn eine Endzeit vorhanden ist
              let arbeitszeitText = "-";
              if (a.endzeit) {
                const start = dayjs(a.anfangszeit);
                const ende = dayjs(a.endzeit);
                const pauseInStunden = a.pause / 60;
                const stundenDifferenz = ende.diff(start, 'hour', true) - pauseInStunden;
                arbeitszeitText = stundenDifferenz > 0 ? stundenDifferenz.toFixed(2) + " h" : "-";
              }
              
              return (
                <tr
                  key={a.id}
                  style={{
                    backgroundColor: index % 2 === 1 ? "#f9f9f9" : "transparent",
                  }}
                >
                  <td style={centerTextStyle}>{dayjs(a.datum).format("DD.MM.YYYY")}</td>
                  <td style={centerTextStyle}>
                    {a.anfangszeit ? dayjs(a.anfangszeit).format("HH:mm") : "-"}
                  </td>
                  <td style={centerTextStyle}>
                    {a.endzeit ? dayjs(a.endzeit).format("HH:mm") : "-"}
                  </td>
                  <td style={centerTextStyle}>{a.pause} min</td>
                  <td style={centerTextStyle}>{arbeitszeitText}</td>
                  <td style={centerTextStyle}>
                    <Button size="xs" onClick={() => handleEdit(a)}>Bearbeiten</Button>
                  </td>
                </tr>
              );
            })
        ) : (
          <tr>
            <td colSpan={6} style={{ textAlign: "center" }}>
              Keine Arbeitszeiten im ausgewählten Monat
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  </>
)}
      
      {/* Mobile Ansicht als Karten (nur auf Mobilgeräten sichtbar) */}
{isMobile && (
  <Stack spacing="xs">
    {/* Neue Zeiterfassung (nur für aktuellen Monat und nur wenn noch kein Eintrag mit Endzeit existiert) */}
    {istAktuellerMonat && (!heutigerEintrag || !heutigerEintrag.endzeit) && (
      <Card shadow="sm" withBorder p="xs">
        <Card.Section withBorder p="xs" bg={theme.colors.blue[0]}>
          <Group position="apart">
            <Text fw={500} ta="center" style={{width: '100%'}}>Neuer Eintrag: {dayjs().format("DD.MM.YYYY")}</Text>
          </Group>
        </Card.Section>
        <Group position="apart" mt="xs">
          {heutigerEintrag && !heutigerEintrag.endzeit ? (
            <Text size="sm" style={{ width: '45%' }}>
              <b>Start:</b> {startzeit}
            </Text>
          ) : (
            <TimeInput
              label="Start"
              leftSection={<IconClock size={16} />}
              value={startzeit}
              onChange={(e) => setStartzeit(e.target.value)}
              placeholder="08:00"
              size="xs"
              style={{ width: '45%' }}
            />
          )}
          <TimeInput
            label="Ende"
            leftSection={<IconClock size={16} />}
            value={endzeit}
            onChange={(e) => setEndzeit(e.target.value)}
            placeholder="16:30"
            size="xs"
            style={{ width: '45%' }}
            disabled={!heutigerEintrag && !startzeit}
          />
        </Group>
        <Button 
          fullWidth 
          mt="xs" 
          size="xs" 
          onClick={handleSaveArbeitszeit}
        >
          {heutigerEintrag && !heutigerEintrag.endzeit ? "Ende speichern" : "Start speichern"}
        </Button>
      </Card>
    )}
    
    {/* Bestehende Einträge als Karten - mit der gleichen Filterlogik wie bei der Tabelle */}
    {arbeitszeiten.length > 0 ? (
      arbeitszeiten
        .slice()
        .sort((a, b) => dayjs(b.datum).diff(dayjs(a.datum)))
        .filter(a => {
          // Wenn es der heutige Tag ist und kein heutigerEintrag existiert, trotzdem anzeigen
          if (dayjs(a.datum).isSame(dayjs(), "day") && !heutigerEintrag) {
            return true;
          }
          // Wenn es der heutige Tag ist und der Eintrag eine Endzeit hat, anzeigen
          if (dayjs(a.datum).isSame(dayjs(), "day") && a.endzeit) {
            return true;
          }
          // Wenn es der heutige Tag ist und der Eintrag keine Endzeit hat, aber nicht der heutigerEintrag ist, nicht anzeigen
          if (dayjs(a.datum).isSame(dayjs(), "day") && !a.endzeit && heutigerEintrag && a.id !== heutigerEintrag.id) {
            return false;
          }
          // Wenn es kein heutiger Tag ist, immer anzeigen
          return !dayjs(a.datum).isSame(dayjs(), "day");
        })
        .map((a) => (
          <Card key={a.id} shadow="sm" withBorder p="xs">
            <Card.Section withBorder p="xs" bg="gray.0">
              <Group position="apart">
                <Text fw={500} ta="center" style={{width: '100%'}}>{dayjs(a.datum).format("DD.MM.YYYY")}</Text>
                <ActionIcon size="sm" onClick={() => handleEdit(a)} style={{position: 'absolute', right: '12px'}}>
                  <IconPencil size={16} />
                </ActionIcon>
              </Group>
            </Card.Section>
            <SimpleGrid cols={2} spacing="xs" mt="xs">
              <Text size="sm" ta="center">
                <b>Start:</b> {a.anfangszeit ? dayjs(a.anfangszeit).format("HH:mm") : "-"}
              </Text>
              <Text size="sm" ta="center">
                <b>Ende:</b> {a.endzeit ? dayjs(a.endzeit).format("HH:mm") : "-"}
              </Text>
              <Text size="sm" span={2} ta="center">
                <b>Pause:</b> {a.pause} min
              </Text>
            </SimpleGrid>
          </Card>
        ))
    ) : (
      <Card shadow="sm" withBorder p="md">
        <Text ta="center" c="dimmed">
          Keine Arbeitszeiten im ausgewählten Monat
        </Text>
      </Card>
    )}
  </Stack>
)}
    </Paper>
  );

  return (
    <DatesProvider settings={{ locale: "de", firstDayOfWeek: 1 }}>
      <Container fluid pos="relative">
        <LoadingOverlay visible={loading} overlayBlur={2} />
        
        {/* Mobile Header mit Menü-Button */}
        {isMobile && (
          <Group position="apart" py="md" px="xs">
            <Title order={4}>Arbeitszeiterfassung</Title>
            <ActionIcon onClick={toggleMobileSidebar}>
              <IconMenu2 size={24} />
            </ActionIcon>
          </Group>
        )}
        
        {/* Mobile Sidebar als Drawer */}
        <Drawer
          opened={mobileSidebarOpened}
          onClose={toggleMobileSidebar}
          title="Menü"
          padding="md"
          size="xs"
          position="left"
        >
          <SidebarContent />
        </Drawer>
        
        <Grid>
          {/* Desktop Sidebar - versteckt auf Mobilgeräten */}
          {!isMobile && (
            <Grid.Col span={2}>
              <Paper p="md" withBorder shadow="sm">
                <SidebarContent />
              </Paper>
            </Grid.Col>
          )}

          {/* Hauptinhalt - volle Breite auf Mobilgeräten */}
          <Grid.Col span={isMobile ? 12 : 10}>
            <MainContent />
          </Grid.Col>
        </Grid>
        
        {/* Modal für Bearbeitung der Arbeitszeiten */}
        {/* Modal für Bearbeitung der Arbeitszeiten */}
<Modal
  opened={editModal.open}
  onClose={() => setEditModal({ open: false, arbeitszeit: null, anfangszeit: "", endzeit: "" })}
  title="Arbeitszeit bearbeiten"
  size={isMobile ? "xs" : "xl"}
>
  <LoadingOverlay visible={loading} overlayBlur={2} />
  
  {editModal.arbeitszeit && (
    <>
      <Text mb="md" ta="center">
        Datum: {dayjs(editModal.arbeitszeit.datum).format("DD.MM.YYYY")}
      </Text>
      
      <TimeInput
        label="Anfangszeit"
        leftSection={<IconClock size={16} />}
        value={editModal.anfangszeit}
        onChange={(e) => setEditModal({ ...editModal, anfangszeit: e.target.value })}
        mb="md"
        placeholder="08:00"
        required
      />
      
      <TimeInput
        label="Endzeit"
        leftSection={<IconClock size={16} />}
        value={editModal.endzeit}
        onChange={(e) => setEditModal({ ...editModal, endzeit: e.target.value })}
        mb="md"
        placeholder="16:30"
      />
      
      <Text size="sm" c="dimmed" mb="md" ta="center">
        Hinweis: Die Pause wird automatisch basierend auf der Arbeitszeit berechnet.
      </Text>
      
      <Group position="center" mb="md">
         <Button onClick={handleSaveEdit}>Speichern</Button>
        <Button 
          variant="outline" 
          onClick={() => setEditModal({ open: false, arbeitszeit: null, anfangszeit: "", endzeit: "" })}
        >
          Abbrechen
        </Button>
       
      </Group>
      
      {/* Trennlinie */}
      <Box mb="md" style={{ borderTop: '1px solid #e9ecef', margin: '15px 0' }}></Box>
      
      {/* Löschen-Button */}
      <Group position="center">
        <Button 
          color="red" 
          variant="outline"
          onClick={() => {
            if (window.confirm('Sind Sie sicher, dass Sie diesen Arbeitszeit-Eintrag löschen möchten?')) {
              handleDeleteArbeitszeit(editModal.arbeitszeit.id);
            }
          }}
        >
          Eintrag löschen
        </Button>
      </Group>
    </>
  )}
</Modal>
      </Container>
    </DatesProvider>
  );
}

export default Dashboard;