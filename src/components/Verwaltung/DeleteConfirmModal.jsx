import React from "react";
import {
  Modal,
  Text,
  Button,
  Group,
  LoadingOverlay
} from "@mantine/core";

function DeleteConfirmModal({ modal, onClose, onConfirm, loading, isMobile }) {
  const handleConfirm = async () => {
    const success = await onConfirm(modal.user?.ID);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      opened={modal.open}
      onClose={onClose}
      title={<Text size="lg" weight={500} color="red">Nutzer löschen</Text>}
      size={isMobile ? "xs" : "md"}
      radius="md"
    >
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      <Text mb="lg">
        Sind Sie sicher, dass Sie den Nutzer{" "}
        <Text span weight={500}>
          "{modal.user?.Vorname} {modal.user?.Nachname}"
        </Text>{" "}
        löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
      </Text>
      
      <Group position="right">
        <Button 
          variant="default" 
          onClick={onClose}
          radius="md"
        >
          Abbrechen
        </Button>
        <Button 
          color="red" 
          onClick={handleConfirm}
          radius="md"
        >
          Löschen
        </Button>
      </Group>
    </Modal>
  );
}

export default DeleteConfirmModal;