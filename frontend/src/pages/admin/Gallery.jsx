import { useEffect, useState } from "react";
import api from "../../api/axios";
import { API_URL } from "../../config";
import "./Gallery.css";

const EMPTY_ITEM = {
    image_url: "",
    caption: "",
    item_order: 0,
};

function createEmptyItems() {
    return Array.from({ length: 9 }, (_, index) => ({
        ...EMPTY_ITEM,
        item_order: index + 1,
    }));
}

function getImageUrl(url) {
    if (!url) return "";

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function createSlug(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export default function GalleryAdmin() {
    const [galleries, setGalleries] = useState([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        title: "",
        slug: "",
        status: "published",
        page_order: 0,
        items: createEmptyItems(),
    });

    useEffect(() => {
        loadGalleries();
    }, []);

    async function loadGalleries() {
        try {
            setLoading(true);

            const response = await api.get("/admin/gallery");

            setGalleries(response.data || []);
        } catch (error) {
            console.error("Error loading galleries:", error);

            alert(
                error.response?.data?.detail ||
                "Failed to load galleries."
            );
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setEditingId(null);

        setForm({
            title: "",
            slug: "",
            status: "published",
            page_order: 0,
            items: createEmptyItems(),
        });
    }

    function handleTitleChange(event) {
        const title = event.target.value;

        setForm((prev) => ({
            ...prev,
            title,
            slug: editingId
                ? prev.slug
                : createSlug(title),
        }));
    }

    function handleFieldChange(event) {
        const { name, value } = event.target.value !== undefined
            ? event.target
            : {};

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function updateItem(index, field, value) {
        setForm((prev) => {
            const items = [...prev.items];

            items[index] = {
                ...items[index],
                [field]: value,
            };

            return {
                ...prev,
                items,
            };
        });
    }

    async function uploadImage(index, file) {
        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert(
                "Please select a JPG, PNG, WEBP or GIF image."
            );
            return;
        }

        try {
            const formData = new FormData();

            formData.append("file", file);

            const response = await api.post(
                "/admin/media/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const uploadedUrl =
                response.data?.data?.[0]?.src;

            if (!uploadedUrl) {
                console.error(
                    "Unexpected upload response:",
                    response.data
                );

                alert("Image upload failed.");
                return;
            }

            updateItem(
                index,
                "image_url",
                uploadedUrl
            );
        } catch (error) {
            console.error(
                "Image upload error:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Image upload failed."
            );
        }
    }

    function removeImage(index) {
        updateItem(index, "image_url", "");
    }

    async function editGallery(id) {
        try {
            setLoading(true);

            const response = await api.get(
                `/admin/gallery/${id}`
            );

            const gallery = response.data;

            const items = Array.from(
                { length: 9 },
                (_, index) => {
                    const existingItem =
                        gallery.items?.find(
                            (item) =>
                                item.item_order ===
                                index + 1
                        );

                    return (
                        existingItem || {
                            ...EMPTY_ITEM,
                            item_order: index + 1,
                        }
                    );
                }
            );

            setForm({
                title: gallery.title || "",
                slug: gallery.slug || "",
                status:
                    gallery.status || "published",
                page_order:
                    gallery.page_order || 0,
                items,
            });

            setEditingId(gallery.id);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } catch (error) {
            console.error(
                "Error loading gallery:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Failed to load gallery."
            );
        } finally {
            setLoading(false);
        }
    }

    async function saveGallery(event) {
        event.preventDefault();

        if (!form.title.trim()) {
            alert("Please enter gallery title.");
            return;
        }

        if (!form.slug.trim()) {
            alert("Please enter gallery slug.");
            return;
        }

        const emptyImage = form.items.find(
            (item) => !item.image_url
        );

        if (emptyImage) {
            alert(
                "Please upload images for all 9 gallery slots."
            );
            return;
        }

        try {
            setSaving(true);

            const payload = {
                title: form.title.trim(),
                slug: form.slug.trim(),
                status: form.status,
                page_order: Number(
                    form.page_order
                ),
                items: form.items.map(
                    (item, index) => ({
                        image_url:
                            item.image_url,
                        caption:
                            item.caption || "",
                        item_order:
                            index + 1,
                    })
                ),
            };

            if (editingId) {
                await api.put(
                    `/admin/gallery/${editingId}`,
                    payload
                );

                alert(
                    "Gallery updated successfully."
                );
            } else {
                await api.post(
                    "/admin/gallery",
                    payload
                );

                alert(
                    "Gallery created successfully."
                );
            }

            resetForm();
            await loadGalleries();
        } catch (error) {
            console.error(
                "Error saving gallery:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Failed to save gallery."
            );
        } finally {
            setSaving(false);
        }
    }

    async function deleteGallery(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this gallery?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/admin/gallery/${id}`
            );

            alert(
                "Gallery deleted successfully."
            );

            if (editingId === id) {
                resetForm();
            }

            await loadGalleries();
        } catch (error) {
            console.error(
                "Error deleting gallery:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Failed to delete gallery."
            );
        }
    }

    return (
        <div className="gallery-admin">

            {/* HEADER */}

            <div className="gallery-admin-header">
                <div>
                    <h1>
                        {editingId
                            ? "Edit Gallery"
                            : "Create Gallery"}
                    </h1>

                    <p>
                        Each gallery contains exactly
                        9 images in a 3 × 3 layout.
                    </p>
                </div>

                {editingId && (
                    <button
                        type="button"
                        className="gallery-btn secondary"
                        onClick={resetForm}
                    >
                        + New Gallery
                    </button>
                )}
            </div>

            {/* FORM */}

            <form
                className="gallery-form"
                onSubmit={saveGallery}
            >

                <div className="gallery-form-fields">

                    <div className="gallery-field">
                        <label>
                            Gallery Title
                        </label>

                        <input
                            type="text"
                            value={form.title}
                            onChange={
                                handleTitleChange
                            }
                            placeholder="Annual Function"
                        />
                    </div>

                    <div className="gallery-field">
                        <label>
                            Slug
                        </label>

                        <input
                            type="text"
                            name="slug"
                            value={form.slug}
                            onChange={
                                handleFieldChange
                            }
                            placeholder="annual-function"
                        />
                    </div>

                    <div className="gallery-field">
                        <label>
                            Status
                        </label>

                        <select
                            name="status"
                            value={form.status}
                            onChange={
                                handleFieldChange
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

                    <div className="gallery-field">
                        <label>
                            Display Order
                        </label>

                        <input
                            type="number"
                            name="page_order"
                            value={
                                form.page_order
                            }
                            onChange={
                                handleFieldChange
                            }
                            min="0"
                        />
                    </div>

                </div>

                {/* 3 x 3 GRID */}

                <div className="gallery-editor-grid">

                    {form.items.map(
                        (item, index) => (
                            <div
                                className="gallery-editor-card"
                                key={index}
                            >

                                <div className="gallery-slot-number">
                                    {index + 1}
                                </div>

                                {item.image_url ? (
                                    <div className="gallery-image-preview">

                                        <img
                                            src={getImageUrl(
                                                item.image_url
                                            )}
                                            alt={
                                                item.caption ||
                                                `Gallery ${
                                                    index + 1
                                                }`
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="gallery-remove-image"
                                            onClick={() =>
                                                removeImage(
                                                    index
                                                )
                                            }
                                        >
                                            Remove
                                        </button>

                                    </div>
                                ) : (
                                    <label className="gallery-upload-box">

                                        <span className="gallery-upload-icon">
                                            +
                                        </span>

                                        <span>
                                            Upload Image
                                        </span>

                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            onChange={(
                                                event
                                            ) =>
                                                uploadImage(
                                                    index,
                                                    event
                                                        .target
                                                        .files?.[0]
                                                )
                                            }
                                        />

                                    </label>
                                )}

                                <div className="gallery-caption-field">

                                    <label>
                                        Caption
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            item.caption
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateItem(
                                                index,
                                                "caption",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter image caption"
                                    />

                                </div>

                            </div>
                        )
                    )}

                </div>

                {/* SAVE */}

                <div className="gallery-form-actions">

                    <button
                        type="submit"
                        className="gallery-btn primary"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : editingId
                            ? "Update Gallery"
                            : "Create Gallery"}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            className="gallery-btn secondary"
                            onClick={resetForm}
                        >
                            Cancel
                        </button>
                    )}

                </div>

            </form>

            {/* EXISTING GALLERIES */}

            <div className="gallery-list-section">

                <div className="gallery-list-header">
                    <h2>
                        Existing Galleries
                    </h2>
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : galleries.length === 0 ? (
                    <div className="gallery-empty">
                        No galleries found.
                    </div>
                ) : (
                    <div className="gallery-table-wrapper">

                        <table className="gallery-table">

                            <thead>
                                <tr>
                                    <th>
                                        Order
                                    </th>

                                    <th>
                                        Title
                                    </th>

                                    <th>
                                        Slug
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Images
                                    </th>

                                    <th>
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {galleries.map(
                                    (gallery) => (
                                        <tr
                                            key={
                                                gallery.id
                                            }
                                        >

                                            <td>
                                                {
                                                    gallery.page_order
                                                }
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        gallery.title
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    gallery.slug
                                                }
                                            </td>

                                            <td>
                                                <span
                                                    className={`gallery-status ${
                                                        gallery.status
                                                    }`}
                                                >
                                                    {
                                                        gallery.status
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                {
                                                    gallery
                                                        .items
                                                        ?.length ||
                                                    0
                                                }{" "}
                                                / 9
                                            </td>

                                            <td>

                                                <div className="gallery-actions">

                                                    <button
                                                        type="button"
                                                        className="gallery-btn edit"
                                                        onClick={() =>
                                                            editGallery(
                                                                gallery.id
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="gallery-btn delete"
                                                        onClick={() =>
                                                            deleteGallery(
                                                                gallery.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
}