import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Paper, Title, Button, Table, Group, MantineProvider, Badge, Menu } from '@mantine/core';
import { MonthPicker, DatesProvider } from '@mantine/dates';
import { jwtDecode } from 'jwt-decode';
import 'dayjs/locale/de';
import '@mantine/dates/styles.css';
import axios from 'axios';
import dayjs from 'dayjs';

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decoded = useMemo(() => token ? jwtDecode(token) : null, [token]);

  const [mitarbeiterListe, setMitarbeiterListe] = useState([]);
  const [selectedMitarbeiter, setSelectedMitarbeiter] = useState(null);
  const [selectedMonat, setSelectedMonat] = useState(dayjs());
  const [arbeitszeiten, setArbeitszeiten] = useState([]);
  const [startzeit, setStartzeit] = useState("");
  const [endzeit, setEndzeit] = useState("");

  useEffect(() => {
    const fetchMitarbeiter = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/mitarbeiter", { headers: { Authorization: token } });
        setMitarbeiterListe(response.data);
        if (decoded?.user_id) {
          const user = response.data.find(u => u.ID === decoded.user_id);
          if (user) setSelectedMitarbeiter(user);
        }
      } catch (error) {
        console.error("Fehler beim Laden der Mitarbeiter:", error);
      }
    };
    if (token) fetchMitarbeiter();
  }, [token, decoded?.user_id]);

  useEffect(() => {
    if (!selectedMitarbeiter || !selectedMonat) return;
    const monthString = selectedMonat.format('YYYY-MM');
    axios.get(`http://localhost:8080/api/arbeitszeiten/${selectedMitarbeiter.ID}?monat=${monthString}`, { headers: { Authorization: token } })
      .then(res => setArbeitszeiten(res.data))
      .catch(() => setArbeitszeiten([]));
  }, [selectedMitarbeiter, selectedMonat, token]);

  const handleExport = async (type) => {
    if (!selectedMitarbeiter) return alert("Mitarbeiter wählen");

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
        alert("Export-Typ unbekannt: " + type);
        return;
    }

    try {
        const response = await axios.get(url, {
            headers: { Authorization: token },
            responseType: "blob"
        });

        const blob = new Blob([response.data]);
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    } catch (err) {
        console.error("Fehler beim Export:", err);
        alert("Fehler beim Export.");
    }
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSaveArbeitszeit = async () => {
    if (!startzeit) return alert("Bitte Startzeit eingeben");

    try {
      const payload = {
        nutzer_id: selectedMitarbeiter.ID,
        datum: dayjs().format("YYYY-MM-DD"),
        anfangszeit: dayjs(`${dayjs().format("YYYY-MM-DD")}T${startzeit}`).toISOString(),
      };

      if (endzeit) {
        payload.endzeit = dayjs(`${dayjs().format("YYYY-MM-DD")}T${endzeit}`).toISOString();
      }

      await axios.post("http://localhost:8080/api/arbeitszeiten", payload, { headers: { Authorization: token } });
      await refreshArbeitszeiten();
      setStartzeit("");
      setEndzeit("");
    } catch (err) {
      console.error("Fehler beim Speichern der Zeiten:", err);
      alert("Fehler beim Speichern der Zeiten");
    }
  };

  const refreshArbeitszeiten = async () => {
    const monthString = selectedMonat.format('YYYY-MM');
    const response = await axios.get(`http://localhost:8080/api/arbeitszeiten/${selectedMitarbeiter.ID}?monat=${monthString}`, { headers: { Authorization: token } });
    setArbeitszeiten(response.data);
  };

  return (
    <MantineProvider>
      <DatesProvider settings={{ locale: 'de', firstDayOfWeek: 1 }}>
        <Container fluid>
          <Grid>
            <Grid.Col span={2}>
              <Paper p="md" withBorder shadow="sm">
                <Title order={4}>Mitarbeiter</Title>
                {mitarbeiterListe.map((m) => (
                  <Button
                    key={m.ID}
                    fullWidth
                    mt="xs"
                    variant={selectedMitarbeiter?.ID === m.ID ? "filled" : "light"}
                    onClick={() => { setSelectedMitarbeiter(m); setSelectedMonat(dayjs()); }}
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
                <Button fullWidth mt="xl">Nutzer verwalten</Button>
                <Button fullWidth mt="xl" variant="outline" color="red" onClick={handleLogout}>Logout</Button>
              </Paper>
            </Grid.Col>

            <Grid.Col span={10}>
              <Paper p="md" withBorder shadow="sm">
                <Group position="apart" mb="md">
                  <Title order={3}>{selectedMitarbeiter ? `${selectedMitarbeiter.Vorname} ${selectedMitarbeiter.Nachname}` : "Mitarbeiter auswählen"}</Title>

                  <Menu shadow="md" width={220}>
  <Menu.Target>
    <Button>Jahresbericht exportieren</Button>
  </Menu.Target>
  <Menu.Dropdown>
    <Menu.Item onClick={() => handleExport('pdf_jahr')}>PDF</Menu.Item>
    <Menu.Item onClick={() => handleExport('csv_jahr')}>CSV</Menu.Item>
  </Menu.Dropdown>
</Menu>
                </Group>

                

                <Group position="center" mb="md">
                  <Badge color="blue" variant="light">Aktueller Monat: {selectedMonat.format('MMMM YYYY')}</Badge>
                </Group>

                <Group position="right" mt="md" mb="sm">
                    <Menu shadow="md" width={220}>
                        <Menu.Target>
                            <Button>Monatsbericht exportieren</Button>
                        </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item onClick={() => handleExport('pdf_monat')}>PDF</Menu.Item>
                        <Menu.Item onClick={() => handleExport('csv_monat')}>CSV</Menu.Item>
                    </Menu.Dropdown>
                    </Menu>
                </Group>

                <Table highlightOnHover withBorder withColumnBorders>
                  <thead>
                    <tr>
                      <th>Datum</th>
                      <th>Start</th>
                      <th>Ende</th>
                      <th>Pause</th>
                      <th>Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!arbeitszeiten.some(a => dayjs(a.datum).isSame(dayjs(), 'day') && a.endzeit) && (
                      <tr>
                        <td>{dayjs().format("DD.MM.YYYY")}</td>
                        <td><input type="time" value={startzeit} onChange={(e) => setStartzeit(e.target.value)} /></td>
                        <td><input type="time" value={endzeit} onChange={(e) => setEndzeit(e.target.value)} /></td>
                        <td>auto</td>
                        <td><Button size="xs" onClick={handleSaveArbeitszeit}>{startzeit && endzeit ? "Ende speichern" : "Speichern"}</Button></td>
                      </tr>
                    )}
                    {arbeitszeiten.length > 0 ? arbeitszeiten.map((a) => (
                      <tr key={a.id}>
                        <td>{dayjs(a.datum).format("DD.MM.YYYY")}</td>
                        <td>{a.anfangszeit ? dayjs(a.anfangszeit).format("HH:mm") : "-"}</td>
                        <td>{a.endzeit ? dayjs(a.endzeit).format("HH:mm") : "-"}</td>
                        <td>{a.pause} min</td>
                        <td><Button size="xs">Bearbeiten</Button></td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center' }}>Keine Arbeitszeiten im ausgewählten Monat</td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </DatesProvider>
    </MantineProvider>
  );
}

export default Dashboard;
