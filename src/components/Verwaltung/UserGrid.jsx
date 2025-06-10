import React from "react";
import { SimpleGrid, Text } from "@mantine/core";
import UserCard from "./UserCard";

function UserGrid({
  filteredMitarbeiter,
  searchTerm,
  activeTab,
  onEdit,
  onPasswordReset,
  onDelete,
  isMobile,
  isTablet
}) {
  return (
    <SimpleGrid 
      cols={isMobile ? 1 : isTablet ? 2 : 3}
      spacing={isMobile ? "sm" : "md"}
    >
      {filteredMitarbeiter.length > 0 ? (
        filteredMitarbeiter.map((user) => (
          <UserCard 
            key={user.ID} 
            user={user}
            onEdit={onEdit}
            onPasswordReset={onPasswordReset}
            onDelete={onDelete}
          />
        ))
      ) : (
        <Text align="center" color="dimmed" py="xl" style={{ gridColumn: "1/-1" }}>
          {searchTerm || activeTab !== "alle" ? 
            "Keine Nutzer mit diesen Filterkriterien gefunden." : 
            "Keine Nutzer vorhanden. Erstellen Sie einen neuen Nutzer."
          }
        </Text>
      )}
    </SimpleGrid>
  );
}

export default UserGrid;