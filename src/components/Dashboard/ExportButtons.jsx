import React from "react";
import { Group, Menu, Button, SimpleGrid } from "@mantine/core";

function ExportButtons({ onExport, isMobile, isExtraSmall }) {
  if (isExtraSmall) {
    return (
      <SimpleGrid cols={2} spacing="xs" mb="md">
        <Menu shadow="md" width={160}>
          <Menu.Target>
            <Button size="xs" fullWidth>Monatsbericht</Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => onExport("pdf_monat")}>PDF</Menu.Item>
            <Menu.Item onClick={() => onExport("csv_monat")}>CSV</Menu.Item>
          </Menu.Dropdown>
        </Menu>
        
        <Menu shadow="md" width={160}>
          <Menu.Target>
            <Button size="xs" fullWidth>Jahresbericht</Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => onExport("pdf_jahr")}>PDF</Menu.Item>
            <Menu.Item onClick={() => onExport("csv_jahr")}>CSV</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </SimpleGrid>
    );
  }

  return (
    <Group position="center" mt="md" mb="sm">
      <Menu shadow="md" width={220}>
        <Menu.Target>
          <Button size={isMobile ? "xs" : "sm"}>Monatsbericht</Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={() => onExport("pdf_monat")}>PDF</Menu.Item>
          <Menu.Item onClick={() => onExport("csv_monat")}>CSV</Menu.Item>
        </Menu.Dropdown>
      </Menu>
      
      <Menu shadow="md" width={220}>
        <Menu.Target>
          <Button size={isMobile ? "xs" : "sm"}>Jahresbericht</Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={() => onExport("pdf_jahr")}>PDF</Menu.Item>
          <Menu.Item onClick={() => onExport("csv_jahr")}>CSV</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}

export default ExportButtons;