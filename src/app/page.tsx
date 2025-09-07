"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Tabs,
  Tab,
  Paper,
  Divider,
  Stack,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  TableContainer,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const eventTypes = ["Hackathon", "Workshop", "Tech Talk", "Fest", "Seminar"] as const;
type EventType = typeof eventTypes[number];

type Event = {
  id: string;
  name: string;
  type: EventType;
  date: string; // ISO string yyyy-mm-dd
  details: string;
};

type RegistrationRow = {
  registration_id: number;
  student_name: string;
  present: number; // 0 or 1
};

const statusColors: Record<string, "success" | "warning" | "default"> = {
  Upcoming: "success",
  Ongoing: "warning",
  Completed: "default",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "2-digit",
  year: "numeric",
});

// ----- Attendance Tab -----
const AttendanceTab: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [attendance, setAttendance] = useState<{ [rid: number]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${BASE_URL}/events`)
      .then((res) => res.json())
      .then(setEvents);
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setRegistrations([]);
      setAttendance({});
      return;
    }
    setLoading(true);
    fetch(`${BASE_URL}/registrations?event_id=${selectedEventId}`)
      .then((res) => res.json())
      .then((rs: RegistrationRow[]) => {
        setRegistrations(rs);
        const att: { [rid: number]: boolean } = {};
        rs.forEach((x) => {
          att[x.registration_id] = x.present === 1;
        });
        setAttendance(att);
        setLoading(false);
      });
  }, [selectedEventId]);

  const handleCheckbox = (rid: number) => {
    setAttendance((prev) => ({ ...prev, [rid]: !prev[rid] }));
  };

  const submitAttendance = async () => {
    setLoading(true);
    for (const reg of registrations) {
      await fetch(`${BASE_URL}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registration_id: reg.registration_id,
          present: attendance[reg.registration_id] ? 1 : 0,
        }),
      });
    }
    setLoading(false);
    alert("Attendance submitted!");
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Typography variant="h6" mb={2}>
        Take Attendance
      </Typography>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Event</InputLabel>
        <Select
          value={selectedEventId}
          label="Select Event"
          onChange={(e) => setSelectedEventId(e.target.value as string)}
        >
          {events.map((ev) => (
            <MenuItem key={ev.id} value={ev.id}>
              {ev.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {loading ? (
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        selectedEventId && (
          <>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Present</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registrations.length ? (
                    registrations.map((reg) => (
                      <TableRow key={reg.registration_id}>
                        <TableCell>{reg.student_name}</TableCell>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={attendance[reg.registration_id] || false}
                            onChange={() => handleCheckbox(reg.registration_id)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        No registrations available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              onClick={submitAttendance}
              disabled={registrations.length === 0 || loading}
            >
              Submit Attendance
            </Button>
          </>
        )
      )}
    </Box>
  );
};

// ----- Reporting Tab -----
const ReportingTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${BASE_URL}/reports/registrations`).then((r) => r.json()),
      fetch(`${BASE_URL}/reports/attendance`).then((r) => r.json()),
      fetch(`${BASE_URL}/reports/feedback`).then((r) => r.json()),
    ])
      .then(([reg, att, feed]) => {
        setRegistrations(reg);
        setAttendance(att);
        setFeedback(feed);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <Box sx={{ textAlign: "center", py: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Stack spacing={5}>
      <Box>
        <Typography variant="h6" gutterBottom>
          Total Registrations per Event
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Event Name</TableCell>
                <TableCell>Total Registrations</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registrations.length ? (
                registrations.map((row) => (
                  <TableRow key={row.event_id}>
                    <TableCell>{row.event_name}</TableCell>
                    <TableCell>{row.total_registrations}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Attendance Percentage per Event
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Event Name</TableCell>
                <TableCell>Attendance %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.length ? (
                attendance.map((row) => (
                  <TableRow key={row.event_id}>
                    <TableCell>{row.event_name}</TableCell>
                    <TableCell>
                      {row.attendance_percentage !== null && row.attendance_percentage !== undefined
                        ? Number(row.attendance_percentage).toFixed(1) + "%"
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Average Feedback Score per Event
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Event Name</TableCell>
                <TableCell>Average Feedback</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feedback.length ? (
                feedback.map((row) => (
                  <TableRow key={row.event_id}>
                    <TableCell>{row.event_name}</TableCell>
                    <TableCell>
                      {row.average_feedback !== null && row.average_feedback !== undefined
                        ? Number(row.average_feedback).toFixed(2)
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Stack>
  );
};

// ----- Main AdminDashboard -----
const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState<Omit<Event, "id">>({
    name: "",
    type: "Hackathon",
    date: "",
    details: "",
  });
  const [filterType, setFilterType] = useState("All");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/events`);
      if (!res.ok) throw new Error("Failed to fetch events");
      const data: Event[] = await res.json();
      setEvents(data);
    } catch (err: any) {
      alert(err.message || "Error fetching events");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name === "type") {
      setForm((prev) => ({ ...prev, type: value as EventType }));
    } else if (name === "filterType") {
      setFilterType(value);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.type || !form.date) {
      alert("Please fill all required fields: Event Name, Type, and Date.");
      return;
    }
    setLoading(true);
    try {
      const url = `${BASE_URL}/events`;
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing && editId ? { id: editId, ...form } : form;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save event");
      }
      setForm({ name: "", type: "Hackathon", date: "", details: "" });
      setIsEditing(false);
      setEditId(null);
      await fetchEvents();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/events`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete event");
      }
      setEvents((prev) => prev.filter((e) => e.id !== deleteId));
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setForm({
      name: event.name,
      type: event.type,
      date: event.date,
      details: event.details,
    });
    setEditId(event.id);
    setIsEditing(true);
  };

  const filteredEvents = useMemo(
    () => (filterType === "All" ? events : events.filter((e) => e.type === filterType)),
    [filterType, events]
  );

  const today = new Date().toISOString().slice(0, 10);

  const getStatus = useCallback(
    (date: string): "Upcoming" | "Ongoing" | "Completed" => {
      if (date > today) return "Upcoming";
      else if (date === today) return "Ongoing";
      else return "Completed";
    },
    [today]
  );

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  return (
    <Box sx={{ bgcolor: "#f5fafa", minHeight: "100vh" }}>
      <AppBar position="static" color="inherit" sx={{ borderBottom: "1px solid #e2e2e2" }}>
        <Toolbar>
          <Typography variant="h6" color="primary" fontWeight={700}>
            Campus Event Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 5 }}>
        <Paper sx={{ borderRadius: 3, p: 4, mx: "auto", maxWidth: 1400 }}>
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            centered
            sx={{ mb: 3, borderRadius: 2 }}
          >
            <Tab label="Event Management" />
            <Tab label="Reporting" />
            <Tab label="Take Attendance" />
          </Tabs>

          {tab === 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                {isEditing ? "Edit Event" : "Create New Event"}
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2} alignItems="center">
                  <TextField
                    label="Event Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    fullWidth
                    disabled={loading}
                  />
                  <FormControl fullWidth disabled={loading}>
                    <InputLabel>Event Type</InputLabel>
                    <Select
                      label="Event Type"
                      name="type"
                      value={form.type}
                      onChange={handleSelectChange}
                      required
                      size="small"
                    >
                      {eventTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                    fullWidth
                    disabled={loading}
                    size="small"
                  />
                </Stack>
                <TextField
                  label="Details"
                  name="details"
                  value={form.details}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                  sx={{ mb: 2 }}
                  disabled={loading}
                />
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setForm({ name: "", type: "Hackathon", date: "", details: "" });
                      setIsEditing(false);
                      setEditId(null);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button variant="contained" type="submit" disabled={loading}>
                    {isEditing ? "Update Event" : "Create Event"}
                  </Button>
                </Box>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="h6" gutterBottom>
                Event List
              </Typography>
              <FormControl sx={{ mb: 2, maxWidth: 300 }}>
                <InputLabel>Filter by Type</InputLabel>
                <Select value={filterType} name="filterType" onChange={handleSelectChange} size="small">
                  <MenuItem value="All">All</MenuItem>
                  {eventTypes.map((et) => <MenuItem key={et} value={et}>{et}</MenuItem>)}
                </Select>
              </FormControl>
              <Table size="small" sx={{ bgcolor: "#fafbfc", borderRadius: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Event Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No Events Found.</TableCell>
                    </TableRow>
                  ) : filteredEvents.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell>{ev.name}</TableCell>
                      <TableCell>{ev.type}</TableCell>
                      <TableCell>{dateFormatter.format(new Date(ev.date))}</TableCell>
                      <TableCell>
                        <Chip label={getStatus(ev.date)} color={statusColors[getStatus(ev.date)]} size="small" />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(ev)}><Edit /></IconButton>
                        <IconButton onClick={() => openDeleteDialog(ev.id)}><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}

          {tab === 1 && (
            <Box p={3}>
              <ReportingTab />
            </Box>
          )}

          {tab === 2 && (
            <Box p={3}>
              <AttendanceTab />
            </Box>
          )}

          {/* Delete Dialog */}
          <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <DialogContentText>Are you sure you want to delete this event?</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDeleteDialog} disabled={loading}>Cancel</Button>
              <Button onClick={handleDelete} disabled={loading} color="error">
                {loading ? <CircularProgress size={18} /> : "Delete"}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
