import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, StyleSheet, Alert, SafeAreaView } from "react-native";
import {
  Card,
  Button,
  Text,
  Searchbar,
  Chip,
  useTheme,
  TextInput,
  ActivityIndicator,
  Appbar,
} from "react-native-paper";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

const BASE_URL = "http://192.168.0.104:4000";

const EVENT_TYPES = ["All", "Hackathon", "Workshop", "Tech Talk"];

function StudentSignup({ onSignup }: { onSignup: (id: number) => void }) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    if (!name.trim() || !password) {
      Alert.alert("Please enter both name and password");
      return;
    }
    setLoading(true);
    try {
      let res, data;
      if (isSignIn) {
        res = await fetch(`${BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, password }),
        });
        data = await res.json();
        if (res.ok) {
          onSignup(data.id);
        } else if (data.error === "Account not found") {
          Alert.alert("No account found", "Please sign up first.");
          setIsSignIn(false);
        } else {
          Alert.alert(data.error || "Sign in failed");
        }
      } else {
        res = await fetch(`${BASE_URL}/students`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, password }),
        });
        data = await res.json();
        if (res.ok) {
          Alert.alert("Account created! Please sign in.");
          setIsSignIn(true);
        } else if (data.error && data.error.includes("already exists")) {
          Alert.alert("Account already exists!", "Please sign in.");
          setIsSignIn(true);
        } else {
          Alert.alert(data.error || "Sign up failed");
        }
      }
    } catch (e) {
      Alert.alert("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.signupWrapper}>
      <Card style={styles.signupCard}>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <Button mode={isSignIn ? "contained" : "text"} onPress={() => setIsSignIn(true)} style={{ flex: 1 }}>
            Sign In
          </Button>
          <Button mode={!isSignIn ? "contained" : "text"} onPress={() => setIsSignIn(false)} style={{ flex: 1 }}>
            Sign Up
          </Button>
        </View>

        <Card.Title title={isSignIn ? "Sign In" : "Sign Up"} titleStyle={{ textAlign: 'center', fontWeight: 'bold', fontSize: 24 }} />

        <Card.Content>
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            autoCapitalize="words"
            style={styles.signupInput}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.signupInput}
          />
          <Button
            mode="contained"
            contentStyle={{ paddingVertical: 6 }}
            onPress={handleAuth}
            loading={loading}
            disabled={loading}
            style={styles.signupButton}
          >
            {isSignIn ? "Sign In" : "Sign Up"}
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

export default function App() {
  const [studentId, setStudentId] = useState<number | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const theme = useTheme();
  const [loadingEvents, setLoadingEvents] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch(`${BASE_URL}/events`);
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data);
    } catch (e) {
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  const fetchRegisteredEvents = useCallback(async () => {
    if (!studentId) {
      setRegisteredEventIds([]);
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/registrations?student_id=${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch registrations");
      const ids: number[] = await res.json();
      setRegisteredEventIds(ids);
    } catch (e) {
      setRegisteredEventIds([]);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId !== null) {
      fetchEvents();
      fetchRegisteredEvents();
    }
  }, [studentId, fetchEvents, fetchRegisteredEvents]);

  const filteredEvents = events.filter(
    (ev) =>
      (filter === "All" || ev.type === filter) &&
      (search === "" ||
        ev.name.toLowerCase().includes(search.toLowerCase()) ||
        (ev.details && ev.details.toLowerCase().includes(search.toLowerCase())))
  );

  async function handleRegister(eventId: number | string) {
    if (studentId === null) {
      Alert.alert("Please sign up first");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, event_id: eventId }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", data.message || "Registered!");
        setRegisteredEventIds((ids) => [...ids, Number(eventId)]);
      } else {
        Alert.alert("Error", data.error || "Registration failed");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to register, check your connection.");
    }
  }

  if (studentId === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
        <Appbar.Header style={{ backgroundColor: "#8f74e0" }}>
          <Appbar.Content title="CampusPulse" titleStyle={{ textAlign: 'center', fontWeight: 'bold', fontSize: 24 }} />
        </Appbar.Header>
        <StudentSignup onSignup={setStudentId} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      <Appbar.Header style={{ backgroundColor: "#8f74e0" }}>
        <Appbar.BackAction color="white" onPress={() => {
          setStudentId(null);
          setRegisteredEventIds([]);
        }} />
        <Appbar.Content 
          title="CampusPulse"
          titleStyle={{ textAlign: 'center', fontWeight: 'bold', fontSize: 24, color: "white" }}
        />
      </Appbar.Header>
      <View style={styles.container}>
        <Searchbar
          placeholder="Search events..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchBar}
          inputStyle={{ fontSize: 16 }}
        />
        <View style={styles.chipRow}>
          {EVENT_TYPES.map((type) => (
            <Chip
              key={type}
              mode={filter === type ? "flat" : "outlined"}
              selected={filter === type}
              onPress={() => setFilter(type)}
              style={[styles.chip, filter === type && styles.chipSelected]}
            >
              {type}
            </Chip>
          ))}
        </View>
        {loadingEvents ? (
          <ActivityIndicator animating size="large" />
        ) : (
          <FlatList
            data={filteredEvents}
            keyExtractor={(ev) => ev.id?.toString() || ""}
            renderItem={({ item }) => {
              const alreadyRegistered = registeredEventIds.includes(item.id);
              return (
                <Card style={styles.card} elevation={4} mode="elevated">
                  {item.image && (
                    <Card.Cover source={{ uri: item.image }} style={{ height: 120 }} />
                  )}
                  <Card.Content>
                    <View style={styles.eventHeaderRow}>
                      <Text style={styles.eventName}>{item.name}</Text>
                      <Chip
                        style={styles.eventTypeChip}
                        compact
                        mode="flat"
                        textStyle={{ fontSize: 12, color: "white" }}
                        selectedColor="white"
                        selected
                        theme={{ colors: { primary: "#8f74e0" } }}
                      >
                        {item.type}
                      </Chip>
                    </View>
                    <View style={styles.detailsRow}>
                      <Icon name="calendar-month" size={16} color="#888" />
                      <Text style={styles.detailText}>{item.date}</Text>
                    </View>
                    <View style={styles.detailsRow}>
                      <Icon name="map-marker" size={16} color="#888" />
                      <Text style={styles.detailText}>{item.location || "N/A"}</Text>
                    </View>
                    <Text variant="bodyMedium" style={{ marginVertical: 4 }}>
                      {item.details}
                    </Text>
                  </Card.Content>
                  <Card.Actions>
                    <Button
                      mode={alreadyRegistered ? "outlined" : "contained"}
                      onPress={() => handleRegister(item.id)}
                      disabled={alreadyRegistered}
                      style={alreadyRegistered ? styles.registeredBtn : styles.registerBtn}
                      labelStyle={{ color: alreadyRegistered ? "#888" : "white" }}
                    >
                      {alreadyRegistered ? "Registered" : "Register"}
                    </Button>
                  </Card.Actions>
                </Card>
              );
            }}
            ListEmptyComponent={<Text style={{ padding: 8 }}>No events found.</Text>}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  signupWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6fa"
  },
  signupCard: {
    width: "90%",
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#efe9fd",
    shadowColor: "#8f74e0",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    elevation: 6
  },
  signupInput: {
    marginBottom: 16
  },
  signupButton: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: "#8f74e0"
  },
  container: { flex: 1, padding: 16, backgroundColor: "#f5f6fa" },
  header: { fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  searchBar: {
    marginBottom: 8,
    backgroundColor: "#efe9fd",
    borderRadius: 16,
    elevation: 0
  },
  chipRow: {
    flexDirection: "row",
    marginBottom: 10,
    flexWrap: "wrap"
  },
  chip: {
    marginRight: 8,
    backgroundColor: "#ede3fd"
  },
  chipSelected: {
    backgroundColor: "#8f74e0"
  },
  card: {
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: "#f7f2ff",
    shadowColor: "#8f74e0",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 3
  },
  eventName: { fontSize: 20, fontWeight: "700", color: "#573d9a" },
  eventHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  eventTypeChip: {
    marginLeft: 8,
    backgroundColor: "#8f74e0"
  },
  detailsRow: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  detailText: { marginLeft: 5, fontSize: 15, color: "#444" },
  registerBtn: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "#8f74e0"
  },
  registeredBtn: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "#eee",
    borderColor: "#ccc", 
    borderWidth: 1,
  }
});
