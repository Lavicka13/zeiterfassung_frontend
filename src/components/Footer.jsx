import React from 'react';
import { Text, Group, Anchor, Box } from '@mantine/core';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      style={{
        width: '100%',
        position: 'fixed',      // NEU!
        left: 0,                // NEU!
        bottom: 0,              // NEU!
        zIndex: 100,            // Falls du Layer-Probleme hast
        borderTop: '1px solid #e9ecef',
        backgroundColor: 'white',
        padding: '10px 0'
        
      }}
    >
      <Group position="center" spacing="xs">
        <Text size="sm" color="dimmed" span>
          © {currentYear} Diventus GmbH, Ernst-Augustin-Straße 12, 12489 Berlin
        </Text>
        <Anchor size="sm" href="#" target="_blank" color="blue">
          Datenschutz
        </Anchor>
        <Anchor size="sm" href="#" target="_blank" color="blue">
          Impressum
        </Anchor>
        <Anchor size="sm" href="#" target="_blank" color="blue">
          Kontakt
        </Anchor>
      </Group>
    </Box>
  );
}

export default Footer;
