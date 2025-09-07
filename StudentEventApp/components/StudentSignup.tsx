import React, { useState } from "react";
import { View, Alert } from "react-native";
import { TextInput, Button } from "react-native-paper";

type StudentSignupProps = {
  onSignup: (studentId: number) => void;
};

export default function StudentSignup({ onSignup }: StudentSignupProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name.trim() || !password) {
      Alert.alert("Missing Input", "Please enter both name and password.");
      return;
    }
    setLoading(true);
    try {
      // Use your new local IPv4 here!
      const res = await fetch("http://192.168.0.104:4000/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json();

      if (res.ok) {
        onSignup(data.id);
      } else if (data.error && data.error.includes("exists")) {
        Alert.alert("Account Exists", "This account already exists, please sign in.");
      } else {
        Alert.alert("Error", data.error || "Signup failed.");
      }
    } catch {
      Alert.alert("Network Error", "Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <TextInput
        label="Full Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        style={{ marginBottom: 12 }}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 12 }}
      />
      <Button
        mode="contained"
        onPress={handleSignup}
        loading={loading}
        disabled={loading}
      >
        Sign Up
      </Button>
    </View>
  );
}
