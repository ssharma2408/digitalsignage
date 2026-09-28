import { useEffect, useState } from "react";
import api from "../../api/axios";
import StaffForm from "./StaffForm";
import "./Staff.css";

function StaffAdmin() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);

    const [search, setSearch] = useState("");

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/staff?skip=0&limit=100"
            );

            setStaff(response.data);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.detail ||
                "Unable to load staff."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingStaff(null);
        setShowForm(true);
    };

    const handleEdit = (item) => {
        setEditingStaff(item);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this staff member?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/admin/staff/${id}`);

            setStaff((current) =>
                current.filter((item) => item.id !== id)
            );

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Unable to delete staff."
            );
        }
    };

    const handleFormSuccess = (savedStaff) => {
        if (editingStaff) {
            setStaff((current) =>
                current.map((item) =>
                    item.id === savedStaff.id
                        ? savedStaff
                        : item
                )
            );
        } else {
            setStaff((current) => [
                savedStaff,
                ...current
            ]);
        }

        setShowForm(false);
        setEditingStaff(null);
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingStaff(null);
    };

    const filteredStaff = staff.filter((item) => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) {
            return true;
        }

        return (
            item.name?.toLowerCase().includes(keyword) ||
            item.teacher_code?.toLowerCase().includes(keyword) ||
            item.employee_code?.toLowerCase().includes(keyword) ||
            item.gpf_pran?.toLowerCase().includes(keyword) ||
            item.mobile_number?.toLowerCase().includes(keyword) ||
            item.designation?.toLowerCase().includes(keyword)
        );
    });

    return (
        <div className="staff-page">

            <div className="staff-header">
                <div>
                    <h1>Staff</h1>
                    <p>Manage school staff members</p>
                </div>

                <button
                    className="btn-primary"
                    onClick={handleAdd}
                >
                    + Add Staff
                </button>
            </div>

            <div className="staff-toolbar">

                <input
                    type="text"
                    placeholder="Search staff..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    className="staff-search"
                />

            </div>

            {error && (
                <div className="staff-error">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="staff-loading">
                    Loading staff...
                </div>
            ) : (
                <div className="staff-table-wrapper">

                    <table className="staff-table">

                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Photo</th>
                                <th>Teacher Code</th>
                                <th>GPF / PRAN</th>
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Designation</th>
                                <th>Gender</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredStaff.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="11"
                                        className="no-staff"
                                    >
                                        No staff found.
                                    </td>
                                </tr>
                            ) : (
                                filteredStaff.map(
                                    (item, index) => (
                                        <tr key={item.id}>

                                            <td>
                                                {index + 1}
                                            </td>

                                            <td>
                                                {item.photo_url ? (
                                                    <img
                                                        src={item.photo_url}
                                                        alt={item.name}
                                                        className="staff-photo"
                                                    />
                                                ) : (
                                                    <div className="staff-photo-placeholder">
                                                        {item.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase()}
                                                    </div>
                                                )}
                                            </td>

                                            <td>
                                                {item.teacher_code}
                                            </td>

                                            <td>
                                                {item.gpf_pran}
                                            </td>

                                            <td>
                                                <strong>
                                                    {item.name}
                                                </strong>
                                            </td>

                                            <td>
                                                {item.mobile_number}
                                            </td>

                                            <td>
                                                {item.designation}
                                            </td>

                                            <td>
                                                {item.gender}
                                            </td>

                                            <td>
                                                {item.teacher_cast || "-"}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        item.status ===
                                                        "published"
                                                            ? "status-published"
                                                            : "status-draft"
                                                    }
                                                >
                                                    {item.status}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="staff-actions">

                                                    <button
                                                        className="btn-edit"
                                                        onClick={() =>
                                                            handleEdit(item)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="btn-delete"
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>
                                    )
                                )
                            )}

                        </tbody>

                    </table>

                </div>
            )}

            {showForm && (
                <StaffForm
                    staff={editingStaff}
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                />
            )}

        </div>
    );
}

export default StaffAdmin;