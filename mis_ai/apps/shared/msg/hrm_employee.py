"""system module"""
from django.utils.translation import gettext_lazy as _


class HRMMsg:  # pylint: disable=too-few-public-methods
    """HRM message translation"""
    HRM_EMPLOYEE_INFO = _('Employee info')
    HRM_REQUEST_SIGNING = _('Contract request signing successfully')
    HRM_SIGNED = _('Signed successfully')
    HRM_OVERTIME = _('Overtime request')
    HRM_PAYROLL_TEMPLATE = _('Payroll template')
    HRM_TEMPLATE_ATTRIBUTE = _('Template attribute')
