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
import { IconMenu2, IconClock, IconUser, IconPencil } from '@tabler/icons-react';
import "dayjs/locale/de";
import "@mantine/dates/styles.css";
import axios from "axios";
import dayjs from "dayjs";
import { getRolle } from "../utils/auth";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decoded = useMemo(() => (token ? jwtDecode(token) : null), [token]);
  const theme = useMantineTheme();
  
  // Mantine Hooks für responsive Designs
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isExtraSmall = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);

  const [mitarbeiterListe, setMitarbeiterListe] = useState([]);
  const [selectedMitarbeiter, setSelectedMitarbeiter] = useState(null);
  const [selectedMonat, setSelectedMonat] = useState(dayjs());
  const [arbeitszeiten, setArbeitszeiten] = useState([]);
  const [startzeit, setStartzeit] = useState("");
  const [endzeit, setEndzeit] = useState("");
  const istAktuellerMonat = selectedMonat.isSame(dayjs(), "month");
  const hatHeuteSchonEintrag = arbeitszeiten.some(
    (a) => dayjs(a.datum).isSame(dayjs(), "day") && a.endzeit
  );
  const [loading, setLoading] = useState(false);
  const [mobileSidebarOpened, { toggle: toggleMobileSidebar }] = useDisclosure(false);
  
  // State für das Bearbeiten-Modal
  const [editModal, setEditModal] = useState({
    open: false,
    arbeitszeit: null,
    anfangszeit: "",
    endzeit: ""
  });

  // Benutzerrolle ermitteln
  const userRole = useMemo(() => getRolle(), []);
  const isAdmin = userRole >= 3;
  const isVorgesetzter = userRole >= 2;

  // Definiere einen Stil für die zentrierte Ausrichtung
  const centerTextStyle = { textAlign: 'center' };

  useEffect(() => {
    const fetchMitarbeiter = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:8080/api/mitarbeiter",
          { headers: { Authorization: token } }
        );
        setMitarbeiterListe(response.data);
        if (decoded?.user_id) {
          const user = response.data.find((u) => u.ID === decoded.user_id);
          if (user) setSelectedMitarbeiter(user);
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
    if (token) fetchMitarbeiter();
  }, [token, decoded?.user_id]);

  useEffect(() => {
    if (!selectedMitarbeiter || !selectedMonat) return;
    
    setLoading(true);
    const monthString = selectedMonat.format("YYYY-MM");
    axios
      .get(
        `http://localhost:8080/api/arbeitszeiten/${selectedMitarbeiter.ID}?monat=${monthString}`,
        { headers: { Authorization: token } }
      )
      .then((res) => setArbeitszeiten(res.data))
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
      const response = await axios.put(
        "http://localhost:8080/api/arbeitszeit/update", 
        {
          id: editModal.arbeitszeit.id,
          anfangszeit: `${editModal.arbeitszeit.datum}T${editModal.anfangszeit}:00`,
          endzeit: editModal.endzeit ? `${editModal.arbeitszeit.datum}T${editModal.endzeit}:00` : null,
          bearbeiter_id: decoded?.user_id,
        },
        { headers: { Authorization: token } }
      );

      notifications.show({
        title: 'Erfolg',
        message: 'Änderungen wurden gespeichert.',
        color: 'green',
      });
      
      setEditModal({ open: false, arbeitszeit: null, anfangszeit: "", endzeit: "" });
      await refreshArbeitszeiten();
    } catch (error) {
      notifications.show({
        title: 'Fehler',
        message: error.response?.data?.error || 'Fehler beim Bearbeiten der Arbeitszeit',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSaveArbeitszeit = async () => {
    if (!startzeit) {
      notifications.show({
        title: 'Fehler',
        message: 'Bitte geben Sie eine Startzeit ein.',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nutzer_id: selectedMitarbeiter.ID,
        datum: dayjs().format("YYYY-MM-DD"),
        anfangszeit: dayjs(
          `${dayjs().format("YYYY-MM-DD")}T${startzeit}`
        ).toISOString(),
      };

      if (endzeit) {
        payload.endzeit = dayjs(
          `${dayjs().format("YYYY-MM-DD")}T${endzeit}`
        ).toISOString();
      }

      await axios.post("http://localhost:8080/api/arbeitszeiten", payload, {
        headers: { Authorization: token },
      });
      
      notifications.show({
        title: 'Erfolg',
        message: 'Arbeitszeit wurde erfolgreich gespeichert.',
        color: 'green',
      });
      
      await refreshArbeitszeiten();
      setStartzeit("");
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

  const refreshArbeitszeiten = async () => {
    if (!selectedMitarbeiter || !selectedMonat) return;
    
    setLoading(true);
    const monthString = selectedMonat.format("YYYY-MM");
    try {
      const response = await axios.get(
        `http://localhost:8080/api/arbeitszeiten/${selectedMitarbeiter.ID}?monat=${monthString}`,
        { headers: { Authorization: token } }
      );
      setArbeitszeiten(response.data);
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
      return mitarbeiterListe.filter(m => m.ID === decoded?.user_id);
    }
  }, [mitarbeiterListe, decoded?.user_id, isVorgesetzter, isAdmin]);

  // Sidebar-Inhalt, wiederverwendbar für Desktop und Mobile
  const SidebarContent = () => (
    <>
      <Title order={4} mb="md">Mitarbeiter</Title>
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
          onChange={(d) => {
            if (d) setSelectedMonat(dayjs(d));
            if (mobileSidebarOpened) toggleMobileSidebar();
          }}
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

      <Group position="center" mb="md">
        <Badge color="blue" variant="light" size={isMobile ? "md" : "lg"}>
          Aktueller Monat: {selectedMonat.format("MMMM YYYY")}
        </Badge>
      </Group>

      {/* Export-Menu für Monatsbericht - nur auf größeren Bildschirmen */}
      <Group position="right" mt="md" mb="sm">
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
        <Table highlightOnHover withBorder withColumnBorders>
          <thead>
            <tr>
              <th style={centerTextStyle}>Datum</th>
              <th style={centerTextStyle}>Start</th>
              <th style={centerTextStyle}>Ende</th>
              <th style={centerTextStyle}>Pause</th>
              <th style={centerTextStyle}>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {istAktuellerMonat && !hatHeuteSchonEintrag && (
              <tr>
                <td style={centerTextStyle}>{dayjs().format("DD.MM.YYYY")}</td>
                <td style={centerTextStyle}>
                  <TimeInput
                    value={startzeit}
                    onChange={(e) => setStartzeit(e.target.value)}
                    placeholder="08:00"
                  />
                </td>
                <td style={centerTextStyle}>
                  <TimeInput
                    value={endzeit}
                    onChange={(e) => setEndzeit(e.target.value)}
                    placeholder="16:30"
                  />
                </td>
                <td style={centerTextStyle}>auto</td>
                <td style={centerTextStyle}>
                  <Button size="xs" onClick={handleSaveArbeitszeit}>
                    {startzeit && endzeit ? "Ende speichern" : "Speichern"}
                  </Button>
                </td>
              </tr>
            )}

            {arbeitszeiten.length > 0 ? (
              arbeitszeiten
                .slice()
                .sort((a, b) => dayjs(b.datum).diff(dayjs(a.datum)))
                .map((a, index) => (
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
                    <td style={centerTextStyle}>
                      <Button size="xs" onClick={() => handleEdit(a)}>Bearbeiten</Button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  Keine Arbeitszeiten im ausgewählten Monat
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
      
      {/* Mobile Ansicht als Karten (nur auf Mobilgeräten sichtbar) */}
      {isMobile && (
        <Stack spacing="xs">
          {/* Neue Zeiterfassung (nur für aktuellen Monat) */}
          {istAktuellerMonat && !hatHeuteSchonEintrag && (
            <Card shadow="sm" withBorder p="xs">
              <Card.Section withBorder p="xs" bg={theme.colors.blue[0]}>
                <Group position="apart">
                  <Text fw={500} ta="center" style={{width: '100%'}}>Neuer Eintrag: {dayjs().format("DD.MM.YYYY")}</Text>
                </Group>
              </Card.Section>
              <Group position="apart" mt="xs">
                <TimeInput
                  label="Start"
                  leftSection={<IconClock size={16} />}
                  value={startzeit}
                  onChange={(e) => setStartzeit(e.target.value)}
                  placeholder="08:00"
                  size="xs"
                  style={{ width: '45%' }}
                />
                <TimeInput
                  label="Ende"
                  leftSection={<IconClock size={16} />}
                  value={endzeit}
                  onChange={(e) => setEndzeit(e.target.value)}
                  placeholder="16:30"
                  size="xs"
                  style={{ width: '45%' }}
                />
              </Group>
              <Button 
                fullWidth 
                mt="xs" 
                size="xs" 
                onClick={handleSaveArbeitszeit}
              >
                {startzeit && endzeit ? "Ende speichern" : "Speichern"}
              </Button>
            </Card>
          )}
          
          {/* Bestehende Einträge als Karten */}
          {arbeitszeiten.length > 0 ? (
            arbeitszeiten
              .slice()
              .sort((a, b) => dayjs(b.datum).diff(dayjs(a.datum)))
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
        <Modal
          opened={editModal.open}
          onClose={() => setEditModal({ open: false, arbeitszeit: null, anfangszeit: "", endzeit: "" })}
          title="Arbeitszeit bearbeiten"
          size={isMobile ? "xs" : "md"}
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
              
              <Group position="center">
                <Button 
                  variant="outline" 
                  onClick={() => setEditModal({ open: false, arbeitszeit: null, anfangszeit: "", endzeit: "" })}
                >
                  Abbrechen
                </Button>
                <Button onClick={handleSaveEdit}>Speichern</Button>
              </Group>
            </>
          )}
        </Modal>
      </Container>
    </DatesProvider>
  );
}

export default Dashboard;