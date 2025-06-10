import React, { useState, useEffect } from "react";
import { Modal, Text, Button, Group, Box, LoadingOverlay } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { IconClock } from '@tabler/icons-react';
import { useMediaQuery } from "@mantine/hooks";
import dayjs from "dayjs";

function TimeEditModal({ modal, onClose, onSave, onDelete, loading }) {
  const isMobile = useMediaQuery('(max-width: 48em)');
  const [anfangszeit, setAnfangszeit] = useState("");
  const [endzeit, setEndzeit] = useState("");

  useEffect(() => {
    if (modal.open && modal.arbeitszeit) {
      const anfangszeitFormatted = modal.arbeitszeit.anfangszeit ? 
        dayjs(modal.arbeitszeit.anfangszeit).format('HH:mm') : '';
      const endzeitFormatted = modal.arbeitszeit.endzeit ? 
        dayjs(modal.arbeitszeit.endzeit).format('HH:mm') : '';
        
      setAnfangszeit(anfangszeitFormatted);
      setEndzeit(endzeitFormatted);
    }
  }, [modal.open, modal.arbeitszeit]);

  const handleSave = () => {
    onSave(modal.arbeitszeit, anfangszeit, endzeit);
  };

  const handleDelete = () => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Arbeitszeit-Eintrag löschen möchten?')) {
      onDelete(modal.arbeitszeit?.id);
    }
  };

  return (
    <Modal
      opened={modal.open}
      onClose={onClose}
      title="Arbeitszeit bearbeiten"
      size={isMobile ? "xs" : "xl"}
    >
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      {modal.arbeitszeit && (
        <>
          <Text mb="md" ta="center">
            Datum: {dayjs(modal.arbeitszeit.datum).format("DD.MM.YYYY")}
          </Text>
          
          <TimeInput
            label="Anfangszeit"
            leftSection={<IconClock size={16} />}
            value={anfangszeit}
            onChange={(e) => setAnfangszeit(e.target.value)}
            mb="md"
            placeholder="08:00"
            required
          />
          
          <TimeInput
            label="Endzeit"
            leftSection={<IconClock size={16} />}
            value={endzeit}
            onChange={(e) => setEndzeit(e.target.value)}
            mb="md"
            placeholder="16:30"
          />
          
          <Text size="sm" c="dimmed" mb="md" ta="center">
            Hinweis: Die Pause wird automatisch basierend auf der Arbeitszeit berechnet.
            Nachtschichten (über Mitternacht) werden korrekt erkannt und berechnet.
          </Text>
          
          <Group position="center" mb="md">
            <Button onClick={handleSave}>Speichern</Button>
            <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          </Group>
          
          {/* Trennlinie */}
          <Box mb="md" style={{ borderTop: '1px solid #e9ecef', margin: '15px 0' }}></Box>
          
          {/* Löschen-Button */}
          <Group position="center">
            <Button color="red" variant="outline" onClick={handleDelete}>
              Eintrag löschen
            </Button>
          </Group>
        </>
      )}
    </Modal>
  );
}

export default TimeEditModal;