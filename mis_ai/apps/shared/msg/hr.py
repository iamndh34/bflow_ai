"""system module"""
from django.utils.translation import gettext_lazy as _


class HRMsg:  # pylint: disable=too-few-public-methods
    """HR message translation"""
    GROUP_LEVEL_CREATE = _('Group level create successfully')
    GROUP_LEVEL_UPDATE = _('Group level update successfully')
    GROUP_CREATE = _('Group create successfully')
    GROUP_UPDATE = _('Group update successfully')
    GROUP_DELETE = _('Group delete successfully')
    EMPLOYEE_CREATE = _('Employee create successfully')
    EMPLOYEE_UPDATE = _('Employee update successfully')
    SHIFT_CREATE = _('Shift create successfully')
    PAYROLL_CONFIG_UPDATE = _('Payroll config update successfully')
