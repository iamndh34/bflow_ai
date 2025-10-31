"""system module"""
from django.utils.translation import gettext_lazy as _


class PermsMsg:  # pylint: disable=too-few-public-methods
    """translate message Permission"""
    USER = _('User')
    USER_STAFF = _('User\'s staff (lower grade)')
    ALL_STAFF = _('All staff in their group')
    ALL_USER = _('All users')
