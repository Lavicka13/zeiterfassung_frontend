import React from "react";
import { Stack, Card, Text, SimpleGrid, Button, ActionIcon, Group } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { IconClock, IconPencil, IconPlus } from '@tabler/icons-react';
import { useMantineTheme } from "@mantine/core";
import dayjs from "dayjs";
import { useTimeCalculations } from "../../hooks/useTimeCalculations";

function MobileTimeCards({ 
  arbeitszeiten, 
  selectedMonat, 
  heutigerEintrag, 
  monatlicheStatistik,
  startzeit, 
  setStartzeit, 
  endzeit, 
  setEndzeit, 
  onEdit, 
  onSaveTime, 
  onNewEntry 
}) {
  const theme = useMantineTheme();
  const { calculateWorkingHoursAndPause, formatHoursAndMinutes } = useTimeCalculations();
  const istAktuellerMonat = selectedMonat.isSame(dayjs(), "month");

  return (
    <Stack spacing="xs">
      {/* Monatsstatistik für Mobile */}
      <Card shadow="sm" withBorder p="xs" bg="blue.0">
        <Text fw={500} ta="center" mb="xs">
          Monatsübersicht {selectedMonat.locale('de').format("MMMM YYYY")}
        </Text>
        <SimpleGrid cols={3} spacing="xs">
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">Gesamtzeit</Text>
            <Text fw={500} size="sm">{monatlicheStatistik.gesamtStunden}</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">Arbeitstage</Text>
            <Text fw={500} size="sm">{monatlicheStatistik.arbeitsTage}</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">Ø pro Tag</Text>
            <Text fw={500} size="sm">{monatlicheStatistik.durchschnittProTag}</Text>
          </div>
        </SimpleGrid>
      </Card>

      {/* Neue Zeiterfassung */}
      {istAktuellerMonat && (!heutigerEintrag || !heutigerEintrag.endzeit) && (
        <Card shadow="sm" withBorder p="xs">
          <Card.Section withBorder p="xs" bg={theme.colors.blue[0]}>
            <Group position="apart">
              <Text fw={500} ta="center" style={{width: '100%'}}>
                Neuer Eintrag: {dayjs().format("DD.MM.YYYY")}
              </Text>
            </Group>
          </Card.Section>
          <Group position="apart" mt="xs">
            {heutigerEintrag && heutigerEintrag.anfangszeit ? (
              <Text size="sm" style={{ width: '45%' }}>
                <b>Start:</b> {dayjs(heutigerEintrag.anfangszeit).format("HH:mm")}
              </Text>
            ) : (
              <TimeInput
                label="Start"
                leftSection={<IconClock size={16} />}
                value={startzeit}
                onChange={(e) => setStartzeit(e.target.value)}
                placeholder="08:00"
                size="xs"
                style={{ width: '45%' }}
              />
            )}
            <TimeInput
              label="Ende"
              leftSection={<IconClock size={16} />}
              value={endzeit}
              onChange={(e) => setEndzeit(e.target.value)}
              placeholder="16:30"
              size="xs"
              style={{ width: '45%' }}
              disabled={!heutigerEintrag && !startzeit}
            />
          </Group>
          <Button 
            fullWidth 
            mt="xs" 
            size="xs" 
            onClick={onSaveTime}
            color="green"
          >
            {heutigerEintrag && heutigerEintrag.anfangszeit ? "Ende speichern" : "Start speichern"}
          </Button>
        </Card>
      )}
      
      {/* Bestehende Einträge als Karten */}
      {arbeitszeiten.length > 0 ? (
        arbeitszeiten
          .slice()
          .sort((a, b) => dayjs(b.datum).diff(dayjs(a.datum)))
          .filter(a => {
            if (dayjs(a.datum).isSame(dayjs(), "day") && !heutigerEintrag) {
              return true;
            }
            if (dayjs(a.datum).isSame(dayjs(), "day") && a.endzeit) {
              return true;
            }
            if (dayjs(a.datum).isSame(dayjs(), "day") && !a.endzeit && heutigerEintrag && a.id !== heutigerEintrag.id) {
              return false;
            }
            return !dayjs(a.datum).isSame(dayjs(), "day");
          })
          .map((a) => {
            let arbeitszeitText = "-";
            let korrektePause = a.pause;
            
            if (a.endzeit) {
              const { workingHours, pauseMinutes } = calculateWorkingHoursAndPause(a.anfangszeit, a.endzeit);
              arbeitszeitText = formatHoursAndMinutes(workingHours);
              korrektePause = pauseMinutes;
            }
            
            return (
              <Card key={a.id} shadow="sm" withBorder p="xs">
                <Card.Section withBorder p="xs" bg="gray.0">
                  <Group position="apart">
                    <Text fw={500} ta="center" style={{width: '100%'}}>
                      {dayjs(a.datum).format("DD.MM.YYYY")}
                    </Text>
                    <ActionIcon 
                      size="sm" 
                      onClick={() => onEdit({ open: true, arbeitszeit: a })} 
                      style={{position: 'absolute', right: '12px'}}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                  </Group>
                </Card.Section>
                <SimpleGrid cols={2} spacing="xs" mt="xs">
                  <Text size="sm" ta="center">
                    <b>Start:</b> {a.anfangszeit ? dayjs(a.anfangszeit).format("HH:mm") : "-"}
                  </Text>
                  <Text size="sm" ta="center">
                    <b>Ende:</b> {a.endzeit ? dayjs(a.endzeit).format("HH:mm") : "-"}
                  </Text>
                  <Text size="sm" ta="center">
                    <b>Pause:</b> {korrektePause} min
                  </Text>
                  <Text size="sm" ta="center">
                    <b>Arbeitszeit:</b> {arbeitszeitText}
                  </Text>
                </SimpleGrid>
              </Card>
            );
          })
      ) : (
        <Card shadow="sm" withBorder p="md">
          <Text ta="center" c="dimmed">
            Keine Arbeitszeiten im ausgewählten Monat
          </Text>
        </Card>
      )}
      
      {/* Button für neuen Eintrag */}
      <Button 
        onClick={onNewEntry}
        leftSection={<IconPlus size={16} />}
        color="violet"
        size="md"
        fullWidth
        mt="md"
      >
        Neuen Zeiteintrag anlegen
      </Button>
    </Stack>
  );
}

export default MobileTimeCards;