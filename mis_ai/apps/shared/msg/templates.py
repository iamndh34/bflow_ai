__all__ = ['TemplateMsg']

from django.utils.translation import gettext_lazy as _


class TemplateMsg:
    welcome_template = _('Welcome Template')
    calendar_template = _('Calendar Template')
    otp_validate_template = _('OTP Validation Template')

    welcome_template_remark_1 = _(
        'This is the email configuration used to send welcome messages to new members of your organization.'
    )
    welcome_template_remark_2 = _(
        "It is used in \"automation rule configuration\" when a new \"user\" or function creation event occurs "
         "custom mailing capabilities if available."
    )

    calendar_template_remark_1 = _("This is the email configuration used to send event calendar registration files.")

    otp_validate_template_remark_1 = _("This is the email configuration used to send OTP to authenticate users.")
