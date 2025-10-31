"""system module"""
from django.utils.translation import gettext_lazy as _


class ReportMsg:  # pylint: disable=too-few-public-methods
    """Sale report message translation"""
    QUARTER_FIRST = _('The first quarter')
    QUARTER_SECOND = _('The second quarter')
    QUARTER_THIRD = _('The third quarter')
    QUARTER_FOURTH = _('The fourth quarter')
    MONTH_JANUARY = _('January')
    MONTH_FEBRUARY = _('February')
    MONTH_MARCH = _('March')
    MONTH_APRIL = _('April')
    MONTH_MAY = _('May')
    MONTH_JUNE = _('June')
    MONTH_JULY = _('July')
    MONTH_AUGUST = _('August')
    MONTH_SEPTEMBER = _('September')
    MONTH_OCTOBER = _('October')
    MONTH_NOVEMBER = _('November')
    MONTH_DECEMBER = _('December')
