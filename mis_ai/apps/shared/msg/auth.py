"""system module"""
from django.utils.translation import gettext_lazy as _


class AuthMsg:  # pylint: disable=too-few-public-methods
    """authentication translation"""
    login_exc = _('Setup login return exception')
    login_success = _('Login successfully')
    KEY_TENANT_CODE = _('tenant_code')
    KEY_DETAIL = _('detail')
    AUTH_EXPIRE = _('The session login was expired.')

    USERNAME_OR_PASSWORD_INCORRECT = _('Username and password are incorrect.')
    USERNAME_ALREADY_EXISTS = _('A user with that username already exists.')
    USERNAME_REQUIRE = _('Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.')
