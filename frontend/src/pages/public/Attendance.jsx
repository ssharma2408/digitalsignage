import { useEffect, useState } from "react";
import { getCachedApiData } from "../../utils/cachedApi";
import "./Attendance.css";

const today = () => new Date().toLocaleDateString("en-CA");

function getDayName(dateString) {
  if (!dateString) return "";

  return new Date(`${dateString}T12:00:00`).toLocaleDateString(
    "en-US",
    { weekday: "long" }
  );
}

function formatDate(date) {
    if (!date) return "";

    const value = String(date);

    // Extract only the date portion: YYYY-MM-DD
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (!match) {
        return value;
    }

    const [, year, month, day] = match;

    return `${day}-${month}-${year}`;
}

const groups = [
  {
    title: "પ્રાથમિક · બાલ વાટિકા થી ધોરણ 5",
    key: "Primary",
  },
  {
    title: "ઉચ્ચ પ્રાથમિક · ધોરણ ૬ થી ૮",
    key: "Upper Primary",
  },
];

const columns = [
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
  ["midday_meal_beneficiaries", "Midday meal"],
];

export default function Attendance() {
  const [attendanceDate, setAttendanceDate] = useState(today());
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
  let cancelled = false;

    async function load() {
      try {
        setError("");

        const response = await getCachedApiData(
          `/public/attendance?attendance_date=${encodeURIComponent(attendanceDate)}`,
          `public_attendance_${attendanceDate}`,
          120 * 60 * 1000
        );

        if (!cancelled) {
          setData(response); // The helper already returns response.data
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
            err.message ||
            "Attendance could not be loaded."
          );
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
}, [attendanceDate]);

  return (
    <main className="public-attendance">
      <header className="attendance-heading">
        <h1>નગર પ્રાથમિક શિક્ષક સમિતિ</h1>        
        <h3 className="public-date">દૈનિક  હાજરી નોધ તા. <b>{formatDate(attendanceDate)}</b>  વાર <strong>{getDayName(attendanceDate)}</strong></h3>       
        
      </header>
      {error && <p role="alert">{error}</p>}
      {!data && !error && <p>Loading attendance...</p>}

      {data && (
        <>
          <div className="attendance-summary">
            {groups.map((group) => {
              const totals = data.groups[group.key];
              return (
                <section className="attendance-summary-card" key={group.key}>
                  <h2>{group.title}</h2>
                  <table>
                    <tbody>
                        <tr>
                            <td>
                                કુલ: <strong>{totals.total_strength}</strong>
                            </td>
                            <td>
                                કુલ કુ: <strong>{totals.registered_boys}</strong>
                            </td>
                            <td>
                                કુલ ક: <strong>{totals.registered_girls}</strong>
                            </td>
                            <td>
                                હાજર: <strong>{totals.total_present}</strong>
                            </td>
                            <td>
                                ગે. હાજર: <strong>{totals.total_absent}</strong>
                            </td>                        
                            <td>
                                મધ્યાહન ભોજન લાભાર્થીઓ:{" "}
                                <strong>{totals.midday_meal_beneficiaries}</strong>
                            </td>
                        </tr>
                    </tbody>
                  </table>
                </section>
              );
            })}
          </div>

          {groups.map((group) => {
            const rows = data.records.filter(
              (r) => r.standard_group === group.key
            );

            return (
              <section key={group.key} className="attendance-group">
                <h2>{group.title}</h2>
                <div className="attendance-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th rowSpan="2">ધોરણ </th>
                        <th colSpan="2">રજીસ્ટ્રર સંખ્યા</th>
                        <th colSpan="2">હાજર</th>
                        <th colSpan="2">ગે. હાજર</th>
                        <th colSpan="2">આવ્યા</th>
                        <th colSpan="2">ગયા</th>
                        <th rowSpan="2">મધ્યાહન ભોજન લાભાર્થીઓ</th>                        
                      </tr>
                      <tr>
                        {["કુ", "ક", "કુ", "ક", "કુ", "ક",
                          "કુ", "ક", "કુ", "ક"].map((label, i) => (
                          <th key={`${label}-${i}`}>{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id}>
                          <th>{r.standard}{r.section ? `-${r.section}` : ""}</th>
                          <td>{r.registered_boys}</td>
                          <td>{r.registered_girls}</td>
                          <td>{r.present_boys}</td>
                          <td>{r.present_girls}</td>
                          <td>{r.absent_boys}</td>
                          <td>{r.absent_girls}</td>
                          <td>{r.come_boys}</td>
                          <td>{r.come_girls}</td>
                          <td>{r.go_boys}</td>
                          <td>{r.go_girls}</td>
                          <td>{r.midday_meal_beneficiaries}</td>                          
                        </tr>
                      ))}                     
                      {!rows.length && (
                        <tr>
                          <td colSpan="13">No records for this group and date.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </>
      )}
    </main>
  );
}