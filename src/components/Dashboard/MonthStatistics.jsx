import React from "react";
import { Box, Paper, Group, Title, Badge } from "@mantine/core";
import { IconCalendarStats } from '@tabler/icons-react';
import { useMantineTheme } from "@mantine/core";

function MonthStatistics({ selectedMonat, monatlicheStatistik }) {
  const theme = useMantineTheme();

  return (
    <Box mb="md">
      <Paper p="md" withBorder shadow="xs" style={{ backgroundColor: '#f9fafb' }}>
        <Group position="apart">
          <Group>
            <IconCalendarStats size={24} color={theme.colors.blue[6]} />
            <Title order={5}>Monatsübersicht {selectedMonat.locale('de').format("MMMM YYYY")}</Title>
          </Group>
          <Group>
            <Badge color="blue" size="lg">
              Gesamtarbeitszeit: {monatlicheStatistik.gesamtStunden}
            </Badge>
            <Badge color="teal" size="lg">
              Arbeitstage: {monatlicheStatistik.arbeitsTage}
            </Badge>
            <Badge color="grape" size="lg">
              Ø pro Tag: {monatlicheStatistik.durchschnittProTag}
            </Badge>
          </Group>
        </Group>
      </Paper>
    </Box>
  );
}

export default MonthStatistics;