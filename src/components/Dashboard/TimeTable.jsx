import React from "react";
import { Table, Button, Text, Group } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { IconPlus, IconClock } from '@tabler/icons-react';
import dayjs from "dayjs";
import { useTimeCalculations } from "../../hooks/useTimeCalculations";

function TimeTable({ 
  arbeitszeiten, 
  selectedMonat, 
  heutigerEintrag, 
  startzeit, 
  setStartzeit, 
  endzeit, 
  setEndzeit, 
  onEdit, 
  onSaveTime, 
  onNewEntry 
}) {
  const { calculateWorkingHoursAndPause, formatHoursAndMinutes } = useTimeCalculations();
  const istAktuellerMonat = selectedMonat.isSame(dayjs(), "month");
  const centerTextStyle = { textAlign: 'center' };

  return (
    <>
      <Table highlightOnHover withBorder withColumnBorders>
        <thead>
          <tr>
            <th style={centerTextStyle}>Datum</th>
            <th style={centerTextStyle}>Start</th>
            <th style={centerTextStyle}>Ende</th>
            <th style={centerTextStyle}>Pause</th>
            <th style={centerTextStyle}>Arbeitszeit</th>
            <th style={centerTextStyle}>Aktion</th>
          </tr>
        </thead>
        <tbody>
          {/* Aktuelle Eingabezeile */}
          {istAktuellerMonat && (!heutigerEintrag || !heutigerEintrag.endzeit) && (
            <tr>
              <td style={centerTextStyle}>{dayjs().format("DD.MM.YYYY")}</td>
              <td style={centerTextStyle}>
                {heutigerEintrag && heutigerEintrag.anfangszeit ? (
                  <Text>{dayjs(heutigerEintrag.anfangszeit).format("HH:mm")}</Text>
                ) : (
                  <TimeInput
                    value={startzeit}
                    onChange={(e) => setStartzeit(e.target.value)}
                    placeholder="08:00"
                  />
                )}
              </td>
              <td style={centerTextStyle}>
                <TimeInput
                  value={endzeit}
                  onChange={(e) => setEndzeit(e.target.value)}
                  placeholder="16:30"
                  disabled={!heutigerEintrag && !startzeit}
                />
              </td>
              <td style={centerTextStyle}>auto</td>
              <td style={centerTextStyle}>-</td>
              <td style={centerTextStyle}>
                <Button size="xs" onClick={onSaveTime} color="green">
                  {heutigerEintrag && heutigerEintrag.anfangszeit ? "Ende speichern" : "Start speichern"}
                </Button>
              </td>
            </tr>
          )}

          {/* Liste der Arbeitszeiten */}
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
              .map((a, index) => {
                let arbeitszeitText = "-";
                let korrektePause = a.pause;
                
                if (a.endzeit) {
                  const { workingHours, pauseMinutes } = calculateWorkingHoursAndPause(a.anfangszeit, a.endzeit);
                  arbeitszeitText = formatHoursAndMinutes(workingHours);
                  korrektePause = pauseMinutes;
                }
                
                return (
                  <tr
                    key={a.id}
                    style={{
                      backgroundColor: index % 2 === 1 ? "#f9f9f9" : "transparent",
                    }}
                  >
                    <td style={centerTextStyle}>{dayjs(a.datum).format("DD.MM.YYYY")}</td>
                    <td style={centerTextStyle}>
                      {a.anfangszeit ? dayjs(a.anfangszeit).format("HH:mm") : "-"}
                    </td>
                    <td style={centerTextStyle}>
                      {a.endzeit ? dayjs(a.endzeit).format("HH:mm") : "-"}
                    </td>
                    <td style={centerTextStyle}>{korrektePause} min</td>
                    <td style={centerTextStyle}>{arbeitszeitText}</td>
                    <td style={centerTextStyle}>
                      <Button size="xs" onClick={() => onEdit({ open: true, arbeitszeit: a })}>
                        Bearbeiten
                      </Button>
                    </td>
                  </tr>
                );
              })
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                Keine Arbeitszeiten im ausgewählten Monat
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      
      <Group position="right" mt="sm">
        <Button 
          onClick={onNewEntry}
          leftSection={<IconPlus size={16} />}
          color="violet"
          size="md"
        >
          Neuen Zeiteintrag anlegen
        </Button>
      </Group>
    </>
  );
}

export default TimeTable;
