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
import axios from "axios";

function PasswortVergessen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  // Email-Format validieren
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Email-Format überprüfen
    if (!email) {
      setEmailError("Bitte geben Sie eine E-Mail-Adresse ein.");
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      return;
    }
    
    setEmailError("");
    setLoading(true);
    
    try {
      // Prüfen, ob der Nutzer existiert
      const checkResponse = await axios.get(`http://localhost:8080/api/nutzer/email-exists?email=${encodeURIComponent(email)}`);
      
      if (!checkResponse.data.exists) {
        setEmailError("Es wurde kein Konto mit dieser E-Mail-Adresse gefunden. Bitte überprüfen Sie Ihre Eingabe.");
        setLoading(false);
        return;
      }
      
      // Passwort-Reset-Anfrage senden
      const response = await axios.post("http://localhost:8080/api/passwort-vergessen", {
        email
      });

      if (response.status === 200) {
        setSubmitted(true);
        notifications.show({
          title: 'Anfrage gesendet',
          message: 'Der Administrator wurde benachrichtigt. Sie erhalten in Kürze eine E-Mail mit weiteren Anweisungen.',
          color: 'green',
        });
        setEmail("");
      }
    } catch (err) {
      console.error("Fehler:", err);
      
      // Spezifische Fehlermeldung basierend auf dem Statuscode
      if (err.response) {
        if (err.response.status === 404) {
          setEmailError("Es wurde kein Konto mit dieser E-Mail-Adresse gefunden.");
        } else {
          notifications.show({
            title: 'Fehler',
            message: err.response.data?.error || 'Ein Fehler ist aufgetreten.',
            color: 'red',
          });
        }
      } else {
        notifications.show({
          title: 'Fehler',
          message: 'Netzwerkfehler oder Server nicht erreichbar.',
          color: 'red',
        });
      }
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
              placeholder="ihre@email.de"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              error={emailError}
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