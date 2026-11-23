"""Limitation du nombre de tentatives (rate limiting), en mémoire.

Sans limite, un code à 6 chiffres (900 000 possibilités) ou un mot de passe peut être
deviné en envoyant des milliers de requêtes. On autorise N appels par fenêtre de temps
et par adresse IP ; au-delà, l'API répond 429 Too Many Requests.

Limite connue : le compteur vit dans la mémoire du processus. Avec plusieurs instances du
serveur, il faudrait un stockage partagé (Redis). Pour une instance unique, c'est suffisant.
"""
import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException, Request, status


class RateLimiter:
    def __init__(self, max_calls: int, period_seconds: int):
        self.max_calls = max_calls
        self.period = period_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def __call__(self, request: Request) -> None:
        # Derrière un hébergeur (Render, Fly...), lancer uvicorn avec --proxy-headers
        # pour que request.client.host soit la vraie IP du client et non celle du proxy.
        ip = request.client.host if request.client else "unknown"
        key = f"{request.url.path}:{ip}"
        now = time.monotonic()
        with self._lock:
            hits = self._hits[key]
            while hits and now - hits[0] > self.period:  # on oublie les appels trop anciens
                hits.popleft()
            if len(hits) >= self.max_calls:
                retry_after = int(self.period - (now - hits[0])) + 1
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Trop de tentatives, réessaie dans quelques minutes",
                    headers={"Retry-After": str(retry_after)},
                )
            hits.append(now)

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


login_limiter = RateLimiter(max_calls=10, period_seconds=60)
signup_limiter = RateLimiter(max_calls=5, period_seconds=600)
verify_limiter = RateLimiter(max_calls=10, period_seconds=600)
resend_limiter = RateLimiter(max_calls=3, period_seconds=600)

ALL_LIMITERS = (login_limiter, signup_limiter, verify_limiter, resend_limiter)
