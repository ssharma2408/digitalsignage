import time
from typing import Any


class TTLCache:
    def __init__(self):
        self._cache = {}

    def get(self, key: str):
        item = self._cache.get(key)

        if item is None:
            return None

        value, expires_at = item

        # Expired
        if time.time() >= expires_at:
            del self._cache[key]
            return None

        return value
    ''' ttl 300 = 5 min '''
    def set(self, key: str, value: Any, ttl: int = 300):
        self._cache[key] = (
            value,
            time.time() + ttl
        )

    def delete(self, key: str):
        self._cache.pop(key, None)

    def clear(self):
        self._cache.clear()


cache = TTLCache()