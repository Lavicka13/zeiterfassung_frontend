import React, { useState, useEffect } from "react";
import {
  Modal,
  Text,
  TextInput,
  Select,
  Button,
  Group,
  Grid,
  LoadingOverlay
} from "@mantine/core";

function EditUserModal({ modal, onClose, onSave, loading, isMobile }) {
  const [userData, setUserData] = useState({
    ID: "",
    Vorname: "",
    Nachname: "",
    Email: "",
    Rolle: ""
  });

  useEffect(() => {
    if (modal.open && modal.user) {
      setUserData({
        ID: modal.user.ID || "",
        Vorname: modal.user.Vorname || "",
        Nachname: modal.user.Nachname || "",
        Email: modal.user.Email || "",
        Rolle: modal.user.Rolle || ""
      });
    }
  }, [modal.open, modal.user]);

  const handleSave = async () => {
    const success = await onSave(userData);
    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    setUserData({
      ID: "",
      Vorname: "",
      Nachname: "",
      Email: "",
      Rolle: ""
    });
    onClose();
  };

  return (
    <Modal
      opened={modal.open}
      onClose={handleClose}
      title={<Text size="lg" weight={500}>Nutzer bearbeiten</Text>}
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
            label="Email"
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
        <Grid.Col span={12}>
          <Select
            label="Rolle"
            data={[
              { value: "mitarbeiter", label: "Mitarbeiter" },
              { value: "vorgesetzter", label: "Vorgesetzter" },
              { value: "admin", label: "Administrator" }
            ]}
            value={userData.Rolle}
            onChange={(value) =>
              setUserData({ ...userData, Rolle: value })
            }
            mb="md"
            radius="md"
          />
        </Grid.Col>
      </Grid>
      
      <Group position="right" mt="md">
        <Button 
          variant="default" 
          onClick={handleClose}
          radius="md"
        >
          Abbrechen
        </Button>
        <Button onClick={handleSave} radius="md">
          Speichern
        </Button>
      </Group>
    </Modal>
  );
}

export default EditUserModal;