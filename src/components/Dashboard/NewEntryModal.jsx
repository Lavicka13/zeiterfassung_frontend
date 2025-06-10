// src/components/Dashboard/NewEntryModal.jsx - Aktualisierte Version
import React, { useState } from "react";
import { Modal, Text, Button, Group, LoadingOverlay, Alert } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { DatePickerInput } from "@mantine/dates";
import { IconClock, IconInfoCircle } from '@tabler/icons-react';
import { useMediaQuery } from "@mantine/hooks";
import dayjs from "dayjs";
import { isCreateAllowed, getEditTimeLimit } from "../../utils/editTimeLimit";

function NewEntryModal({ modal, onClose, onSave, selectedMitarbeiter, loading }) {
  const isMobile = useMediaQuery('(max-width: 48em)');
  const [datum, setDatum] = useState(new Date());
  const [anfangszeit, setAnfangszeit] = useState("");
  const [endzeit, setEndzeit] = useState("");

  // Berechne das früheste erlaubte Datum (3 Monate zurück)
  const earliestDate = getEditTimeLimit().toDate();
  const heute = new Date();

  const handleSave = () => {
    // Prüfen, ob das gewählte Datum innerhalb der erlaubten Zeitspanne liegt
    if (!isCreateAllowed(datum)) {
      return; // Der Save wird durch die disabled Validierung verhindert
    }
    
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

  // Prüfen, ob das gewählte Datum erlaubt ist
  const istDatumErlaubt = isCreateAllowed(datum);

  return (
    <Modal
      opened={modal.open}
      onClose={handleClose}
      title="Neuen Zeiteintrag erstellen"
      size={isMobile ? "xs" : "md"}
    >
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      {/* Hinweis über Zeitbegrenzung */}
      <Alert 
        icon={<IconInfoCircle size={16} />} 
        title="Hinweis" 
        color="blue"
        variant="light"
        mb="md"
      >
        <Text size="sm">
          Einträge können nur bis zu 3 Monate rückwirkend erstellt werden.
          <br />
          Frühestes erlaubtes Datum: {dayjs(earliestDate).format("DD.MM.YYYY")}
        </Text>
      </Alert>

      <DatePickerInput
        label="Datum auswählen"
        placeholder="Datum auswählen"
        value={datum}
        onChange={setDatum}
        mb="md"
        required
        clearable={false}
        locale="de"
        minDate={earliestDate}
        maxDate={heute}
        error={!istDatumErlaubt ? "Dieses Datum liegt außerhalb der erlaubten Zeitspanne" : null}
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
        <Button 
          onClick={handleSave}
          disabled={!istDatumErlaubt || !anfangszeit}
        >
          Erstellen
        </Button>
        <Button variant="outline" onClick={handleClose}>Abbrechen</Button>
      </Group>
    </Modal>
  );
}

export default NewEntryModal;