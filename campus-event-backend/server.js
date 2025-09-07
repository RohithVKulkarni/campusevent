const Database = require("better-sqlite3");
const express = require("express");
const cors = require("cors");

const db = new Database("events.db");

// Schema setup
db.exec(`
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  details TEXT
);

DROP TABLE IF EXISTS students;

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  UNIQUE(event_id, student_id),
  FOREIGN KEY(event_id) REFERENCES events(id),
  FOREIGN KEY(student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS attendance (
  registration_id INTEGER PRIMARY KEY,
  present BOOLEAN DEFAULT 0,
  FOREIGN KEY(registration_id) REFERENCES registrations(id)
);

CREATE TABLE IF NOT EXISTS feedback (
  registration_id INTEGER PRIMARY KEY,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  FOREIGN KEY(registration_id) REFERENCES registrations(id)
);
`);

const app = express();
app.use(cors());
app.use(express.json());

// Event APIs
app.post("/events", (req, res) => {
  const { name, type, date, details } = req.body;
  if (!name || !type || !date) return res.status(400).json({ error: "Missing required fields" });
  try {
    const info = db.prepare("INSERT INTO events (name, type, date, details) VALUES (?, ?, ?, ?)").run(name, type, date, details || "");
    res.status(201).json({ message: "Event created", id: info.lastInsertRowid });
  } catch (e) {
    res.status(500).json({ error: "Error creating event", details: e.message });
  }
});

app.put("/events", (req, res) => {
  const { id, name, type, date, details } = req.body;
  if (!id || !name || !type || !date) return res.status(400).json({ error: "Missing fields" });
  try {
    const info = db.prepare("UPDATE events SET name = ?, type = ?, date = ?, details = ? WHERE id = ?").run(name, type, date, details || "", id);
    if (info.changes === 0) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event updated" });
  } catch (e) {
    res.status(500).json({ error: "Error updating event", details: e.message });
  }
});

app.get("/events", (req, res) => {
  try {
    const events = db.prepare("SELECT * FROM events ORDER BY date DESC").all();
    res.json(events);
  } catch (e) {
    res.status(500).json({ error: "Error fetching events", details: e.message });
  }
});

app.delete("/events", (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Missing id" });
  try {
    const info = db.prepare("DELETE FROM events WHERE id = ?").run(id);
    if (info.changes === 0) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ error: "Error deleting event", details: e.message });
  }
});

// Student APIs
app.post("/students", (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ error: "Missing fields" });
  const exists = db.prepare("SELECT id FROM students WHERE name = ?").get(name);
  if (exists) return res.status(400).json({ error: "account exists" });
  try {
    const info = db.prepare("INSERT INTO students (name, password) VALUES (?, ?)").run(name, password);
    res.status(201).json({ message: "Student added", id: info.lastInsertRowid });
  } catch (e) {
    res.status(500).json({ error: "Error adding student", details: e.message });
  }
});

// Login API
app.post("/login", (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ error: "Missing fields" });
  const user = db.prepare("SELECT id, password FROM students WHERE name = ?").get(name);
  if (!user) return res.status(400).json({ error: "Account not found" });
  if (user.password !== password) return res.status(400).json({ error: "Incorrect password" });
  res.json({ id: user.id });
});

// Get all students
app.get("/students", (req, res) => {
  try {
    const students = db.prepare("SELECT * FROM students").all();
    res.json(students);
  } catch (e) {
    res.status(500).json({ error: "Error fetching students", details: e.message });
  }
});

// Registrations and Attendance APIs

app.post("/register", (req, res) => {
  const { student_id, event_id } = req.body;
  if (!student_id || !event_id) return res.status(400).json({ error: "Missing parameters" });

  const student = db.prepare("SELECT id FROM students WHERE id = ?").get(student_id);
  if (!student) return res.status(400).json({ error: "Invalid student ID" });

  const event = db.prepare("SELECT id FROM events WHERE id = ?").get(event_id);
  if (!event) return res.status(400).json({ error: "Invalid event ID" });

  const exists = db.prepare("SELECT id FROM registrations WHERE student_id = ? AND event_id = ?").get(student_id, event_id);
  if (exists) return res.status(400).json({ error: "Already registered" });

  try {
    const info = db.prepare("INSERT INTO registrations (student_id, event_id) VALUES (?, ?)").run(student_id, event_id);
    db.prepare("INSERT INTO attendance (registration_id, present) VALUES (?, 0)").run(info.lastInsertRowid);
    db.prepare("INSERT INTO feedback (registration_id) VALUES (?)").run(info.lastInsertRowid);
    res.json({ message: "Registered successfully", registration_id: info.lastInsertRowid });
  } catch (e) {
    res.status(500).json({ error: "Error registering", details: e.message });
  }
});

// New enhanced GET registrations for attendance (per event with student info)
app.get("/registrations", (req, res) => {
  const event_id = req.query.event_id;
  if (!event_id) return res.status(400).json({ error: "Missing event_id" });
  try {
    const rows = db.prepare(`
      SELECT r.id as registration_id, s.name as student_name, COALESCE(a.present, 0) as present
      FROM registrations r
      JOIN students s ON r.student_id = s.id
      LEFT JOIN attendance a ON a.registration_id = r.id
      WHERE r.event_id = ?
      ORDER BY s.name
    `).all(event_id);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Error fetching registrations", details: e.message });
  }
});

// Attendance API
app.post("/attendance", (req, res) => {
  const { registration_id, present } = req.body;
  if (!registration_id || present === undefined) return res.status(400).json({ error: "Missing parameters" });
  try {
    db.prepare("UPDATE attendance SET present = ? WHERE registration_id = ?").run(present ? 1 : 0, registration_id);
    res.json({ message: "Attendance updated" });
  } catch (e) {
    res.status(500).json({ error: "Error updating attendance", details: e.message });
  }
});

// Feedback API
app.post("/feedback", (req, res) => {
  const { registration_id, rating, comments } = req.body;
  if (!registration_id || rating == null || rating < 1 || rating > 5) return res.status(400).json({ error: "Invalid input" });
  try {
    db.prepare("UPDATE feedback SET rating = ?, comments = ? WHERE registration_id = ?").run(rating, comments || null, registration_id);
    res.json({ message: "Feedback submitted" });
  } catch (e) {
    res.status(500).json({ error: "Error submitting feedback", details: e.message });
  }
});

// Reports
app.get("/reports", (req, res) => {
  // optional: summary report combining all
  res.status(404).json({ error: "Not implemented" });
});

app.get("/reports/registrations", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT e.id as event_id, e.name as event_name, COUNT(r.id) as total_registrations
      FROM events e LEFT JOIN registrations r ON e.id = r.event_id
      GROUP BY e.id
      ORDER BY total_registrations DESC
    `).all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Error fetching registration report", details: e.message });
  }
});

app.get("/reports/attendance", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT e.id as event_id, e.name as event_name,
      (SUM(a.present) * 100.0 / COUNT(a.registration_id)) as attendance_percentage
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      LEFT JOIN attendance a ON a.registration_id = r.id
      GROUP BY e.id
    `).all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Error fetching attendance report", details: e.message });
  }
});

app.get("/reports/feedback", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT e.id as event_id, e.name as event_name, AVG(f.rating) as average_feedback
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      LEFT JOIN feedback f ON f.registration_id = r.id
      GROUP BY e.id
    `).all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Error fetching feedback report", details: e.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
