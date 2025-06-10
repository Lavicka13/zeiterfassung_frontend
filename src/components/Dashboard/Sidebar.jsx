import React from "react";
import { Paper, Title, Button, Group } from "@mantine/core";
import { MonthPicker } from "@mantine/dates";
import { IconUser } from '@tabler/icons-react';
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

function Sidebar({ 
  filteredMitarbeiter, 
  selectedMitarbeiter, 
  setSelectedMitarbeiter,
  selectedMonat,
  setSelectedMonat,
  isVorgesetzter,
  isAdmin
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Paper p="md" withBorder shadow="sm">
      {filteredMitarbeiter.length > 1 && (
        <Title order={4} mb="md">Mitarbeiter</Title>
      )}
      
      {filteredMitarbeiter.map((m) => (
        <Button
          key={m.ID}
          fullWidth
          mt="xs"
          variant={selectedMitarbeiter?.ID === m.ID ? "filled" : "light"}
          onClick={() => {
            setSelectedMitarbeiter(m);
            setSelectedMonat(dayjs());
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
      
      {(isVorgesetzter || isAdmin) && (
        <Button 
          fullWidth 
          mt="xl" 
          onClick={() => navigate("/verwaltung")}
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
    </Paper>
  );
}

export default Sidebar;