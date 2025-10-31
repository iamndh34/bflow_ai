__all__ = [
    'AppsCodeToList',
]

from django.utils.translation import gettext_lazy as _


class AppsCodeToList:
    mapping = {
        'quotation': {
            'quotation': {
                'title': _('Quotation'),
                'is_active': True,
            }
        },
        'saleorder': {
            'saleorder': {
                'title': _('Sale Order'),
                'is_active': True,
            },
        },
        'leave': {
            'leaverequest': {
                'title': _('Leave request'),
                'is_active': True,
            },
        },
        'businesstrip': {
            'businessrequest': {
                'title': _('Business trip'),
                'is_active': True,
            },
        },
        'assettools': {
            'assettoolsprovide': {
                'title': _('Asset, Tools provide'),
                'is_active': True,
            },
            'assettoolsdelivery': {
                'title': _('Asset, Tools delivery'),
                'is_active': True,
            },
            'assettoolsreturn': {
                'title': _('Asset, Tools return'),
                'is_active': True,
            },
        },
        'task': {
            'opportunitytask': {
                'title': _('Task'),
                'is_active': False,
            },
        },
        'saledata': {
            'contact': {
                'title': _('Contact'),
                'is_active': True,
            },
            'account': {
                'title': _('Account'),
                'is_active': True,
            },
            'product': {
                'title': _('Product'),
                'is_active': True,
            },
            'expenses': {
                'title': _('Expenses'),
                'is_active': True,
            },
            'expenseitem': {
                'title': _('Expenses Item'),
                'is_active': True,
            },
            'warehouse': {
                'title': _('Warehouse'),
                'is_active': True,
            },
            'goodreceipt': {
                'title': _('Good receipt'),
                'is_active': True,
            },
            'price': {
                'title': _('Price'),
                'is_active': True,
            },
            'shipping': {
                'title': _('Shipping'),
                'is_active': True,
            },
            'paymentterm': {
                'title': _('Payment Terms'),
                'is_active': True,
            },
        },
        'opportunity': {
            'opportunity': {
                'title': _('Opportunity'),
                'is_active': True,
            },
            'documentforcustomer': {
                'title': _('Document for customer'),
                'is_active': True,
            },
            'opportunitycall': {
                'title': _('Call Log'),
                'is_active': True,
            },
            'opportunityemail': {
                'title': _('Email Log'),
                'is_active': True,
            },
            'meetingwithcustomer': {
                'title': _('Metting Log'),
                'is_active': True,
            },
        },
        'delivery': {
            'orderpickingsub': {
                'title': _('Delivery'),
                'is_active': True,
            },
            'orderdeliverysub': {
                'title': _('Picking'),
                'is_active': True,
            },
        },
        'promotion': {
            'promotion': {
                'title': _('Promotion'),
                'is_active': True,
            },
        },
        'cashoutflow': {
            'advancepayment': {
                'title': _('Advance Payment'),
                'is_active': True,
            },
            'payment': {
                'title': _('Payment'),
                'is_active': True,
            },
            'returnadvance': {
                'title': _('Return Advance'),
                'is_active': True,
            },
        },
        'contract': {
            'contract': {
                'title': _('Contract'),
                'is_active': True,
            },
        },
        'purchasing': {
            'purchasequotationrequest': {
                'title': _('Purchase quotation request'),
                'is_active': True,
            },
            'purchasequotation': {
                'title': _('Purchase quotation'),
                'is_active': True,
            },
            'purchaseorder': {
                'title': _('Purchase order'),
                'is_active': True,
            },
            'purchaserequest': {
                'title': _('Purchase request'),
                'is_active': True,
            },
        },
        'project': {
            'project': {
                'title': _('Project'),
                'is_active': True,
            },
            'projectbaseline': {
                'title': _('Project Baseline'),
                'is_active': True
            },
            'activities': {
                'title': _('Project activities'),
                'is_active': True
            }
        },
        'employeeinfo': {
            'employeecontractruntime': {
                'title': _('HRM Signing request'),
                'is_active': True
            }
        },
        'leaseorder': {
            'leaseorder': {
                'title': _('Lease order'),
                'is_active': True,
            }
        },
        'inventory': {
            'goodsreceipt': {
                'title': _('Goods receipt'),
                'is_active': True,
            },
            'goodsreturn': {
                'title': _('Goods return'),
                'is_active': True,
            },
            'goodsissue': {
                'title': _('Goods issue'),
                'is_active': True,
            },
            'goodsdetail': {
                'title': _('Goods detail'),
                'is_active': True,
            },
            'goodstransfer': {
                'title': _('Goods transfer'),
                'is_active': True,
            },
            'inventoryadjustment': {
                'title': _('Inventory adjustment'),
                'is_active': True,
            },
        },
        'bidding': {
            'bidding': {
                'title': _('Bidding'),
                'is_active': True,
            },
        },
        'consulting': {
            'consulting': {
                'title': _('Consulting'),
                'is_active': True,
            },
        },
        'overtimerequest': {
            'overtimerequest': {
                'title': _('Overtime request'),
                'is_active': True,
            }
        },
        'payrolltemplate': {
            'payrolltemplate': {
                'title': _('Payroll template'),
                'is_active': True,
            }
        },
    }

    @classmethod
    def get_data(cls):
        return cls.mapping
