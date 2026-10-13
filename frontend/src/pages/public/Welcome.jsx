import { useEffect, useState } from "react";
import { getCachedApiData } from "../../utils/cachedApi";

export default function Welcome() {
    const [welcome, setWelcome] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadWelcome() {
            try {
                const data = await getCachedApiData(
                    "/public/welcome",
                    "public_welcome",
                    120 * 60 * 1000 // 30 minutes
                );

                if (active) {
                    setWelcome(data);
                }
            } catch (err) {
                if (active) {
                    setError("Unable to load Welcome page.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadWelcome();

        return () => {
            active = false;
        };
    }, []);

    if (loading) return <p>Loading Welcome page...</p>;
    if (error) return <p>{error}</p>;
    if (!welcome) return null;

    return (
        <div>
            <style>{welcome.css}</style>

            <div
                dangerouslySetInnerHTML={{
                    __html: welcome.html || ""
                }}
            />
        </div>
    );
}
