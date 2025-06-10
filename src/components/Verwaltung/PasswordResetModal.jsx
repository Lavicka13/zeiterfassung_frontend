import React, { useState } from "react";
import {
  Modal,
  Text,
  PasswordInput,
  Button,
  Group,
  LoadingOverlay
} from "@mantine/core";

function PasswordResetModal({ modal, onClose, onSave, loading, isMobile }) {
  const [newPassword, setNewPassword] = useState("");

  const handleSave = async () => {
    const success = await onSave(modal.user?.ID, newPassword);
    if (success) {
      setNewPassword("");
      onClose();
    }
  };

  const handleClose = () => {
    setNewPassword("");
    onClose();
  };

  return (
    <Modal
      opened={modal.open}
      onClose={handleClose}
      title={<Text size="lg" weight={500}>Passwort zurücksetzen</Text>}
      size={isMobile ? "xs" : "md"}
      radius="md"
    >
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      <Text mb="md">
        Neues Passwort für{" "}
        <Text span weight={500}>
          "{modal.user?.Vorname} {modal.user?.Nachname}"
        </Text>{" "}
        festlegen:
      </Text>
      
      <PasswordInput
        label="Neues Passwort"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Neues Passwort (mind. 6 Zeichen)"
        mb="xl"
        radius="md"
        required
      />
      
      <Group position="right">
        <Button 
          variant="default" 
          onClick={handleClose}
          radius="md"
        >
          Abbrechen
        </Button>
        <Button 
          onClick={handleSave}
          radius="md"
          disabled={!newPassword || newPassword.length < 6}
        >
          Passwort setzen
        </Button>
      </Group>
    </Modal>
  );
}

export default PasswordResetModal;