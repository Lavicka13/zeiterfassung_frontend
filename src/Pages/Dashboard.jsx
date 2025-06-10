// ===== src/Pages/Dashboard.jsx (Komplett überarbeitet) =====
import React, { useState, useEffect, useMemo } from "react";
import { Container, Grid, LoadingOverlay, useMantineTheme } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { DatesProvider } from "@mantine/dates";
import { notifications } from '@mantine/notifications';
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import "dayjs/locale/de";
import "@mantine/dates/styles.css";
import axios from "axios";

// Importiere die neuen Module
import Sidebar from "../components/Dashboard/Sidebar";
import MainContent from "../components/Dashboard/MainContent";
import MobileSidebar from "../components/Dashboard/MobileSidebar";
import TimeEditModal from "../components/Dashboard/TimeEditModal";
import NewEntryModal from "../components/Dashboard/NewEntryModal";
import DeleteConfirmModal from "../components/Dashboard/DeleteConfirmModal";

// Custom Hooks
import { useDashboardData } from "../hooks/useDashboardData";
import { useTimeCalculations } from "../hooks/useTimeCalculations";
import { useArbeitszeiten } from "../hooks/useArbeitszeiten";

function Dashboard() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  
  // Custom Hooks für Datenmanagement
  const { 
    mitarbeiterListe, 
    selectedMitarbeiter, 
    setSelectedMitarbeiter,
    loading,
    setLoading,
    decoded,
    userRole,
    isAdmin,
    isVorgesetzter
  } = useDashboardData();

  const {
    arbeitszeiten,
    selectedMonat,
    setSelectedMonat,
    heutigerEintrag,
    setHeutigerEintrag,
    monatlicheStatistik,
    refreshArbeitszeiten
  } = useArbeitszeiten(selectedMitarbeiter);

  // Modal States
  const [mobileSidebarOpened, { toggle: toggleMobileSidebar }] = useDisclosure(false);
  const [editModal, setEditModal] = useState({ open: false, arbeitszeit: null });
  const [newEntryModal, setNewEntryModal] = useState({ open: false });
  const [deleteModal, setDeleteModal] = useState({ open: false, arbeitszeit: null });

  // Zeit-Input States
  const [startzeit, setStartzeit] = useState("");
  const [endzeit, setEndzeit] = useState("");

  const token = localStorage.getItem("token");

  const filteredMitarbeiter = useMemo(() => {
    if (isVorgesetzter || isAdmin) {
      return mitarbeiterListe;
    } else {
      return mitarbeiterListe.filter(m => m.ID === decoded?.nutzer_id);
    }
  }, [mitarbeiterListe, decoded?.nutzer_id, isVorgesetzter, isAdmin]);

  // Setze Startzeit wenn heutiger Eintrag existiert
  useEffect(() => {
    if (heutigerEintrag && !heutigerEintrag.endzeit && !startzeit) {
      setStartzeit(dayjs(heutigerEintrag.anfangszeit).format("HH:mm"));
    } else if (!heutigerEintrag && !startzeit) {
      setStartzeit("");
      setEndzeit("");
    }
  }, [heutigerEintrag]);

  // Export Handler
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

  // Arbeitszeit speichern Handler
  const handleSaveArbeitszeit = async () => {
    if (!selectedMitarbeiter) {
      notifications.show({
        title: 'Fehler',
        message: 'Kein Mitarbeiter ausgewählt. Bitte wählen Sie einen Mitarbeiter aus.',
        color: 'red',
      });
      return;
    }
    
    if (!startzeit) {
      setStartzeit(dayjs().format("HH:mm"));
    }
    
    setLoading(true);
    try {
      if (heutigerEintrag && !heutigerEintrag.endzeit) {
        // Endzeit für bestehenden Eintrag speichern
        const endzeitToSave = endzeit || dayjs().format("HH:mm");
        const anfangszeitDate = dayjs(heutigerEintrag.anfangszeit);
        
        const endeDate = dayjs()
          .hour(parseInt(endzeitToSave.split(':')[0]))
          .minute(parseInt(endzeitToSave.split(':')[1]))
          .second(0);
        
        const payload = {
          id: heutigerEintrag.id,
          anfangszeit: anfangszeitDate.toISOString(),
          endzeit: endeDate.toISOString(),
          bearbeiter_id: decoded?.nutzer_id,
        };
        
        await axios({
          method: 'put',
          url: 'http://localhost:8080/api/arbeitszeit/update',
          headers: { 
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          data: payload
        });
        
        setHeutigerEintrag({
          ...heutigerEintrag,
          endzeit: endeDate.toISOString()
        });
        
        notifications.show({
          title: 'Erfolg',
          message: 'Endzeit wurde erfolgreich gespeichert.',
          color: 'green',
        });
      } else {
        // Neue Startzeit speichern
        const startzeitToSave = startzeit || dayjs().format("HH:mm");
        const heute = dayjs();
        
        const anfangDate = heute
          .hour(parseInt(startzeitToSave.split(':')[0]))
          .minute(parseInt(startzeitToSave.split(':')[1]))
          .second(0);
        
        const payload = {
          nutzer_id: selectedMitarbeiter.ID,
          datum: heute.format("YYYY-MM-DD"),
          anfangszeit: anfangDate.toISOString(),
        };

        if (endzeit) {
          const endeDate = heute
            .hour(parseInt(endzeit.split(':')[0]))
            .minute(parseInt(endzeit.split(':')[1]))
            .second(0);
          
          payload.endzeit = endeDate.toISOString();
        }
        
        const response = await axios.post("http://localhost:8080/api/arbeitszeiten", payload, {
          headers: { 
            Authorization: token,
            'Content-Type': 'application/json'
          },
        });
        
        const neuerEintrag = {
          id: response.data.id || Date.now(),
          nutzer_id: selectedMitarbeiter.ID,
          datum: heute.format("YYYY-MM-DD"),
          anfangszeit: anfangDate.toISOString(),
          endzeit: endzeit ? payload.endzeit : null
        };
        
        setHeutigerEintrag(neuerEintrag);
        setStartzeit(startzeitToSave);
        
        notifications.show({
          title: 'Erfolg',
          message: 'Arbeitszeit wurde erfolgreich gespeichert.',
          color: 'green',
        });
      }
      
      await refreshArbeitszeiten();
      
      if (!heutigerEintrag || heutigerEintrag.endzeit) {
        setStartzeit("");
      }
      setEndzeit("");
    } catch (err) {
      console.error("Fehler beim Speichern der Zeiten:", err);
      
      notifications.show({
        title: 'Fehler',
        message: err.response?.data?.error || 'Fehler beim Speichern der Arbeitszeit',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit Handler
  const handleSaveEdit = async (arbeitszeit, anfangszeit, endzeit) => {
    if (!arbeitszeit) return;
    
    if (!anfangszeit) {
      notifications.show({
        title: 'Fehler',
        message: 'Bitte geben Sie eine Anfangszeit ein.',
        color: 'red',
      });
      return;
    }
    
    setLoading(true);
    try {
      const datum = dayjs(arbeitszeit.datum);
      
      const anfangszeitISO = datum
        .hour(parseInt(anfangszeit.split(':')[0]))
        .minute(parseInt(anfangszeit.split(':')[1]))
        .second(0)
        .toISOString();
      
      const payload = {
        id: arbeitszeit.id,
        anfangszeit: anfangszeitISO,
        bearbeiter_id: decoded?.nutzer_id,
      };
      
      if (endzeit && endzeit.trim() !== '') {
        const endzeitISO = datum
          .hour(parseInt(endzeit.split(':')[0]))
          .minute(parseInt(endzeit.split(':')[1]))
          .second(0)
          .toISOString();
        
        payload.endzeit = endzeitISO;
      }
      
      const response = await axios({
        method: 'put',
        url: 'http://localhost:8080/api/arbeitszeit/update',
        headers: { 
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        data: payload,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      if (response.status !== 200) {
        throw new Error(response.data.error || "Unbekannter Fehler");
      }

      notifications.show({
        title: 'Erfolg',
        message: 'Änderungen wurden gespeichert.',
        color: 'green',
      });
      
      setEditModal({ open: false, arbeitszeit: null });
      await refreshArbeitszeiten();
    } catch (error) {
      console.error("Fehler beim Bearbeiten:", error);
      
      notifications.show({
        title: 'Fehler',
        message: error.response?.data?.error || error.message || 'Fehler beim Bearbeiten der Arbeitszeit',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Neuen Eintrag erstellen Handler
  const handleCreateNewEntry = async (datum, anfangszeit, endzeit) => {
    if (!selectedMitarbeiter) {
      notifications.show({
        title: 'Fehler',
        message: 'Kein Mitarbeiter ausgewählt. Bitte wählen Sie einen Mitarbeiter aus.',
        color: 'red',
      });
      return;
    }
    
    if (!datum || !anfangszeit) {
      notifications.show({
        title: 'Fehler',
        message: 'Bitte geben Sie Datum und Anfangszeit ein.',
        color: 'red',
      });
      return;
    }
    
    setLoading(true);
    try {
      const selectedDate = dayjs(datum);
      
      const anfangszeitArray = anfangszeit.split(':');
      const anfangDate = selectedDate
        .hour(parseInt(anfangszeitArray[0]))
        .minute(parseInt(anfangszeitArray[1]))
        .second(0);
      
      const payload = {
        nutzer_id: selectedMitarbeiter.ID,
        datum: selectedDate.format("YYYY-MM-DD"),
        anfangszeit: anfangDate.toISOString(),
      };

      if (endzeit) {
        const endzeitArray = endzeit.split(':');
        const endeDate = selectedDate
          .hour(parseInt(endzeitArray[0]))
          .minute(parseInt(endzeitArray[1]))
          .second(0);
        
        payload.endzeit = endeDate.toISOString();
      }
      
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
      
      setNewEntryModal({ open: false });
      
      if (selectedDate.month() === selectedMonat.month() && 
          selectedDate.year() === selectedMonat.year()) {
        await refreshArbeitszeiten();
      }
    } catch (err) {
      console.error("Fehler beim Speichern der Zeiten:", err);
      
      notifications.show({
        title: 'Fehler',
        message: err.response?.data?.error || 'Fehler beim Speichern der Arbeitszeit',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Löschen Handler
  const handleDeleteArbeitszeit = async (id) => {
    if (!id) return;
    
    setLoading(true);
    try {
      await axios.delete(`http://localhost:8080/api/arbeitszeiten/${id}`, {
        headers: { Authorization: token }
      });
      
      notifications.show({
        title: 'Erfolg',
        message: 'Arbeitszeit-Eintrag wurde erfolgreich gelöscht.',
        color: 'green',
      });
      
      setDeleteModal({ open: false, arbeitszeit: null });
      await refreshArbeitszeiten();
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      
      notifications.show({
        title: 'Fehler',
        message: error.response?.data?.error || 'Fehler beim Löschen des Eintrags',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DatesProvider settings={{ locale: "de", firstDayOfWeek: 1 }}>
      <Container fluid pos="relative">
        <LoadingOverlay visible={loading} overlayBlur={2} />
        
        <MobileSidebar 
          opened={mobileSidebarOpened}
          onClose={toggleMobileSidebar}
          filteredMitarbeiter={filteredMitarbeiter}
          selectedMitarbeiter={selectedMitarbeiter}
          setSelectedMitarbeiter={setSelectedMitarbeiter}
          selectedMonat={selectedMonat}
          setSelectedMonat={setSelectedMonat}
          isVorgesetzter={isVorgesetzter}
          isAdmin={isAdmin}
        />
        
        <Grid>
          {!isMobile && (
            <Grid.Col span={2}>
              <Sidebar 
                filteredMitarbeiter={filteredMitarbeiter}
                selectedMitarbeiter={selectedMitarbeiter}
                setSelectedMitarbeiter={setSelectedMitarbeiter}
                selectedMonat={selectedMonat}
                setSelectedMonat={setSelectedMonat}
                isVorgesetzter={isVorgesetzter}
                isAdmin={isAdmin}
              />
            </Grid.Col>
          )}

          <Grid.Col span={isMobile ? 12 : 10}>
            <MainContent 
              selectedMitarbeiter={selectedMitarbeiter}
              arbeitszeiten={arbeitszeiten}
              monatlicheStatistik={monatlicheStatistik}
              selectedMonat={selectedMonat}
              heutigerEintrag={heutigerEintrag}
              startzeit={startzeit}
              setStartzeit={setStartzeit}
              endzeit={endzeit}
              setEndzeit={setEndzeit}
              onEdit={setEditModal}
              onNewEntry={() => setNewEntryModal({ open: true })}
              onSaveTime={handleSaveArbeitszeit}
              onExport={handleExport}
              toggleMobileSidebar={toggleMobileSidebar}
              isMobile={isMobile}
            />
          </Grid.Col>
        </Grid>
        
        {/* Modals */}
        <TimeEditModal 
          modal={editModal}
          onClose={() => setEditModal({ open: false, arbeitszeit: null })}
          onSave={handleSaveEdit}
          onDelete={(id) => setDeleteModal({ open: true, arbeitszeit: { id } })}
          loading={loading}
        />
        
        <NewEntryModal 
          modal={newEntryModal}
          onClose={() => setNewEntryModal({ open: false })}
          onSave={handleCreateNewEntry}
          selectedMitarbeiter={selectedMitarbeiter}
          loading={loading}
        />
        
        <DeleteConfirmModal 
          modal={deleteModal}
          onClose={() => setDeleteModal({ open: false, arbeitszeit: null })}
          onConfirm={handleDeleteArbeitszeit}
          loading={loading}
        />
      </Container>
    </DatesProvider>
  );
}

export default Dashboard;
    