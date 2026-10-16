import { useEffect, useState } from "react";
import { getCachedApiData } from "../../utils/cachedApi";
import "./SignagePlayer.css";

const DISPLAY_INTERVAL = 20_000; // 20 seconds

export default function SignagePlayer() {
    const [pages, setPages] = useState([
        {
            id: "welcome",
            title: "Welcome",
            url: "/welcome",
        },
        {
            id: "staff",
            title: "Staff",
            url: "/staff",
        },
        {
            id: "attendance",
            title: "Attendance",
            url: "/attendance",
        },
    ]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        
        async function loadGalleries() {
            try {
                const galleries = await getCachedApiData(
                    "/public/gallery",
                    "public_gallery_list",
                    120 * 60 * 1000 // 30 minutes
                );

                const galleryPages = (galleries || [])
                    .filter((gallery) => gallery.status === "published")
                    .map((gallery) => ({
                        id: `gallery-${gallery.id}`,
                        title: gallery.title,
                        url: `/gallery/${encodeURIComponent(gallery.slug)}`,
                    }));

                if (!cancelled) {
                    setPages([
                        {
                            id: "welcome",
                            title: "Welcome",
                            url: "/welcome",
                        },
                        {
                            id: "staff",
                            title: "Staff",
                            url: "/staff",
                        },
                        {
                            id: "attendance",
                            title: "Attendance",
                            url: "/attendance",
                        },
                        ...galleryPages,
                    ]);

                    setError("");
                }
            } catch (err) {
                console.error("Failed to load galleries:", err);

                if (!cancelled) {
                    setError(
                        "Gallery list could not be loaded. Showing available pages."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }


        loadGalleries();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (pages.length <= 1) return;

        const timer = window.setInterval(() => {
            setCurrentIndex((previousIndex) => {
                return (previousIndex + 1) % pages.length;
            });
        }, DISPLAY_INTERVAL);

        return () => window.clearInterval(timer);
    }, [pages.length]);

    // Keep the index valid if the playlist changes.
    const safeIndex = currentIndex % pages.length;
    const currentPage = pages[safeIndex];

    return (
        <main className="signage-player">
            {loading && (
                <div className="signage-status">
                    Loading signage playlist...
                </div>
            )}

            {error && (
                <div className="signage-error">
                    {error}
                </div>
            )}

            {currentPage && (
                <iframe
                    key={currentPage.id}
                    className="signage-frame"
                    src={currentPage.url}
                    title={currentPage.title}
                    allow="fullscreen"
                />
            )}
        </main>
    );
}