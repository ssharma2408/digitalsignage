import { useEffect, useState } from "react";
import api from "../../api/axios";
import { API_URL } from "../../config";

// How long each staff page remains visible.
// 10000 = 10 seconds.
const PAGE_DISPLAY_TIME = 10000;

/**
 * Supports both:
 *
 * 1. Existing local URLs
 *    /uploads/images/staff.jpg
 *
 * 2. Full Supabase Storage URLs
 *    https://xxxxx.supabase.co/storage/v1/object/public/...
 */
function getImageUrl(url) {
    if (!url) return "";

    // Supabase or any other complete URL
    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    // Existing local backend image
    return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
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

export default function Staff() {
    const [staff, setStaff] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/public/staff");

            // Keep the order returned by backend.
            // Backend should already sort using teacher_order.
            setStaff(Array.isArray(response.data) ? response.data : []);

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

    /**
     * Calculate how many staff members should appear
     * on each page.
     *
     * Examples:
     *
     * 14 staff -> 7 + 7
     * 13 staff -> 7 + 6
     * 12 staff -> 6 + 6
     * 11 staff -> 6 + 5
     */
    const getPageSize = () => {
        if (staff.length <= 1) {
            return staff.length;
        }

        return Math.ceil(staff.length / 2);
    };

    const pageSize = getPageSize();

    /**
     * Split staff into two pages.
     */
    const totalPages =
        staff.length > 0
            ? Math.ceil(staff.length / pageSize)
            : 0;

    const startIndex = currentPage * pageSize;

    const visibleStaff = staff.slice(
        startIndex,
        startIndex + pageSize
    );

    /**
     * Automatically switch between Page 1 and Page 2.
     *
     * If there is only one page, no timer is required.
     */
    useEffect(() => {
        if (totalPages <= 1) {
            setCurrentPage(0);
            return;
        }

        const timer = setInterval(() => {
            setCurrentPage((previousPage) => {
                return (previousPage + 1) % totalPages;
            });
        }, PAGE_DISPLAY_TIME);

        return () => {
            clearInterval(timer);
        };
    }, [totalPages]);

    /**
     * Reset to first page whenever the staff list changes.
     */
    useEffect(() => {
        setCurrentPage(0);
    }, [staff.length]);

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

    if (staff.length === 0) {
        return (
            <div className="public-staff-page">
                <div className="no-staff">
                    No staff members found.
                </div>
            </div>
        );
    }

    return (
        <div className="staff-container">

            {/* Page Header */}
            <header className="header">
                <h1>Staff Details</h1>
            </header>

            {/* Staff Table */}
            <section className="sheet">
                <div className="table-wrap">

                    <table border="1">

                        <thead>
                            <tr>
                                <th>અનું. નં.</th>
                                <th>
                                    કર્મચારી નંબર /ટીચર કોડ
                                </th>
                                <th>
                                    જી.પી. એફ. નંબર / PRAN no.
                                </th>
                                <th>
                                    ઈ.ચા.આચાર્ય /શિક્ષકનું નામ,(અટક પહેલા લખવી)
                                </th>
                                <th>
                                    સરનામુ
                                </th>
                                <th>
                                    મોબાઈલ નંબર
                                </th>
                                <th>
                                    હોદ્દો(ઉ.શિ./વિ.સ.)આ મુજબ જ લખવુ)
                                </th>
                                <th>
                                    સ્ત્રી, / પુ
                                </th>
                                <th>
                                    SC, ST, SEBC, EWS, OPEN
                                </th>
                                <th>
                                    લાયકાત
                                </th>
                                <th>
                                    ખાતામાં દાખલ તારીખ
                                </th>
                                <th>
                                    નિયમિત પગાર ધોરણની તારીખ
                                </th>
                                <th>
                                    હાલની શાળામાં દાખલ તારીખ
                                </th>
                                <th>
                                    જન્મ તારીખ
                                </th>
                                <th>
                                    નિવૃત્તિ તારીખ
                                </th>
                                <th>
                                    કર્મચારી કોડ
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {/* Column Number Row */}
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

                            {/* Current Page Staff */}
                            {visibleStaff.map((member, index) => {

                                const imageUrl = getImageUrl(
                                    member.photo_url
                                );

                                /*
                                 * Serial number is based on the
                                 * complete staff list, not the
                                 * current page.
                                 *
                                 * Page 1:
                                 * 1,2,3,4,5,6,7
                                 *
                                 * Page 2:
                                 * 8,9,10,11...
                                 */
                                const serialNumber =
                                    startIndex + index + 1;

                                return (
                                    <tr key={member.id}>

                                        {/* Serial Number / Photo */}
                                        <td>
                                            <div className="staff-photo-cell">

                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        className="staff-pic"
                                                        alt={
                                                            member.name ||
                                                            "Staff member"
                                                        }
                                                        loading="eager"
                                                    />
                                                ) : (
                                                    <div className="staff-no-photo">
                                                        No Photo
                                                    </div>
                                                )}

                                            </div>
                                        </td>

                                        {/* Teacher Code */}
                                        <td>
                                            {member.teacher_code || ""}
                                        </td>

                                        {/* GPF / PRAN */}
                                        <td>
                                            {member.gpf_pran || ""}
                                        </td>

                                        {/* Name */}
                                        <td>
                                            {member.name || ""}
                                        </td>

                                        {/* Address */}
                                        <td>
                                            {member.address || ""}
                                        </td>

                                        {/* Mobile */}
                                        <td>
                                            {member.mobile_number || ""}
                                        </td>

                                        {/* Designation */}
                                        <td>
                                            {member.designation || ""}
                                        </td>

                                        {/* Gender */}
                                        <td>
                                            {member.gender || ""}
                                        </td>

                                        {/* Cast */}
                                        <td>
                                            {member.teacher_cast || ""}
                                        </td>

                                        {/* Qualifications */}
                                        <td>
                                            {member.qualifications || ""}
                                        </td>

                                        {/* Account Entered Date */}
                                        <td>
                                            {formatDate(member.account_entered_date) || ""}
                                        </td>

                                        {/* Regular Pay Scale Date */}
                                        <td>
                                            {formatDate(member.regular_pay_scale_date) || ""}
                                        </td>

                                        {/* Current School Admission Date */}
                                        <td>
                                            {formatDate(member.current_school_admission_date) || ""}
                                        </td>

                                        {/* DOB */}
                                        <td>
                                            {formatDate(member.dob) || ""}
                                        </td>

                                        {/* Retirement Date */}
                                        <td>
                                            {formatDate(member.retirement_date) || ""}
                                        </td>

                                        {/* Employee Code */}
                                        <td>
                                            {member.employee_code || ""}
                                        </td>

                                    </tr>
                                );
                            })}

                        </tbody>

                    </table>

                </div>
            </section>

            {/* Page Indicator
            {totalPages > 1 && (
                <div className="staff-page-indicator">
                    Page {currentPage + 1} of {totalPages}
                </div>
            )} */}

        </div>
    );
}