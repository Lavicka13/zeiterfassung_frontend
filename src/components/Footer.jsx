import React from 'react';
import { Text, Anchor, Box } from '@mantine/core';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      style={{
        width: '100%',
        position: 'fixed',
        left: 0,
        bottom: 0,
        zIndex: 100,
        borderTop: '1px solid #e9ecef',
        backgroundColor: 'white',
        padding: '10px 0',
        textAlign: 'center', // Explizit zentrieren
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Text size="sm" c="dimmed" span>
          © {currentYear} Diventus GmbH, Ernst-Augustin-Straße 12, 12489 Berlin
        </Text>
        <Anchor size="sm" href="#" target="_blank" c="blue">
          Datenschutz
        </Anchor>
        <Anchor size="sm" href="#" target="_blank" c="blue">
          Impressum
        </Anchor>
        <Anchor size="sm" href="#" target="_blank" c="blue">
          Kontakt
        </Anchor>
      </div>
    </Box>
  );
}

export default Footer;