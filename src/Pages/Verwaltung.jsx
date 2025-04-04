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
} from "@mantine/core";
import axios from "axios";

function Verwaltung() {
  const token = localStorage.getItem("token");
  const [mitarbeiter, setMitarbeiter] = useState([]);
  const [bearbeiteUser, setBearbeiteUser] = useState(null);
  const [neuUser, setNeuUser] = useState({
    Vorname: "",
    Nachname: "",
    Rolle: "mitarbeiter",
    Passwort: "",
  });
  const [offenNeuModal, setOffenNeuModal] = useState(false);

  useEffect(() => {
    fetchMitarbeiter();
  }, []);

  const fetchMitarbeiter = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/mitarbeiter", {
        headers: { Authorization: token },
      });
      setMitarbeiter(res.data);
    } catch (err) {
      console.error("Fehler beim Laden:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/mitarbeiter/${bearbeiteUser.ID}`,
        bearbeiteUser,
        { headers: { Authorization: token } }
      );
      alert("Nutzer aktualisiert.");
      setBearbeiteUser(null);
      fetchMitarbeiter();
    } catch (err) {
      alert("Fehler beim Aktualisieren");
    }
  };

  const handleNeuSpeichern = async () => {
    try {
      await axios.post("http://localhost:8080/api/mitarbeiter", neuUser, {
        headers: { Authorization: token },
      });
      alert("Neuer Nutzer gespeichert.");
      setNeuUser({
        Vorname: "",
        Nachname: "",
        Rolle: "mitarbeiter",
        Passwort: "",
      });
      setOffenNeuModal(false);
      fetchMitarbeiter();
    } catch (err) {
      alert("Fehler beim Erstellen");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Wirklich löschen?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/mitarbeiter/${id}`, {
        headers: { Authorization: token },
      });
      alert("Nutzer gelöscht.");
      fetchMitarbeiter();
    } catch (err) {
      alert("Fehler beim Löschen");
    }
  };

  const handlePasswortReset = async (id) => {
    const neuesPasswort = prompt("Neues Passwort eingeben:");
    if (!neuesPasswort) return;
    try {
      await axios.put(
        `http://localhost:8080/api/mitarbeiter/${id}/passwort`,
        { passwort: neuesPasswort },
        { headers: { Authorization: token } }
      );
      alert("Passwort aktualisiert.");
    } catch (err) {
      alert("Fehler beim Zurücksetzen");
    }
  };

  return (
    <Paper p="lg">
      <Title order={2} mb="lg">Nutzerverwaltung</Title>

      <Button onClick={() => setOffenNeuModal(true)} mb="md">
        + Neuen Nutzer hinzufügen
      </Button>

      {bearbeiteUser && (
        <>
          <Title order={4}>Bearbeite: {bearbeiteUser.Vorname}</Title>
          <TextInput
            label="Vorname"
            value={bearbeiteUser.Vorname}
            onChange={(e) =>
              setBearbeiteUser({
                ...bearbeiteUser,
                Vorname: e.target.value,
              })
            }
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
          />
          <Select
            label="Rolle"
            data={["mitarbeiter", "vorgesetzter", "admin"]}
            value={bearbeiteUser.Rolle}
            onChange={(value) =>
              setBearbeiteUser({ ...bearbeiteUser, Rolle: value })
            }
          />
          <Group mt="md">
            <Button onClick={handleUpdate}>Speichern</Button>
            <Button variant="outline" onClick={() => setBearbeiteUser(null)}>
              Abbrechen
            </Button>
          </Group>
        </>
      )}

      <Table highlightOnHover withBorder>
        <thead>
          <tr>
            <th>Vorname</th>
            <th>Nachname</th>
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
              <td>{m.Rolle}</td>
              <td>
                <Group spacing="xs">
                  <Button size="xs" onClick={() => setBearbeiteUser(m)}>
                    Bearbeiten
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    color="red"
                    onClick={() => handleDelete(m.ID)}
                  >
                    Löschen
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => handlePasswortReset(m.ID)}
                  >
                    🔒 Reset
                  </Button>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        opened={offenNeuModal}
        onClose={() => setOffenNeuModal(false)}
        title="Neuen Nutzer anlegen"
      >
        <TextInput
          label="Vorname"
          value={neuUser.Vorname}
          onChange={(e) =>
            setNeuUser({ ...neuUser, Vorname: e.target.value })
          }
        />
        <TextInput
          label="Nachname"
          value={neuUser.Nachname}
          onChange={(e) =>
            setNeuUser({ ...neuUser, Nachname: e.target.value })
          }
        />
        <TextInput
          label="Passwort"
          type="password"
          value={neuUser.Passwort}
          onChange={(e) =>
            setNeuUser({ ...neuUser, Passwort: e.target.value })
          }
        />
        <Select
          label="Rolle"
          data={["mitarbeiter", "vorgesetzter", "admin"]}
          value={neuUser.Rolle}
          onChange={(value) => setNeuUser({ ...neuUser, Rolle: value })}
        />
        <Group mt="md">
          <Button onClick={handleNeuSpeichern}>Erstellen</Button>
          <Button variant="outline" onClick={() => setOffenNeuModal(false)}>
            Abbrechen
          </Button>
        </Group>
      </Modal>
    </Paper>
  );
}

export default Verwaltung;
