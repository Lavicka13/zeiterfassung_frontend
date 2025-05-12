import React, { useEffect, useState } from "react";
import {
  Table,
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
  LoadingOverlay
} from "@mantine/core";
import { notifications } from '@mantine/notifications';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { isLoggedIn, getRolle } from "../utils/auth";

function Verwaltung() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [mitarbeiter, setMitarbeiter] = useState([]);
  const [bearbeiteUser, setBearbeiteUser] = useState(null);
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
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:8080/api/mitarbeiter/${bearbeiteUser.ID}`,
        bearbeiteUser,
        { headers: { Authorization: token } }
      );
      
      notifications.show({
        title: 'Erfolg',
        message: 'Nutzer erfolgreich aktualisiert.',
        color: 'green',
      });
      
      setBearbeiteUser(null);
      fetchMitarbeiter();
    } catch (err) {
      notifications.show({
        title: 'Fehler',
        message: err.response?.data?.error || 'Fehler beim Aktualisieren',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNeuSpeichern = async () => {
    if (!neuUser.Vorname || !neuUser.Nachname || !neuUser.Email || !neuUser.Passwort) {
      notifications.show({
        title: 'Fehler',
        message: 'Bitte alle Pflichtfelder ausfüllen',
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
      notifications.show({
        title: 'Fehler',
        message: err.response?.data?.error || 'Fehler beim Erstellen des Nutzers',
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
      notifications.show({
        title: 'Fehler',
        message: err.response?.data?.error || 'Fehler beim Zurücksetzen des Passworts',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

const getRollenBadge = (rolle) => {
  console.log("Rolle Wert:", rolle); // Debugging: Zeigt den tatsächlichen Wert im Browser-Konsolenfenster
  
  let color = "green"; // Standard: grün für Mitarbeiter
  let text = "Mitarbeiter"; // Standardtext
  
  // Versuche, sowohl Strings als auch Zahlen zu behandeln
  if (rolle === "admin" || rolle === 3 || rolle === "3") {
    color = "red";
    text = "Administrator";
  } else if (rolle === "vorgesetzter" || rolle === 2 || rolle === "2") {
    color = "blue";
    text = "Vorgesetzter";
  } else if (rolle === "mitarbeiter" || rolle === 1 || rolle === "1") {
    color = "green";
    text = "Mitarbeiter";
  }
  
  return <Badge color={color}>{text}</Badge>;
};

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <Paper p="lg" pos="relative">
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      <Group position="apart" mb="lg">
        <Title order={2}>Nutzerverwaltung</Title>
        <Button onClick={goToDashboard} variant="outline">
          Zurück zum Dashboard
        </Button>
      </Group>

      <Button onClick={() => setOffenNeuModal(true)} mb="md">
        + Neuen Nutzer hinzufügen
      </Button>

     

      <Table highlightOnHover withBorder>
        <thead>
          <tr>
            <th>Vorname</th>
            <th>Nachname</th>
            <th>E-Mail</th>
            <th>Rolle</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {mitarbeiter.map((m, index) => (
            <tr
              key={m.ID}
              style={{
                backgroundColor: index % 2 === 1 ? "#f9f9f9" : "transparent",
              }}
            >
              <td>{m.Vorname}</td>
              <td>{m.Nachname}</td>
              <td>{m.Email}</td>
              <td>{getRollenBadge(m.Rolle)}</td>
              <td>
                <Group spacing="xs">
                  <Button size="xs" onClick={() => setBearbeiteUser(m)}>
                    Bearbeiten
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    color="red"
                    onClick={() => setDeleteModal({ open: true, user: m })}
                  >
                    Löschen
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => setResetModal({ open: true, user: m })}
                  >
                    🔒 Reset
                  </Button>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal für neue Nutzer */}
      <Modal
        opened={offenNeuModal}
        onClose={() => setOffenNeuModal(false)}
        title="Neuen Nutzer anlegen"
      >
        <LoadingOverlay visible={loading} overlayBlur={2} />
        <TextInput
          label="Vorname"
          value={neuUser.Vorname}
          onChange={(e) =>
            setNeuUser({ ...neuUser, Vorname: e.target.value })
          }
          mb="sm"
          required
        />
        <TextInput
          label="Nachname"
          value={neuUser.Nachname}
          onChange={(e) =>
            setNeuUser({ ...neuUser, Nachname: e.target.value })
          }
          mb="sm"
          required
        />
        <TextInput
          label="E-Mail"
          value={neuUser.Email}
          onChange={(e) =>
            setNeuUser({ ...neuUser, Email: e.target.value })
          }
          mb="sm"
          required
        />
        <PasswordInput
          label="Passwort"
          value={neuUser.Passwort}
          onChange={(e) =>
            setNeuUser({ ...neuUser, Passwort: e.target.value })
          }
          mb="sm"
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
          mb="md"
        />
        <Group mt="md">
          <Button onClick={handleNeuSpeichern}>Erstellen</Button>
          <Button variant="outline" onClick={() => setOffenNeuModal(false)}>
            Abbrechen
          </Button>
        </Group>
      </Modal>

      {/* Modal für Löschbestätigung */}
      <Modal
        opened={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, user: null })}
        title="Nutzer löschen"
      >
        <LoadingOverlay visible={loading} overlayBlur={2} />
        <Text mb="lg">
          Sind Sie sicher, dass Sie den Nutzer "{deleteModal.user?.Vorname} {deleteModal.user?.Nachname}" löschen möchten?
          Diese Aktion kann nicht rückgängig gemacht werden.
        </Text>
        <Group position="right">
          <Button variant="outline" onClick={() => setDeleteModal({ open: false, user: null })}>
            Abbrechen
          </Button>
          <Button color="red" onClick={() => handleDelete(deleteModal.user?.ID)}>
            Löschen
          </Button>
        </Group>
      </Modal>

      {/* Modal für Passwort-Reset */}
      <Modal
        opened={resetModal.open}
        onClose={() => setResetModal({ open: false, user: null })}
        title="Passwort zurücksetzen"
      >
        <LoadingOverlay visible={loading} overlayBlur={2} />
        <Text mb="md">
          Neues Passwort für "{resetModal.user?.Vorname} {resetModal.user?.Nachname}" festlegen:
        </Text>
        <PasswordInput
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Neues Passwort (mind. 6 Zeichen)"
          mb="md"
        />
        <Group position="right">
          <Button variant="outline" onClick={() => setResetModal({ open: false, user: null })}>
            Abbrechen
          </Button>
          <Button onClick={() => handlePasswortReset(resetModal.user?.ID)}>
            Passwort setzen
          </Button>
        </Group>
      </Modal>
       {bearbeiteUser && (
        <Box mb="xl" p="md" sx={{ border: '1px solid #ddd', borderRadius: '4px' }}>
          <Title order={4} mb="md">Bearbeite: {bearbeiteUser.Vorname} {bearbeiteUser.Nachname}</Title>
          <TextInput
            label="Vorname"
            value={bearbeiteUser.Vorname}
            onChange={(e) =>
              setBearbeiteUser({
                ...bearbeiteUser,
                Vorname: e.target.value,
              })
            }
            mb="sm"
          />
          <TextInput
            label="Nachname"
            value={bearbeiteUser.Nachname}
            onChange={(e) =>
              setBearbeiteUser({
                ...bearbeiteUser,
                Nachname: e.target.value,
              })
            }
            mb="sm"
          />
          <TextInput
            label="Email"
            value={bearbeiteUser.Email || ""}
            onChange={(e) =>
              setBearbeiteUser({
                ...bearbeiteUser,
                Email: e.target.value,
              })
            }
            mb="sm"
          />
          <Select
            label="Rolle"
            data={[
              { value: "mitarbeiter", label: "Mitarbeiter" },
              { value: "vorgesetzter", label: "Vorgesetzter" },
              { value: "admin", label: "Administrator" }
            ]}
            value={bearbeiteUser.Rolle}
            onChange={(value) =>
              setBearbeiteUser({ ...bearbeiteUser, Rolle: value })
            }
            mb="md"
          />
          <Group mt="md">
            <Button onClick={handleUpdate}>Speichern</Button>
            <Button variant="outline" onClick={() => setBearbeiteUser(null)}>
              Abbrechen
            </Button>
          </Group>
        </Box>
      )}
    </Paper>
  );
}

export default Verwaltung;