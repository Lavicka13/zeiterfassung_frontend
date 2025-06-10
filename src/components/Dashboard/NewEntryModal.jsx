import React, { useState } from "react";
import { Modal, Text, Button, Group, LoadingOverlay } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { DatePickerInput } from "@mantine/dates";
import { IconClock } from '@tabler/icons-react';
import { useMediaQuery } from "@mantine/hooks";

function NewEntryModal({ modal, onClose, onSave, selectedMitarbeiter, loading }) {
  const isMobile = useMediaQuery('(max-width: 48em)');
  const [datum, setDatum] = useState(new Date());
  const [anfangszeit, setAnfangszeit] = useState("");
  const [endzeit, setEndzeit] = useState("");

  const handleSave = () => {
    onSave(datum, anfangszeit, endzeit);
    // Reset form
    setDatum(new Date());
    setAnfangszeit("");
    setEndzeit("");
  };

  const handleClose = () => {
    setDatum(new Date());
    setAnfangszeit("");
    setEndzeit("");
    onClose();
  };

  return (
    <Modal
      opened={modal.open}
      onClose={handleClose}
      title="Neuen Zeiteintrag erstellen"
      size={isMobile ? "xs" : "md"}
    >
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      <DatePickerInput
        label="Datum auswählen"
        placeholder="Datum auswählen"
        value={datum}
        onChange={setDatum}
        mb="md"
        required
        clearable={false}
        locale="de"
      />
      
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
        label="Endzeit (optional)"
        leftSection={<IconClock size={16} />}
        value={endzeit}
        onChange={(e) => setEndzeit(e.target.value)}
        mb="md"
        placeholder="16:30"
      />
      
      <Text size="sm" c="dimmed" mb="md" ta="center">
        Hinweis: Die Pause wird automatisch basierend auf der Arbeitszeit berechnet.
        Nachtschichten (über Mitternacht) werden korrekt erkannt und berechnet.
        Wenn keine Endzeit angegeben wird, kann der Eintrag später ergänzt werden.
      </Text>
      
      <Group position="right" mt="md">
        <Button onClick={handleSave}>Erstellen</Button>
        <Button variant="outline" onClick={handleClose}>Abbrechen</Button>
      </Group>
    </Modal>
  );
}

export default NewEntryModal;

