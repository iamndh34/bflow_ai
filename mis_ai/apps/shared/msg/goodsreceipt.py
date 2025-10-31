"""system module"""
from django.utils.translation import gettext_lazy as _


class GRMsg:  # pylint: disable=too-few-public-methods
    """Goods receipt message translation"""
    TYPE_FOR_PO = _('For purchase order')
    TYPE_FOR_IA = _('For inventory adjustment')
    TYPE_FOR_PRODUCT = _('For production')
    TYPE_FOR_PM = _('For product modification')
