import React, { useState } from 'react';
import { TextInput, Button, Paper, Title, Container, MantineProvider } from '@mantine/core';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          passwort: password // 👈 hier wichtig: das Feld muss `passwort` heißen
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token); // Token speichern
        window.location.href = '/dashboard'; // Nach Login weiterleiten
      } else {
        alert('Login fehlgeschlagen');
      }
    } catch (error) {
      console.error('Fehler beim Login:', error);
      alert('Es ist ein Fehler aufgetreten');
    }
  };

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Container size={620} my={40}>
        <Title align="center" style={{ marginBottom: 80 }}>
          Arbeitszeiterfassung - Login
        </Title>
        <Paper withBorder shadow="md" p={30} radius="md">
          <form onSubmit={handleLogin}>
            <TextInput
              label="E-Mail"
              placeholder="abc@example.com"
              required
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
            />
            <TextInput
              label="Passwort"
              placeholder="********"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              mt="md"
            />
            <Button fullWidth mt="xl" type="submit">
              Login
            </Button>
          </form>
        </Paper>
      </Container>
    </MantineProvider>
  );
}

export default LoginPage;
