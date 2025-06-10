import React from "react";
import {
  Grid,
  TextInput,
  Group,
  Button,
  Tabs,
  Menu,
  Text
} from "@mantine/core";
import {
  IconSearch,
  IconUserPlus,
  IconUserCircle,
  IconUserCog,
  IconSortAscending,
  IconSortDescending
} from '@tabler/icons-react';

function UserFilters({
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  mitarbeiter,
  sortField,
  sortDirection,
  onSortChange,
  onCreateUser,
  isMobile,
  isExtraSmall
}) {
  const toggleSortDirection = () => {
    onSortChange(sortField);
  };

  const getTabCount = (tab) => {
    if (tab === "alle") return mitarbeiter.length;
    
    return mitarbeiter.filter(m => {
      const rolle = m.Rolle || m.RechteID || "";
      const rolleStr = String(rolle).toLowerCase();
      
      if (tab === "admin") {
        return rolleStr === "admin" || rolleStr === "3";
      } else if (tab === "vorgesetzter") {
        return rolleStr === "vorgesetzter" || rolleStr === "2";
      } else if (tab === "mitarbeiter") {
        return rolleStr === "mitarbeiter" || rolleStr === "1";
      }
      return false;
    }).length;
  };

  return (
    <>
      {/* Search and Create Controls */}
      <Grid mb="lg" align="center" gutter={isMobile ? "xs" : "md"}>
        <Grid.Col span={isMobile ? 12 : 6}>
          <TextInput
            placeholder="Suche nach Name oder E-Mail..."
            icon={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            radius="md"
          />
        </Grid.Col>
        <Grid.Col span={isMobile ? 12 : 6}>
          <Group position={isMobile ? "center" : "right"} spacing="sm">
            <Button 
              variant="filled" 
              leftIcon={<IconUserPlus size={16} />}
              onClick={onCreateUser}
              radius="md"
            >
              Neuer Nutzer
            </Button>
          </Group>
        </Grid.Col>
      </Grid>

      {/* Tabs for Role Filtering */}
      <Tabs 
        value={activeTab} 
        onChange={setActiveTab}
        mb="md"
        radius="md"
      >
        <Tabs.List>
          <Tabs.Tab value="alle" icon={<IconUserCircle size={16} />}>
            Alle ({getTabCount("alle")})
          </Tabs.Tab>
          <Tabs.Tab value="admin" icon={<IconUserCog size={16} />} color="red">
            Administratoren ({getTabCount("admin")})
          </Tabs.Tab>
          <Tabs.Tab value="vorgesetzter" icon={<IconUserCog size={16} />} color="blue">
            Vorgesetzte ({getTabCount("vorgesetzter")})
          </Tabs.Tab>
          <Tabs.Tab value="mitarbeiter" icon={<IconUserCircle size={16} />} color="green">
            Mitarbeiter ({getTabCount("mitarbeiter")})
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {/* Sort Controls */}
      <Group position="right" mb="md" spacing="xs">
        <Text size="sm" color="dimmed">Sortieren nach:</Text>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button 
              variant="subtle" 
              rightIcon={sortDirection === "asc" ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
              compact
            >
              {sortField === "Nachname" ? "Nachname" : 
               sortField === "Vorname" ? "Vorname" : "E-Mail"}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item 
              icon={<IconSortAscending size={16} />} 
              onClick={() => onSortChange("Nachname")}
              rightSection={sortField === "Nachname" ? "✓" : null}
            >
              Nachname
            </Menu.Item>
            <Menu.Item 
              icon={<IconSortAscending size={16} />} 
              onClick={() => onSortChange("Vorname")}
              rightSection={sortField === "Vorname" ? "✓" : null}
            >
              Vorname
            </Menu.Item>
            <Menu.Item 
              icon={<IconSortAscending size={16} />} 
              onClick={() => onSortChange("Email")}
              rightSection={sortField === "Email" ? "✓" : null}
            >
              E-Mail
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item 
              icon={sortDirection === "asc" ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
              onClick={toggleSortDirection}
            >
              {sortDirection === "asc" ? "Aufsteigend" : "Absteigend"}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </>
  );
}

export default UserFilters;