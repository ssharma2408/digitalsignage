import { useEffect, useState } from "react";
import api from "../../api/axios";

function Welcome() {

    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadWelcome = async () => {

            try {

                const response = await api.get(
                    "/public/welcome"
                );

                setPage(response.data);

            } catch (error) {

                console.error(
                    "Failed to load welcome page:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        loadWelcome();

    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!page) {
        return <div>Welcome page not available.</div>;
    }

    return (
        <>
            <style>
                {page.css}
            </style>

            <div
                dangerouslySetInnerHTML={{
                    __html: page.html
                }}
            />
        </>
    );
}

export default Welcome;