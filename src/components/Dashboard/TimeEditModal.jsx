// src/components/Dashboard/TimeEditModal.jsx - Aktualisierte Version
import React, { useState, useEffect } from "react";
import { Modal, Text, Button, Group, Box, LoadingOverlay, Alert } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { IconClock, IconLock } from '@tabler/icons-react';
import { useMediaQuery } from "@mantine/hooks";
import dayjs from "dayjs";
import { isEditAllowed, getEditNotAllowedMessage } from "../../utils/editTimeLimit";

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

  // Prüfen, ob der Eintrag bearbeitet werden darf
  const istBearbeitbar = modal.arbeitszeit ? isEditAllowed(modal.arbeitszeit.datum) : false;

  const handleSave = () => {
    if (!istBearbeitbar) {
      return; // Sollte nicht aufgerufen werden können, aber Sicherheitscheck
    }
    onSave(modal.arbeitszeit, anfangszeit, endzeit);
  };

  const handleDelete = () => {
    if (!istBearbeitbar) {
      return; // Sollte nicht aufgerufen werden können, aber Sicherheitscheck
    }
    if (window.confirm('Sind Sie sicher, dass Sie diesen Arbeitszeit-Eintrag löschen möchten?')) {
      onDelete(modal.arbeitszeit?.id);
    }
  };

  if (!modal.arbeitszeit) {
    return null;
  }

  return (
    <Modal
      opened={modal.open}
      onClose={onClose}
      title="Arbeitszeit bearbeiten"
      size={isMobile ? "xs" : "xl"}
    >
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      <Text mb="md" ta="center">
        Datum: {dayjs(modal.arbeitszeit.datum).format("DD.MM.YYYY")}
      </Text>

      {/* Warnung wenn nicht bearbeitbar */}
      {!istBearbeitbar && (
        <Alert 
          icon={<IconLock size={16} />} 
          title="Bearbeitung nicht möglich" 
          color="red"
          variant="light"
          mb="md"
        >
          <Text size="sm">
            {getEditNotAllowedMessage()}
          </Text>
        </Alert>
      )}
      
      <TimeInput
        label="Anfangszeit"
        leftSection={<IconClock size={16} />}
        value={anfangszeit}
        onChange={(e) => setAnfangszeit(e.target.value)}
        mb="md"
        placeholder="08:00"
        required
        disabled={!istBearbeitbar}
      />
      
      <TimeInput
        label="Endzeit"
        leftSection={<IconClock size={16} />}
        value={endzeit}
        onChange={(e) => setEndzeit(e.target.value)}
        mb="md"
        placeholder="16:30"
        disabled={!istBearbeitbar}
      />
      
      {istBearbeitbar && (
        <Text size="sm" c="dimmed" mb="md" ta="center">
          Hinweis: Die Pause wird automatisch basierend auf der Arbeitszeit berechnet.
          Nachtschichten (über Mitternacht) werden korrekt erkannt und berechnet.
        </Text>
      )}
      
      <Group position="center" mb="md">
        <Button 
          onClick={handleSave}
          disabled={!istBearbeitbar}
        >
          Speichern
        </Button>
        <Button variant="outline" onClick={onClose}>
          {istBearbeitbar ? "Abbrechen" : "Schließen"}
        </Button>
      </Group>
      
      {istBearbeitbar && (
        <>
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