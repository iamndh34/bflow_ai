"""system module"""
from django.utils.translation import gettext_lazy as _


class ServerMsg:  # pylint: disable=too-few-public-methods
    """message error translation"""
    SERVER_ERR = _('Server errors')
    URL_INVALID = _('Url is invalid')

