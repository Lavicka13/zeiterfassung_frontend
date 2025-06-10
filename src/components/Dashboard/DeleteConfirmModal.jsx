import React from "react";
import { Modal, Text, Button, Group, LoadingOverlay } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

function DeleteConfirmModal({ modal, onClose, onConfirm, loading }) {
  const isMobile = useMediaQuery('(max-width: 48em)');

  const handleConfirm = () => {
    onConfirm(modal.arbeitszeit?.id);
  };

  return (
    <Modal
      opened={modal.open}
      onClose={onClose}
      title={<Text size="lg" weight={500} color="red">Eintrag löschen</Text>}
      size={isMobile ? "xs" : "md"}
    >
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      <Text mb="lg">
        Sind Sie sicher, dass Sie diesen Arbeitszeit-Eintrag löschen möchten?
        Diese Aktion kann nicht rückgängig gemacht werden.
      </Text>
      
      <Group position="right">
        <Button variant="default" onClick={onClose}>Abbrechen</Button>
        <Button color="red" onClick={handleConfirm}>Löschen</Button>
      </Group>
    </Modal>
  );
}

export default DeleteConfirmModal;