__all__ = [
    'SpaceGroup',
    'SpaceItem',
]

from typing import Union
from urllib.parse import urlencode

from django.urls import reverse
from django.utils.translation import gettext_lazy as trans
from .utils import RandomGenerate


# Menus Setup
class MenuCommon:
    name: str
    code: str
    view_name: Union[str, None]
    icon: str
    child: list

    def __init__(
            self,
            name: str, code: str,
            view_name: Union[str, None] = None,
            icon: str = None,
            child: list = None,
            params: dict[str, any] = None,
            expanded: bool = False,
    ):
        self.name = name
        self.code = code
        self.view_name = view_name
        self.icon = icon if icon else ''
        self.child = child if isinstance(child, list) else []
        self.params = params if isinstance(params, dict) else {}
        self.expanded = expanded

    @property
    def data(self):
        url = reverse(self.view_name) if self.view_name and self.view_name != '#' else '#'
        if self.params:
            url += '?' + urlencode(self.params)
        return {
            'name': self.name,
            'name_i18n': trans(self.name),
            'code': self.code if self.code else RandomGenerate.get_string(length=32),
            'view_name': self.view_name,
            'url': url,
            'icon': self.icon,
            'expanded': self.expanded,
            'child': [
                x.data for x in self.child
            ]
        }


class MenusCompanySystem:
    COMPANY_LIST = MenuCommon(
        name='Company', code='menu_company_list', view_name='CompanyList', icon='<i class="fas fa-building"></i>'
    )
    USER_LIST = MenuCommon(
        name='User', code='menu_user_list', view_name='UserList', icon='<i class="fas fa-user"></i>'
    )
    ORG_CHART = MenuCommon(
        name='Org Chart',
        code='menu_org_child',
        icon='<i class="fas fa-sitemap"></i>',
        child=[
            MenuCommon(
                name='Employee', code='menu_employee_list', view_name='EmployeeList',
                icon='<i class="fas fa-user-tie"></i>'
            ),
            MenuCommon(
                name='Role', code='menu_role_list', view_name='RoleList', icon='<i class="fas fa-users-cog"></i>'
            ),
            MenuCommon(
                name='Group', code='menu_group_list', view_name='GroupList', icon='<i class="fas fa-users"></i>'
            ),
            MenuCommon(
                name='Org Charts', code='menu_company_diagram', view_name='TenantDiagramView',
                icon='<i class="fas fa-solid fa-diagram-project"></i>',
            ),
        ]
    )
    WORKING_CALENDAR = MenuCommon(
        name='Holidays', code='menu_holidays', view_name='WorkingCalendarConfig',
        icon='<i class="fas far fa-calendar"></i>',
    )
    WORKFLOW_PROCESS = MenuCommon(
        name='Process Management', code='menu_process_management', icon='<i class="fas fab fa-stumbleupon-circle"></i>',
        child=[
            MenuCommon(
                name='Workflow', code='menu_workflow_list', view_name='WorkflowList',
                icon='<i class="fas fa-shapes"></i>'
            ),
            MenuCommon(
                name='Config Process', code='menu_process', view_name='ProcessList',
                icon='<i class="fas fa-solid fa-microchip"></i>',
            ),
            MenuCommon(
                name='Automation', code='', view_name='#', icon='<i class="fas fa-robot"></i>',
            ),
        ]
    )
    PROCESS = MenuCommon(
        name='Process', code='process_group', icon='<i class="fas fa-solid fa-microchip"></i>',
        expanded=True,
        child=[
            MenuCommon(
                name='Config Process', code='menu_process', view_name='ProcessList',
                icon='<i class="fas fa-solid fa-microchip"></i>',
            ),
            MenuCommon(
                name='My Process Runtime',
                code='menu_process_runtime',
                view_name='ProcessRuntimeListMeRedirect',
                icon='<i class="fas fa-solid fa-microchip"></i>',
            ),
        ]
    )
    TENANT_MANAGE = MenuCommon(
        name='Tenant', code='menu_company_overview_list', view_name='CompanyListOverviewList',
        icon='<i class="fas fa-solid fa-city"></i>',
    )
    COMPANY_SITE_BUILDER = MenuCommon(
        name='Site Config', code='menu_site_config_builder', view_name='MyCompanyWebsiteList',
        icon='<i class="fas fa-solid fa-globe"></i>',
    )


class MenusCoreConfigurations:
    FINANCIAL_CONFIG = MenuCommon(
        name='Financial config', code='menu_financial_config', view_name='#',
        icon='<i class="fas fa-balance-scale"></i>',
        child=[
            MenuCommon(
                name='Accounting policies', code='id_menu_master_data_accounting_policies', view_name='AccountingPoliciesList',
                icon='<i class="fas bi bi-calculator"></i>',
            ),
            MenuCommon(
                name='Posting period', code='id_menu_master_data_periods_config', view_name='PeriodsConfigList',
                icon='<i class="fas far fa-calendar-alt"></i>',
            ),
            MenuCommon(
                name='Categories', code='id_menu_master_data_categories', view_name='CategoryMasterDataList',
                icon='<i class="fas fa-folder"></i>',
            ),
            MenuCommon(
                name='Bank', code='id_menu_master_data_bank', view_name='BankMasterDataList',
                icon='<i class="fas fa-solid fa-building-columns"></i>',
            ),
            MenuCommon(
                name='Payroll config', code='menu_payroll_config', view_name='PayrollConfigDetail',
                icon='<i class="fas fa-receipt"></i>',
            ),
        ]
    )
    MASTER_DATA_CONFIG = MenuCommon(
        name='Master data config', code='menu_masterdata', view_name='#',
        icon='<i class="fas fa-crown"></i>',
        child=[
            MenuCommon(
                name='Contact', code='id_menu_master_data_contact', view_name='ContactMasterDataList',
                icon='<i class="fas bi bi-journal-bookmark-fill"></i>',
            ),
            MenuCommon(
                name='Account', code='id_menu_master_data_account', view_name='AccountMasterDataList',
                icon='<i class="fas bi bi-person-rolodex"></i>',
            ),
            MenuCommon(
                name='Item', code='id_menu_master_data_product', view_name='ProductMasterDataList',
                icon='<i class="fas bi bi-diagram-2-fill"></i>',
            ),
            MenuCommon(
                name='Price', code='id_menu_master_data_price', view_name='PriceMasterDataList',
                icon='<i class="fas bi bi-currency-exchange"></i>',
            ),
            MenuCommon(
                name='Attribute', code='id_menu_master_data_attribute', view_name='AttributeList',
                icon='<i class="fas fa-cubes"></i>',
            ),
            MenuCommon(
                name='Document', code='id_menu_master_data_document', view_name='DocumentTypeMasterDataList',
                icon='<i class="fas fa-file"></i>',
            ),
            MenuCommon(
                name='Meeting', code='id_menu_master_data_meeting_schedule', view_name='MeetingScheduleMasterdataList',
                icon='<i class="fas fa-chalkboard-teacher"></i>',
            ),
            MenuCommon(
                name='Project config', code='menu_project_config',
                view_name='ProjectConfig',
                icon='<i class="fas fa-brands fa-r-project"></i>',
            ),
            MenuCommon(
                name='KMS Document type', code='menu_document_type_config',
                view_name='DocumentTypeConfigList',
                icon='<i class="fa-regular fa-file"></i>'
            ),
            MenuCommon(
                name='KMS Content group', code='menu_content_group_config',
                view_name='ContentGroupList',
                icon='<i class="fa-regular fa-copy"></i>'
            ),
            MenuCommon(
                name='Shift', code='id_menu_master_data_shift',
                view_name='ShiftMasterDataList',
                icon='<i class="fas fa-history"></i>'
            ),
            MenuCommon(
                name='Shipment', code='menu_master_data_shipment',
                view_name='ShipmentMasterDataList',
                icon='<i class="fa-solid fa-truck-arrow-right"></i>'
            )
        ]
    )
    TRANSITION_DATA_CONFIG = MenuCommon(
        name='Transition data config', code='menu_transition_data_config', view_name='#',
        icon='<i class="fas fa-exchange-alt"></i>',
        child=[
            MenuCommon(
                name='Balance initialization', code='menu_balance_init', view_name='BalanceInitList',
                icon='<i class="fas fa-balance-scale"></i>',
            ),
            MenuCommon(
                name='Delivery', code='menu_delivery_config', view_name='DeliveryConfigDetail',
                icon='<i class="fas fa-truck"></i>',
            ),
            MenuCommon(
                name='Sale Order', code='menu_quotation_config', view_name='QuotationConfigDetail',
                icon='<i class="fas fa-file-invoice-dollar"></i>',
            ),
            MenuCommon(
                name='Lease order', code='menu_lease_order_config', view_name='LeaseOrderConfigDetail',
                icon='<i class="fas fa-handshake"></i>',
            ),
            # MenuCommon(
            #     name='Sale Order', code='menu_sale_order_config', view_name='SaleOrderConfigDetail',
            #     icon='<i class="fas fa-file-invoice"></i>',
            # ),
            MenuCommon(
                name='Opportunity', code='menu_opportunity_config', view_name='OpportunityConfigDetail',
                icon='<i class="fas fa-solid fa-lightbulb"></i>',
            ),
            MenuCommon(
                name='Task', code='menu_opportunity_task_config', view_name='OpportunityTaskConfig',
                icon='<i class="fas fa-solid fa-clipboard-check"></i>',
            ),
            # MenuCommon(
            #     name='Payment', code='menu_payment_config', view_name='PaymentConfigList',
            #     icon='<i class="fas bi bi-credit-card-fill"></i>',
            # ),
            MenuCommon(
                name='Expense Items', code='id_menu_expense_item_list', view_name='ExpenseItemList',
                icon='<i class="fas bi bi-wallet2"></i>',
            ),
            MenuCommon(
                name='Internal Labor Items', code='id_menu_expense_list', view_name='ExpenseList',
                icon='<i class="fas bi bi-cash-coin"></i>',
            ),
            MenuCommon(
                name='Leave', code='menu_leave_config', view_name='LeaveConfigDetail',
                icon='<i class="fas fa-solid fa-arrow-right-from-bracket"></i>',
            ),
            MenuCommon(
                name='Purchase Request Config', code='menu_purchase_request_config', view_name='PurchaseRequestConfig',
                icon='<i class="fas fa-shopping-cart"></i>',
            ),
            MenuCommon(
                name='Revenue plan config', code='id_menu_master_data_revenue_plan_config',
                view_name='RevenuePlanConfigList',
                icon='<i class="fas fa-hand-holding-usd"></i>',
            ),
            MenuCommon(
                name='Budget plan config', code='id_menu_master_data_budget_plan_config',
                view_name='BudgetPlanConfigList',
                icon='<i class="fas fa-wallet"></i>',
            ),
            MenuCommon(
                name='Invoice form config', code='menu_invoice_sign',
                view_name='InvoiceSignList',
                icon='<i class="fas fa-signature"></i>',
            ),
            MenuCommon(
                name='Bidding Result Config', code='menu_bidding_result_config', view_name='BiddingResultConfigList',
                icon='<i class="fas fa-gavel"></i>',
            ),
            MenuCommon(
                name='Warehouse config', code='menu_warehouse_config',
                view_name='WarehouseConfigList',
                icon='<i class="fas fas fa-warehouse"></i>'
            )
        ]
    )
    TEMPLATES_DATA_CONFIG = MenuCommon(
        name='Templates', code='menu_templates', view_name='#',
        icon='<i class="fas fa-solid fa-swatchbook"></i>',
        child=[
            MenuCommon(
                name='Print Template', code='menu_print_template', view_name='PrintTemplatesListView',
                icon='<i class="fas fa-solid fa-print"></i>'
            ),
            MenuCommon(
                name='Mail Template', code='menu_mail_template', view_name='MailTemplatesListView',
                icon='<i class="fas fa-regular fa-envelope"></i>'
            ),
            MenuCommon(
                name='Import Data', code='menu_import_data', view_name='FImportCreateView',
                icon='<i class="fas fa-solid fa-file-import"></i>'
            ),
            MenuCommon(
                name='Contract Template', code='menu_contract_template', view_name='ContractTemplateList',
                icon='<i class="fas fa-solid fa-file-contract"></i>'
            ),
        ]
    )


class MenusForms:
    FORM_DATA_CONFIG = MenuCommon(
        name='Forms',
        code='menu_form_data',
        view_name='FormListView',
        icon='<i class="fas fa-brands fa-wpforms"></i>'
    )


class MenusCRM:
    HOME = MenuCommon(
        name='Home', code='id_menu_home_page', view_name='HomeView',
        icon='<i class="fas fas fa-home"></i>',
    )
    DASHBOARD = MenuCommon(
        name='Dashboard', code='id_menu_dashboard', view_name='DashboardCommonPage',
        icon='<i class="fas fa-chart-column"></i>',
    )
    PLANNING = MenuCommon(
        name='Planning', code='id_menu_planning', view_name='#',
        icon='<i class="fas fa-scroll"></i>',
        child=[
            MenuCommon(
                name='Revenue plan', code='menu_revenue_plan_list', view_name='RevenuePlanList',
                icon='<i class="fas fa-circle-dollar-to-slot"></i>',
            ),
            MenuCommon(
                name='Budget plan', code='menu_budget_plan_list', view_name='BudgetPlanList',
                icon='<i class="fas fa-wallet"></i>',
            )
        ],
    )
    LEAD = MenuCommon(
        name='Lead', code='menu_lead_list', view_name='LeadList',
        icon='<i class="fas far fa-star"></i>',
    )
    CALENDAR = MenuCommon(
        name='Calendar', code='menu_calendar', view_name='ProgrammeList',
        icon='<i class="fas far fa-calendar"></i>',
    )
    CONTACT = MenuCommon(
        name='Contact', code='id_menu_contact', view_name='ContactList',
        icon='<i class="fas fa-solid fa-id-card"></i>',
    )
    ACCOUNT = MenuCommon(
        name='Account', code='id_menu_account', view_name='AccountList',
        icon='<i class="fas fa-solid fa-id-card-clip"></i>',
    )
    OPPORTUNITY = MenuCommon(
        name='Opportunity', code='menu_opportunity_list', view_name='OpportunityList',
        icon='<i class="fas far fa-lightbulb"></i>',
    )
    QUOTATION = MenuCommon(
        name='Quotation', code='', view_name='#',
        icon='<i class="fas fa-file-signature"></i>',
        child=[
            MenuCommon(
                name='Sale quotation', code='menu_quotation_list', view_name='QuotationList',
                icon='<i class="fas fa-file-invoice-dollar"></i>',
            ),
            MenuCommon(
                name='Service quotation', code='menu_service_quotation_list', view_name='ServiceQuotationList',
                icon='<i class="fas fa-file-invoice-dollar"></i>',
            )
        ],
    )
    BIDDING = MenuCommon(
        name='Bidding', code='menu_bidding_list', view_name='BiddingList',
        icon='<i class="fas fa-gavel"></i>',
    )
    ORDERS = MenuCommon(
        name='Orders', code='', view_name='#',
        icon='<i class="fas fa-file-signature"></i>',
        child=[
            MenuCommon(
                name='Sale order', code='menu_sale_order_list', view_name='SaleOrderList',
                icon='<i class="fas fa-shopping-cart"></i>',
            ),
            MenuCommon(
                name='Lease order', code='menu_lease_order_list', view_name='LeaseOrderList',
                icon='<i class="fas fa-handshake"></i>',
            ),
            MenuCommon(
                name='Service order', code='menu_service_order_list', view_name='ServiceOrderList',
                icon='<i class="fas fa-concierge-bell"></i>',
            )
        ],
    )
    # GROUP_ORDER = MenuCommon(
    #     name='Group order', code='menu_group_order_list', view_name='GroupOrderList',
    #     icon='<i class="fas fa-file-invoice"></i>',
    # )
    LEASE_ASSET_LIST = MenuCommon(
        name='Lease asset list', code='menu_lease_asset_list', view_name='LeaseOrderAssetList',
        icon='<i class="fas fa-hand-holding-usd"></i>',
    )
    RECURRENCE = MenuCommon(
        name='Recurrence transaction', code='menu_recurrence', view_name='',
        icon='<i class="fas fa-sync-alt"></i>',
        child=[
            MenuCommon(
                name='Recurring order', code='menu_recurring_order', view_name='RecurrenceList',
                icon='<i class="fas fa-file"></i>',
            ),
            MenuCommon(
                name='Action list', code='menu_action_list', view_name='RecurrenceActionList',
                icon='<i class="fas fa-location-arrow"></i>',
            ),
            MenuCommon(
                name='Transaction template', code='menu_transaction_template', view_name='TransactionTemplateList',
                icon='<i class="fas fa-file-alt"></i>',
            ),
        ],
    )
    WORK_ORDER = MenuCommon(
        name='Work order', code='menu_work_order_list', view_name='WorkOrderList',
        icon='<i class="fas fa-pencil-ruler"></i>',
    )
    AR_INVOICE = MenuCommon(
        name='AR invoice', code='id_menu_ar_invoice', view_name='ARInvoiceList',
        icon='<i class="fas bi bi-receipt"></i>',
    )
    FINAL_ACCEPTANCE = MenuCommon(
        name='Final acceptance', code='menu_final_acceptance_list', view_name='FinalAcceptanceList',
        icon='<i class="fas fa-calendar-check"></i>',
    )
    CONTRACT_APPROVAL = MenuCommon(
        name='Contract approval', code='menu_contract_approval_list', view_name='ContractApprovalList',
        icon='<i class="fas fa-file-signature"></i>',
    )
    PRODUCT = MenuCommon(
        name='Product', code='id_menu_product_list', view_name='ProductList',
        icon='<i class="fa-solid fa-box"></i>',
    )
    OPP_BOM = MenuCommon(
        name='Opportunity BOM', code='menu_project_bom_list', view_name='OpportunityBOMList',
        icon='<i class="fas fa-dice"></i>',
    )
    PRICING = MenuCommon(
        name='Pricing', code='menu_pricing', view_name='',
        icon='<i class="fas bi bi-tags-fill"></i>',
        child=[
            MenuCommon(
                name='Price List', code='id_menu_pricing_list', view_name='PriceList',
                icon='<i class="fas fa-list-ol"></i>',
            ),
            MenuCommon(
                name='Shipping list', code='id_menu_shipping_list', view_name='ShippingList',
                icon='<i class="fas fa-shipping-fast"></i>',
            ),
            MenuCommon(
                name='Promotion List', code='id_menu_promotion_list', view_name='PromotionList',
                icon='<i class="fas fa-percent"></i>',
            ),
        ]
    )
    ACCOUNT_PAYABLE = MenuCommon(
        name='Account payable', code='menu_account_payable', view_name='',
        icon='<i class="fas fa-coins"></i>',
        child=[
            MenuCommon(
                name='Advance payment', code='id_menu_advance_payment', view_name='AdvancePaymentList',
                icon='<i class="fas fa-hand-holding-usd"></i>',
            ),
            MenuCommon(
                name='Payment', code='id_menu_payment', view_name='PaymentList',
                icon='<i class="fas far fa-credit-card"></i>',
            ),
            MenuCommon(
                name='Return advance', code='id_menu_return_advance', view_name='ReturnAdvanceList',
                icon='<i class="bi bi-arrow-return-left"></i>',
            ),
        ],
    )
    SALE_ACTIVITIES = MenuCommon(
        name='Sale activities', code='menu_sale_activities', view_name='',
        icon='<i class="fas bi bi-ui-checks-grid"></i>',
        child=[
            MenuCommon(
                name='Call to customer', code='id_menu_log_a_call', view_name='OpportunityCallLogList',
                icon='<i class="fas fa-phone-volume"></i>',
            ),
            MenuCommon(
                name='Email to customer', code='id_menu_email', view_name='OpportunityEmailList',
                icon='<i class="fas bi bi-envelope-fill"></i>',
            ),
            MenuCommon(
                name='Meeting with customer', code='id_menu_meeting', view_name='OpportunityMeetingList',
                icon='<i class="fas bi bi-person-workspace"></i>',
            ),
            MenuCommon(
                name='Document for customer', code='menu_opportunity_document',
                view_name='OpportunityDocumentList',
                icon='<i class="fas bi bi-file-earmark"></i>',
            ),

        ],
    )
    TASK = MenuCommon(
        name='Task', code='menu_opportunity_task', view_name='OpportunityTaskList',
        icon='<i class="fas fa-solid fa-list-check"></i>',
        child=[],
    )
    CONSULTING = MenuCommon(
        name='Consulting', code='menu_consulting_list', view_name='ConsultingList',
        icon='<i class="fas fa-solid fa-briefcase"></i>',
    )
    CHAT_3RD = MenuCommon(
        name='Chat Third party', code='menu_chat_third_party', view_name='Chat3rdView',
        icon='<i class="fas fa-solid fa-comments"></i>',
    )


class MenusPurchase:
    HOME = MenuCommon(
        name='Home', code='id_menu_home_page', view_name='HomeView', icon='<i class="fas fa-home"></i>',
    )
    PURCHASE = MenuCommon(
        name='Purchasing', code='menu_purchase_activities', view_name='', icon='<i class="fas fa-cart-arrow-down"></i>',
        child=[
            MenuCommon(
                name='Goods stock plan', code='menu_distribution_plan_list', view_name='DistributionPlanList',
                icon='<i class="fas fa-expand-arrows-alt"></i>',
            ),
            MenuCommon(
                name='Purchase request',
                code='menu_purchase_request_list',
                view_name='PurchaseRequestList',
                icon='<i class="fas fa-file-upload"></i>',
            ),
            MenuCommon(
                name='Purchase quotation request',
                code='id_menu_purchase_quotation_request_list',
                view_name='PurchaseQuotationRequestList',
                icon='<i class="fas fa-file-invoice-dollar"></i>',
            ),
            MenuCommon(
                name='Purchase quotation',
                code='id_menu_purchase_quotation_list',
                view_name='PurchaseQuotationList',
                icon='<i class="fas fa-file-alt"></i>',
            ),
            MenuCommon(
                name='Purchase order', code='menu_purchase_order_list', view_name='PurchaseOrderList',
                icon='<i class="fas fa-shopping-cart"></i>',
            ),
            MenuCommon(
                name='AP invoice', code='id_menu_ap_invoice', view_name='APInvoiceList',
                icon='<i class="fas fa-file-invoice"></i>',
            )
        ],
    )


class MenusInventory:
    HOME = MenuCommon(
        name='Home', code='id_menu_home_page', view_name='HomeView', icon='<i class="fas fa-home"></i>',
    )

    WAREHOUSE_LIST = MenuCommon(
        name='Warehouse list', code='menu_warehouse_list', view_name='WareHouseList',
        icon='<i class="fas fa-warehouse"></i>',
    )
    INVENTORY = MenuCommon(
        name='Inventory activities', code='menu_inventory_activities', view_name='',
        icon='<i class="fas fa-store"></i>',
        child=[
            MenuCommon(
                name='Picking', code='menu_order_picking_list', view_name='OrderPickingList',
                icon='<i class="fas fa-box"></i>',
            ),
            MenuCommon(
                name='Delivery', code='menu_order_delivery_list', view_name='OrderDeliveryList',
                icon='<i class="fas fa-truck"></i>',
            ),
            MenuCommon(
                name='Goods receipt',
                code='menu_goods_receipt_list',
                view_name='GoodsReceiptList',
                icon='<i class="fas fa-dolly-flatbed"></i>',
            ),
            MenuCommon(
                name='Goods registration',
                code='menu_goods_registration_list',
                view_name='GoodsRegistrationList',
                icon='<i class="fas bi bi-ui-radios-grid"></i>',
            ),
            MenuCommon(
                name='Goods detail',
                code='menu_goods_detail_list',
                view_name='GoodsDetail',
                icon='<i class="fas bi bi-info-square"></i>',
            ),
            MenuCommon(
                name='Goods issue',
                code='menu_goods_issue_list',
                view_name='GoodsIssueList',
                icon='<i class="fas fa-file-export"></i>',
            ),
            MenuCommon(
                name='Goods return',
                code='menu_goods_return',
                view_name='GoodsReturnList',
                icon='<i class="fas far fa-arrow-alt-circle-left"></i>',
            ),
            MenuCommon(
                name='Goods transfer',
                code='menu_goods_transfer_list',
                view_name='GoodsTransferList',
                icon='<i class="fas fa-exchange-alt"></i>',
            ),
            MenuCommon(
                name='Inventory adjustment',
                code='menu_inventory_adjustment_list',
                view_name='InventoryAdjustmentList',
                icon='<i class="fas bi bi-sliders"></i>',
            ),
            MenuCommon(
                name='Goods recovery',
                code='menu_goods_recovery_list',
                view_name='GoodsRecoveryList',
                icon='<i class="fas fa-reply"></i>',
            ),
            MenuCommon(
                name='Product modification', code='id_menu_product_modification', view_name='ProductModificationList',
                icon='<i class="fa-solid fa-boxes-stacked"></i>',
            ),
            MenuCommon(
                name='Equipment loan', code='id_menu_equipment_loan', view_name='EquipmentLoanList',
                icon='<i class="fa-solid fa-boxes-packing"></i>',
            ),
            MenuCommon(
                name='Equipment return', code='id_menu_equipment_return', view_name='EquipmentReturnList',
                icon='<i class="fa-solid fa-rotate-left"></i>',
            )
        ],
    )


class MenuEOffice:
    HOME = MenuCommon(
        name='Home', code='id_menu_home_page', view_name='HomeView', icon='<i class="fas fa-home"></i>',
    )
    CALENDAR = MenuCommon(
        name='Calendar', code='menu_calendar', view_name='ProgrammeList', icon='<i class="fas far fa-calendar"></i>',
    )
    LEAVE = MenuCommon(
        name='Leave', code='menu_leave', icon='<i class="fas fa-solid fa-arrow-right-from-bracket"></i>',
        child=[
            MenuCommon(
                name='Leave request', code='menu_leave_request', view_name='LeaveRequestList',
                icon='<i class="fas fa-solid fa-arrow-right-from-bracket"></i>'
            ),
            MenuCommon(
                name='Available list', code='menu_leave_available', view_name='LeaveAvailableList',
                icon='<i class="fas fa-regular fa-calendar-check"></i>',
            )
        ]
    )
    BUSINESS_TRIP = MenuCommon(
        name='Business trip', code='menu_business', view_name='BusinessTripRequestList',
        icon='<i class="fas fa-solid fa-business-time"></i>',
    )
    ASSET_TOOLS = MenuCommon(
        name='Asset, tools', code='menu_asset_tools', icon='<i class="fas fa-solid fa-pen-ruler"></i>',
        child=[
            MenuCommon(
                name='Provide request', code='menu_asset_provide', view_name='AssetToolsProvideRequestList',
                icon='<i class="fas fa-solid fa-hand-holding"></i>',
            ),
            MenuCommon(
                name='Asset, tools delivery', code='menu_asset_delivery', view_name='AssetToolsDeliveryList',
                icon='<i class="fas fa-solid fa-truck-fast"></i>',
            ),
            MenuCommon(
                name='Asset, tools list', code='menu_asset_list', view_name='AssetToolsList',
                icon='<i class="fas fa-solid fa-list"></i>',
            ),
            MenuCommon(
                name='Asset, tools return list', code='menu_asset_return', view_name='AssetToolsReturnList',
                icon='<i class="fas fa-solid fa-backward-fast"></i>',
            ),
        ]
    )
    MEETING = MenuCommon(
        name='Meeting schedule', code='menu_meeting_list', view_name='MeetingScheduleList',
        icon='<i class="fas fa-chalkboard-teacher"></i>',
    )


class MenuKMS:
    WORK_SPACE = MenuCommon(
        name='Workspace', code='menu_dms_work_space', view_name='', icon='<i class="fas fa-laptop-house"></i>',
        child=[
            MenuCommon(
                name='File',
                code='menu_folder_ws_list',
                view_name='FolderList',
                icon='<i class="fas fa-file"></i>',
            ),
            MenuCommon(
                name='Document approval',
                code='menu_document_approval',
                view_name='KMSDocumentApprovalList',
                icon='<i class="fa-solid fa-file-circle-check"></i>',
            ),
            MenuCommon(
                name='Incoming document',
                code='menu_incoming_document',
                view_name='IncomingDocumentList',
                icon='<i class="fas fa-file-import"></i>',
            ),
        ],
    )
    MY_SPACE = MenuCommon(
        name='My space', code='menu_dms_my_space', view_name='', icon='<i class="fas fa-user"></i>',
        child=[
            MenuCommon(
                name='My file',
                code='menu_folder_list',
                view_name='FolderMyFileList',
                icon='<i class="fas fa-file"></i>',
            ),
        ],
    )


class MenusReport:
    HOME = MenuCommon(
        name='Home', code='id_menu_home_page', view_name='HomeView', icon='<i class="fas fa-home"></i>',
    )
    SALE_REPORT = MenuCommon(
        name='Sale reports', code='menu_sale_reports', view_name='', icon='<i class="fas fa-balance-scale"></i>',
        child=[
            MenuCommon(
                name='Pipeline report',
                code='menu_report_pipeline_list',
                view_name='ReportPipelineList',
                icon='<i class="fas bi bi-dot"></i>',
            ),
            MenuCommon(
                name='Revenue report',
                code='menu_report_revenue_list',
                view_name='ReportRevenueList',
                icon='<i class="fas bi bi-dot"></i>',
            ),
            MenuCommon(
                name='General revenue report',
                code='menu_report_general_list',
                view_name='ReportGeneralList',
                icon='<i class="fas bi bi-dot"></i>',
            ),
            MenuCommon(
                name='Product report',
                code='menu_report_product_list',
                view_name='ReportProductList',
                icon='<i class="fas bi bi-dot"></i>',
            ),
            MenuCommon(
                name='Customer report',
                code='menu_report_customer_list',
                view_name='ReportCustomerList',
                icon='<i class="fas bi bi-dot"></i>',
            ),
            MenuCommon(
                name='Cashflow report',
                code='menu_report_cashflow_list',
                view_name='ReportCashflowList',
                icon='<i class="fas bi bi-dot"></i>',
            ),
            MenuCommon(
                name='Budget report',
                code='menu_budget_report',
                view_name='BudgetReportList',
                icon='<i class="fas bi bi-dot"></i>',
            ),
            MenuCommon(
                name='Lease report',
                code='menu_report_lease_list',
                view_name='ReportLeaseList',
                icon='<i class="fas bi bi-dot"></i>',
            ),
        ],
    )
    INVENTORY_REPORT = MenuCommon(
        name='Inventory reports', code='menu_inventory_reports', view_name='', icon='<i class="fas fa-warehouse"></i>',
        child=[
            MenuCommon(
                name='Inventory report',
                code='menu_inventory_report',
                view_name='ReportInventoryList',
                icon='<i class="fas bi bi-dot"></i>',
            ),
            MenuCommon(
                name='Items detail report',
                code='menu_items_detail_report',
                view_name='ReportInventoryDetailList',
                icon='<i class="fas bi bi-dot"></i>',
            ),
        ],
    )
    PURCHASING_REPORT = MenuCommon(
        name='Purchasing reports', code='menu_purchasing_reports', view_name='', icon='<i class="fas fa-boxes"></i>',
        child=[
            MenuCommon(
                name='Purchase order report',
                code='menu_po_report',
                view_name='PurchaseOrderReportList',
                icon='<i class="fas bi bi-dot"></i>',
            ),
        ],
    )


class MenusProject:
    HOME = MenuCommon(
        name='Project home', code='id_menu_project_home', view_name='ProjectHome', icon='<i class="fas fa-home"></i>',
    )
    LIST = MenuCommon(
        name='Project list', code='menu_project', view_name='ProjectList',
        icon='<i class="fas fa-solid fa-bars-progress"></i>',
    )
    ACTIVITIES = MenuCommon(
        name='Project activities', code='menu_project_activities', view_name='ProjectActivities',
        icon='<i class="fas fa-solid fa-fire-flame-curved"></i>',
    )
    TASKS = MenuCommon(
        name='Project task list', code='menu_project_task_list', view_name='ProjectTaskList',
        icon='<i class="fas fa-solid fa-list"></i>',
    )


class MenusProduction:
    HOME = MenuCommon(
        name='Home', code='id_menu_home_page', view_name='HomeView', icon='<i class="fas fa-home"></i>',
    )
    PRODUCTION = MenuCommon(
        name='Production', code='menu_purchase_activities', view_name='', icon='<i class="fas bi bi-robot"></i>',
        child=[
            MenuCommon(
                name='Production BOM', code='menu_bom_list', view_name='BOMList',
                icon='<i class="fas fab fa-connectdevelop"></i>',
            ),
            MenuCommon(
                name='Production order',
                code='menu_production_order_list',
                view_name='ProductionOrderList',
                icon='<i class="fas fa-boxes"></i>',
            ),
            MenuCommon(
                name='Production report',
                code='menu_production_report_list',
                view_name='ProductionReportList',
                icon='<i class="fas fa-tasks"></i>',
            ),
            MenuCommon(
                name='Product modification BOM',
                code='id_menu_product_modification_bom',
                view_name='ProductModificationBOMList',
                icon='<i class="fas fa-wrench"></i>',
            ),
        ],
    )


class MenusHRM:
    HOME = MenuCommon(
        name='Home', code='id_menu_hrm_home_page', view_name='HomeView', icon='<i class="fas fa-home"></i>',
    )
    HUMAN_RESOURCES = MenuCommon(
        name='Human resources', code='menu_human_resources', view_name='', icon='<i class="fas fa-solid fa-person"></i>',
        child=[
            MenuCommon(
                name='Employee data', code='menu_employee_data_list', view_name='HRMEmployeeList',
                icon='<i class="fas fa-solid fa-user-check"></i>',
            ),
        ]
    )
    ATTENDANCE = MenuCommon(
        name='Attendance', code='menu_attendance', view_name='',
        icon='<i class="fas fa-calendar-check"></i>',
        child=[
            MenuCommon(
                name='Shift assignment', code='menu_shift_assignment_list', view_name='ShiftAssignmentList',
                icon='<i class="fas fa-user-clock"></i>',
            ),
            MenuCommon(
                name='Attendance table', code='menu_attendance_list', view_name='HRMAttendanceList',
                icon='<i class="fa-solid fa-table-columns"></i>',
            ),
            MenuCommon(
                name='Attendance device config',
                code='menu_attendance_device_list',
                view_name='AttendanceDeviceList',
                icon='<i class="fa-solid fa-gears"></i>',
            ),
            MenuCommon(
                name='Synchronize employee',
                code='menu_device_integrate_employee_list',
                view_name='DeviceIntegrateEmployeeList',
                icon='<i class="fas fa-repeat"></i>',
            ),
            MenuCommon(
                name='Absence explanation',
                code='menu_absence_explanation_list',
                view_name='AbsenceExplanationList',
                icon='<i class="fas fa-comment-alt absence-explanation-icon"></i>',
            ),
        ]
    )
    OVERTIME_REQUEST = MenuCommon(
        name='Overtime request', code='menu_overtime_request', view_name='OvertimeList',
        icon='<i class="fa-solid fa-stopwatch-20"></i>',
    )
    PAYROLL = MenuCommon(
        name='Payroll', code='menu_payroll', view_name='',
        icon='<i class="fa-solid fa-wallet"></i>',
        child=[
            MenuCommon(
                name='Payroll template', code='menu_payroll_template', view_name='PayrollTemplateList',
                icon='<i class="fa-solid fa-gears"></i>',
            ),
            MenuCommon(
                name='Template attribute', code='menu_template_attribute_list',
                view_name='PayrollTemplAttrList', icon='<i class="fa-solid fa-gears"></i>',
            )
        ]
    )


class MenusPartnerCenter:
    HOME = MenuCommon(
        name='Home', code='id_menu_partner_center_home_page', view_name='HomeView', icon='<i class="fas fa-home"></i>',
    )
    LISTS = MenuCommon(
        name='Lists', code='menu_partner_center_lists', view_name='ListList', icon='<i class="fas fa-solid fa-search"></i>',
    )


class MenusBFlowAIAssistant:
    HOME = MenuCommon(
        name='Home', code='id_menu_bflow_ai_asstant_home_page', view_name='HomeView', icon='<i class="fas fa-home"></i>',
    )
    BFLOW_AI_CHATBOT = MenuCommon(
        name='Chatbot', code='menu_bflow_ai_chatbot', view_name='BFlowAIChatbot', icon='<i class="fa-solid fa-robot"></i>',
    )


class MenusFinancials:
    HOME = MenuCommon(
        name='Home', code='id_menu_home_page', view_name='HomeView', icon='<i class="fas fa-home"></i>',
    )
    ACCOUNTING_SETTING = MenuCommon(
        name='Accounting setting', code='', view_name='', icon='<i class="fas fa-cog"></i>',
        child=[
            MenuCommon(
                name='Chart of accounts', code='menu_chart_of_accounts_list', view_name='ChartOfAccountsList',
                icon='<i class="fas fa-list-alt"></i>',
            ),
            MenuCommon(
                name='Default account determination', code='menu_default_account_determination_list', view_name='DefaultAccountDeterminationList',
                icon='<i class="fas bi bi-journal-text"></i>',
            ),
        ],
    )
    ASSET = MenuCommon(
        name='Assets', code='menu_asset', view_name='', icon='<i class="fas fa-warehouse"></i>',
        child=[
            MenuCommon(
                name='Fixed assets', code='menu_fixed_asset', view_name='FixedAssetList',
                icon='<i class="fas fa-warehouse"></i>',
            ),
            MenuCommon(
                name='Fixed asset write-off', code='menu_fixed_asset_writeoff', view_name='FixedAssetWriteOffList',
                icon='<i class="fas fa-warehouse"></i>',
            ),
            MenuCommon(
                name='Instruments & Tools', code='menu_instrument_tool',
                view_name='InstrumentToolList',
                icon='<i class="fas fa-tools"></i>',
            ),
            MenuCommon(
                name='Instrument tool write-off', code='menu_instrument_tool_write_off',
                view_name='InstrumentToolWriteOffList',
                icon='<i class="fas fa-tools"></i>',
            ),

        ],
    )
    CASHFLOW = MenuCommon(
        name='Cashflow', code='menu_cashflow', view_name='', icon='<i class="fas fa-exchange-alt"></i>',
        child=[
            MenuCommon(
                name='Cash inflow', code='menu_cash_inflow', view_name='CashInflowList',
                icon='<i class="fas fa-reply"></i>',
            ),
            MenuCommon(
                name='Cash outflow', code='menu_cash_outflow', view_name='CashOutflowList',
                icon='<i class="fas fa-share"></i>',
            ),
        ],
    )
    JOURNAL_ENTRY = MenuCommon(
        name='Journal entry', code='menu_journal_entry_list', view_name='JournalEntryList',
        icon='<i class="fas bi bi-journal-text"></i>',
    )
    RECONCILIATION = MenuCommon(
        name='Reconciliation', code='menu_reconciliation', view_name='ReconList',
        icon='<i class="fas bi bi-ui-checks"></i>',
    )
    PAYMENT_PLAN = MenuCommon(
        name='Payment plan', code='menu_payment_plan_list', view_name='PaymentPlanList',
        icon='<i class="fas fa-money-check-alt"></i>',
    )


# Space Setup
class SpaceCommon:
    name: str  # 'Sale'
    code: str  # 'sale'
    icon: str  # '<i class="fas fa-user-astronaut"></i>'
    child: list  # []
    menus: list  # []

    def __init__(self, name: str, code: str, icon: str = None, child: list = None, menus: list = None):
        self.name = name
        self.code = code
        self.icon = icon if icon else ''
        self.child = child if isinstance(child, list) else []
        self.menus = menus if isinstance(menus, list) else []

    @property
    def data_minimal(self):
        return {
            'name': self.name,
            'code': self.code,
            'icon': self.icon,
        }

    @property
    def data(self):
        return {
            'name': self.name,
            'code': self.code,
            'icon': self.icon,
            'child': [x.data for x in self.child],
        }

    @property
    def data_menus(self):
        return [x.data for x in self.menus]


class SpaceItem:
    mapping = {
        'crm': SpaceCommon(
            'SALES',
            'crm',
            icon='<i class="fa-solid fa-comments-dollar"></i>',
            menus=[
                MenusCRM.HOME,
                MenusCRM.DASHBOARD,
                MenusCRM.LEAD,
                MenusCRM.CONTACT,
                MenusCRM.ACCOUNT,
                MenusCRM.OPPORTUNITY,
                MenusCRM.QUOTATION,
                MenusCRM.ORDERS,
                MenusCRM.CALENDAR,
                MenusCRM.CONSULTING,
                MenusCRM.BIDDING,
                MenusCRM.PLANNING,
                # MenusCRM.GROUP_ORDER,
                MenusCRM.AR_INVOICE,
                MenusCRM.LEASE_ASSET_LIST,
                MenusCRM.RECURRENCE,
                MenusCRM.WORK_ORDER,
                MenusCRM.FINAL_ACCEPTANCE,
                MenusCRM.CONTRACT_APPROVAL,
                MenusCRM.PRODUCT,
                MenusCRM.OPP_BOM,
                MenusCRM.PRICING,
                MenusCRM.ACCOUNT_PAYABLE,
                MenusCRM.SALE_ACTIVITIES,
                MenusCRM.TASK,
                MenusCRM.CHAT_3RD,
            ],
        ),
        'kms': SpaceCommon(
            'KMS',
            'kms',
            icon='<i class="fas far fa-folder-open"></i>',
            menus=[
                MenuKMS.WORK_SPACE,
                MenuKMS.MY_SPACE,
            ],
        ),
        'e-office': SpaceCommon(
            'E-OFFICE',
            'e-office',
            icon='<i class="fas fa-solid fa-laptop-file"></i>',
            menus=[
                MenuEOffice.HOME,
                MenuEOffice.CALENDAR,
                MenuEOffice.LEAVE,
                MenuEOffice.BUSINESS_TRIP,
                MenuEOffice.ASSET_TOOLS,
                MenuEOffice.MEETING,
            ],
        ),
        'financials': SpaceCommon(
            'FINANCIALS',
            'financials',
            icon='<i class="fas fa-balance-scale"></i>',
            menus=[
                MenusFinancials.HOME,
                MenusFinancials.ACCOUNTING_SETTING,
                MenusFinancials.CASHFLOW,
                MenusFinancials.ASSET,
                MenusFinancials.JOURNAL_ENTRY,
                MenusFinancials.RECONCILIATION,
                MenusFinancials.PAYMENT_PLAN,
            ]
        ),
        'forms': SpaceCommon(
            'FORMS',
            'forms',
            icon='<i class="fas fa-solid fa-pager"></i>',
            menus=[
                MenusForms.FORM_DATA_CONFIG,
            ]
        ),
        'hrm': SpaceCommon(
            'HRM',
            'hrm',
            icon='<i class="fas fa-solid fa-user-tag"></i>',
            menus=[
                MenusHRM.HOME,
                MenusHRM.HUMAN_RESOURCES,
                MenusHRM.ATTENDANCE,
                MenusHRM.OVERTIME_REQUEST,
                MenusHRM.PAYROLL,
            ],
        ),
        'inventory': SpaceCommon(
            'INVENTORY',
            'inventory',
            icon='<i class="fas fas fa-warehouse"></i>',
            menus=[
                MenusInventory.HOME,
                MenusInventory.WAREHOUSE_LIST,
                MenusInventory.INVENTORY,
            ],
        ),
        'purchase': SpaceCommon(
            'PURCHASE',
            'purchase',
            icon='<i class="fas fas fa-cash-register"></i>',
            menus=[
                MenusPurchase.HOME,
                MenusPurchase.PURCHASE,
            ],
        ),
        'production': SpaceCommon(
            'PRODUCTION',
            'production',
            icon='<i class="fas bi bi-robot"></i>',
            menus=[
                MenusProduction.HOME,
                MenusProduction.PRODUCTION,
            ]
        ),
        'project': SpaceCommon(
            'PROJECT',
            'project',
            icon='<i class="fas fa-solid fa-weight-scale"></i>',
            menus=[
                MenusProject.HOME,
                MenusProject.LIST,
                MenusProject.ACTIVITIES,
                MenusProject.TASKS,
            ]
        ),
        'report': SpaceCommon(
            'REPORT',
            'report',
            icon='<i class="fas fa-table"></i>',
            menus=[
                MenusReport.HOME,
                MenusCRM.DASHBOARD,
                MenusReport.SALE_REPORT,
                MenusReport.INVENTORY_REPORT,
                MenusReport.PURCHASING_REPORT,
            ],
        ),
        'definition': SpaceCommon(
            'DEFINITION',
            'definition',
            icon='<i class="fas fa-solid fa-square-pen"></i>',
            menus=[
                MenusCompanySystem.WORKFLOW_PROCESS.child[0],
                MenusCompanySystem.PROCESS,
            ],
        ),
        'partner-center': SpaceCommon(
            'PARTNER CENTER',
            'partner-center',
            icon='<i class="fas fa-solid fa-user-tag"></i>',
            menus=[
                MenusPartnerCenter.HOME,
                MenusPartnerCenter.LISTS,
            ],
        ),
        'company-system': SpaceCommon(
            'COMPANY SYSTEM',
            'company-system',
            icon='<i class="fas far fa-building"></i>',
            menus=[
                MenusCompanySystem.COMPANY_LIST,
                MenusCompanySystem.USER_LIST,
                MenusCompanySystem.ORG_CHART,
                MenusCompanySystem.WORKING_CALENDAR,
                MenusCompanySystem.WORKFLOW_PROCESS,
                MenusCompanySystem.TENANT_MANAGE,
                MenusCompanySystem.COMPANY_SITE_BUILDER,
            ],
        ),
        'core-configurations': SpaceCommon(
            'SETTINGS',
            'core-configurations',
            icon='<i class="fas fas fa-cog"></i>',
            menus=[
                MenusCoreConfigurations.FINANCIAL_CONFIG,
                MenusCoreConfigurations.MASTER_DATA_CONFIG,
                MenusCoreConfigurations.TRANSITION_DATA_CONFIG,
                MenusCoreConfigurations.TEMPLATES_DATA_CONFIG,
            ],
        ),
        'bflow-ai': SpaceCommon(
            'BFlow AI',
            'bflow-ai',
            icon='<i class="fa-solid fa-wand-magic-sparkles fa-beat" style="color: #74C0FC;"></i>',
            menus=[
                MenusBFlowAIAssistant.HOME,
                MenusBFlowAIAssistant.BFLOW_AI_CHATBOT,
            ],
        ),
    }

    @classmethod
    def get_space_detail(cls, space_code):
        if space_code in cls.mapping:
            return cls.mapping[space_code].data_minimal
        return {}

    @classmethod
    def get_menus_of_space(cls, space_code):
        if space_code in cls.mapping:
            return cls.mapping[space_code].data_menus
        return None

    @classmethod
    def get_menus(cls):
        return {
            key: value.data_menus for key, value in cls.mapping.items()
        }


class SpaceGroup:
    SPACE = SpaceCommon(
        'Space', 'space', child=[
            SpaceItem.mapping['crm'],
            SpaceItem.mapping['kms'],
            SpaceItem.mapping['e-office'],
            SpaceItem.mapping['financials'],
            SpaceItem.mapping['forms'],
            SpaceItem.mapping['hrm'],
            SpaceItem.mapping['inventory'],
            SpaceItem.mapping['purchase'],
            SpaceItem.mapping['production'],
            SpaceItem.mapping['project'],
            SpaceItem.mapping['report'],
            SpaceItem.mapping['definition'],
            SpaceItem.mapping['partner-center'],
        ]
    )
    CORE_SETTINGS = SpaceCommon(
        'Core', 'core_settings', child=[
            SpaceItem.mapping['company-system'],
            SpaceItem.mapping['core-configurations'],
            SpaceItem.mapping['bflow-ai'],
        ]
    )

    @classmethod
    def get_space_all(cls, is_hide_core: bool = True):
        result = [cls.SPACE.data]
        if is_hide_core is False:
            result.append(cls.CORE_SETTINGS.data)
        return result


# 1. GET space group all
# SpaceGroup.get_space_all()

# 2. GET menus by space selected
#   SpaceItem.get_menus_of_space('company-system')
