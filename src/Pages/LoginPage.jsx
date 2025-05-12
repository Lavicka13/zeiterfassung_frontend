import React, { useState } from "react";
import {
  TextInput,
  Button,
  Paper,
  Title,
  Container,
  PasswordInput,
  LoadingOverlay
} from "@mantine/core";
import { notifications } from '@mantine/notifications';
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          passwort: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        
        notifications.show({
          title: 'Erfolg',
          message: 'Login erfolgreich!',
          color: 'green',
        });
        
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        
        notifications.show({
          title: 'Fehler',
          message: errorData.error || 'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.',
          color: 'red',
        });
      }
    } catch (error) {
      console.error("Fehler beim Login:", error);
      
      notifications.show({
        title: 'Fehler',
        message: 'Verbindungsfehler. Bitte versuchen Sie es später erneut.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title align="center" mb={30}>
        Arbeitszeiterfassung - Login
      </Title>
      
      <Paper withBorder shadow="md" p={30} radius="md" pos="relative">
        <LoadingOverlay visible={loading} overlayBlur={2} />
        
        <form onSubmit={handleLogin}>
          <TextInput
            label="E-Mail"
            placeholder="abc@example.com"
            required
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
          />
          
          <PasswordInput
            label="Passwort"
            placeholder="Ihr Passwort"
            required
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            mt="md"
          />
          
          <Button fullWidth mt="xl" type="submit">
            Login
          </Button>
          
          <Button
            fullWidth 
            mt="sm"
            variant="subtle"
            size="xs"
            onClick={() => navigate("/passwort-vergessen")}
          >
            Passwort vergessen?
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default LoginPage;