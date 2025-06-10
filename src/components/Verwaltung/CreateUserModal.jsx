import React, { useState } from "react";
import {
  Modal,
  Text,
  TextInput,
  PasswordInput,
  Select,
  Button,
  Group,
  Grid,
  LoadingOverlay
} from "@mantine/core";

function CreateUserModal({ opened, onClose, onSave, loading, isMobile }) {
  const [userData, setUserData] = useState({
    Vorname: "",
    Nachname: "",
    Email: "",
    Rolle: "mitarbeiter",
    Passwort: "",
  });

  const handleSave = async () => {
    const success = await onSave(userData);
    if (success) {
      setUserData({
        Vorname: "",
        Nachname: "",
        Email: "",
        Rolle: "mitarbeiter",
        Passwort: "",
      });
      onClose();
    }
  };

  const handleClose = () => {
    setUserData({
      Vorname: "",
      Nachname: "",
      Email: "",
      Rolle: "mitarbeiter",
      Passwort: "",
    });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={<Text size="lg" weight={500}>Neuen Nutzer anlegen</Text>}
      size={isMobile ? "xs" : "md"}
      radius="md"
    >
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      <Grid>
        <Grid.Col span={isMobile ? 12 : 6}>
          <TextInput
            label="Vorname"
            value={userData.Vorname}
            onChange={(e) =>
              setUserData({ ...userData, Vorname: e.target.value })
            }
            mb="md"
            radius="md"
            required
            placeholder="Max"
          />
        </Grid.Col>
        <Grid.Col span={isMobile ? 12 : 6}>
          <TextInput
            label="Nachname"
            value={userData.Nachname}
            onChange={(e) =>
              setUserData({ ...userData, Nachname: e.target.value })
            }
            mb="md"
            radius="md"
            required
            placeholder="Mustermann"
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <TextInput
            label="E-Mail"
            type="email"
            value={userData.Email}
            onChange={(e) =>
              setUserData({ ...userData, Email: e.target.value })
            }
            mb="md"
            radius="md"
            required
            placeholder="max.mustermann@example.com"
          />
        </Grid.Col>
        <Grid.Col span={isMobile ? 12 : 6}>
          <PasswordInput
            label="Passwort"
            value={userData.Passwort}
            onChange={(e) =>
              setUserData({ ...userData, Passwort: e.target.value })
            }
            mb="md"
            radius="md"
            required
            placeholder="Mindestens 6 Zeichen"
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
            value={userData.Rolle}
            onChange={(value) => setUserData({ ...userData, Rolle: value })}
            mb="md"
            radius="md"
          />
        </Grid.Col>
      </Grid>
      
      <Group mt="md" position="right">
        <Button variant="default" onClick={handleClose} radius="md">
          Abbrechen
        </Button>
        <Button onClick={handleSave} radius="md">
          Erstellen
        </Button>
      </Group>
    </Modal>
  );
}

export default CreateUserModal;