"""system module"""
from django.utils.translation import gettext_lazy as _


class ProductionMsg:  # pylint: disable=too-few-public-methods
    """Production apps message translation"""
    TYPE_FOR_PO = _('General production')
    TYPE_FOR_WO = _('Production for orders')
