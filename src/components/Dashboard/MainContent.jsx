import React from "react";
import { Paper, Group, Title, ActionIcon } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconMenu2 } from '@tabler/icons-react';

import ExportButtons from "./ExportButtons";
import MonthStatistics from "./MonthStatistics";
import TimeTable from "./TimeTable";
import MobileTimeCards from "./MobileTimeCards";

function MainContent({ 
  selectedMitarbeiter,
  arbeitszeiten,
  monatlicheStatistik,
  selectedMonat,
  heutigerEintrag,
  startzeit,
  setStartzeit,
  endzeit,
  setEndzeit,
  onEdit,
  onNewEntry,
  onSaveTime,
  onExport,
  toggleMobileSidebar,
  isMobile
}) {
  const isExtraSmall = useMediaQuery('(max-width: 36em)');

  return (
    <Paper p={isMobile ? "xs" : "md"} withBorder shadow="sm">
      {isMobile && (
        <Group position="apart" py="md" px="xs">
          <Title order={4}>Arbeitszeiterfassung</Title>
          <ActionIcon onClick={toggleMobileSidebar}>
            <IconMenu2 size={24} />
          </ActionIcon>
        </Group>
      )}

      <Group position="apart" mb="md" wrap="nowrap">
        <Title order={3} size={isMobile ? "h4" : "h3"}>
          {selectedMitarbeiter
            ? `${selectedMitarbeiter.Vorname} ${selectedMitarbeiter.Nachname}`
            : "Mitarbeiter auswählen"}
        </Title>
      </Group>

      <ExportButtons 
        onExport={onExport}
        isMobile={isMobile}
        isExtraSmall={isExtraSmall}
      />

      {!isMobile ? (
        <>
          <MonthStatistics 
            selectedMonat={selectedMonat}
            monatlicheStatistik={monatlicheStatistik}
          />
          <TimeTable 
            arbeitszeiten={arbeitszeiten}
            selectedMonat={selectedMonat}
            heutigerEintrag={heutigerEintrag}
            startzeit={startzeit}
            setStartzeit={setStartzeit}
            endzeit={endzeit}
            setEndzeit={setEndzeit}
            onEdit={onEdit}
            onSaveTime={onSaveTime}
            onNewEntry={onNewEntry}
          />
        </>
      ) : (
        <MobileTimeCards 
          arbeitszeiten={arbeitszeiten}
          selectedMonat={selectedMonat}
          heutigerEintrag={heutigerEintrag}
          monatlicheStatistik={monatlicheStatistik}
          startzeit={startzeit}
          setStartzeit={setStartzeit}
          endzeit={endzeit}
          setEndzeit={setEndzeit}
          onEdit={onEdit}
          onSaveTime={onSaveTime}
          onNewEntry={onNewEntry}
        />
      )}
    </Paper>
  );
}

export default MainContent;