"""system module"""
from django.utils.translation import gettext_lazy as _


class PurchasingMsg:  # pylint: disable=too-few-public-methods
    """Purchasing message translation"""
    PURCHASE_REQUEST_CREATE = _('Purchase request create successfully')
    PURCHASE_REQUEST_UPDATE = _('Purchase request update successfully')
    PO_GR_NONE = _('Not receipt yet')
    PO_GR_WAIT = _('Wait')
    PO_GR_PART = _('Partially received')
    PO_GR_RECEIVED = _('Received')
