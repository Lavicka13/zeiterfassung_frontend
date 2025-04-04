import React, { useState } from "react";
import {
  Title,
  TextInput,
  Button,
  Paper,
  Container,
  MantineProvider,
} from "@mantine/core";

function PasswortVergessen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/passwort-vergessen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert("Der Administrator wurde benachrichtigt.");
        setEmail("");
      } else {
        alert("Fehler beim Versenden der Anfrage.");
      }
    } catch (err) {
      alert("Netzwerkfehler oder Server nicht erreichbar.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Container size={500} my={40}>
        <Paper withBorder shadow="md" p={30} radius="md">
          <Title order={3} mb="md" align="center">
            Passwort zurücksetzen
          </Title>
          <form onSubmit={handleSubmit}>
            <TextInput
              label="E-Mail"
              placeholder="dein@email.de"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <Button
              fullWidth
              mt="md"
              type="submit"
              loading={loading}
            >
              Link anfordern
            </Button>
          </form>
        </Paper>
      </Container>
    </MantineProvider>
  );
}

export default PasswortVergessen;
