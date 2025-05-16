import React, { useEffect, useState } from "react";
import {
  Button,
  TextInput,
  Select,
  Paper,
  Title,
  Group,
  Modal,
  Text,
  Box,
  Badge,
  PasswordInput,
  LoadingOverlay,
  ActionIcon,
  Card,
  SimpleGrid,
  Stack,
  useMantineTheme,
  Divider,
  Container,
  Avatar,
  Tabs,
  Grid,
  Menu
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from '@mantine/notifications';
import { useNavigate } from "react-router-dom";
import { 
  IconEdit, 
  IconTrash, 
  IconLock, 
  IconChevronLeft, 
  IconSearch, 
  IconUserPlus, 
  IconUserCircle,
  IconUserCog,
  IconSortAscending,
  IconSortDescending,
  IconRefresh,
  IconDots
} from '@tabler/icons-react';
import axios from "axios";
import { isLoggedIn, getRolle } from "../utils/auth";

function Verwaltung() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const theme = useMantineTheme();
  
  // Responsive Design
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  
  const [mitarbeiter, setMitarbeiter] = useState([]);
  const [filteredMitarbeiter, setFilteredMitarbeiter] = useState([]);
  const [bearbeiteUser, setBearbeiteUser] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, user: null }); // Neuer State für das Edit-Modal
  const [neuUser, setNeuUser] = useState({
    Vorname: "",
    Nachname: "",
    Email: "",
    Rolle: "mitarbeiter",
    Passwort: "",
  });
  const [offenNeuModal, setOffenNeuModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [resetModal, setResetModal] = useState({ open: false, user: null });
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortField, setSortField] = useState("Nachname");
  const [activeTab, setActiveTab] = useState("alle");

  // Function to generate avatar initials
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  // Function to get avatar color based on role
  const getAvatarColor = (rolle) => {
    if (!rolle) return theme.colors.green[5];
    
    const rolleStr = String(rolle).toLowerCase();
    
    if (rolleStr === "admin" || rolleStr === "3") return theme.colors.red[5];
    if (rolleStr === "vorgesetzter" || rolleStr === "2") return theme.colors.blue[5];
    return theme.colors.green[5];
  };

  useEffect(() => {
    // Überprüfe Zugriffsberechtigungen
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    
    const role = getRolle();
    if (role < 2) { // Weniger als Vorgesetzter
      notifications.show({
        title: 'Zugriff verweigert',
        message: 'Sie haben keine Berechtigung für diesen Bereich.',
        color: 'red',
      });
      navigate("/dashboard");
      return;
    }
    
    fetchMitarbeiter();
  }, [navigate]);

  // Filter Mitarbeiter basierend auf aktivem Tab und Suchbegriff
  useEffect(() => {
    if (!mitarbeiter || mitarbeiter.length === 0) {
      setFilteredMitarbeiter([]);
      return;
    }
    
    // Kopie der Mitarbeiterliste erstellen
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
    
    // Nach Suchbegriff filtern (wenn vorhanden)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(m => 
        (m.Vorname && m.Vorname.toLowerCase().includes(searchLower)) ||
        (m.Nachname && m.Nachname.toLowerCase().includes(searchLower)) ||
        (m.Email && m.Email.toLowerCase().includes(searchLower))
      );
    }
    
    // Nach ausgewähltem Feld sortieren
    result.sort((a, b) => {
      const fieldA = (a[sortField] || "").toLowerCase();
      const fieldB = (b[sortField] || "").toLowerCase();
      
      if (sortDirection === "asc") {
        return fieldA.localeCompare(fieldB);
      } else {
        return fieldB.localeCompare(fieldA);
      }
    });
    
    setFilteredMitarbeiter(result);
  }, [mitarbeiter, activeTab, searchTerm, sortField, sortDirection]);

  const fetchMitarbeiter = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/mitarbeiter", {
        headers: { Authorization: token },
      });
      setMitarbeiter(res.data);
    } catch (err) {
      console.error("Fehler beim Laden:", err);
      notifications.show({
        title: 'Fehler',
        message: 'Mitarbeiterdaten konnten nicht geladen werden.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    // Prüfen ob alle Pflichtfelder ausgefüllt sind
    if (!editModal.user.Vorname || !editModal.user.Nachname || !editModal.user.Email) {
      notifications.show({
        title: 'Fehler',
        message: 'Bitte alle Pflichtfelder ausfüllen',
        color: 'red',
      });
      return;
    }
    
    // Einfache E-Mail-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editModal.user.Email)) {
      notifications.show({
        title: 'Fehler',
        message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
        color: 'red',
      });
      return;
    }
    
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:8080/api/mitarbeiter/${editModal.user.ID}`,
        editModal.user,
        { headers: { Authorization: token } }
      );
      
      notifications.show({
        title: 'Erfolg',
        message: 'Nutzer erfolgreich aktualisiert.',
        color: 'green',
      });
      
      setEditModal({ open: false, user: null });
      fetchMitarbeiter();
    } catch (err) {
      // Verbesserte Fehlerbehandlung
      let errorMessage = 'Fehler beim Aktualisieren';
      
      // Wenn der Fehler mit der Email-Validierung zu tun hat
      if (err.response?.data?.error && err.response.data.error.includes('Email')) {
        errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      notifications.show({
        title: 'Fehler',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNeuSpeichern = async () => {
    // Prüfen ob alle Pflichtfelder ausgefüllt sind
    if (!neuUser.Vorname || !neuUser.Nachname || !neuUser.Email || !neuUser.Passwort) {
      notifications.show({
        title: 'Fehler',
        message: 'Bitte alle Pflichtfelder ausfüllen',
        color: 'red',
      });
      return;
    }
    
    // Prüfen ob das Passwort lang genug ist
    if (neuUser.Passwort.length < 6) {
      notifications.show({
        title: 'Fehler',
        message: 'Bitte geben Sie ein gültiges Passwort mit mindestens 6 Zeichen ein.',
        color: 'red',
      });
      return;
    }
    
    // Einfache E-Mail-Validierung 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(neuUser.Email)) {
      notifications.show({
        title: 'Fehler',
        message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
        color: 'red',
      });
      return;
    }
    
    setLoading(true);
    try {
      await axios.post("http://localhost:8080/api/mitarbeiter", neuUser, {
        headers: { Authorization: token },
      });
      
      notifications.show({
        title: 'Erfolg',
        message: 'Neuer Nutzer erfolgreich angelegt.',
        color: 'green',
      });
      
      setNeuUser({
        Vorname: "",
        Nachname: "",
        Email: "",
        Rolle: "mitarbeiter",
        Passwort: "",
      });
      setOffenNeuModal(false);
      fetchMitarbeiter();
    } catch (err) {
      // Verbesserte Fehlerbehandlung
      let errorMessage = 'Fehler beim Erstellen des Nutzers';
      
      // Wenn der Fehler mit dem Passwort zu tun hat oder eine Email-Validierung fehlschlägt
      if (err.response?.data?.error && err.response.data.error.includes('Email')) {
        errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
      } else if (err.response?.data?.error && err.response.data.error.includes('Passwort')) {
        errorMessage = 'Bitte geben Sie ein gültiges Passwort mit mindestens 6 Zeichen ein.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      notifications.show({
        title: 'Fehler',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:8080/api/mitarbeiter/${id}`, {
        headers: { Authorization: token },
      });
      
      notifications.show({
        title: 'Erfolg',
        message: 'Nutzer erfolgreich gelöscht.',
        color: 'green',
      });
      
      fetchMitarbeiter();
    } catch (err) {
      notifications.show({
        title: 'Fehler',
        message: err.response?.data?.error || 'Fehler beim Löschen des Nutzers',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setDeleteModal({ open: false, user: null });
    }
  };

  const handlePasswortReset = async (id) => {
    // Validierung des Passworts bevor API-Anfrage gesendet wird
    if (!newPassword || newPassword.length < 6) {
      notifications.show({
        title: 'Fehler',
        message: 'Bitte geben Sie ein gültiges Passwort mit mindestens 6 Zeichen ein.',
        color: 'red',
      });
      return;
    }
    
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:8080/api/mitarbeiter/${id}/passwort`,
        { passwort: newPassword },
        { headers: { Authorization: token } }
      );
      
      notifications.show({
        title: 'Erfolg',
        message: 'Passwort erfolgreich zurückgesetzt.',
        color: 'green',
      });
      
      setNewPassword("");
      setResetModal({ open: false, user: null });
    } catch (err) {
      // Verbesserte Fehlerbehandlung
      let errorMessage = 'Fehler beim Zurücksetzen des Passworts';
      
      // Spezifische Fehlermeldung für Passwort-Probleme
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
    } finally {
      setLoading(false);
    }
  };

  const getRollenBadge = (rolle) => {
    let color = "green"; // Standard: grün für Mitarbeiter
    let text = "Mitarbeiter"; // Standardtext
    
    if (!rolle) return <Badge color={color} variant="light" size="md">{text}</Badge>;
    
    const rolleStr = String(rolle).toLowerCase();
    
    if (rolleStr === "admin" || rolleStr === "3") {
      color = "red";
      text = "Administrator";
    } else if (rolleStr === "vorgesetzter" || rolleStr === "2") {
      color = "blue";
      text = "Vorgesetzter";
    } else if (rolleStr === "mitarbeiter" || rolleStr === "1") {
      color = "green";
      text = "Mitarbeiter";
    }
    
    return <Badge color={color} variant="light" size="md">{text}</Badge>;
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const handleSortChange = (field) => {
    if (sortField === field) {
      toggleSortDirection();
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  // Funktion, um das Bearbeiten-Modal zu öffnen
  const openEditModal = (user) => {
    setEditModal({ open: true, user: { ...user } });
  };

  // Modern Card Display for users
  const UserCard = ({ user }) => (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Group position="apart" style={{ marginBottom: 12, alignItems: 'flex-start' }}>
        <Group>
          <Avatar 
            radius="xl" 
            size={42} 
            color={getAvatarColor(user.Rolle || user.RechteID)}
          >
            {getInitials(user.Vorname, user.Nachname)}
          </Avatar>
          <div>
            <Text weight={500} size="lg">{user.Vorname} {user.Nachname}</Text>
            <Text size="sm" color="dimmed">{user.Email}</Text>
          </div>
        </Group>
        {getRollenBadge(user.Rolle || user.RechteID)}
      </Group>

      <Group position="right" spacing="xs" mt="md">
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="default" radius="md" size={36}>
              <IconDots size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item 
              icon={<IconEdit size={16} />}
              onClick={() => openEditModal(user)}
            >
              Bearbeiten
            </Menu.Item>
            <Menu.Item 
              icon={<IconLock size={16} />}
              onClick={() => setResetModal({ open: true, user })}
            >
              Passwort zurücksetzen
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item 
              color="red" 
              icon={<IconTrash size={16} />}
              onClick={() => setDeleteModal({ open: true, user })}
            >
              Löschen
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Card>
  );

  return (
    <Container size="xl" px={isMobile ? "xs" : "md"} py="lg">
      <Paper shadow="xs" radius="md" p={isMobile ? "sm" : "md"} pos="relative" withBorder>
        <LoadingOverlay visible={loading} overlayBlur={2} />
        
        <Group position="apart" mb={30}>
          <div>
            <Title order={2} size={isMobile ? "h3" : "h2"} mb={5}>Nutzerverwaltung</Title>
            <Text color="dimmed" size="sm">Verwalten Sie Ihr Team und deren Berechtigungen</Text>
          </div>
          <Button 
            onClick={goToDashboard} 
            variant="subtle" 
            leftIcon={<IconChevronLeft size={16} />}
            color="gray"
          >
            Zurück zum Dashboard
          </Button>
        </Group>

        <Divider mb="xl" />

        {/* Search and Filter Controls */}
        <Grid mb="lg" align="center" gutter={isMobile ? "xs" : "md"}>
          <Grid.Col span={isMobile ? 12 : 6}>
            <TextInput
              placeholder="Suche nach Name oder E-Mail..."
              icon={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              radius="md"
            />
          </Grid.Col>
          <Grid.Col span={isMobile ? 12 : 6}>
            <Group position={isMobile ? "center" : "right"} spacing="sm">
              <Button 
                variant="filled" 
                leftIcon={<IconUserPlus size={16} />}
                onClick={() => setOffenNeuModal(true)}
                radius="md"
              >
                Neuer Nutzer
              </Button>
              
            </Group>
          </Grid.Col>
        </Grid>

        {/* Tabs for Role Filtering */}
        <Tabs 
          value={activeTab} 
          onChange={setActiveTab}
          mb="md"
          radius="md"
        >
          <Tabs.List>
            <Tabs.Tab value="alle" icon={<IconUserCircle size={16} />}>
              Alle ({mitarbeiter.length})
            </Tabs.Tab>
            <Tabs.Tab value="admin" icon={<IconUserCog size={16} />} color="red">
              Administratoren
            </Tabs.Tab>
            <Tabs.Tab value="vorgesetzter" icon={<IconUserCog size={16} />} color="blue">
              Vorgesetzte
            </Tabs.Tab>
            <Tabs.Tab value="mitarbeiter" icon={<IconUserCircle size={16} />} color="green">
              Mitarbeiter
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* Sort Controls */}
        <Group position="right" mb="md" spacing="xs">
          <Text size="sm" color="dimmed">Sortieren nach:</Text>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button 
                variant="subtle" 
                rightIcon={sortDirection === "asc" ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
                compact
              >
                {sortField === "Nachname" ? "Nachname" : 
                 sortField === "Vorname" ? "Vorname" : "E-Mail"}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item 
                icon={<IconSortAscending size={16} />} 
                onClick={() => handleSortChange("Nachname")}
                rightSection={sortField === "Nachname" ? "✓" : null}
              >
                Nachname
              </Menu.Item>
              <Menu.Item 
                icon={<IconSortAscending size={16} />} 
                onClick={() => handleSortChange("Vorname")}
                rightSection={sortField === "Vorname" ? "✓" : null}
              >
                Vorname
              </Menu.Item>
              <Menu.Item 
                icon={<IconSortAscending size={16} />} 
                onClick={() => handleSortChange("Email")}
                rightSection={sortField === "Email" ? "✓" : null}
              >
                E-Mail
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                icon={sortDirection === "asc" ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
                onClick={toggleSortDirection}
              >
                {sortDirection === "asc" ? "Aufsteigend" : "Absteigend"}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* User Cards Display (Grid for all sizes) */}
        <SimpleGrid 
          cols={isMobile ? 1 : isTablet ? 2 : 3}
          spacing={isMobile ? "sm" : "md"}
        >
          {filteredMitarbeiter.length > 0 ? (
            filteredMitarbeiter.map((user) => (
              <UserCard key={user.ID} user={user} />
            ))
          ) : (
            <Text align="center" color="dimmed" py="xl" style={{ gridColumn: "1/-1" }}>
              {searchTerm || activeTab !== "alle" ? 
                "Keine Nutzer mit diesen Filterkriterien gefunden." : 
                "Keine Nutzer vorhanden. Erstellen Sie einen neuen Nutzer."
              }
            </Text>
          )}
        </SimpleGrid>

        {/* Modal für neue Nutzer */}
        <Modal
          opened={offenNeuModal}
          onClose={() => setOffenNeuModal(false)}
          title={<Text size="lg" weight={500}>Neuen Nutzer anlegen</Text>}
          size={isMobile ? "xs" : "md"}
          radius="md"
        >
          <LoadingOverlay visible={loading} overlayBlur={2} />
          <TextInput
            label="Vorname"
            value={neuUser.Vorname}
            onChange={(e) =>
              setNeuUser({ ...neuUser, Vorname: e.target.value })
            }
            mb="md"
            radius="md"
            required
          />
          <TextInput
            label="Nachname"
            value={neuUser.Nachname}
            onChange={(e) =>
              setNeuUser({ ...neuUser, Nachname: e.target.value })
            }
            mb="md"
            radius="md"
            required
          />
          <TextInput
            label="E-Mail"
            value={neuUser.Email}
            onChange={(e) =>
              setNeuUser({ ...neuUser, Email: e.target.value })
            }
            mb="md"
            radius="md"
            required
          />
          <PasswordInput
            label="Passwort"
            value={neuUser.Passwort}
            onChange={(e) =>
              setNeuUser({ ...neuUser, Passwort: e.target.value })
            }
            mb="md"
            radius="md"
            required
          />
          <Select
            label="Rolle"
            data={[
              { value: "mitarbeiter", label: "Mitarbeiter" },
              { value: "vorgesetzter", label: "Vorgesetzter" },
              { value: "admin", label: "Administrator" }
            ]}
            value={neuUser.Rolle}
            onChange={(value) => setNeuUser({ ...neuUser, Rolle: value })}
            mb="xl"
            radius="md"
          />
          <Group mt="md" position="right">
            <Button variant="default" onClick={() => setOffenNeuModal(false)} radius="md">
              Abbrechen
            </Button>
            <Button onClick={handleNeuSpeichern} radius="md">
              Erstellen
            </Button>
          </Group>
        </Modal>

        {/* Modal für Löschbestätigung */}
        <Modal
          opened={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, user: null })}
          title={<Text size="lg" weight={500} color="red">Nutzer löschen</Text>}
          size={isMobile ? "xs" : "md"}
          radius="md"
        >
          <LoadingOverlay visible={loading} overlayBlur={2} />
          <Text mb="lg">
            Sind Sie sicher, dass Sie den Nutzer <Text span weight={500}>"{deleteModal.user?.Vorname} {deleteModal.user?.Nachname}"</Text> löschen möchten?
            Diese Aktion kann nicht rückgängig gemacht werden.
          </Text>
          <Group position="right">
            <Button 
              variant="default" 
              onClick={() => setDeleteModal({ open: false, user: null })}
              radius="md"
            >
              Abbrechen
            </Button>
            <Button 
              color="red" 
              onClick={() => handleDelete(deleteModal.user?.ID)}
              radius="md"
            >
              Löschen
            </Button>
          </Group>
        </Modal>

        {/* Modal für Passwort-Reset */}
        <Modal
          opened={resetModal.open}
          onClose={() => setResetModal({ open: false, user: null })}
          title={<Text size="lg" weight={500}>Passwort zurücksetzen</Text>}
          size={isMobile ? "xs" : "md"}
          radius="md"
        >
          <LoadingOverlay visible={loading} overlayBlur={2} />
          <Text mb="md">
            Neues Passwort für <Text span weight={500}>"{resetModal.user?.Vorname} {resetModal.user?.Nachname}"</Text> festlegen:
          </Text>
          <PasswordInput
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Neues Passwort (mind. 6 Zeichen)"
            mb="xl"
            radius="md"
          />
          <Group position="right">
            <Button 
              variant="default" 
              onClick={() => setResetModal({ open: false, user: null })}
              radius="md"
            >
              Abbrechen
            </Button>
            <Button 
              onClick={() => handlePasswortReset(resetModal.user?.ID)}
              radius="md"
            >
              Passwort setzen
            </Button>
          </Group>
        </Modal>
        
        {/* NEUES Modal für Nutzer bearbeiten */}
        <Modal
          opened={editModal.open}
          onClose={() => setEditModal({ open: false, user: null })}
          title={<Text size="lg" weight={500}>Nutzer bearbeiten</Text>}
          size={isMobile ? "xs" : "md"}
          radius="md"
        >
          <LoadingOverlay visible={loading} overlayBlur={2} />
          {editModal.user && (
            <>
              <Grid>
                <Grid.Col span={isMobile ? 12 : 6}>
                  <TextInput
                    label="Vorname"
                    value={editModal.user.Vorname || ""}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        user: { ...editModal.user, Vorname: e.target.value }
                      })
                    }
                    mb="md"
                    radius="md"
                    required
                  />
                </Grid.Col>
                <Grid.Col span={isMobile ? 12 : 6}>
                  <TextInput
                    label="Nachname"
                    value={editModal.user.Nachname || ""}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        user: { ...editModal.user, Nachname: e.target.value }
                      })
                    }
                    mb="md"
                    radius="md"
                    required
                  />
                </Grid.Col>
                <Grid.Col span={isMobile ? 12 : 6}>
                  <TextInput
                    label="Email"
                    value={editModal.user.Email || ""}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        user: { ...editModal.user, Email: e.target.value }
                      })
                    }
                    mb="md"
                    radius="md"
                    required
                  />
                </Grid.Col>
                <Grid.Col span={isMobile ? 12 : 6}>
                  <Select
                    label="Rolle"
                    data={[
                      { value: "mitarbeiter", label: "Mitarbeiter" },
                      { value: "vorgesetzter", label: "Vorgesetzter" },
                      { value: "admin", label: "Administrator" }
                    ]}
                    value={editModal.user.Rolle || ""}
                    onChange={(value) =>
                      setEditModal({
                        ...editModal,
                        user: { ...editModal.user, Rolle: value }
                      })
                    }
                    mb="md"
                    radius="md"
                  />
                </Grid.Col>
              </Grid>
              
              <Group position="right" mt="md">
                <Button 
                  variant="default" 
                  onClick={() => setEditModal({ open: false, user: null })}
                  radius="md"
                >
                  Abbrechen
                </Button>
                <Button onClick={handleUpdate} radius="md">Speichern</Button>
              </Group>
            </>
          )}
        </Modal>
      </Paper>
    </Container>
  );
}

export default Verwaltung;