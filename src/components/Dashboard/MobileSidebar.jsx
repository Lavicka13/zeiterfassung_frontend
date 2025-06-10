import React from "react";
import { Drawer, Title, Button, Group } from "@mantine/core";
import { MonthPicker } from "@mantine/dates";
import { IconUser } from '@tabler/icons-react';
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

function MobileSidebar({ 
  opened, 
  onClose, 
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
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Menü"
      padding="md"
      size="xs"
      position="left"
    >
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
            onClose();
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
          onClick={() => {
            navigate("/verwaltung");
            onClose();
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
    </Drawer>
  );
}

export default MobileSidebar;