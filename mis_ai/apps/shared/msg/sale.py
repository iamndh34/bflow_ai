from django.utils.translation import gettext_lazy as _


class MDConfigMsg:
    """Master data PAYMENTS_TERMS (PT) config message translations"""
    PT_CREATE = _('Payments terms create successfully')
    PT_UPDATE = _('Payments terms update successfully')
    PT_DELETE = _('Payments terms delete successfully')
    PT_UNIT_PERCENT = _('Percent')
    PT_UNIT_AMOUNT = _('Amount')
    PT_UNIT_BALANCE = _('Balance')
    PT_DAY_TYPE_WK_DAY = _('Working day')
    PT_DAY_TYPE_CA_DAY = _('Calendar day')
    PT_AFTER_CONTRACT = _('Contract date')
    PT_AFTER_DELIVERY = _('Delivery date')
    PT_AFTER_INVOICE = _('Invoice date')
    PT_AFTER_ACCEPTANCE = _('Acceptance date')
    PT_AFTER_EOI_MONTH = _('End of invoice month')
    PT_AFTER_ORDER_DATE = _('Order date')


class GRMsg:
    MS_CREATE = _('Good receipt create successfully')
    MS_UPDATE = _('Good receipt update successfully')
    MS_DELETE = _('Good receipt delete successfully')
