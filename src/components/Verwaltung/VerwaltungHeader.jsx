
import React from "react";
import { Group, Title, Text } from "@mantine/core";

function VerwaltungHeader({ isMobile, mitarbeiterCount }) {
  return (
    <Group position="apart" mb={30}>
      <div>
        <Title order={2} size={isMobile ? "h3" : "h2"} mb={5}>
          Nutzerverwaltung
        </Title>
        <Text color="dimmed" size="sm">
          Verwalten Sie Ihr Team und deren Berechtigungen ({mitarbeiterCount} Nutzer)
        </Text>
      </div>
    </Group>
  );
}

export default VerwaltungHeader;