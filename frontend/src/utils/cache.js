export function getCachedData(key, maxAge = 10 * 60 * 1000) {
    try {
        const cached = localStorage.getItem(key);

        if (!cached) {
            return null;
        }

        const data = JSON.parse(cached);

        if (Date.now() - data.timestamp > maxAge) {
            localStorage.removeItem(key);
            return null;
        }

        return data.value;
    } catch (error) {
        console.error("Cache read error:", error);
        return null;
    }
}

export function setCachedData(key, value) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify({
                timestamp: Date.now(),
                value
            })
        );
    } catch (error) {
        console.error("Cache write error:", error);
    }
}