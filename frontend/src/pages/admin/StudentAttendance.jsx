import { useEffect, useState } from "react";
import api from "../../api/axios";

const today = () => new Date().toLocaleDateString("en-CA");

function getDayName(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const emptyForm = () => ({
  attendance_date: today(),
  standard: "5",
  section: "A",
  registered_boys: 0,
  registered_girls: 0,
  present_boys: 0,
  present_girls: 0,
  absent_boys: 0,
  absent_girls: 0,
  come_boys: 0,
  come_girls: 0,
  go_boys: 0,
  go_girls: 0,
  midday_meal_beneficiaries: 0,
});

const fields = [
  ["registered_boys", "Registered boys"],
  ["registered_girls", "Registered girls"],
  ["present_boys", "Present boys"],
  ["present_girls", "Present girls"],
  ["absent_boys", "Absent boys"],
  ["absent_girls", "Absent girls"],
  ["come_boys", "Come boys"],
  ["come_girls", "Come girls"],
  ["go_boys", "Go boys"],
  ["go_girls", "Go girls"],
  ["midday_meal_beneficiaries", "Midday meal beneficiaries"],
];

export default function StudentAttendance() {
  const [selectedDate, setSelectedDate] = useState(today());
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadRecords() {
    try {
      const response = await api.get("/admin/attendance", {
        params: { attendance_date: selectedDate },
      });
      setRecords(response.data);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Could not load attendance.");
    }
  }

  useEffect(() => {
    loadRecords();
  }, [selectedDate]);

  function changeField(name, value) {
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      ...form,
      attendance_date: selectedDate,
      section: form.section.trim(),
    };

    try {
      if (editId) {
        await api.put(`/admin/attendance/${editId}`, payload);
        setMessage("Attendance updated.");
      } else {
        await api.post("/admin/attendance", payload);
        setMessage("Attendance saved.");
      }

      setEditId(null);
      setForm({ ...emptyForm(), attendance_date: selectedDate });
      await loadRecords();
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Could not save attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  function editRecord(record) {
    setEditId(record.id);
    const { id, created_at, updated_at, standard_group,
      total_strength, total_present, total_absent, ...editable } = record;
    setForm(editable);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteRecord(id) {
    if (!window.confirm("Delete this attendance record?")) return;

    try {
      await api.delete(`/admin/attendance/${id}`);
      setMessage("Attendance deleted.");
      await loadRecords();
    } catch (error) {
      setMessage(error.response?.data?.detail || "Delete failed.");
    }
  }
  
  const selectedDay = getDayName(selectedDate);

  return (
    <div className="attendance-admin">
      <h1>Student Attendance</h1>

      <label>
        Attendance date
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setEditId(null);
            setForm({ ...emptyForm(), attendance_date: e.target.value });
          }}
        />
      </label>

      <label>
        Day
        <select value={selectedDay} disabled>
            {DAYS.map((day) => (
            <option key={day} value={day}>
                {day}
            </option>
            ))}
        </select>
      </label>

      <form onSubmit={save}>
        <h2>{editId ? "Edit attendance" : "Add attendance"}</h2>

        <label>
          Standard
          <select
            value={form.standard}
            onChange={(e) => changeField("standard", e.target.value)}
          >
            {["બાલ", "1", "2", "3", "4", "5", "6", "7", "8"].map((value) => (
              <option key={value} value={value}>
                {value === "બાલ" ? "બાલ" : `Standard ${value}`}
              </option>
            ))}
          </select>
        </label>

        <label>
          Section
          <input            
            maxLength={10}
            value={form.section}
            onChange={(e) => changeField("section", e.target.value)}
          />
        </label>

        <div className="attendance-form-grid">
          {fields.map(([name, label]) => (
            <label key={name}>
              {label}
              <input
                type="number"
                min="0"
                required
                value={form[name]}
                onChange={(e) => changeField(name, e.target.value)}
              />
            </label>
          ))}
        </div>

        <button disabled={saving} type="submit">
          {saving ? "Saving..." : editId ? "Update attendance" : "Save attendance"}
        </button>

        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm({ ...emptyForm(), attendance_date: selectedDate });
            }}
          >
            Cancel edit
          </button>
        )}
      </form>

      {message && <p role="status">{message}</p>}

      <h2>Records for {selectedDate}</h2>

      <div className="attendance-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Class</th>
              <th>Strength B/G</th>
              <th>Present B/G</th>
              <th>Absent B/G</th>
              <th>Meal</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>{r.standard}{r.section ? `-${r.section}` : ""}</td>
                <td>{r.registered_boys}/{r.registered_girls}</td>
                <td>{r.present_boys}/{r.present_girls}</td>
                <td>{r.absent_boys}/{r.absent_girls}</td>
                <td>{r.midday_meal_beneficiaries}</td>
                <td>
                  <button type="button" onClick={() => editRecord(r)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteRecord(r.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!records.length && (
              <tr><td colSpan="6">No attendance records for this date.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}