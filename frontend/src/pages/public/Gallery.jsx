import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import { API_URL } from "../../config";
import "./PublicGallery.css";

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

export default function Gallery() {
    const { slug } = useParams();

    const [gallery, setGallery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadGallery();
    }, [slug]);

    async function loadGallery() {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/public/${slug}`
            );

            setGallery(response.data);
        } catch (error) {
            console.error(
                "Error loading gallery:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Gallery not found."
            );
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="public-gallery-loading">
                Loading gallery...
            </div>
        );
    }

    if (error || !gallery) {
        return (
            <div className="public-gallery-error">
                <h2>
                    {error || "Gallery not found"}
                </h2>

                <Link to="/gallery">
                    Back to Galleries
                </Link>
            </div>
        );
    }

    return (
        <div className="public-gallery-page">

            <header className="public-gallery-header">
                <h1>
                    {gallery.title}
                </h1>
            </header>

            <main className="public-gallery-grid">

                {gallery.items
                    ?.sort(
                        (a, b) =>
                            a.item_order -
                            b.item_order
                    )
                    .map((item) => (
                        <div
                            className="public-gallery-item"
                            key={item.id}
                        >

                            <div className="public-gallery-image">
                                <img
                                    src={getImageUrl(
                                        item.image_url
                                    )}
                                    alt={
                                        item.caption ||
                                        gallery.title
                                    }
                                />
                            </div>

                            <div className="public-gallery-caption">
                                {item.caption}
                            </div>

                        </div>
                    ))}

            </main>

        </div>
    );
}