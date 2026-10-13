import { getCachedData, setCachedData } from "./cache";
import api from "../api/axios";

export async function getCachedApiData(
    url,
    cacheKey,
    maxAge = 10 * 60 * 1000
) {
    const cached = getCachedData(cacheKey, maxAge);

    if (cached !== null) {
        return cached;
    }

    const response = await api.get(url);

    setCachedData(cacheKey, response.data);

    return response.data;
}
