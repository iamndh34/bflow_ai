from rest_framework.permissions import IsAuthenticated


class IsAuthenticatedDisableOptionsPermission(IsAuthenticated):
    """
    Global permission to disallow all requests for method OPTIONS.
    """

    def has_permission(self, request, view):
        if request.method == 'OPTIONS':
            return False
        return True
