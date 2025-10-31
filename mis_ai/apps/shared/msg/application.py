"""system module"""
from django.utils.translation import gettext_lazy as _


class AppMsg:  # pylint: disable=too-few-public-methods
    """Application message translation"""
    APP_QUOTATION = _('Quotation')
    APP_SALE_ORDER = _('Sale order')
    APP_PURCHASE_REQUEST = _('Purchase request')
    APP_PURCHASE_ORDER = _('Purchase order')
    APP_GOODS_RECEIPT = _('Goods receipt')
    APP_DELIVERY = _('Delivery')
    APP_GOODS_RETURN = _('Goods return')
    ZONES_UPDATE = _('Zones update successfully')
    EMPLOYEE_ZONES_CONFIG_UPDATE = _('Employee zones config update successfully')
    APP_LEASE_ORDER = _('Lease order')
