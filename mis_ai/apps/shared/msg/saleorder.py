"""system module"""
from django.utils.translation import gettext_lazy as _


class SOMsg:  # pylint: disable=too-few-public-methods
    """Sale order message translation"""
    DELIVERY_TYPE_NONE = _('Not delivery yet')
    DELIVERY_TYPE_DELIVERING = _('In transit')
    DELIVERY_TYPE_PART = _('Partially delivered')
    DELIVERY_TYPE_DELIVERED = _('Delivered')
    PAYMENT_STAGE_SO = _('Sale order')
    PAYMENT_STAGE_CONTRACT = _('Contract')
    PAYMENT_STAGE_DELIVERY = _('Delivery')
    PAYMENT_STAGE_ACCEPTANCE = _('Final acceptance')
    PAYMENT_STAGE_INVOICE = _('Invoice')
    PAYMENT_DATE_TYPE_CONTRACT = _('Contract date')
    PAYMENT_DATE_TYPE_DELIVERY = _('Delivery date')
    PAYMENT_DATE_TYPE_INVOICE = _('Invoice date')
    PAYMENT_DATE_TYPE_ACCEPTANCE = _('Acceptance date')
    PAYMENT_DATE_TYPE_MONTH = _('End of invoice month')
    PAYMENT_DATE_TYPE_ORDER = _('Order date')
    INVOICE_STATUS_NONE = _('Invoice not issued yet')
    INVOICE_STATUS_PART = _('Invoice partially issued')
    INVOICE_STATUS_DONE = _('Invoice issued')
