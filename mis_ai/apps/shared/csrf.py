from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny


class APIAllowAny(AllowAny):
    ...


class CSRFCheckSessionAuthentication(SessionAuthentication):
    def authenticate(self, request):
        self.enforce_csrf(request)
        return super().authenticate(request)
