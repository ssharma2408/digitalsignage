import { useEffect, useState } from "react";
import api from "../../api/axios";
import { API_URL } from "../../config";

function StaffForm({
    staff,
    onSuccess,
    onCancel
}) {
    const [form, setForm] = useState({
        photo_url: "",
        teacher_code: "",
        gpf_pran: "",
        name: "",
        address: "",
        mobile_number: "",
        designation: "",
        gender: "",
        teacher_cast: "",
        qualifications: "",
        teacher_order: 0,
        account_entered_date: "",
        regular_pay_scale_date: "",
        current_school_admission_date: "",
        dob: "",
        retirement_date: "",
        employee_code: "",
        status: "published"
    });

    const [photoPreview, setPhotoPreview] = useState("");
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!staff) {
            setForm({
                photo_url: "",
                teacher_code: "",
                gpf_pran: "",
                name: "",
                address: "",
                mobile_number: "",
                designation: "",
                gender: "",
                teacher_cast: "",
                qualifications: "",
                teacher_order: 0,
                account_entered_date: "",
                regular_pay_scale_date: "",
                current_school_admission_date: "",
                dob: "",
                retirement_date: "",
                employee_code: "",
                status: "published"
            });

            setPhotoPreview("");
            return;
        }

        setForm({
            photo_url: staff.photo_url || "",
            teacher_code: staff.teacher_code || "",
            gpf_pran: staff.gpf_pran || "",
            name: staff.name || "",
            address: staff.address || "",
            mobile_number: staff.mobile_number || "",
            designation: staff.designation || "",
            gender: staff.gender || "",
            teacher_cast: staff.teacher_cast || "",
            qualifications: staff.qualifications || "",
            teacher_order: staff.teacher_order || "",
            account_entered_date:
                formatDateForInput(staff.account_entered_date),
            regular_pay_scale_date:
                formatDateForInput(staff.regular_pay_scale_date),
            current_school_admission_date:
                formatDateForInput(
                    staff.current_school_admission_date
                ),
            dob: formatDateForInput(staff.dob),
            retirement_date:
                formatDateForInput(staff.retirement_date),
            employee_code: staff.employee_code || "",
            status: staff.status || "published"
        });

        setPhotoPreview(
            getImageUrl(staff.photo_url)
        );

    }, [staff]);

    const formatDateForInput = (value) => {
        if (!value) {
            return "";
        }

        return value.substring(0, 10);
    };

    const getImageUrl = (url) => {
        if (!url) {
            return "";
        }

        if (url.startsWith("http")) {
            return url;
        }

        return `${API_URL}${url}`;
    };

    const handleChange = (e) => {
        const {
            name,
            value
        } = e.target;

        setForm((current) => ({
            ...current,
            [name]: value
        }));
    };

    /*
     * Upload teacher photo
     */
    const handlePhotoUpload = async (e) => {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        try {
            setUploadingPhoto(true);

            const uploadData = new FormData();

            // IMPORTANT: Staff uses "file"
            uploadData.append("file", selectedFile);

            const response = await api.post(
                "/admin/media/upload",
                uploadData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log("MEDIA UPLOAD RESPONSE:", response.data);

            const uploadedUrl = response.data?.data?.[0]?.src;

            if (!uploadedUrl) {
                throw new Error("Image URL not returned by server");
            }

            console.log("Uploaded URL:", uploadedUrl);

            // Save URL in staff form
            setForm(prev => ({
                ...prev,
                photo_url: uploadedUrl
            }));

            // Show preview
            setPhotoPreview(uploadedUrl);

        } catch (error) {
            console.error("Photo upload error:", error);

            alert(
                error.response?.data?.detail ||
                error.message ||
                "Photo upload failed"
            );

        } finally {
            setUploadingPhoto(false);
        }
    };

    const removePhoto = () => {

        setForm((current) => ({
            ...current,
            photo_url: ""
        }));

        setPhotoPreview("");
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);
            setError("");

            const payload = {
                ...form,

                account_entered_date:
                    form.account_entered_date
                        ? `${form.account_entered_date}T00:00:00`
                        : null,

                regular_pay_scale_date:
                    form.regular_pay_scale_date
                        ? `${form.regular_pay_scale_date}T00:00:00`
                        : null,

                current_school_admission_date:
                    form.current_school_admission_date
                        ? `${form.current_school_admission_date}T00:00:00`
                        : null,

                dob:
                    form.dob
                        ? `${form.dob}T00:00:00`
                        : null,

                retirement_date:
                    form.retirement_date
                        ? `${form.retirement_date}T00:00:00`
                        : null
            };

            let response;

            if (staff) {

                response = await api.put(
                    `/admin/staff/${staff.id}`,
                    payload
                );

            } else {

                response = await api.post(
                    "/admin/staff",
                    payload
                );
            }

            onSuccess(response.data);

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.detail ||
                "Unable to save staff."
            );

        } finally {

            setSaving(false);

        }
    };

    return (
        <div className="staff-modal-overlay">

            <div className="staff-modal">

                <div className="staff-modal-header">

                    <h2>
                        {staff
                            ? "Edit Staff"
                            : "Add Staff"}
                    </h2>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onCancel}
                    >
                        ×
                    </button>

                </div>

                {error && (
                    <div className="staff-error">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="staff-form"
                >

                    {/* PHOTO */}

                    <div className="staff-photo-upload">

                        <label>
                            Teacher Photo
                        </label>

                        <div className="staff-photo-preview">

                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt={
                                        form.name ||
                                        "Teacher"
                                    }
                                />
                            ) : (
                                <div className="photo-placeholder">
                                    No Photo
                                </div>
                            )}

                        </div>

                        <div className="photo-actions">

                            <label className="btn-secondary upload-button">

                                {uploadingPhoto
                                    ? "Uploading..."
                                    : "Choose Photo"}

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={
                                        handlePhotoUpload
                                    }
                                    disabled={
                                        uploadingPhoto
                                    }
                                    hidden
                                />

                            </label>

                            {photoPreview && (
                                <button
                                    type="button"
                                    className="btn-delete"
                                    onClick={removePhoto}
                                    disabled={
                                        uploadingPhoto
                                    }
                                >
                                    Remove
                                </button>
                            )}

                        </div>

                    </div>


                    <div className="form-grid">

                        <div className="form-group">
                            <label>
                                Teacher Code
                            </label>

                            <input
                                name="teacher_code"
                                value={
                                    form.teacher_code
                                }
                                onChange={
                                    handleChange
                                }                                
                            />
                        </div>


                        <div className="form-group">
                            <label>
                                GPF / PRAN
                            </label>

                            <input
                                name="gpf_pran"
                                value={
                                    form.gpf_pran
                                }
                                onChange={
                                    handleChange
                                }                                
                            />
                        </div>


                        <div className="form-group form-full">
                            <label>
                                Teacher Name *
                            </label>

                            <input
                                name="name"
                                value={form.name}
                                onChange={
                                    handleChange
                                }
                                required
                            />
                        </div>


                        <div className="form-group form-full">
                            <label>
                                Address
                            </label>

                            <textarea
                                name="address"
                                value={
                                    form.address
                                }
                                onChange={
                                    handleChange
                                }
                                rows="3"
                            />
                        </div>


                        <div className="form-group">
                            <label>
                                Mobile *
                            </label>

                            <input
                                name="mobile_number"
                                value={
                                    form.mobile_number
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />
                        </div>


                        <div className="form-group">
                            <label>
                                Designation *
                            </label>

                            <input
                                name="designation"
                                value={
                                    form.designation
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />
                        </div>


                        <div className="form-group">
                            <label>
                                Gender *
                            </label>

                            <select
                                name="gender"
                                value={form.gender}
                                onChange={
                                    handleChange
                                }
                                required
                            >
                                <option value="">
                                    Select Gender
                                </option>

                                 <option value="પુ">
                                    પુ
                                </option>

                                <option value="સ્ત્રી">
                                    સ્ત્રી
                                </option>

                                <option value="અન્ય">
                                    અન્ય
                                </option>
                            </select>
                        </div>


                        <div className="form-group">
                            <label>
                                Category
                            </label>

                            <select
                                name="teacher_cast"
                                value={form.teacher_cast}
                                onChange={
                                    handleChange
                                }
                            >
                                <option value="">
                                    Select Category
                                </option>

                                <option value="SC">
                                    SC
                                </option>

                                <option value="ST">
                                    ST
                                </option>

                                <option value="SEBC">
                                    SEBC
                                </option>

                                <option value="EWS">
                                    EWS
                                </option>

                                <option value="OPEN">
                                    OPEN
                                </option>
                            </select>
                        </div>


                        <div className="form-group">
                            <label>
                                Qualification
                            </label>

                            <input
                                name="qualifications"
                                value={
                                    form.qualifications
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>


                        <div className="form-group">
                            <label>
                                Employee Code
                            </label>

                            <input
                                name="employee_code"
                                value={
                                    form.employee_code
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>


                        <div className="form-group">
                            <label>
                                Date of Birth
                            </label>

                            <input
                                type="date"
                                name="dob"
                                value={form.dob}
                                onChange={
                                    handleChange
                                }
                            />
                        </div>


                        <div className="form-group">
                            <label>
                                Account Entered Date
                            </label>

                            <input
                                type="date"
                                name="account_entered_date"
                                value={
                                    form.account_entered_date
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>


                        <div className="form-group">
                            <label>
                                Regular Pay Scale Date
                            </label>

                            <input
                                type="date"
                                name="regular_pay_scale_date"
                                value={
                                    form.regular_pay_scale_date
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>


                        <div className="form-group">
                            <label>
                                Current School Admission Date
                            </label>

                            <input
                                type="date"
                                name="current_school_admission_date"
                                value={
                                    form.current_school_admission_date
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>


                        <div className="form-group">
                            <label>
                                Retirement Date
                            </label>

                            <input
                                type="date"
                                name="retirement_date"
                                value={
                                    form.retirement_date
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>
                                Teacher Order
                            </label>

                            <input
                                type="number"
                                name="teacher_order"
                                min="0"
                                value={form.teacher_order}
                                onChange={
                                    handleChange
                                }
                            />

                            <small>
                                Lower number appears first.
                            </small>
                        </div>

                        <div className="form-group">
                            <label>
                                Status
                            </label>

                            <select
                                name="status"
                                value={form.status}
                                onChange={
                                    handleChange
                                }
                            >
                                <option value="published">
                                    Published
                                </option>

                                <option value="draft">
                                    Draft
                                </option>
                            </select>
                        </div>

                    </div>


                    <div className="staff-form-actions">

                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={
                                saving ||
                                uploadingPhoto
                            }
                        >
                            {saving
                                ? "Saving..."
                                : staff
                                    ? "Update Staff"
                                    : "Save Staff"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default StaffForm;