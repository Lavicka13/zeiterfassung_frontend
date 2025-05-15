import React from 'react';
import { Box, Image } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

function Header() {
  // Media Query für mobile Geräte
  const isMobile = useMediaQuery('(max-width: 100px)');
  
  // Du kannst hier den Pfad zu deinem eigenen Bild einsetzen
  const logoPath = '/header.jpg'; // Dieses Bild ist bereits in deinem public-Ordner

  return (
    <Box
      style={{
        position: 'absolute',
        top: isMobile ? 10 : 15,
        right: isMobile ? 10 : 20,
        zIndex: 100,
      }}
    >
      <Image
        src={logoPath}
        alt="Logo"
        width={isMobile ? 30 : 40}
        height={isMobile ? 30 : 40}
        style={{ 
          // Optional: Schatten hinzufügen, damit das Logo besser sichtbar ist
          
        }}
      />
    </Box>
  );
}

export default Header;