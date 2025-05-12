import React, { useState } from "react";
import {
  Title,
  TextInput,
  Button,
  Paper,
  Container,
  LoadingOverlay,
  Text,
  Group
} from "@mantine/core";
import { notifications } from '@mantine/notifications';
import { useNavigate } from "react-router-dom";

function PasswortVergessen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

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
        setSubmitted(true);
        notifications.show({
          title: 'Anfrage gesendet',
          message: 'Der Administrator wurde benachrichtigt. Sie erhalten in Kürze eine E-Mail mit weiteren Anweisungen.',
          color: 'green',
        });
        setEmail("");
      } else {
        const errorData = await response.json();
        notifications.show({
          title: 'Fehler',
          message: errorData.error || 'Fehler beim Versenden der Anfrage.',
          color: 'red',
        });
      }
    } catch (err) {
      notifications.show({
        title: 'Fehler',
        message: 'Netzwerkfehler oder Server nicht erreichbar.',
        color: 'red',
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow="md" p={30} radius="md" pos="relative">
        <LoadingOverlay visible={loading} overlayBlur={2} />
        
        <Title order={3} mb="md" align="center">
          Passwort zurücksetzen
        </Title>

        {submitted ? (
          <>
            <Text align="center" mb="md">
              Ihre Anfrage wurde erfolgreich gesendet. Der Administrator wurde benachrichtigt.
            </Text>
            <Button fullWidth onClick={() => navigate("/login")}>
              Zurück zum Login
            </Button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextInput
              label="E-Mail"
              placeholder="dein@email.de"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />

            <Group position="apart" mt="lg">
              <Button variant="subtle" onClick={() => navigate("/login")}>
                Zurück zum Login
              </Button>
              <Button type="submit">
                Link anfordern
              </Button>
            </Group>
          </form>
        )}
      </Paper>
    </Container>
  );
}

export default PasswortVergessen;