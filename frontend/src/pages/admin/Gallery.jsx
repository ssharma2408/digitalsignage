import { useEffect, useState } from "react";
import api from "../../api/axios";
import { API_URL } from "../../config";
import "./Gallery.css";
import ImageCropModal from "../../components/ImageCropModal";

const EMPTY_ITEM = {
    image_url: "",
    caption: "",
    item_order: 1,
};

function getImageUrl(url) {
    if (!url) return "";

    // Existing absolute URLs continue to work
    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    // New relative URLs
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

    const [cropImage, setCropImage] = useState(null);
    const [cropIndex, setCropIndex] = useState(null);

    const [form, setForm] = useState({
        title: "",
        slug: "",
        status: "published",
        page_order: 0,
        show_title: true,
        items: [],
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

    /*
     * Reset the form.
     *
     * IMPORTANT:
     * Start with ZERO images.
     * Admin adds images using "+ Add Image".
     */
    function resetForm() {
        setEditingId(null);

        setForm({
            title: "",
            slug: "",
            status: "published",
            page_order: 0,
            show_title: true,
            items: [],
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
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
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleShowTitleChange(event) {
        const checked = event.target.checked;

        setForm((prev) => ({
            ...prev,
            show_title: checked,
        }));
    }

    /*
     * Add one new image slot.
     *
     * Maximum = 9.
     */
    function addImage() {
        if (form.items.length >= 9) {
            alert("Maximum 9 images allowed.");
            return;
        }

        setForm((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    ...EMPTY_ITEM,
                    item_order: prev.items.length + 1,
                },
            ],
        }));
    }

    /*
     * Remove an image slot completely.
     */
    function removeImage(index) {
        setForm((prev) => {
            const items = prev.items
                .filter((_, i) => i !== index)
                .map((item, i) => ({
                    ...item,
                    item_order: i + 1,
                }));

            return {
                ...prev,
                items,
            };
        });
    }

    /*
     * Update image_url / caption.
     */
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

    /*
     * Upload image.
     *
     * Current backend response expected:
     * response.data.data[0].src
     */
    const handleImageSelect = (event, index) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        // Basic validation
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            return;
        }

        // Create temporary browser URL
        const imageUrl = URL.createObjectURL(file);

        setCropImage(imageUrl);
        setCropIndex(index);

        // Allow selecting the same image again
        event.target.value = "";
    };

    const handleCropComplete = async (croppedBlob) => {
        if (cropIndex === null) {
            return;
        }

        try {
            const file = new File(
                [croppedBlob],
                `gallery-${Date.now()}.jpg`,
                {
                    type: "image/jpeg",
                }
            );

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
                throw new Error(
                    "Upload response did not contain image URL."
                );
            }

            updateItem(
                cropIndex,
                "image_url",
                uploadedUrl
            );

            // Close crop modal
            setCropImage(null);
            setCropIndex(null);

        } catch (error) {
            console.error(
                "Cropped image upload failed:",
                error
            );

            alert("Image upload failed.");
        }
    };

    /*
     * Edit existing gallery.
     *
     * IMPORTANT:
     * Do NOT create 9 empty slots.
     * Load only the images that actually exist.
     */
    async function editGallery(id) {
        try {
            setLoading(true);

            const response = await api.get(
                `/admin/gallery/${id}`
            );

            const gallery = response.data;

            const items = (gallery.items || [])
                .slice(0, 9)
                .sort(
                    (a, b) =>
                        (a.item_order || 0) -
                        (b.item_order || 0)
                )
                .map((item, index) => ({
                    image_url: item.image_url || "",
                    caption: item.caption || "",
                    item_order:
                        index + 1,
                }));

            setForm({
                title: gallery.title || "",
                slug: gallery.slug || "",
                status:
                    gallery.status || "published",
                page_order:
                    gallery.page_order ?? 0,

                /*
                 * Existing galleries created before
                 * show_title was added remain visible.
                 */
                show_title:
                    gallery.show_title ?? true,

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

    /*
     * Save / Update gallery.
     */
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

        /*
         * Gallery must contain at least 1 image.
         */
        if (form.items.length < 1) {
            alert(
                "Please add at least 1 image to the gallery."
            );
            return;
        }

        /*
         * Maximum 9.
         */
        if (form.items.length > 9) {
            alert(
                "Maximum 9 images are allowed."
            );
            return;
        }

        /*
         * Make sure every added slot has an image.
         */
        const emptyImage = form.items.find(
            (item) => !item.image_url
        );

        if (emptyImage) {
            alert(
                "Please upload an image for every added image slot."
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

                /*
                 * IMPORTANT:
                 * Send checkbox value to backend.
                 */
                show_title: Boolean(
                    form.show_title
                ),

                /*
                 * 1–9 images.
                 *
                 * Caption remains optional.
                 */
                items: form.items.map(
                    (item, index) => ({
                        image_url:
                            item.image_url,

                        caption:
                            item.caption?.trim() ||
                            null,

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

            console.error(
                "Backend response:",
                error.response?.data
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

            {/* =========================
                HEADER
            ========================== */}

            <div className="gallery-admin-header">

                <div>
                    <h1>
                        {editingId
                            ? "Edit Gallery"
                            : "Create Gallery"}
                    </h1>

                    <p>
                        Add 1 to 9 images to each
                        gallery.
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

            {/* =========================
                FORM
            ========================== */}

            <form
                className="gallery-form"
                onSubmit={saveGallery}
            >

                <div className="gallery-form-fields">

                    {/* Gallery Title */}

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
                            placeholder="Annual Function 2026"
                        />

                    </div>

                    {/* Show Title Checkbox */}

                    <label className="gallery-checkbox">

                        <input
                            type="checkbox"
                            checked={
                                Boolean(
                                    form.show_title
                                )
                            }
                            onChange={
                                handleShowTitleChange
                            }
                        />

                        <span>
                            Show Gallery Title on
                            Public Page
                        </span>

                    </label>

                    {/* Slug */}

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
                            placeholder="annual-function-2026"
                        />

                    </div>

                    {/* Status */}

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

                    {/* Display Order */}

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

                {/* =========================
                    IMAGE SECTION HEADER
                ========================== */}

                <div className="gallery-images-header">

                    <div>
                        <h2>
                            Gallery Images
                        </h2>

                        <p>
                            {form.items.length}
                            {" "}of 9 images added
                        </p>
                    </div>

                    <button
                        type="button"
                        className="gallery-btn primary"
                        onClick={addImage}
                        disabled={
                            form.items.length >=
                            9
                        }
                    >
                        + Add Image
                    </button>

                </div>

                {/* =========================
                    IMAGE GRID
                ========================== */}

                {form.items.length === 0 ? (

                    <div className="gallery-empty-editor">

                        <div className="gallery-upload-icon">
                            +
                        </div>

                        <p>
                            No images added yet.
                        </p>

                        <button
                            type="button"
                            className="gallery-btn primary"
                            onClick={addImage}
                        >
                            + Add First Image
                        </button>

                    </div>

                ) : (

                    <div className="gallery-editor-grid">

                        {form.items.map(
                            (item, index) => (

                                <div
                                    className="gallery-editor-card"
                                    key={
                                        item.id ||
                                        `new-${index}`
                                    }
                                >

                                    {/* Number */}

                                    <div className="gallery-slot-number">

                                        {index + 1}

                                    </div>

                                    {/* Image */}

                                    {item.image_url ? (

                                        <div className="gallery-image-preview">

                                            <img
                                                src={getImageUrl(
                                                    item.image_url
                                                )}
                                                alt={
                                                    item.caption ||
                                                    `Gallery image ${
                                                        index +
                                                        1
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
                                                Remove Image
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
                                                onChange={(event) => handleImageSelect(event, index)}
                                            />

                                        </label>

                                    )}

                                    {/* Caption */}

                                    <div className="gallery-caption-field">

                                        <label>
                                            Caption
                                            <span>
                                                {" "}
                                                (Optional)
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                item.caption ||
                                                ""
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
                                            placeholder="Enter image caption (optional)"
                                        />

                                    </div>

                                    {/* Remove Slot */}

                                    <button
                                        type="button"
                                        className="gallery-btn delete"
                                        onClick={() =>
                                            removeImage(
                                                index
                                            )
                                        }
                                    >
                                        Remove Image Slot
                                    </button>

                                </div>

                            )
                        )}

                    </div>

                )}

                {/* =========================
                    SAVE BUTTONS
                ========================== */}

                <div className="gallery-form-actions">

                    <button
                        type="submit"
                        className="gallery-btn primary"
                        disabled={
                            saving ||
                            form.items.length === 0
                        }
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

            {/* =========================
                EXISTING GALLERIES
            ========================== */}

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
                                        Public Title
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

                                                {gallery.show_title ??
                                                true
                                                    ? "Yes"
                                                    : "No"}

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
                                                }

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
            {cropImage && (
                <ImageCropModal
                    image={cropImage}
                    aspect={16 / 9}
                    onCancel={() => {
                        URL.revokeObjectURL(cropImage);
                        setCropImage(null);
                        setCropIndex(null);
                    }}
                    onComplete={handleCropComplete}
                />
            )}
        </div>
    );
}