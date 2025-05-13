import React from 'react';
import { Text, Box, Group, Anchor } from '@mantine/core';

function FooterExact() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: 'white',
        borderTop: '1px solid #e9ecef',
        padding: '8px 16px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#6c757d',
        zIndex: 100
      }}
    >
      <Group position="center" spacing="xs">
        <Text size="sm" color="dimmed" span>
          © {currentYear} Diventus GmbH, Ernst-Augustin-Straße 12, 12489 Berlin
        </Text>
        <Anchor 
          size="sm" 
          href="#" 
          target="_blank"
          sx={{ color: '#4dabf7' }}
        >
          Datenschutz
        </Anchor>
        <Anchor 
          size="sm" 
          href="#" 
          target="_blank"
          sx={{ color: '#4dabf7' }}
        >
          Impressum
        </Anchor>
        <Anchor 
          size="sm" 
          href="#" 
          target="_blank"
          sx={{ color: '#4dabf7' }}
        >
          Kontakt
        </Anchor>
      </Group>
    </Box>
  );
}

export default FooterExact;