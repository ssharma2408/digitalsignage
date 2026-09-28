import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Staff() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            setLoading(true);

            const response = await api.get("/public/staff");

            setStaff(response.data);

        } catch (error) {
            console.error("Failed to load staff:", error);

            setError(
                error.response?.data?.detail ||
                "Unable to load staff members."
            );

        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="public-staff-page">
                <div className="staff-loading">
                    Loading staff members...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="public-staff-page">
                <div className="staff-error">
                    {error}
                </div>
            </div>
        );
    }


    return (
        <div className="staff-container">
            <header className="header">
                <h1>Staff Details</h1>
            </header>
            {staff.length === 0 ? (
                <div className="no-staff">
                    No staff members found.
                </div>
            ) : (
            <section className="sheet"><div className="table-wrap">
                <table border="1">
                    <thead>
                        <tr>
                            <th>અનું. નં.</th>
                            <th>કર્મચારી નંબર /ટીચર કોડ </th>
                            <th>જી.પી. એફ. નંબર / PRAN no.</th>
                            <th>ઈ.ચા.આચાર્ય /શિક્ષકનું નામ,(અટક પહેલા લખવી)</th>
                            <th>સરનામુ </th>
                            <th>મોબાઈલ નંબર </th>
                            <th>હોદ્દો(ઉ.શિ./વિ.સ.)આ મુજબ જ લખવુ)</th>
                            <th>સ્ત્રી, / પુ </th>
                            <th>SC, ST, SEBC, EWS,  OPEN</th>
                            <th>લાયકાત </th>
                            <th>ખાતામાં દાખલ તારીખ </th>
                            <th>નિયમિત પગાર ધોરણની તારીખ</th>
                            <th>હાલની શાળામાં દાખલ તારીખ</th>
                            <th>જન્મ તારીખ</th>
                            <th>નિવૃત્તિ તારીખ </th>
                            <th>કર્મચારી કોડ </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>2</td>
                            <td>3</td>
                            <td>4</td>
                            <td>5</td>
                            <td>6</td>
                            <td>7</td>
                            <td>8</td>
                            <td>10</td>
                            <td>12</td>
                            <td>16</td>
                            <td>19</td>
                            <td>20</td>
                            <td>22</td>
                            <td>23</td>
                            <td></td>
                        </tr>
                        {staff.map((member) => {
                            const imageUrl = member.photo_url
                            return (
                                <tr key={member.id}>                        
                                    <td>
                                    {imageUrl ? (
                                        <img src={imageUrl} className="staff-pic" alt={member.name} />
                                        ) : (
                                            <div className="staff-no-photo">
                                                No Photo
                                            </div>
                                        )}
                                    </td>
                                    <td>                                        
                                        {member.teacher_code}
                                    </td>
                                    <td>{member.gpf_pran}</td>
                                    <td>{member.name}</td>
                                    <td>{member.address}</td>
                                    <td>{member.mobile_number}</td>
                                    <td>{member.designation}</td>
                                    <td>{member.gender}</td>
                                    <td>{member.teacher_cast}</td>
                                    <td>{member.qualifications}</td>
                                    <td>{member.account_entered_date}</td>
                                    <td>{member.regular_pay_scale_date}</td>
                                    <td>{member.current_school_admission_date}</td>
                                    <td>{member.dob}</td>
                                    <td>{member.retirement_date}</td>
                                    <td>{member.employee_code}</td>
                                </tr>
                             );
                        })}                        
                    </tbody>
                </table>
            </div>
        </section>
            )
        }
        </div>
    );
}