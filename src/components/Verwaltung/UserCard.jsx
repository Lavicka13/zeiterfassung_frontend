import React from "react";
import {
  Card,
  Group,
  Avatar,
  Text,
  Badge,
  Menu,
  ActionIcon
} from "@mantine/core";
import {
  IconDots,
  IconEdit,
  IconLock,
  IconTrash
} from '@tabler/icons-react';
import { useMantineTheme } from "@mantine/core";

function UserCard({ user, onEdit, onPasswordReset, onDelete }) {
  const theme = useMantineTheme();

  // Function to generate avatar initials
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  // Function to get avatar color based on role
  const getAvatarColor = (rolle) => {
    if (!rolle) return theme.colors.green[5];
    
    const rolleStr = String(rolle).toLowerCase();
    
    if (rolleStr === "admin" || rolleStr === "3") return theme.colors.red[5];
    if (rolleStr === "vorgesetzter" || rolleStr === "2") return theme.colors.blue[5];
    return theme.colors.green[5];
  };

  const getRollenBadge = (rolle) => {
    let color = "green";
    let text = "Mitarbeiter";
    
    if (!rolle) return <Badge color={color} variant="light" size="md">{text}</Badge>;
    
    const rolleStr = String(rolle).toLowerCase();
    
    if (rolleStr === "admin" || rolleStr === "3") {
      color = "red";
      text = "Administrator";
    } else if (rolleStr === "vorgesetzter" || rolleStr === "2") {
      color = "blue";
      text = "Vorgesetzter";
    } else if (rolleStr === "mitarbeiter" || rolleStr === "1") {
      color = "green";
      text = "Mitarbeiter";
    }
    
    return <Badge color={color} variant="light" size="md">{text}</Badge>;
  };

  return (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Group position="apart" style={{ marginBottom: 12, alignItems: 'flex-start' }}>
        <Group>
          <Avatar 
            radius="xl" 
            size={42} 
            color={getAvatarColor(user.Rolle || user.RechteID)}
          >
            {getInitials(user.Vorname, user.Nachname)}
          </Avatar>
          <div>
            <Text weight={500} size="lg">{user.Vorname} {user.Nachname}</Text>
            <Text size="sm" color="dimmed">{user.Email}</Text>
          </div>
        </Group>
        {getRollenBadge(user.Rolle || user.RechteID)}
      </Group>

      <Group position="right" spacing="xs" mt="md">
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="default" radius="md" size={36}>
              <IconDots size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item 
              icon={<IconEdit size={16} />}
              onClick={() => onEdit(user)}
            >
              Bearbeiten
            </Menu.Item>
            <Menu.Item 
              icon={<IconLock size={16} />}
              onClick={() => onPasswordReset(user)}
            >
              Passwort zurücksetzen
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item 
              color="red" 
              icon={<IconTrash size={16} />}
              onClick={() => onDelete(user)}
            >
              Löschen
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Card>
  );
}

export default UserCard;