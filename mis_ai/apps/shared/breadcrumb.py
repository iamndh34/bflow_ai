"""system module"""
import sys
from operator import itemgetter
from django.urls import reverse, NoReverseMatch
from django.utils.translation import gettext_lazy as _
from unidecode import unidecode


class BreadcrumbChildren:  # pylint: disable=too-few-public-methods
    """prepare url breadcrumbs"""

    def __init__(
            self, title: object, url: object = None,
            arg_pattern: object = None, kw_pattern: object = None, is_append_code: object = False
    ):
        self.title = title
        self.url = url if url else ''
        self.arg_pattern = arg_pattern if arg_pattern and isinstance(arg_pattern, list) else []
        self.kw_pattern = kw_pattern if kw_pattern and isinstance(kw_pattern, dict) else {}
        self.is_append_code = is_append_code

    @property
    def data(self):
        """template data"""
        return {
            'title': self.title if self.title else '#',
            'url': reverse(self.url, kwargs=self.kw_pattern) if self.url else '#',
            'is_append_code': self.is_append_code,
        }


class BreadcrumbItem:  # pylint: disable=too-few-public-methods
    """prepare text menu line"""
    # home
    HOME_PAGE = BreadcrumbChildren(
        _('Home Page'), 'HomeView'
    )
    NOTIFICATIONS_PAGE = BreadcrumbChildren(_('Notifications'))

    # base
    BASTION_LIST = BreadcrumbChildren(_('List'))
    BASTION_CREATE = BreadcrumbChildren(_('Create'))
    BASTION_DETAIL = BreadcrumbChildren(_('Detail'), is_append_code=True)
    BASTION_UPDATE = BreadcrumbChildren(_('Update'), is_append_code=True)
    BASTION_KNOWLEDGE = BreadcrumbChildren(_('Knowledge'))

    # hr
    EMPLOYEE_LIST_PAGE = BreadcrumbChildren(_('Employee'), 'EmployeeList')
    EMPLOYEE_CREATE_PAGE = BreadcrumbChildren(_('Employee Create'), 'EmployeeCreate')
    GROUP_LEVEL_LIST_PAGE = BreadcrumbChildren(_('Organization Level'), 'GroupLevelList')
    GROUP_LIST_PAGE = BreadcrumbChildren(_('Organization Group'), 'GroupList')
    ROLE_LIST_PAGE = BreadcrumbChildren(_('Role'), 'RoleList')
    ROLE_CREATE_PAGE = BreadcrumbChildren(_("Create Role"), 'RoleCreate')

    # user
    USER_LIST_PAGE = BreadcrumbChildren(_('User'), 'UserList')
    USER_CREATE_PAGE = BreadcrumbChildren(_('User Create'), 'UserCreate')
    USER_DETAIL_PAGE = BreadcrumbChildren(_('User detail'))
    USER_EDIT_PAGE = BreadcrumbChildren(_('Edit user'))
    USER_CHANGE_PASSWORD = BreadcrumbChildren(_('Change password'))
    MY_PROFILE = BreadcrumbChildren(_('My profile'))

    # website
    MY_WEBSITE_LIST = BreadcrumbChildren(_('My Website'), 'MyCompanyWebsiteList')

    # company
    COMPANY_PAGE = BreadcrumbChildren(_('Company'), 'CompanyList')
    COMPANY_OVERVIEW_PAGE = BreadcrumbChildren(_('Company Overview'), 'CompanyListOverviewList')
    COMPANY_OVERVIEW_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    COMPANY_DIAGRAM = BreadcrumbChildren(_('Company Diagram'), 'TenantDiagramView')

    # TENANT_INFORMATION_PAGE = BreadcrumbChildren('Tenant Information', 'TenantInformation')

    # Workflow
    WORKFLOW_LIST_PAGE = BreadcrumbChildren(_('Workflow'), 'WorkflowList')
    WORKFLOW_CREATE_PAGE = BreadcrumbChildren(_('Workflow create'), 'WorkflowCreate')
    WORKFLOW_DETAIL_PAGE = BreadcrumbChildren(_('Workflow detail'))

    # Contact, Account
    CONTACT_LIST_PAGE = BreadcrumbChildren(_('Contact'), 'ContactList')
    CONTACT_CREATE_PAGE = BreadcrumbChildren(_('Contact create'), 'ContactCreate')
    CONTACT_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    CONTACT_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    ACCOUNT_LIST_PAGE = BreadcrumbChildren(_('Account'), 'AccountList')
    ACCOUNT_CREATE_PAGE = BreadcrumbChildren(_('Account create'), 'AccountCreate')
    ACCOUNT_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    ACCOUNT_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    # Master data config
    MASTER_DATA_PRICE_PAGE = BreadcrumbChildren(_('Master data price'), 'PriceMasterDataList')
    MEETING_CONFIG_PAGE = BreadcrumbChildren(_('Meeting config'), 'MeetingScheduleMasterdataList')

    # Master data
    CONTACT_MASTER_DATA_LIST_PAGE = BreadcrumbChildren(_('Master data contact'), 'ContactMasterDataList')
    ACCOUNT_MASTER_DATA_LIST_PAGE = BreadcrumbChildren(_('Master data account'), 'AccountMasterDataList')
    PRODUCT_MASTER_DATA_LIST_PAGE = BreadcrumbChildren(_('Master data product'), 'ProductMasterDataList')

    # Product
    PRODUCT_LIST_PAGE = BreadcrumbChildren(_('Product'), 'ProductList')
    PRODUCT_CREATE_PAGE = BreadcrumbChildren(_('Product create'), 'ProductCreate')
    PRODUCT_DETAIL_PAGE = BreadcrumbChildren(_('Product Detail'))
    PRODUCT_UPDATE_PAGE = BreadcrumbChildren(_('Product Update'))

    # Product Modification
    PRODUCT_MODIFICATION_LIST_PAGE = BreadcrumbChildren(_('Product Modification'), 'ProductModificationList')
    PRODUCT_MODIFICATION_CREATE_PAGE = BreadcrumbChildren(_('Create'), 'ProductModificationCreate')
    PRODUCT_MODIFICATION_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    PRODUCT_MODIFICATION_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    # Product Modification BOM
    PRODUCT_MODIFICATION_BOM_LIST_PAGE = BreadcrumbChildren(_('Product Modification BOM'), 'ProductModificationBOMList')
    PRODUCT_MODIFICATION_BOM_CREATE_PAGE = BreadcrumbChildren(_('Create'), 'ProductModificationBOMCreate')
    PRODUCT_MODIFICATION_BOM_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    PRODUCT_MODIFICATION_BOM_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    # Equipment loan
    EQUIPMENT_LOAN_LIST_PAGE = BreadcrumbChildren(_('Equipment Loan'), 'EquipmentLoanList')
    EQUIPMENT_LOAN_CREATE_PAGE = BreadcrumbChildren(_('Create'), 'EquipmentLoanCreate')
    EQUIPMENT_LOAN_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    EQUIPMENT_LOAN_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    # Equipment return
    EQUIPMENT_RETURN_LIST_PAGE = BreadcrumbChildren(_('Equipment Return'), 'EquipmentReturnList')
    EQUIPMENT_RETURN_CREATE_PAGE = BreadcrumbChildren(_('Create'), 'EquipmentReturnCreate')
    EQUIPMENT_RETURN_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    EQUIPMENT_RETURN_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    # Advance
    ADVANCE_PAYMENT_LIST_PAGE = BreadcrumbChildren(_('Advance Payment'), 'AdvancePaymentList')
    ADVANCE_PAYMENT_CREATE_PAGE = BreadcrumbChildren(_('Advance Payment create'), 'AdvancePaymentCreate')
    ADVANCE_PAYMENT_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    ADVANCE_PAYMENT_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    # AR invoice
    AR_INVOICE_LIST_PAGE = BreadcrumbChildren(_('AR invoice'), 'ARInvoiceList')
    AR_INVOICE_CREATE_PAGE = BreadcrumbChildren(_('AR invoice create'), 'ARInvoiceCreate')
    AR_INVOICE_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    AR_INVOICE_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    # AP invoice
    AP_INVOICE_LIST_PAGE = BreadcrumbChildren(_('AP invoice'), 'APInvoiceList')
    AP_INVOICE_CREATE_PAGE = BreadcrumbChildren(_('AP invoice create'), 'APInvoiceCreate')
    AP_INVOICE_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    AP_INVOICE_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    # Payment
    PAYMENT_LIST_PAGE = BreadcrumbChildren(_('Payment'), 'PaymentList')
    PAYMENT_CREATE_PAGE = BreadcrumbChildren(_('Payment create'), 'PaymentCreate')
    PAYMENT_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))

    # Price
    PRICE_LIST_PAGE = BreadcrumbChildren(_('Price List'), 'PriceList')
    PRICE_LIST_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))

    # Expense
    EXPENSE_LIST_PAGE = BreadcrumbChildren(_('Expense'), 'ExpenseList')

    # Promotion
    PROMOTION_LIST_PAGE = BreadcrumbChildren(_('Promotion'), 'PromotionList')
    PROMOTION_CREATE_PAGE = BreadcrumbChildren(_('Promotion create'), 'PromotionCreate')
    PROMOTION_DETAIL_PAGE = BreadcrumbChildren(_('Promotion detail'))
    PROMOTION_EDIT_PAGE = BreadcrumbChildren(_('Promotion edit'))

    # Opportunity
    OPPORTUNITY_LIST_PAGE = BreadcrumbChildren(_('Opportunity'), 'OpportunityList')
    OPPORTUNITY_CONTRAT_SUMMARY_PAGE = BreadcrumbChildren(_('Contract summary'), 'OpportunityContractSummary')

    # Quotation
    QUOTATION_CONFIG_PAGE = BreadcrumbChildren(_('Quotation'), 'QuotationConfigDetail')
    QUOTATION_LIST_PAGE = BreadcrumbChildren(_('Sale quotation'), 'QuotationList')
    QUOTATION_CREATE_PAGE = BreadcrumbChildren(_('Sale quotation create'), 'QuotationCreate')
    QUOTATION_DETAIL_PAGE = BreadcrumbChildren(_('Sale quotation detail'))
    QUOTATION_UPDATE_PAGE = BreadcrumbChildren(_('Sale quotation update'))

    # Bidding
    BIDDING_LIST_PAGE = BreadcrumbChildren(_('Bidding list'), 'BiddingList')
    BIDDING_CREATE_PAGE = BreadcrumbChildren(_('Bidding create'), 'BiddingCreate')

    # Shipping
    SHIPPING_LIST_PAGE = BreadcrumbChildren(_('Shipping'), 'ShippingList')
    SHIPPING_CREATE_PAGE = BreadcrumbChildren(_('Shipping create'), 'ShippingCreate')
    SHIPPING_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))

    # Sale order
    SALE_ORDER_CONFIG_PAGE = BreadcrumbChildren(_('Sale Order'), 'SaleOrderConfigDetail')
    SALE_ORDER_LIST_PAGE = BreadcrumbChildren(_('Sale Order'), 'SaleOrderList')
    SALE_ORDER_CREATE_PAGE = BreadcrumbChildren(_('Sale order create'), 'SaleOrderCreate')
    SALE_ORDER_DETAIL_PAGE = BreadcrumbChildren(_('Sale order detail'))
    SALE_ORDER_UPDATE_PAGE = BreadcrumbChildren(_('Sale order update'))

    # WareHouse
    WAREHOUSE_LIST_PAGE = BreadcrumbChildren(_('Warehouse list'), 'WareHouseList')

    # Good receipt
    GOOD_RECEIPT_LIST_PAGE = BreadcrumbChildren(_('Good receipt'), 'GoodReceiptList')
    GOOD_RECEIPT_CREATE_PAGE = BreadcrumbChildren(_('Good receipt create'), 'GoodReceiptCreate')
    GOOD_RECEIPT_EDIT_PAGE = BreadcrumbChildren(_('Good receipt edit'))
    GOOD_RECEIPT_DETAIL_PAGE = BreadcrumbChildren(_('Good receipt detail'))

    # Inventory Adjustment
    INVENTORY_ADJUSTMENT_LIST_PAGE = BreadcrumbChildren(_('Inventory adjustment'), 'InventoryAdjustmentList')
    INVENTORY_ADJUSTMENT_CREATE_PAGE = BreadcrumbChildren(_('Inventory adjustment create'), 'InventoryAdjustmentCreate')
    INVENTORY_ADJUSTMENT_EDIT_PAGE = BreadcrumbChildren(_('Inventory adjustment update'))
    INVENTORY_ADJUSTMENT_DETAIL_PAGE = BreadcrumbChildren(_('Inventory adjustment detail'))

    # Transition Data Config
    DELIVERY_CONFIG_PAGE = BreadcrumbChildren(_('Delivery'), 'DeliveryConfigDetail')
    DELIVERY_PICKING_LIST_PAGE = BreadcrumbChildren(_('Picking'), 'OrderPickingList')
    DELIVERY_LIST_PAGE = BreadcrumbChildren(_('Delivery list'), 'OrderDeliveryList')

    # Return Advance
    RETURN_ADVANCE_LIST_PAGE = BreadcrumbChildren(_('Return Advance'), 'ReturnAdvanceList')
    RETURN_ADVANCE_CREATE_PAGE = BreadcrumbChildren(_('Return Advance create'), 'ReturnAdvanceCreate')
    RETURN_ADVANCE_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))

    # Opportunity Detail
    OPPORTUNITY_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))

    # Opportunity Config
    OPPORTUNITY_CONFIG_PAGE = BreadcrumbChildren(_('Opportunity'), 'OpportunityConfigDetail')

    # Payment Config
    PAYMENT_CONFIG_PAGE = BreadcrumbChildren(_('Payment Config'), 'PaymentConfigList')

    # Task
    OPPORTUNITY_TASK_CONFIG_PAGE = BreadcrumbChildren(_('Task config'), 'OpportunityTaskConfig')
    OPPORTUNITY_TASK_LIST_PAGE = BreadcrumbChildren(_('Task'), 'OpportunityTaskList')

    # Document
    DOCUMENT_MASTER_DATA_LIST_PAGE = BreadcrumbChildren(_('Master data document'), 'DocumentTypeMasterDataList')

    # Bidding Result config
    BIDDING_RESULT_CONFIG_PAGE = BreadcrumbChildren(_('Bidding'), 'BiddingResultConfigList')

    # Sale Activities
    CALL_LOG_LIST_PAGE = BreadcrumbChildren(_('Call to customer'), 'OpportunityCallLogList')
    EMAIL_LIST_PAGE = BreadcrumbChildren(_('Send email'), 'OpportunityEmailList')
    MEETING_LIST_PAGE = BreadcrumbChildren(_('Meeting with customer'), 'OpportunityMeetingList')

    OPPORTUNITY_DOCUMENT_LIST_PAGE = BreadcrumbChildren(_('Document for customer'), 'OpportunityDocumentList')

    # Purchase
    # PURCHASE_REQUEST_LIST_PAGE = BreadcrumbChildren(_('Purchase Request List'), 'PurchaseRequestList'),
    # Purchase Quotation Request
    PURCHASE_QUOTATION_REQUEST = BreadcrumbChildren(
        _('Purchase Quotation Request'), 'PurchaseQuotationRequestList'
    )
    PURCHASE_QUOTATION_REQUEST_CREATE_FROM_PR = BreadcrumbChildren(
        _('Purchase Quotation Request create (From PR)'), 'PurchaseQuotationRequestCreateFromPR'
    )
    PURCHASE_QUOTATION_REQUEST_CREATE_MANUAL = BreadcrumbChildren(
        _('Purchase Quotation Request create (Manual)'), 'PurchaseQuotationRequestCreateManual'
    )
    PURCHASE_QUOTATION_REQUEST_DETAIL = BreadcrumbChildren(
        _('Purchase Quotation Request detail'),
    )

    PURCHASE_QUOTATION = BreadcrumbChildren(
        _('Purchase Quotation'), 'PurchaseQuotationList'
    )
    PURCHASE_QUOTATION_CREATE = BreadcrumbChildren(
        _('Purchase Quotation create '), 'PurchaseQuotationCreate'
    )
    PURCHASE_QUOTATION_DETAIL = BreadcrumbChildren(
        _('Purchase Quotation detail'),
    )

    PURCHASE_REQUEST_LIST = BreadcrumbChildren(
        _('Purchase Request'), 'PurchaseRequestList'
    )

    # Process
    PROCESS_CONFIG_LIST = BreadcrumbChildren(
        _('Process configuration'), 'ProcessList'
    )
    PROCESS_RUNTIME_LIST = BreadcrumbChildren(
        _('Process runtime'), 'ProcessRuntimeListView'
    )

    # Expense item

    EXPENSE_ITEM_LIST_PAGE = BreadcrumbChildren(
        _('Expense List'), 'ExpenseItemList'
    )

    # Purchase order
    PURCHASE_ORDER_LIST_PAGE = BreadcrumbChildren(_('Purchase order'), 'PurchaseOrderList')
    PURCHASE_ORDER_CREATE_PAGE = BreadcrumbChildren(_('Purchase order create'), 'PurchaseOrderCreate')
    PURCHASE_ORDER_DETAIL_PAGE = BreadcrumbChildren(_('Purchase order detail'))
    PURCHASE_ORDER_UPDATE_PAGE = BreadcrumbChildren(_('Purchase order update'))

    # Goods receipt
    GOODS_RECEIPT_LIST_PAGE = BreadcrumbChildren(_('Goods receipt'), 'GoodsReceiptList')
    GOODS_RECEIPT_CREATE_PAGE = BreadcrumbChildren(_('Goods receipt create'), 'GoodsReceiptCreate')
    GOODS_RECEIPT_DETAIL_PAGE = BreadcrumbChildren(_('Goods receipt detail'))
    GOODS_RECEIPT_UPDATE_PAGE = BreadcrumbChildren(_('Goods receipt update'))

    # Goods detail
    GOODS_DETAIL_PAGE = BreadcrumbChildren(_('Goods detail'), 'GoodsDetail')

    # Purchase request config
    PURCHASE_REQUEST_CONFIG_PAGE = BreadcrumbChildren(_('Purchase Request'), 'PurchaseRequestConfig')

    # Goods transfer
    GOODS_TRANSFER_LIST_PAGE = BreadcrumbChildren(_('Goods Transfer'), 'GoodsTransferList')

    # Goods issue
    GOODS_ISSUE_LIST_PAGE = BreadcrumbChildren(_('Goods issue'), 'GoodsIssueList')

    # E-Office
    #  Leave
    LEAVE_CONFIG = BreadcrumbChildren(
        _('Leave config'), 'LeaveConfigDetail'
    )
    LEAVE_REQUEST = BreadcrumbChildren(
        _('Leave request list'), 'LeaveRequestList'
    )
    LEAVE_AVAILABLE = BreadcrumbChildren(
        _('Leave available list'), 'LeaveAvailableList'
    )
    LEAVE_REQUEST_CREATE = BreadcrumbChildren(
        _('Create'), 'LeaveRequestCreate'
    )
    LEAVE_REQUEST_DETAIL = BreadcrumbChildren(_('Detail'))
    LEAVE_REQUEST_EDIT = BreadcrumbChildren(_('Edit'))

    # Working calendar
    WORKING_CALENDAR_CONFIG = BreadcrumbChildren(_('Working calendar'), 'WorkingCalendarConfig')

    # Business trip
    BUSINESS_TRIP_REQUEST = BreadcrumbChildren(
        _('Business trip list'), 'BusinessTripRequestList'
    )
    BUSINESS_TRIP_CREATE = BreadcrumbChildren(
        _('Create'), 'BusinessTripCreate'
    )

    # Final acceptance
    FINAL_ACCEPTANCE_LIST_PAGE = BreadcrumbChildren(_('Final acceptance'), 'FinalAcceptanceList')

    # Calendar
    CALENDAR_LIST_PAGE = BreadcrumbChildren(_('Calendar'), 'ProgrammeList')

    # Asset tools
    ASSET_TOOLS_PROVIDE_LIST = BreadcrumbChildren(_('Asset, Tools provide list'), 'AssetToolsProvideRequestList')
    ASSET_TOOLS_DELIVERY_LIST = BreadcrumbChildren(_('Asset, Tools delivery list'), 'AssetToolsDeliveryList')
    ASSET_TOOLS_RETURN_LIST = BreadcrumbChildren(_('Asset, Tools return list'), 'AssetToolsReturnList')

    MEETING_SCHEDULE_LIST_PAGE = BreadcrumbChildren(_('Meeting schedule list'), 'MeetingScheduleList')
    MEETING_ZOOM_CONFIG_LIST_PAGE = BreadcrumbChildren(_('Zoom account config'), 'MeetingZoomConfigList')
    MEETING_SCHEDULE_CREATE_PAGE = BreadcrumbChildren(_('Meeting schedule create'), 'MeetingScheduleCreate')
    MEETING_SCHEDULE_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))

    DASHBOARD_COMMON_PAGE = BreadcrumbChildren(_('Dashboard'), 'DashboardCommonPage')
    DASHBOARD_GENERAL_LIST_PAGE = BreadcrumbChildren(_('General dashboard'), 'DashboardGeneralList')
    DASHBOARD_PIPELINE_LIST_PAGE = BreadcrumbChildren(_('Pipeline dashboard'), 'DashboardPipelineList')

    PERIODS_CONFIG_PAGE = BreadcrumbChildren(_('Periods config'), 'PeriodsConfigList')
    ACCOUNTING_POLICIES_PAGE = BreadcrumbChildren(_('Accounting policies'), 'AccountingPoliciesList')

    BALANCE_INIT_PAGE = BreadcrumbChildren(_('Balance initialization'), 'BalanceInitList')

    INVOICE_SIGN_PAGE = BreadcrumbChildren(_('Invoice sign'), 'InvoiceSignList')

    INVENTORY_INTERACT_CONFIG = BreadcrumbChildren(_('Warehouse config'), 'WarehouseConfigList')

    REVENUE_PLAN_CONFIG_PAGE = BreadcrumbChildren(_('Revenue plan config'), 'RevenuePlanConfigList')

    REVENUE_PLAN_LIST_PAGE = BreadcrumbChildren(_('Revenue plan list'), 'RevenuePlanList')
    REVENUE_PLAN_CREATE_PAGE = BreadcrumbChildren(_('Revenue plan create'), 'RevenuePlanCreate')
    REVENUE_PLAN_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    REVENUE_PLAN_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    BUDGET_PLAN_LIST_PAGE = BreadcrumbChildren(_('Budget plan list'), 'BudgetPlanList')
    BUDGET_PLAN_CREATE_PAGE = BreadcrumbChildren(_('Budget plan create'), 'BudgetPlanCreate')
    BUDGET_PLAN_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    BUDGET_PLAN_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    # Report
    REPORT_REVENUE_LIST_PAGE = BreadcrumbChildren(_('Revenue report'), 'ReportRevenueList')
    REPORT_PRODUCT_LIST_PAGE = BreadcrumbChildren(_('Product report'), 'ReportProductList')
    REPORT_CUSTOMER_LIST_PAGE = BreadcrumbChildren(_('Customer report'), 'ReportCustomerList')
    REPORT_PIPELINE_LIST_PAGE = BreadcrumbChildren(_('Pipeline report'), 'ReportPipelineList')
    REPORT_CASHFLOW_LIST_PAGE = BreadcrumbChildren(_('Cashflow report'), 'ReportCashflowList')
    REPORT_INVENTORY_COST_LIST_PAGE = BreadcrumbChildren(_('Inventory Report'), 'ReportInventoryList')
    REPORT_INVENTORY_STOCK_LIST_PAGE = BreadcrumbChildren(_('Items Detail Report'), 'ReportInventoryDetailList')
    REPORT_PURCHASING_LIST_PAGE = BreadcrumbChildren(_('Purchase order report'), 'PurchaseOrderReportList')
    BUDGET_REPORT_LIST_PAGE = BreadcrumbChildren(_('Budget report'), 'BudgetReportList')

    GOODS_RETURN_LIST_PAGE = BreadcrumbChildren(_('Goods return list'), 'GoodsReturnList')
    GOODS_RETURN_CREATE_PAGE = BreadcrumbChildren(_('Goods return create'), 'GoodsReturnCreate')
    GOODS_RETURN_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    GOODS_RETURN_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    CASH_INFLOW_LIST_PAGE = BreadcrumbChildren(_('Cash inflow list'), 'CashInflowList')
    CASH_INFLOW_CREATE_PAGE = BreadcrumbChildren(_('Cash inflow create'), 'CashInflowCreate')
    CASH_INFLOW_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    CASH_INFLOW_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    RECON_LIST_PAGE = BreadcrumbChildren(_('Reconciliation list'), 'ReconList')
    RECON_CREATE_PAGE = BreadcrumbChildren(_('Reconciliation create'), 'ReconCreate')
    RECON_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    RECON_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    CASH_OUTFLOW_LIST_PAGE = BreadcrumbChildren(_('Cash outflow list'), 'CashOutflowList')
    CASH_OUTFLOW_CREATE_PAGE = BreadcrumbChildren(_('Cash outflow create'), 'CashOutflowCreate')
    CASH_OUTFLOW_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    CASH_OUTFLOW_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    GOODS_REGISTRATION_LIST_PAGE = BreadcrumbChildren(_('Goods registration list'), 'GoodsRegistrationList')
    GOODS_REGISTRATION_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))

    LEAD_LIST_PAGE = BreadcrumbChildren(_('Lead list'), 'LeadList')
    LEAD_CREATE_PAGE = BreadcrumbChildren(_('Lead create'), 'LeadCreate')
    LEAD_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    LEAD_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    DISTRIBUTION_PLAN_LIST_PAGE = BreadcrumbChildren(_('Goods stock plan list'), 'DistributionPlanList')
    DISTRIBUTION_PLAN_CREATE_PAGE = BreadcrumbChildren(_('Goods stock plan create'), 'DistributionPlanCreate')
    DISTRIBUTION_PLAN_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    DISTRIBUTION_PLAN_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    BOM_LIST_PAGE = BreadcrumbChildren(_('Production BOM list'), 'BOMList')
    BOM_CREATE_PAGE = BreadcrumbChildren(_('Production BOM create'), 'BOMCreate')
    BOM_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    BOM_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    OPP_BOM_LIST_PAGE = BreadcrumbChildren(_('Opportunity BOM list'), 'OpportunityBOMList')
    OPP_BOM_CREATE_PAGE = BreadcrumbChildren(_('Opportunity BOM create'), 'OpportunityBOMCreate')
    OPP_BOM_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    OPP_BOM_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    PRINTER_CONFIG_LIST_PAGE = BreadcrumbChildren(_('Print List'), 'PrintTemplatesListView')
    MAILER_CONFIG_LIST_PAGE = BreadcrumbChildren(_('Mail Template'), 'MailTemplatesListView')
    IMPORT_LIST_PAGE = BreadcrumbChildren(_('Import List'), 'FImportListView')
    FORM_LIST_PAGE = BreadcrumbChildren(_('Forms'), 'FormListView')
    FORM_ENTRIES_LIST_PAGE = BreadcrumbChildren(_('Entries Data'))

    LOGS = BreadcrumbChildren(_('Logs'))

    # PROJECT
    PROJECT_HOME = BreadcrumbChildren(_('Project home'), 'ProjectList')
    PROJECT_LIST = BreadcrumbChildren(_('Project list'), 'ProjectList')
    PROJECT_WORKS = BreadcrumbChildren(_('Project works'), 'ProjectWorkList')
    PROJECT_CONFIG = BreadcrumbChildren(_('Project config'), 'ProjectConfig')
    PROJECT_ACTIVITIES = BreadcrumbChildren(_('Project activities'), 'ProjectActivities')
    PROJECT_TASKS_LIST = BreadcrumbChildren(_('Project task list'), 'ProjectTaskList')

    # Zones
    ZONES_LIST_PAGE = BreadcrumbChildren(_('Zones'), 'ZonesList')

    # Contract
    CONTRACT_LIST_PAGE = BreadcrumbChildren(_('Contract approval'), 'ContractApprovalList')

    # Production
    PRODUCTION_ORDER_LIST_PAGE = BreadcrumbChildren(_('Production order'), 'ProductionOrderList')
    PRODUCTION_REPORT_LIST_PAGE = BreadcrumbChildren(_('Production report'), 'ProductionReportList')
    WORK_ORDER_LIST_PAGE = BreadcrumbChildren(_('Work order'), 'WorkOrderList')

    # Recurrence
    RECURRENCE_LIST_PAGE = BreadcrumbChildren(_('Recurrence'), 'RecurrenceList')
    RECURRENCE_TEMPLATE_LIST_PAGE = BreadcrumbChildren(_('Transaction template'), 'TransactionTemplateList')
    RECURRENCE_ACTION_LIST_PAGE = BreadcrumbChildren(_('Action list'), 'RecurrenceActionList')
    # HRM
    HRM_EMPLOYEE_LIST_PAGE = BreadcrumbChildren(_('HRM Employee info'), 'HRMEmployeeList')
    HRM_EMPLOYEE_CREATE_PAGE = BreadcrumbChildren(_('Create'), 'HRMEmployeeCreate')
    HRM_EMPLOYEE_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    HRM_EMPLOYEE_UPDATE_PAGE = BreadcrumbChildren(_('Update'))
    # HRM OVERTIME REQUEST
    HRM_OVERTIME_LIST_PAGE = BreadcrumbChildren(_('Overtime request'), 'OvertimeList')
    HRM_OVERTIME_CREATE_PAGE = BreadcrumbChildren(_('Create'), 'OvertimeCreate')
    HRM_OVERTIME_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    HRM_OVERTIME_UPDATE_PAGE = BreadcrumbChildren(_('Update'))
    # HRM PAYROLL TEMPLATE
    HRM_PAYROLL_TEMPLATE_LIST_PAGE = BreadcrumbChildren(_('Payroll template'), 'PayrollTemplateList')
    HRM_PAYROLL_TEMPLATE_CREATE_PAGE = BreadcrumbChildren(_('Create'), 'PayrollTemplateCreate')
    HRM_PAYROLL_TEMPLATE_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    HRM_PAYROLL_TEMPLATE_UPDATE_PAGE = BreadcrumbChildren(_('Update'))
    # HRM TEMPLATE ATTRIBUTE
    HRM_TEMPLATE_ATTRIBUTE_LIST_PAGE = BreadcrumbChildren(_('Tempate attribute'), 'PayrollTemplAttrList')

    # CONTRACT TEMPLATE
    CONTRACT_TEMPLATE_LIST_PAGE = BreadcrumbChildren(_('Contract template list'), 'ContractTemplateList')
    CONTRACT_TEMPLATE_CREATE_PAGE = BreadcrumbChildren(_('Create'), 'ContractTemplateCreate')
    CONTRACT_TEMPLATE_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    CONTRACT_TEMPLATE_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    # Accounting
    CHART_OF_ACCOUNTS_LIST_PAGE = BreadcrumbChildren(_('Chart of accounts'), 'ChartOfAccountsList')
    DEFAULT_ACCOUNT_DETERMINATION_LIST_PAGE = BreadcrumbChildren(_('Default account determination'),
                                                                 'DefaultAccountDeterminationList')

    # Journal entry
    JOURNAL_ENTRY_LIST_PAGE = BreadcrumbChildren(_('Journal entry'), 'JournalEntryList')
    JOURNAL_ENTRY_CREATE_PAGE = BreadcrumbChildren(_('Create'), 'JournalEntryCreate')
    JOURNAL_ENTRY_DETAIL_PAGE = BreadcrumbChildren(_('Detail'))
    JOURNAL_ENTRY_UPDATE_PAGE = BreadcrumbChildren(_('Update'))

    # Consulting
    CONSULTING_LIST_PAGE = BreadcrumbChildren(_('Consulting list'), 'ConsultingList')
    CONSULTING_CREATE_PAGE = BreadcrumbChildren(_('Consulting create'), 'ConsultingCreate')

    # Lease order
    LEASE_ORDER_CONFIG_PAGE = BreadcrumbChildren(_('Lease Order'), 'LeaseOrderConfigDetail')
    LEASE_ORDER_LIST_PAGE = BreadcrumbChildren(_('Lease order'), 'LeaseOrderList')
    LEASE_ASSET_LIST_PAGE = BreadcrumbChildren(_('Lease asset list'), 'LeaseOrderAssetList')

    # Partnercenter
    PARTNER_CENTER_LIST_PAGE = BreadcrumbChildren(_('Lists'), 'ListList')

    # Fixed asset
    CATEGORY_MASTER_DATA_LIST_PAGE = BreadcrumbChildren(_('Master data categories'), 'CategoryMasterDataList')
    FIXED_ASSET_PAGE = BreadcrumbChildren(_('Fixed Asset'), 'FixedAssetList')
    FIXED_ASSET_WRITE_OFF_PAGE = BreadcrumbChildren(_('Fixed Asset Write-off'), 'FixedAssetWriteOffList')

    # Bank
    BANK_MASTER_DATA_LIST_PAGE = BreadcrumbChildren(_('Master data bank'), 'BankMasterDataList')

    # Instrument tool
    INSTRUMENT_TOOL_PAGE = BreadcrumbChildren(_('Instrument Tool'), 'InstrumentToolList')
    INSTRUMENT_TOOL_WRITE_OFF_PAGE = BreadcrumbChildren(_('Instrument Tool Write-off'), 'InstrumentToolWriteOffList')

    # Contract
    GOODS_RECOVERY_LIST_PAGE = BreadcrumbChildren(_('Goods recovery'), 'GoodsRecoveryList')

    # Group Order
    GROUP_ORDER_PAGE = BreadcrumbChildren(_('Group order'), 'GroupOrderList')

    # Payment plan
    PAYMENT_PLAN_LIST_PAGE = BreadcrumbChildren(_('Payment plan'), 'PaymentPlanList')

    # KMS
    KMS_DOC_TYPE_LIST = BreadcrumbChildren(_('Document type'), 'DocumentTypeConfigList')
    KMS_CONTENT_GROUP_LIST = BreadcrumbChildren(_('Content group'), 'ContentGroupList')
    KMS_DOCUMENT_APPROVAL_LIST = BreadcrumbChildren(_('Document approval'), 'KMSDocumentApprovalList')

    # Incoming Document
    INCOMING_DOCUMENT_LIST = BreadcrumbChildren(_('Incoming document'), 'IncomingDocumentList')

    # BFlow Chatbot
    BFLOW_AI_CHATBOT_PAGE = BreadcrumbChildren(_('BFlow Chatbot'), 'BFlowAIChatbot')

    # Shift
    MASTER_DATA_SHIFT_PAGE = BreadcrumbChildren(_('Master data shift'), 'ShiftMasterDataList')

    # Shift assignment
    SHIFT_ASSIGNMENT_LIST_PAGE = BreadcrumbChildren(_('Shift assignment'), 'ShiftAssignmentList')

    # Attendance
    HRM_ATTENDANCE_LIST_PAGE = BreadcrumbChildren(_('HRM Attendance info'), 'HRMAttendanceList')

    # Device integrate
    DEVICE_EMPLOYEE_INTEGRATE_LIST_PAGE = BreadcrumbChildren(_('Synchronize employee'), 'DeviceIntegrateEmployeeList')

    # Attendance device
    ATTENDANCE_DEVICE_LIST_PAGE = BreadcrumbChildren(_('Attendance device config'), 'AttendanceDeviceList')

    # Absence explanation
    ABSENCE_EXPLANATION_LIST = BreadcrumbChildren(_('Absence Explanation'), 'AbsenceExplanationList')

    # master data - attribute
    ATTRIBUTE_LIST_PAGE = BreadcrumbChildren(_('Product/Service attribute'), 'AttributeList')

    # Service order
    SERVICE_ORDER_PAGE = BreadcrumbChildren(_('Service order'), 'ServiceOrderList')
    SERVICE_ORDER_DETAIL_DASHBOARD_PAGE = BreadcrumbChildren(_('Service order detail dashboard'), 'ServiceOrderDetailDashboard')

    # shipment
    SHIPMENT_MASTER_DATA_LIST_PAGE = BreadcrumbChildren(_('Master data shipment'), 'ShipmentMasterDataList')

    # Service quotation
    SERVICE_QUOTATION_PAGE = BreadcrumbChildren(_('Service quotation'), 'ServiceQuotationList')

    # Payroll configuration
    PAYROLL_CONFIG_PAGE = BreadcrumbChildren(_('Payroll config'), 'PayrollConfigDetail')


class BreadcrumbView:
    """menu vertical item view"""

    @staticmethod
    def get_list_view(search_txt=''):
        arr = []
        for att in dir(BreadcrumbItem()):
            if not att.startswith('__'):
                child = getattr(BreadcrumbItem, att)
                if child.url:
                    search_txt = unidecode(search_txt.lower())
                    main_txt = unidecode(child.title.lower())
                    if search_txt in main_txt:
                        arr.append(
                            {
                                'view_name': child.url,
                                'title': child.title,
                            }
                        )
        arr = sorted(arr, key=itemgetter('title'))
        return arr

    @staticmethod
    def check_view_name():
        """
        Check view was used in BreadcrumbItem that is exists
        Returns:
            True : Nothing happened
            or NoReverseMatch : raise Error and interrupt runtime process
        """
        if hasattr(sys, 'argv') and isinstance(sys.argv, list) and len(sys.argv) > 0:
            if sys.argv[0].endswith('mange.py') or sys.argv[0].endswith('wsgi.py'):  # allow check when runserver
                view_errs = {}
                for att in dir(BreadcrumbItem()):
                    if not att.startswith('__'):
                        child = getattr(BreadcrumbItem, att)
                        try:
                            if child.url:
                                if child.kw_pattern and child.arg_pattern:
                                    reverse(child.url, args=child.arg_pattern, kwargs=child.kw_pattern)
                                elif child.arg_pattern:
                                    reverse(child.url, args=child.arg_pattern)
                                elif child.kw_pattern:
                                    reverse(child.url, kwargs=child.kw_pattern)
                                else:
                                    reverse(child.url)

                        except NoReverseMatch as err:
                            view_errs[att] = str(err)

                if view_errs:
                    msg = 'Some view was used in Breadcrumb does not exist. It is: \n'
                    msg += '************************************************************\n'
                    for k, value in view_errs.items():
                        msg += f'* {k}: {value}\n'
                    msg += '************************************************************\n'
                    raise NoReverseMatch(msg)
        return True

    @classmethod
    def parsed(cls, name: str) -> list:
        """method parsed data custom"""
        result = []
        data = getattr(cls, name, [])
        if data and isinstance(data, list):
            has_append_code = False
            for item in data[::-1]:
                item_data = item.data
                if item_data['is_append_code'] is True:
                    if has_append_code is False:
                        has_append_code = True
                    else:
                        item_data['is_append_code'] = False
                result.append(item_data)
        return result[::-1]

    HOME_PAGE = [
        BreadcrumbItem.HOME_PAGE,
    ]
    NOTIFICATIONS_PAGE = [BreadcrumbItem.NOTIFICATIONS_PAGE]

    EMPLOYEE_LIST_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.EMPLOYEE_LIST_PAGE,
    ]
    EMPLOYEE_CREATE_PAGE = EMPLOYEE_LIST_PAGE + [BreadcrumbItem.EMPLOYEE_CREATE_PAGE]
    EMPLOYEE_UPDATE_PAGE = EMPLOYEE_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]
    EMPLOYEE_DETAIL_PAGE = EMPLOYEE_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]

    USER_LIST_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.USER_LIST_PAGE,
    ]
    USER_CREATE_PAGE = USER_LIST_PAGE + [BreadcrumbItem.USER_CREATE_PAGE]
    USER_DETAIL_PAGE = USER_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    USER_EDIT_PAGE = USER_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]
    USER_CHANGE_PASSWORD = USER_LIST_PAGE + [BreadcrumbItem.USER_CHANGE_PASSWORD]
    MY_PROFILE_PAGE = [BreadcrumbItem.HOME_PAGE, BreadcrumbItem.MY_PROFILE]

    MY_WEBSITE_LIST = [BreadcrumbItem.MY_WEBSITE_LIST]

    GROUP_LEVEL_LIST_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.GROUP_LIST_PAGE,
        BreadcrumbItem.GROUP_LEVEL_LIST_PAGE,
    ]
    GROUP_LIST_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.GROUP_LIST_PAGE,
    ]
    GROUP_CREATE = GROUP_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    GROUP_DETAIL = GROUP_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    GROUP_UPDATE = GROUP_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    COMPANY_LIST_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.COMPANY_PAGE,
    ]
    COMPANY_CREATE_PAGE = COMPANY_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    COMPANY_DETAIL_PAGE = COMPANY_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    COMPANY_UPDATE_PAGE = COMPANY_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]
    COMPANY_DIAGRAM = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.COMPANY_DIAGRAM,
    ]
    COMPANY_OVERVIEW_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.COMPANY_PAGE,
        BreadcrumbItem.COMPANY_OVERVIEW_PAGE,
    ]
    COMPANY_OVERVIEW_DETAIL_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.COMPANY_PAGE,
        BreadcrumbItem.COMPANY_OVERVIEW_PAGE,
        BreadcrumbItem.COMPANY_OVERVIEW_DETAIL_PAGE,
    ]

    ROLE_LIST_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.ROLE_LIST_PAGE,
    ]
    ROLE_CREATE_PAGE = ROLE_LIST_PAGE + [BreadcrumbItem.ROLE_CREATE_PAGE]
    ROLE_DETAIL_PAGE = ROLE_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    ROLE_UPDATE_PAGE = ROLE_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # TENANT_INFORMATION_PAGE = [BreadcrumbItem.HOME_PAGE, BreadcrumbItem.TENANT_INFORMATION_PAGE]
    WORKFLOW_LIST_PAGE = [
        BreadcrumbItem.WORKFLOW_LIST_PAGE
    ]
    WORKFLOW_CREATE_PAGE = WORKFLOW_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    WORKFLOW_DETAIL_PAGE = WORKFLOW_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    WORKFLOW_UPDATE_PAGE = WORKFLOW_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    CONTACT_LIST_PAGE = [
        BreadcrumbItem.CONTACT_LIST_PAGE
    ]
    CONTACT_CREATE_PAGE = CONTACT_LIST_PAGE + [BreadcrumbItem.CONTACT_CREATE_PAGE]
    CONTACT_DETAIL_PAGE = CONTACT_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    CONTACT_UPDATE_PAGE = CONTACT_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    ACCOUNT_LIST_PAGE = [
        BreadcrumbItem.ACCOUNT_LIST_PAGE
    ]
    ACCOUNT_CREATE_PAGE = ACCOUNT_LIST_PAGE + [BreadcrumbItem.ACCOUNT_CREATE_PAGE]
    ACCOUNT_DETAIL_PAGE = ACCOUNT_LIST_PAGE + [BreadcrumbItem.ACCOUNT_DETAIL_PAGE]
    ACCOUNT_UPDATE_PAGE = ACCOUNT_LIST_PAGE + [BreadcrumbItem.ACCOUNT_UPDATE_PAGE]

    MASTER_DATA_PRICE_PAGE = [
        BreadcrumbItem.MASTER_DATA_PRICE_PAGE
    ]

    MEETING_CONFIG_PAGE = [
        BreadcrumbItem.MEETING_CONFIG_PAGE
    ]

    CONTACT_MASTER_DATA_LIST_PAGE = [
        BreadcrumbItem.CONTACT_MASTER_DATA_LIST_PAGE
    ]
    ACCOUNT_MASTER_DATA_LIST_PAGE = [
        BreadcrumbItem.ACCOUNT_MASTER_DATA_LIST_PAGE
    ]
    PRODUCT_MASTER_DATA_LIST_PAGE = [
        BreadcrumbItem.PRODUCT_MASTER_DATA_LIST_PAGE
    ]

    PRODUCT_LIST_PAGE = [
        BreadcrumbItem.PRODUCT_LIST_PAGE
    ]
    PRODUCT_CREATE_PAGE = PRODUCT_LIST_PAGE + [BreadcrumbItem.PRODUCT_CREATE_PAGE]
    PRODUCT_DETAIL_PAGE = PRODUCT_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    PRODUCT_UPDATE_PAGE = PRODUCT_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    PRODUCT_MODIFICATION_LIST_PAGE = [
        BreadcrumbItem.PRODUCT_MODIFICATION_LIST_PAGE
    ]
    PRODUCT_MODIFICATION_CREATE_PAGE = PRODUCT_MODIFICATION_LIST_PAGE + [
        BreadcrumbItem.PRODUCT_MODIFICATION_CREATE_PAGE]
    PRODUCT_MODIFICATION_DETAIL_PAGE = PRODUCT_MODIFICATION_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    PRODUCT_MODIFICATION_UPDATE_PAGE = PRODUCT_MODIFICATION_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    PRODUCT_MODIFICATION_BOM_LIST_PAGE = [
        BreadcrumbItem.PRODUCT_MODIFICATION_BOM_LIST_PAGE
    ]
    PRODUCT_MODIFICATION_BOM_CREATE_PAGE = PRODUCT_MODIFICATION_BOM_LIST_PAGE + [
        BreadcrumbItem.PRODUCT_MODIFICATION_CREATE_PAGE]
    PRODUCT_MODIFICATION_BOM_DETAIL_PAGE = PRODUCT_MODIFICATION_BOM_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    PRODUCT_MODIFICATION_BOM_UPDATE_PAGE = PRODUCT_MODIFICATION_BOM_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    EQUIPMENT_LOAN_LIST_PAGE = [
        BreadcrumbItem.EQUIPMENT_LOAN_LIST_PAGE
    ]
    EQUIPMENT_LOAN_CREATE_PAGE = EQUIPMENT_LOAN_LIST_PAGE + [
        BreadcrumbItem.EQUIPMENT_LOAN_CREATE_PAGE]
    EQUIPMENT_LOAN_DETAIL_PAGE = EQUIPMENT_LOAN_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    EQUIPMENT_LOAN_UPDATE_PAGE = EQUIPMENT_LOAN_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    EQUIPMENT_RETURN_LIST_PAGE = [
        BreadcrumbItem.EQUIPMENT_RETURN_LIST_PAGE
    ]
    EQUIPMENT_RETURN_CREATE_PAGE = EQUIPMENT_RETURN_LIST_PAGE + [
        BreadcrumbItem.EQUIPMENT_RETURN_CREATE_PAGE]
    EQUIPMENT_RETURN_DETAIL_PAGE = EQUIPMENT_RETURN_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    EQUIPMENT_RETURN_UPDATE_PAGE = EQUIPMENT_RETURN_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    ADVANCE_PAYMENT_LIST_PAGE = [
        BreadcrumbItem.ADVANCE_PAYMENT_LIST_PAGE
    ]
    ADVANCE_PAYMENT_CREATE_PAGE = ADVANCE_PAYMENT_LIST_PAGE + [BreadcrumbItem.ADVANCE_PAYMENT_CREATE_PAGE]
    ADVANCE_PAYMENT_DETAIL_PAGE = ADVANCE_PAYMENT_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    ADVANCE_PAYMENT_UPDATE_PAGE = ADVANCE_PAYMENT_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    AR_INVOICE_LIST_PAGE = [
        BreadcrumbItem.AR_INVOICE_LIST_PAGE
    ]
    AR_INVOICE_CREATE_PAGE = AR_INVOICE_LIST_PAGE + [BreadcrumbItem.AR_INVOICE_CREATE_PAGE]
    AR_INVOICE_DETAIL_PAGE = AR_INVOICE_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    AR_INVOICE_UPDATE_PAGE = AR_INVOICE_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    AP_INVOICE_LIST_PAGE = [
        BreadcrumbItem.AP_INVOICE_LIST_PAGE
    ]
    AP_INVOICE_CREATE_PAGE = AP_INVOICE_LIST_PAGE + [BreadcrumbItem.AP_INVOICE_CREATE_PAGE]
    AP_INVOICE_DETAIL_PAGE = AP_INVOICE_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    AP_INVOICE_UPDATE_PAGE = AP_INVOICE_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    PAYMENT_LIST_PAGE = [
        BreadcrumbItem.PAYMENT_LIST_PAGE
    ]
    PAYMENT_CREATE_PAGE = PAYMENT_LIST_PAGE + [BreadcrumbItem.PAYMENT_CREATE_PAGE]
    PAYMENT_DETAIL_PAGE = PAYMENT_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    PAYMENT_CONFIG_PAGE = [BreadcrumbItem.PAYMENT_CONFIG_PAGE]

    PRICE_LIST_PAGE = [
        BreadcrumbItem.PRICE_LIST_PAGE
    ]
    PRICE_LIST_DETAIL_PAGE = PRICE_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    PRICE_LIST_UPDATE_PAGE = PRICE_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    EXPENSE_LIST_PAGE = [BreadcrumbItem.EXPENSE_LIST_PAGE]
    EXPENSE_CREATE_PAGE = EXPENSE_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    EXPENSE_DETAIL_PAGE = EXPENSE_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    EXPENSE_UPDATE_PAGE = EXPENSE_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    PROMOTION_LIST_PAGE = [
        BreadcrumbItem.PROMOTION_LIST_PAGE
    ]
    PROMOTION_CREATE_PAGE = PROMOTION_LIST_PAGE + [BreadcrumbItem.PROMOTION_CREATE_PAGE]
    PROMOTION_DETAIL_PAGE = PROMOTION_LIST_PAGE + [BreadcrumbItem.PROMOTION_DETAIL_PAGE]
    PROMOTION_EDIT_PAGE = PROMOTION_LIST_PAGE + [BreadcrumbItem.PROMOTION_EDIT_PAGE]

    # Opportunity
    OPPORTUNITY_LIST_PAGE = [
        BreadcrumbItem.OPPORTUNITY_LIST_PAGE
    ]
    OPPORTUNITY_DETAIL_PAGE = OPPORTUNITY_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    OPPORTUNITY_UPDATE_PAGE = OPPORTUNITY_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]
    OPPORTUNITY_CONFIG_PAGE = [BreadcrumbItem.OPPORTUNITY_CONFIG_PAGE]
    OPPORTUNITY_CONTRAT_SUMMARY_PAGE = [
        BreadcrumbItem.OPPORTUNITY_CONTRAT_SUMMARY_PAGE
    ]

    # Quotation
    QUOTATION_LIST_PAGE = [
        BreadcrumbItem.QUOTATION_LIST_PAGE
    ]
    QUOTATION_CREATE_PAGE = QUOTATION_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    QUOTATION_DETAIL_PAGE = QUOTATION_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    QUOTATION_UPDATE_PAGE = QUOTATION_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # Bidding
    BIDDING_LIST_PAGE = [
        BreadcrumbItem.BIDDING_LIST_PAGE
    ]
    BIDDING_CREATE_PAGE = BIDDING_LIST_PAGE + [BreadcrumbItem.BIDDING_CREATE_PAGE]
    BIDDING_DETAIL_PAGE = BIDDING_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    BIDDING_UPDATE_PAGE = BIDDING_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # Shipping
    SHIPPING_LIST_PAGE = [
        BreadcrumbItem.SHIPPING_LIST_PAGE
    ]
    SHIPPING_CREATE_PAGE = SHIPPING_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    SHIPPING_DETAIL_PAGE = SHIPPING_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    SHIPPING_UPDATE_PAGE = SHIPPING_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # Sale order
    SALE_ORDER_LIST_PAGE = [
        BreadcrumbItem.SALE_ORDER_LIST_PAGE
    ]
    SALE_ORDER_CREATE_PAGE = SALE_ORDER_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    SALE_ORDER_DETAIL_PAGE = SALE_ORDER_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    SALE_ORDER_UPDATE_PAGE = SALE_ORDER_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # Warehouse
    WAREHOUSE_LIST_PAGE = [
        BreadcrumbItem.WAREHOUSE_LIST_PAGE,
    ]
    WAREHOUSE_CREATE_PAGE = WAREHOUSE_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    WAREHOUSE_DETAIL_PAGE = WAREHOUSE_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    WAREHOUSE_UPDATE_PAGE = WAREHOUSE_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # Good receipt
    GOOD_RECEIPT_LIST_PAGE = [
        BreadcrumbItem.GOOD_RECEIPT_LIST_PAGE
    ]
    GOOD_RECEIPT_CREATE_PAGE = GOOD_RECEIPT_LIST_PAGE + [BreadcrumbItem.GOOD_RECEIPT_CREATE_PAGE]
    GOOD_RECEIPT_EDIT_PAGE = GOOD_RECEIPT_LIST_PAGE + [BreadcrumbItem.GOOD_RECEIPT_EDIT_PAGE]
    GOOD_RECEIPT_DETAIL_PAGE = GOOD_RECEIPT_LIST_PAGE + [BreadcrumbItem.GOOD_RECEIPT_DETAIL_PAGE]

    # Return Advance
    RETURN_ADVANCE_LIST_PAGE = [
        BreadcrumbItem.RETURN_ADVANCE_LIST_PAGE
    ]
    RETURN_ADVANCE_CREATE_PAGE = RETURN_ADVANCE_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    RETURN_ADVANCE_DETAIL_PAGE = RETURN_ADVANCE_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    RETURN_ADVANCE_UPDATE_PAGE = RETURN_ADVANCE_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # Delivery
    ORDER_PICKING_LIST_PAGE = [
        BreadcrumbItem.DELIVERY_PICKING_LIST_PAGE,
    ]
    ORDER_PICKING_DETAIL_PAGE = ORDER_PICKING_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    ORDER_PICKING_EDIT_PAGE = ORDER_PICKING_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]
    ORDER_DELIVERY_LIST_PAGE = [
        BreadcrumbItem.DELIVERY_LIST_PAGE,
    ]
    ORDER_DELIVERY_CREATE_PAGE = [
        BreadcrumbItem.DELIVERY_LIST_PAGE,
        BreadcrumbItem.BASTION_CREATE
    ]
    ORDER_DELIVERY_DETAIL_PAGE = ORDER_DELIVERY_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    ORDER_DELIVERY_EDIT_PAGE = ORDER_DELIVERY_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # Transition Data Config
    DELIVERY_CONFIG = [
        BreadcrumbItem.DELIVERY_CONFIG_PAGE
    ]
    QUOTATION_CONFIG = [
        BreadcrumbItem.QUOTATION_CONFIG_PAGE
    ]
    SALE_ORDER_CONFIG = [
        BreadcrumbItem.SALE_ORDER_CONFIG_PAGE
    ]

    # Task
    OPPORTUNITY_TASK_CONFIG_PAGE = [BreadcrumbItem.OPPORTUNITY_TASK_CONFIG_PAGE]
    OPPORTUNITY_TASK_LIST_PAGE = [BreadcrumbItem.OPPORTUNITY_TASK_LIST_PAGE]

    # Document
    DOCUMENT_MASTER_DATA_LIST_PAGE = [BreadcrumbItem.DOCUMENT_MASTER_DATA_LIST_PAGE]

    # Bidding Result config
    BIDDING_RESULT_CONFIG_PAGE = [BreadcrumbItem.BIDDING_RESULT_CONFIG_PAGE]

    # Sale Activities
    CALL_LOG_LIST_PAGE = [
        BreadcrumbItem.CALL_LOG_LIST_PAGE
    ]
    EMAIL_LIST_PAGE = [
        BreadcrumbItem.EMAIL_LIST_PAGE
    ]
    MEETING_LIST_PAGE = [
        BreadcrumbItem.MEETING_LIST_PAGE
    ]

    OPPORTUNITY_DOCUMENT_LIST_PAGE = [
        BreadcrumbItem.OPPORTUNITY_DOCUMENT_LIST_PAGE
    ]
    OPPORTUNITY_DOCUMENT_CREATE_PAGE = OPPORTUNITY_DOCUMENT_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    OPPORTUNITY_DOCUMENT_DETAIL_PAGE = OPPORTUNITY_DOCUMENT_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]

    PURCHASE_QUOTATION_REQUEST_LIST_PAGE = [
        BreadcrumbItem.PURCHASE_QUOTATION_REQUEST
    ]
    PURCHASE_QUOTATION_REQUEST_CREATE_PAGE_FROM_PR = PURCHASE_QUOTATION_REQUEST_LIST_PAGE + [
        BreadcrumbItem.PURCHASE_QUOTATION_REQUEST_CREATE_FROM_PR
    ]
    PURCHASE_QUOTATION_REQUEST_CREATE_PAGE_MANUAL = PURCHASE_QUOTATION_REQUEST_LIST_PAGE + [
        BreadcrumbItem.PURCHASE_QUOTATION_REQUEST_CREATE_MANUAL
    ]
    PURCHASE_QUOTATION_REQUEST_DETAIL_PAGE = PURCHASE_QUOTATION_REQUEST_LIST_PAGE + [
        BreadcrumbItem.BASTION_DETAIL
    ]
    PURCHASE_QUOTATION_REQUEST_UPDATE_PAGE = PURCHASE_QUOTATION_REQUEST_LIST_PAGE + [
        BreadcrumbItem.BASTION_UPDATE
    ]

    PURCHASE_QUOTATION_LIST_PAGE = [
        BreadcrumbItem.PURCHASE_QUOTATION
    ]
    PURCHASE_QUOTATION_CREATE_PAGE = PURCHASE_QUOTATION_LIST_PAGE + [
        BreadcrumbItem.PURCHASE_QUOTATION_CREATE
    ]
    PURCHASE_QUOTATION_DETAIL_PAGE = PURCHASE_QUOTATION_LIST_PAGE + [
        BreadcrumbItem.BASTION_DETAIL
    ]
    PURCHASE_QUOTATION_UPDATE_PAGE = PURCHASE_QUOTATION_LIST_PAGE + [
        BreadcrumbItem.BASTION_UPDATE
    ]

    PURCHASE_REQUEST_LIST_PAGE = [
        BreadcrumbItem.PURCHASE_REQUEST_LIST
    ]
    PURCHASE_REQUEST_CREATE_PAGE = PURCHASE_REQUEST_LIST_PAGE + [
        BreadcrumbItem.BASTION_CREATE
    ]
    PURCHASE_REQUEST_DETAIL_PAGE = PURCHASE_REQUEST_LIST_PAGE + [
        BreadcrumbItem.BASTION_DETAIL
    ]
    PURCHASE_REQUEST_UPDATE_PAGE = PURCHASE_REQUEST_LIST_PAGE + [
        BreadcrumbItem.BASTION_UPDATE
    ]

    # process
    PROCESS_LIST_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.PROCESS_CONFIG_LIST
    ]
    PROCESS_CREATE_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.PROCESS_CONFIG_LIST,
        BreadcrumbItem.BASTION_CREATE,
    ]
    PROCESS_UPDATE_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.PROCESS_CONFIG_LIST,
        BreadcrumbItem.BASTION_UPDATE,
    ]
    PROCESS_DETAIL_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.PROCESS_CONFIG_LIST,
        BreadcrumbItem.BASTION_DETAIL,
    ]
    PROCESS_RUNTIME_LIST_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.PROCESS_CONFIG_LIST,
        BreadcrumbItem.PROCESS_RUNTIME_LIST
    ]
    PROCESS_RUNTIME_DETAIL_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.PROCESS_CONFIG_LIST,
        BreadcrumbItem.PROCESS_RUNTIME_LIST,
        BreadcrumbItem.BASTION_DETAIL
    ]

    # expense item
    EXPENSE_ITEM_LIST_PAGE = [
        BreadcrumbItem.EXPENSE_ITEM_LIST_PAGE
    ]

    # Purchase order
    PURCHASE_ORDER_LIST_PAGE = [BreadcrumbItem.PURCHASE_ORDER_LIST_PAGE]
    PURCHASE_ORDER_CREATE_PAGE = PURCHASE_ORDER_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    PURCHASE_ORDER_DETAIL_PAGE = PURCHASE_ORDER_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    PURCHASE_ORDER_UPDATE_PAGE = PURCHASE_ORDER_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # Goods receipt
    GOODS_RECEIPT_LIST_PAGE = [BreadcrumbItem.GOODS_RECEIPT_LIST_PAGE]
    GOODS_RECEIPT_CREATE_PAGE = GOODS_RECEIPT_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    GOODS_RECEIPT_DETAIL_PAGE = GOODS_RECEIPT_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    GOODS_RECEIPT_UPDATE_PAGE = GOODS_RECEIPT_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # Goods detail
    GOODS_DETAIL_PAGE = [BreadcrumbItem.GOODS_DETAIL_PAGE]

    # e-office Leave
    LEAVE_CONFIG_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.LEAVE_CONFIG
    ]
    WORKING_CALENDAR_CONFIG = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.WORKING_CALENDAR_CONFIG
    ]
    LEAVE_REQUEST = [BreadcrumbItem.HOME_PAGE, BreadcrumbItem.LEAVE_REQUEST]
    LEAVE_REQUEST_CREATE = LEAVE_REQUEST + [BreadcrumbItem.LEAVE_REQUEST_CREATE]
    LEAVE_REQUEST_DETAIL = LEAVE_REQUEST + [BreadcrumbItem.BASTION_DETAIL]
    LEAVE_REQUEST_EDIT = LEAVE_REQUEST + [BreadcrumbItem.BASTION_UPDATE]
    LEAVE_AVAILABLE = [BreadcrumbItem.HOME_PAGE, BreadcrumbItem.LEAVE_AVAILABLE]

    # Purchase request config
    PURCHASE_REQUEST_CONFIG_PAGE = [BreadcrumbItem.PURCHASE_REQUEST_CONFIG_PAGE]

    # Inventory Adjustment
    INVENTORY_ADJUSTMENT_LIST_PAGE = [BreadcrumbItem.INVENTORY_ADJUSTMENT_LIST_PAGE]
    INVENTORY_ADJUSTMENT_CREATE_PAGE = INVENTORY_ADJUSTMENT_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    INVENTORY_ADJUSTMENT_DETAIL_PAGE = INVENTORY_ADJUSTMENT_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    INVENTORY_ADJUSTMENT_UPDATE_PAGE = INVENTORY_ADJUSTMENT_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # Goods transfer
    GOODS_TRANSFER_LIST_PAGE = [BreadcrumbItem.GOODS_TRANSFER_LIST_PAGE]
    GOODS_TRANSFER_CREATE_PAGE = GOODS_TRANSFER_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    GOODS_TRANSFER_DETAIL_PAGE = GOODS_TRANSFER_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    GOODS_TRANSFER_UPDATE_PAGE = GOODS_TRANSFER_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # Goods issue
    GOODS_ISSUE_LIST_PAGE = [BreadcrumbItem.GOODS_ISSUE_LIST_PAGE]
    GOODS_ISSUE_CREATE_PAGE = GOODS_ISSUE_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    GOODS_ISSUE_DETAIL_PAGE = GOODS_ISSUE_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    GOODS_ISSUE_UPDATE_PAGE = GOODS_ISSUE_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # Business trip
    BUSINESS_TRIP_REQUEST_LIST = [BreadcrumbItem.HOME_PAGE, BreadcrumbItem.BUSINESS_TRIP_REQUEST]
    BUSINESS_TRIP_CREATE = BUSINESS_TRIP_REQUEST_LIST + [BreadcrumbItem.BUSINESS_TRIP_CREATE]
    BUSINESS_TRIP_DETAIL = BUSINESS_TRIP_REQUEST_LIST + [BreadcrumbItem.BASTION_DETAIL]
    BUSINESS_TRIP_EDIT = BUSINESS_TRIP_REQUEST_LIST + [BreadcrumbItem.BASTION_UPDATE]

    # Final acceptance
    FINAL_ACCEPTANCE_LIST_PAGE = [BreadcrumbItem.FINAL_ACCEPTANCE_LIST_PAGE] + [BreadcrumbItem.BASTION_DETAIL]

    # Calendar
    CALENDAR_LIST_PAGE = [BreadcrumbItem.HOME_PAGE, BreadcrumbItem.CALENDAR_LIST_PAGE]

    # Asset tools
    ASSET_TOOLS_PROVIDE_LIST = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.ASSET_TOOLS_PROVIDE_LIST
    ]
    ASSET_TOOLS_PROVIDE_CREATE = ASSET_TOOLS_PROVIDE_LIST + [BreadcrumbItem.BASTION_CREATE]
    ASSET_TOOLS_PROVIDE_DETAIL = ASSET_TOOLS_PROVIDE_LIST + [BreadcrumbItem.BASTION_DETAIL]
    ASSET_TOOLS_PROVIDE_EDIT = ASSET_TOOLS_PROVIDE_LIST + [BreadcrumbItem.BASTION_UPDATE]
    ASSET_TOOLS_DELIVERY_LIST = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.ASSET_TOOLS_DELIVERY_LIST
    ]
    ASSET_TOOLS_DELIVERY_CREATE = ASSET_TOOLS_DELIVERY_LIST + [BreadcrumbItem.BASTION_CREATE]
    ASSET_TOOLS_DELIVERY_DETAIL = ASSET_TOOLS_DELIVERY_LIST + [BreadcrumbItem.BASTION_DETAIL]
    ASSET_TOOLS_DELIVERY_EDIT = ASSET_TOOLS_DELIVERY_LIST + [BreadcrumbItem.BASTION_UPDATE]
    ASSET_TOOLS_RETURN_LIST = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.ASSET_TOOLS_RETURN_LIST
    ]
    ASSET_TOOLS_RETURN_CREATE = ASSET_TOOLS_RETURN_LIST + [BreadcrumbItem.BASTION_CREATE]
    ASSET_TOOLS_RETURN_DETAIL = ASSET_TOOLS_RETURN_LIST + [BreadcrumbItem.BASTION_DETAIL]
    ASSET_TOOLS_RETURN_EDIT = ASSET_TOOLS_RETURN_LIST + [BreadcrumbItem.BASTION_UPDATE]

    MEETING_SCHEDULE_LIST_PAGE = [BreadcrumbItem.MEETING_SCHEDULE_LIST_PAGE]
    MEETING_ZOOM_CONFIG_LIST_PAGE = [BreadcrumbItem.MEETING_ZOOM_CONFIG_LIST_PAGE]
    MEETING_SCHEDULE_CREATE_PAGE = [BreadcrumbItem.MEETING_SCHEDULE_LIST_PAGE,
                                    BreadcrumbItem.MEETING_SCHEDULE_CREATE_PAGE]
    MEETING_SCHEDULE_DETAIL_PAGE = MEETING_SCHEDULE_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]

    DASHBOARD_COMMON_PAGE = [BreadcrumbItem.DASHBOARD_COMMON_PAGE]
    DASHBOARD_GENERAL_LIST_PAGE = [BreadcrumbItem.DASHBOARD_GENERAL_LIST_PAGE]
    DASHBOARD_PIPELINE_LIST_PAGE = [BreadcrumbItem.DASHBOARD_PIPELINE_LIST_PAGE]

    PERIODS_CONFIG_PAGE = [BreadcrumbItem.PERIODS_CONFIG_PAGE]
    ACCOUNTING_POLICIES_PAGE = [BreadcrumbItem.ACCOUNTING_POLICIES_PAGE]

    BALANCE_INIT_PAGE = [BreadcrumbItem.BALANCE_INIT_PAGE]

    INVOICE_SIGN_PAGE = [BreadcrumbItem.INVOICE_SIGN_PAGE]

    INVENTORY_INTERACT_CONFIG = [BreadcrumbItem.INVENTORY_INTERACT_CONFIG]

    REVENUE_PLAN_CONFIG_PAGE = [BreadcrumbItem.REVENUE_PLAN_CONFIG_PAGE]

    REVENUE_PLAN_LIST_PAGE = [BreadcrumbItem.REVENUE_PLAN_LIST_PAGE]
    REVENUE_PLAN_CREATE_PAGE = REVENUE_PLAN_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    REVENUE_PLAN_DETAIL_PAGE = REVENUE_PLAN_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    REVENUE_PLAN_UPDATE_PAGE = REVENUE_PLAN_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    BUDGET_PLAN_LIST_PAGE = [BreadcrumbItem.BUDGET_PLAN_LIST_PAGE]
    BUDGET_PLAN_CREATE_PAGE = BUDGET_PLAN_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    BUDGET_PLAN_DETAIL_PAGE = BUDGET_PLAN_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    BUDGET_PLAN_UPDATE_PAGE = BUDGET_PLAN_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # Report
    REPORT_REVENUE_LIST_PAGE = [
        BreadcrumbItem.REPORT_REVENUE_LIST_PAGE
    ]
    REPORT_PRODUCT_LIST_PAGE = [
        BreadcrumbItem.REPORT_PRODUCT_LIST_PAGE
    ]
    REPORT_CUSTOMER_LIST_PAGE = [
        BreadcrumbItem.REPORT_CUSTOMER_LIST_PAGE
    ]
    REPORT_PIPELINE_LIST_PAGE = [
        BreadcrumbItem.REPORT_PIPELINE_LIST_PAGE
    ]
    REPORT_CASHFLOW_LIST_PAGE = [
        BreadcrumbItem.REPORT_CASHFLOW_LIST_PAGE
    ]
    REPORT_INVENTORY_COST_LIST_PAGE = [
        BreadcrumbItem.REPORT_INVENTORY_COST_LIST_PAGE
    ]
    REPORT_INVENTORY_STOCK_LIST_PAGE = [
        BreadcrumbItem.REPORT_INVENTORY_STOCK_LIST_PAGE
    ]
    REPORT_PURCHASING_LIST_PAGE = [
        BreadcrumbItem.REPORT_PURCHASING_LIST_PAGE
    ]
    BUDGET_REPORT_LIST_PAGE = [
        BreadcrumbItem.BUDGET_REPORT_LIST_PAGE
    ]

    GOODS_RETURN_LIST_PAGE = [BreadcrumbItem.GOODS_RETURN_LIST_PAGE]
    GOODS_RETURN_CREATE_PAGE = GOODS_RETURN_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    GOODS_RETURN_DETAIL_PAGE = GOODS_RETURN_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    GOODS_RETURN_UPDATE_PAGE = GOODS_RETURN_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    CASH_INFLOW_LIST_PAGE = [BreadcrumbItem.CASH_INFLOW_LIST_PAGE]
    CASH_INFLOW_CREATE_PAGE = CASH_INFLOW_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    CASH_INFLOW_DETAIL_PAGE = CASH_INFLOW_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    CASH_INFLOW_UPDATE_PAGE = CASH_INFLOW_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    RECON_LIST_PAGE = [BreadcrumbItem.RECON_LIST_PAGE]
    RECON_CREATE_PAGE = RECON_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    RECON_DETAIL_PAGE = RECON_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    RECON_UPDATE_PAGE = RECON_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    CASH_OUTFLOW_LIST_PAGE = [BreadcrumbItem.CASH_OUTFLOW_LIST_PAGE]
    CASH_OUTFLOW_CREATE_PAGE = CASH_OUTFLOW_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    CASH_OUTFLOW_DETAIL_PAGE = CASH_OUTFLOW_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    CASH_OUTFLOW_UPDATE_PAGE = CASH_OUTFLOW_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    GOODS_REGISTRATION_LIST_PAGE = [BreadcrumbItem.GOODS_REGISTRATION_LIST_PAGE]
    GOODS_REGISTRATION_DETAIL_PAGE = GOODS_REGISTRATION_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]

    LEAD_LIST_PAGE = [BreadcrumbItem.LEAD_LIST_PAGE]
    LEAD_CREATE_PAGE = LEAD_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    LEAD_DETAIL_PAGE = LEAD_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    LEAD_UPDATE_PAGE = LEAD_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    DISTRIBUTION_PLAN_LIST_PAGE = [BreadcrumbItem.DISTRIBUTION_PLAN_LIST_PAGE]
    DISTRIBUTION_PLAN_CREATE_PAGE = DISTRIBUTION_PLAN_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    DISTRIBUTION_PLAN_DETAIL_PAGE = DISTRIBUTION_PLAN_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    DISTRIBUTION_PLAN_UPDATE_PAGE = DISTRIBUTION_PLAN_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    BOM_LIST_PAGE = [BreadcrumbItem.BOM_LIST_PAGE]
    BOM_CREATE_PAGE = BOM_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    BOM_DETAIL_PAGE = BOM_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    BOM_UPDATE_PAGE = BOM_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    OPP_BOM_LIST_PAGE = [BreadcrumbItem.OPP_BOM_LIST_PAGE]
    OPP_BOM_CREATE_PAGE = OPP_BOM_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    OPP_BOM_DETAIL_PAGE = OPP_BOM_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    OPP_BOM_UPDATE_PAGE = OPP_BOM_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    PRINTER_CONFIG_LIST = [BreadcrumbItem.HOME_PAGE, BreadcrumbItem.PRINTER_CONFIG_LIST_PAGE]
    PRINTER_CONFIG_LIST_PAGE = PRINTER_CONFIG_LIST + [BreadcrumbItem.BASTION_LIST]
    PRINTER_CONFIG_CREATE_PAGE = PRINTER_CONFIG_LIST + [BreadcrumbItem.BASTION_CREATE]
    PRINTER_CONFIG_DETAIL_PAGE = PRINTER_CONFIG_LIST + [BreadcrumbItem.BASTION_DETAIL]
    PRINTER_CONFIG_UPDATE_PAGE = PRINTER_CONFIG_LIST + [BreadcrumbItem.BASTION_UPDATE]

    MAILER_CONFIG_LIST = [BreadcrumbItem.HOME_PAGE, BreadcrumbItem.MAILER_CONFIG_LIST_PAGE]
    MAILER_CONFIG_LIST_PAGE = MAILER_CONFIG_LIST + [BreadcrumbItem.BASTION_LIST]
    MAILER_LOG_LIST = [BreadcrumbItem.HOME_PAGE, BreadcrumbItem.MAILER_CONFIG_LIST_PAGE, BreadcrumbItem.LOGS]
    MAILER_LOG_LIST_PAGE = MAILER_LOG_LIST + [BreadcrumbItem.BASTION_LIST]

    IMPORT_LIST = [BreadcrumbItem.HOME_PAGE, BreadcrumbItem.IMPORT_LIST_PAGE]
    IMPORT_LIST_PAGE = IMPORT_LIST + [BreadcrumbItem.BASTION_LIST]
    IMPORT_CREATE_PAGE = IMPORT_LIST + [BreadcrumbItem.BASTION_CREATE]

    # project
    PROJECT_CONFIG = [BreadcrumbItem.HOME_PAGE, BreadcrumbItem.PROJECT_CONFIG]
    PROJECT_HOME = [BreadcrumbItem.HOME_PAGE, BreadcrumbItem.PROJECT_HOME]
    PROJECT_LIST = [BreadcrumbItem.HOME_PAGE, BreadcrumbItem.PROJECT_LIST]
    PROJECT_WORKS = [BreadcrumbItem.HOME_PAGE, BreadcrumbItem.PROJECT_WORKS]
    PROJECT_CREATE_PAGE = PROJECT_LIST + [BreadcrumbItem.BASTION_CREATE]
    PROJECT_DETAIL_PAGE = PROJECT_LIST + [BreadcrumbItem.BASTION_DETAIL]
    PROJECT_UPDATE_PAGE = PROJECT_LIST + [BreadcrumbItem.BASTION_UPDATE]
    PROJECT_ACTIVITIES = [BreadcrumbItem.HOME_PAGE, BreadcrumbItem.PROJECT_ACTIVITIES]
    PROJECT_TASKS_LIST = [BreadcrumbItem.HOME_PAGE, BreadcrumbItem.PROJECT_TASKS_LIST]

    FORM_LIST = [BreadcrumbItem.HOME_PAGE, BreadcrumbItem.FORM_LIST_PAGE]
    FORM_CREATE = FORM_LIST + [BreadcrumbItem.BASTION_CREATE]
    FORM_UPDATE = FORM_LIST + [BreadcrumbItem.BASTION_UPDATE]
    FORM_ENTRIES_LIST = FORM_LIST + [BreadcrumbItem.FORM_ENTRIES_LIST_PAGE]
    FORM_KNOWLEDGE = FORM_LIST + [BreadcrumbItem.BASTION_KNOWLEDGE]

    # Zones
    ZONES_LIST_PAGE = [
        BreadcrumbItem.ZONES_LIST_PAGE
    ]

    # Contract
    CONTRACT_LIST_PAGE = [
        BreadcrumbItem.CONTRACT_LIST_PAGE
    ]
    CONTRACT_CREATE_PAGE = CONTRACT_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    CONTRACT_DETAIL_PAGE = CONTRACT_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    CONTRACT_UPDATE_PAGE = CONTRACT_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # Production
    PRODUCTION_ORDER_LIST_PAGE = [
        BreadcrumbItem.PRODUCTION_ORDER_LIST_PAGE
    ]
    PRODUCTION_ORDER_CREATE_PAGE = PRODUCTION_ORDER_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    PRODUCTION_ORDER_DETAIL_PAGE = PRODUCTION_ORDER_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    PRODUCTION_ORDER_UPDATE_PAGE = PRODUCTION_ORDER_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    PRODUCTION_REPORT_LIST_PAGE = [
        BreadcrumbItem.PRODUCTION_REPORT_LIST_PAGE
    ]
    PRODUCTION_REPORT_CREATE_PAGE = PRODUCTION_REPORT_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    PRODUCTION_REPORT_DETAIL_PAGE = PRODUCTION_REPORT_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    PRODUCTION_REPORT_UPDATE_PAGE = PRODUCTION_REPORT_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    WORK_ORDER_LIST_PAGE = [
        BreadcrumbItem.WORK_ORDER_LIST_PAGE
    ]
    WORK_ORDER_CREATE_PAGE = WORK_ORDER_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    WORK_ORDER_DETAIL_PAGE = WORK_ORDER_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    WORK_ORDER_UPDATE_PAGE = WORK_ORDER_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # Recurrence
    RECURRENCE_LIST_PAGE = [
        BreadcrumbItem.RECURRENCE_LIST_PAGE
    ]
    RECURRENCE_CREATE_PAGE = RECURRENCE_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    RECURRENCE_DETAIL_PAGE = RECURRENCE_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    RECURRENCE_UPDATE_PAGE = RECURRENCE_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]
    RECURRENCE_TEMPLATE_LIST_PAGE = [
        BreadcrumbItem.RECURRENCE_TEMPLATE_LIST_PAGE
    ]
    RECURRENCE_ACTION_LIST_PAGE = [
        BreadcrumbItem.RECURRENCE_ACTION_LIST_PAGE
    ]

    # HRM
    HRM_EMPLOYEE_LIST_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.HRM_EMPLOYEE_LIST_PAGE
    ]
    HRM_EMPLOYEE_CREATE_PAGE = HRM_EMPLOYEE_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    HRM_EMPLOYEE_DETAIL_PAGE = HRM_EMPLOYEE_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    HRM_EMPLOYEE_UPDATE_PAGE = HRM_EMPLOYEE_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # OVERTIME REQUEST
    HRM_OVERTIME_LIST_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.HRM_OVERTIME_LIST_PAGE
    ]
    HRM_OVERTIME_CREATE_PAGE = HRM_OVERTIME_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    HRM_OVERTIME_DETAIL_PAGE = HRM_OVERTIME_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    HRM_OVERTIME_UPDATE_PAGE = HRM_OVERTIME_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # PAYROLL TEMPLATE
    HRM_PAYROLL_TEMPLATE_LIST_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.HRM_PAYROLL_TEMPLATE_LIST_PAGE
    ]
    HRM_PAYROLL_TEMPLATE_CREATE_PAGE = HRM_PAYROLL_TEMPLATE_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    HRM_PAYROLL_TEMPLATE_DETAIL_PAGE = HRM_PAYROLL_TEMPLATE_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    HRM_PAYROLL_TEMPLATE_UPDATE_PAGE = HRM_PAYROLL_TEMPLATE_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]
    # PAYROLL TEMPLATE
    HRM_TEMPLATE_ATTRIBUTE_LIST_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.HRM_TEMPLATE_ATTRIBUTE_LIST_PAGE
    ]

    # Consulting
    CONSULTING_LIST_PAGE = [
        BreadcrumbItem.CONSULTING_LIST_PAGE
    ]
    CONSULTING_CREATE_PAGE = CONSULTING_LIST_PAGE + [BreadcrumbItem.CONSULTING_CREATE_PAGE]
    CONSULTING_DETAIL_PAGE = CONSULTING_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    CONSULTING_UPDATE_PAGE = CONSULTING_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # Lease order
    LEASE_ORDER_CONFIG = [
        BreadcrumbItem.LEASE_ORDER_CONFIG_PAGE
    ]
    LEASE_ORDER_LIST_PAGE = [
        BreadcrumbItem.LEASE_ORDER_LIST_PAGE
    ]
    LEASE_ORDER_CREATE_PAGE = LEASE_ORDER_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    LEASE_ORDER_DETAIL_PAGE = LEASE_ORDER_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    LEASE_ORDER_UPDATE_PAGE = LEASE_ORDER_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]
    LEASE_ASSET_LIST_PAGE = [
        BreadcrumbItem.LEASE_ASSET_LIST_PAGE
    ]

    # CONTRACT TEMPLATE
    CONTRACT_TEMPLATE_LIST_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.CONTRACT_TEMPLATE_LIST_PAGE
    ]
    CONTRACT_TEMPLATE_CREATE_PAGE = CONTRACT_TEMPLATE_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    CONTRACT_TEMPLATE_DETAIL_PAGE = CONTRACT_TEMPLATE_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    CONTRACT_TEMPLATE_UPDATE_PAGE = CONTRACT_TEMPLATE_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    # Consulting
    PARTNER_CENTER_LIST = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.PARTNER_CENTER_LIST_PAGE
    ]
    PARTNER_CENTER_LIST_LIST_PAGE = PARTNER_CENTER_LIST + [BreadcrumbItem.BASTION_LIST]
    PARTNER_CENTER_LIST_CREATE_PAGE = PARTNER_CENTER_LIST + [BreadcrumbItem.BASTION_CREATE]
    PARTNER_CENTER_LIST_DETAIL_PAGE = PARTNER_CENTER_LIST + [BreadcrumbItem.BASTION_DETAIL]
    PARTNER_CENTER_LIST_UPDATE_PAGE = PARTNER_CENTER_LIST + [BreadcrumbItem.BASTION_UPDATE]

    CATEGORY_MASTER_DATA_LIST_PAGE = [BreadcrumbItem.CATEGORY_MASTER_DATA_LIST_PAGE]
    # Fixed asset
    FIXED_ASSET_LIST = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.FIXED_ASSET_PAGE
    ]
    FIXED_ASSET_LIST_PAGE = FIXED_ASSET_LIST + [BreadcrumbItem.BASTION_LIST]
    FIXED_ASSET_CREATE_PAGE = FIXED_ASSET_LIST + [BreadcrumbItem.BASTION_CREATE]
    FIXED_ASSET_DETAIL_PAGE = FIXED_ASSET_LIST + [BreadcrumbItem.BASTION_DETAIL]
    FIXED_ASSET_UPDATE_PAGE = FIXED_ASSET_LIST + [BreadcrumbItem.BASTION_UPDATE]

    FIXED_ASSET_WRITE_OFF_LIST = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.FIXED_ASSET_WRITE_OFF_PAGE
    ]
    FIXED_ASSET_WRITE_OFF_LIST_PAGE = FIXED_ASSET_WRITE_OFF_LIST + [BreadcrumbItem.BASTION_LIST]
    FIXED_ASSET_WRITE_OFF_CREATE_PAGE = FIXED_ASSET_WRITE_OFF_LIST + [BreadcrumbItem.BASTION_CREATE]
    FIXED_ASSET_WRITE_OFF_DETAIL_PAGE = FIXED_ASSET_WRITE_OFF_LIST + [BreadcrumbItem.BASTION_DETAIL]
    FIXED_ASSET_WRITE_OFF_UPDATE_PAGE = FIXED_ASSET_WRITE_OFF_LIST + [BreadcrumbItem.BASTION_UPDATE]

    # Bank
    BANK_MASTER_DATA_LIST_PAGE = [BreadcrumbItem.BANK_MASTER_DATA_LIST_PAGE]

    # Instrument Tool
    INSTRUMENT_TOOL_LIST = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.INSTRUMENT_TOOL_PAGE
    ]
    INSTRUMENT_TOOL_LIST_PAGE = INSTRUMENT_TOOL_LIST + [BreadcrumbItem.BASTION_LIST]
    INSTRUMENT_TOOL_CREATE_PAGE = INSTRUMENT_TOOL_LIST + [BreadcrumbItem.BASTION_CREATE]
    INSTRUMENT_TOOL_DETAIL_PAGE = INSTRUMENT_TOOL_LIST + [BreadcrumbItem.BASTION_DETAIL]
    INSTRUMENT_TOOL_UPDATE_PAGE = INSTRUMENT_TOOL_LIST + [BreadcrumbItem.BASTION_UPDATE]

    CHART_OF_ACCOUNTS_LIST_PAGE = [
        BreadcrumbItem.CHART_OF_ACCOUNTS_LIST_PAGE
    ]
    DEFAULT_ACCOUNT_DETERMINATION_LIST_PAGE = [
        BreadcrumbItem.DEFAULT_ACCOUNT_DETERMINATION_LIST_PAGE
    ]

    JOURNAL_ENTRY_LIST_PAGE = [BreadcrumbItem.JOURNAL_ENTRY_LIST_PAGE]
    JOURNAL_ENTRY_CREATE_PAGE = JOURNAL_ENTRY_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    JOURNAL_ENTRY_DETAIL_PAGE = JOURNAL_ENTRY_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    JOURNAL_ENTRY_UPDATE_PAGE = JOURNAL_ENTRY_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    INSTRUMENT_TOOL_WRITE_OFF_LIST = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.INSTRUMENT_TOOL_WRITE_OFF_PAGE
    ]
    INSTRUMENT_TOOL_WRITE_OFF_LIST_PAGE = INSTRUMENT_TOOL_WRITE_OFF_LIST + [BreadcrumbItem.BASTION_LIST]
    INSTRUMENT_TOOL_WRITE_OFF_CREATE_PAGE = INSTRUMENT_TOOL_WRITE_OFF_LIST + [BreadcrumbItem.BASTION_CREATE]
    INSTRUMENT_TOOL_WRITE_OFF_DETAIL_PAGE = INSTRUMENT_TOOL_WRITE_OFF_LIST + [BreadcrumbItem.BASTION_DETAIL]
    INSTRUMENT_TOOL_WRITE_OFF_UPDATE_PAGE = INSTRUMENT_TOOL_WRITE_OFF_LIST + [BreadcrumbItem.BASTION_UPDATE]

    # Goods recovery
    GOODS_RECOVERY_LIST_PAGE = [
        BreadcrumbItem.GOODS_RECOVERY_LIST_PAGE
    ]
    GOODS_RECOVERY_CREATE_PAGE = GOODS_RECOVERY_LIST_PAGE + [BreadcrumbItem.BASTION_CREATE]
    GOODS_RECOVERY_DETAIL_PAGE = GOODS_RECOVERY_LIST_PAGE + [BreadcrumbItem.BASTION_DETAIL]
    GOODS_RECOVERY_UPDATE_PAGE = GOODS_RECOVERY_LIST_PAGE + [BreadcrumbItem.BASTION_UPDATE]

    GROUP_ORDER_LIST = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.GROUP_ORDER_PAGE
    ]
    GROUP_ORDER_LIST_PAGE = GROUP_ORDER_LIST + [BreadcrumbItem.BASTION_LIST]
    GROUP_ORDER_CREATE_PAGE = GROUP_ORDER_LIST + [BreadcrumbItem.BASTION_CREATE]
    GROUP_ORDER_DETAIL_PAGE = GROUP_ORDER_LIST + [BreadcrumbItem.BASTION_DETAIL]
    GROUP_ORDER_UPDATE_PAGE = GROUP_ORDER_LIST + [BreadcrumbItem.BASTION_UPDATE]

    # Payment plan
    PAYMENT_PLAN_LIST_PAGE = [
        BreadcrumbItem.PAYMENT_PLAN_LIST_PAGE
    ]

    KMS_DOC_TYPE_LIST = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.KMS_DOC_TYPE_LIST
    ]
    KMS_DOC_TYPE_CREATE_PAGE = KMS_DOC_TYPE_LIST + [BreadcrumbItem.BASTION_CREATE]
    KMS_DOC_TYPE_DETAIL_PAGE = KMS_DOC_TYPE_LIST + [BreadcrumbItem.BASTION_DETAIL]
    KMS_DOC_TYPE_UPDATE_PAGE = KMS_DOC_TYPE_LIST + [BreadcrumbItem.BASTION_UPDATE]

    KMS_CONTENT_GROUP_LIST = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.KMS_CONTENT_GROUP_LIST
    ]
    KMS_CONTENT_GROUP_CREATE_PAGE = KMS_CONTENT_GROUP_LIST + [BreadcrumbItem.BASTION_CREATE]
    KMS_CONTENT_GROUP_DETAIL_PAGE = KMS_CONTENT_GROUP_LIST + [BreadcrumbItem.BASTION_DETAIL]
    KMS_CONTENT_GROUP_UPDATE_PAGE = KMS_CONTENT_GROUP_LIST + [BreadcrumbItem.BASTION_UPDATE]

    KMS_DOCUMENT_APPROVAL_LIST = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.KMS_DOCUMENT_APPROVAL_LIST
    ]
    KMS_DOCUMENT_APPROVAL_CREATE_PAGE = KMS_DOCUMENT_APPROVAL_LIST + [BreadcrumbItem.BASTION_CREATE]
    KMS_DOCUMENT_APPROVAL_DETAIL_PAGE = KMS_DOCUMENT_APPROVAL_LIST + [BreadcrumbItem.BASTION_DETAIL]
    KMS_DOCUMENT_APPROVAL_UPDATE_PAGE = KMS_DOCUMENT_APPROVAL_LIST + [BreadcrumbItem.BASTION_UPDATE]

    # incoming document
    INCOMING_DOCUMENT_LIST = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.INCOMING_DOCUMENT_LIST
    ]
    INCOMING_DOCUMENT_CREATE_PAGE = INCOMING_DOCUMENT_LIST + [BreadcrumbItem.BASTION_CREATE]
    INCOMING_DOCUMENT_DETAIL_PAGE = INCOMING_DOCUMENT_LIST + [BreadcrumbItem.BASTION_DETAIL]
    INCOMING_DOCUMENT_UPDATE_PAGE = INCOMING_DOCUMENT_LIST + [BreadcrumbItem.BASTION_UPDATE]

    # shift
    MASTER_DATA_SHIFT_PAGE = [
        BreadcrumbItem.MASTER_DATA_SHIFT_PAGE
    ]

    # Shift assignment
    SHIFT_ASSIGNMENT_LIST_PAGE = [
        BreadcrumbItem.SHIFT_ASSIGNMENT_LIST_PAGE
    ]

    # Attendance
    HRM_ATTENDANCE_LIST_PAGE = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.HRM_ATTENDANCE_LIST_PAGE
    ]

    # Device integrate
    DEVICE_INTEGRATE_EMPLOYEE_LIST_PAGE = [
        BreadcrumbItem.DEVICE_EMPLOYEE_INTEGRATE_LIST_PAGE
    ]

    # Attendance Device
    ATTENDANCE_DEVICE_LIST_PAGE = [
        BreadcrumbItem.ATTENDANCE_DEVICE_LIST_PAGE
    ]

    # Service Order
    SERVICE_ORDER = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.SERVICE_ORDER_PAGE
    ]
    SERVICE_ORDER_LIST_PAGE = SERVICE_ORDER + [BreadcrumbItem.BASTION_LIST]
    SERVICE_ORDER_CREATE_PAGE = SERVICE_ORDER + [BreadcrumbItem.BASTION_CREATE]
    SERVICE_ORDER_DETAIL_PAGE = SERVICE_ORDER + [BreadcrumbItem.BASTION_DETAIL]
    SERVICE_ORDER_UPDATE_PAGE = SERVICE_ORDER + [BreadcrumbItem.BASTION_UPDATE]
    SERVICE_ORDER_DETAIL_DASHBOARD_PAGE = [BreadcrumbItem.SERVICE_ORDER_DETAIL_DASHBOARD_PAGE]

    # Absence explanation
    ABSENCE_EXPLANATION_LIST_PAGE = [
        BreadcrumbItem.ABSENCE_EXPLANATION_LIST
    ]
    ABSENCE_EXPLANATION_CREATE_PAGE = [BreadcrumbItem.ABSENCE_EXPLANATION_LIST] + [BreadcrumbItem.BASTION_CREATE]
    ABSENCE_EXPLANATION_DETAIL_PAGE = [BreadcrumbItem.ABSENCE_EXPLANATION_LIST] + [BreadcrumbItem.BASTION_DETAIL]
    ABSENCE_EXPLANATION_UPDATE_PAGE = [BreadcrumbItem.ABSENCE_EXPLANATION_LIST] + [BreadcrumbItem.BASTION_UPDATE]

    # master data - attribute
    ATTRIBUTE_LIST_PAGE = [
        BreadcrumbItem.ATTRIBUTE_LIST_PAGE
    ]

    SHIPMENT_MASTER_DATA_LIST_PAGE = [BreadcrumbItem.SHIPMENT_MASTER_DATA_LIST_PAGE]

    # Service quotation
    SERVICE_QUOTATION = [
        BreadcrumbItem.HOME_PAGE,
        BreadcrumbItem.SERVICE_QUOTATION_PAGE
    ]
    SERVICE_QUOTATION_LIST_PAGE = SERVICE_QUOTATION + [BreadcrumbItem.BASTION_LIST]
    SERVICE_QUOTATION_CREATE_PAGE = SERVICE_QUOTATION + [BreadcrumbItem.BASTION_CREATE]
    SERVICE_QUOTATION_DETAIL_PAGE = SERVICE_QUOTATION + [BreadcrumbItem.BASTION_DETAIL]
    SERVICE_QUOTATION_UPDATE_PAGE = SERVICE_QUOTATION + [BreadcrumbItem.BASTION_UPDATE]

    PAYROLL_CONFIG_PAGE = [
        BreadcrumbItem.PAYROLL_CONFIG_PAGE
    ]

    BFLOW_AI_CHATBOT_PAGE = [
        BreadcrumbItem.BFLOW_AI_CHATBOT_PAGE
    ]
