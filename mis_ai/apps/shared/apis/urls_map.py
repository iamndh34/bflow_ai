"""not need import module"""


class StringUrl(str):  # pylint: disable=too-few-public-methods
    """convert str url"""

    def push_id(self, _id):
        """return url with id"""
        return f'{self}/{_id}'

    def fill_key(self, **kwargs):
        """return kwargs with format"""
        # 'abc/{a1}/{b1}/{c1}' + kwargs={"a1": "1", "b1": 2, "c1": 3}
        # Return ==> 'abc/1/2/3'
        return self.format(**kwargs)

    def fill_idx(self, *args):
        """return str with format"""
        # 'abc/{}/{}/{}' + args=[1, 2, 3]
        # Return ==> 'abc/1/2/3'
        return self.format(*args)


class ApiURL:  # pylint: disable=too-few-public-methods
    """API link BE"""

    @staticmethod
    def push_id(url, _id):
        """return str with url format"""
        return f'{url}/{_id}'

    login = StringUrl('auth/sign-in')
    logout = StringUrl('auth/sign-out')
    my_profile = StringUrl('auth/profile')
    ALIVE_CHECK = StringUrl('auth/alive-check')
    refresh_token = StringUrl('auth/token-refresh')
    SWITCH_COMPANY = StringUrl('auth/switch-company')
    tenants = StringUrl('provisioning/tenants')
    user_list = StringUrl('account/users')
    USER_DETAIL = StringUrl('account/user/{pk}')
    USER_RESET_PASSWORD = StringUrl('account/user/{pk}/reset-password')
    USER_MAIL_WELCOME = StringUrl('account/user/{pk}/mail-welcome')
    USER_COMPANIES = StringUrl('account/user/{pk}/companies')
    LANGUAGE_CHANGE = 'auth/language'
    AUTH_LOGS = 'auth/logs'
    AUTH_LOGS_REPORT = 'auth/logs/report'

    # home
    HOME_CALENDAR = 'auth/calendar'

    #
    USER_CHANGE_PASSWORD = StringUrl('auth/change-password')
    USER_FORGOT_PASSWORD = StringUrl('auth/forgot-password')
    USER_FORGOT_PASSWORD_DETAIL = StringUrl('auth/forgot-password/{pk}')

    # web / page builder
    BUILDER_PAGE_LIST = StringUrl('site/config/page-list')
    BUILDER_PAGE_DETAIL = StringUrl('site/config/page/{pk}')
    BUILDER_PAGE_DETAIL_CLONE = StringUrl('site/config/page/{pk}/clone')
    BUILDER_PAGE_VIEWER = StringUrl('site/config/page/{company_id}/{path_sub}/viewer')
    BUILDER_PAGE_TENANT_GETTER = StringUrl('site/config/page/company-get/{company_sub_domain}')
    BUILDER_PAGE_TEMPLATE = StringUrl('site/config/templates')
    BUILDER_PAGE_TEMPLATE_DETAIL = StringUrl('site/config/template/{pk}')

    # files
    FILE_UPLOAD = StringUrl('attachment/upload')
    FILE_EDIT = StringUrl('attachment/edit')
    FILE_DETAIL = StringUrl('attachment/detail/{pk}')
    PUBLIC_FILE_UPLOAD = StringUrl('attachment/public-upload')
    FILE_UNUSED = StringUrl('attachment/unused')
    FILE_UPLOAD_WEB_BUILDER = StringUrl('attachment/web-builder/upload')
    FILE_LIST_WEB_BUILDER = StringUrl('attachment/web-builder/list')
    FILE_DOWNLOAD = StringUrl('attachment/download/{pk}')
    FILE_INFO = StringUrl('attachment/info/{pk}')

    # attachment
    MEDIA_ACCESS_TOKEN = StringUrl('hr/employee/media-token')
    MEDIA_UPLOAD_FILE = StringUrl('f/files')
    API_FORWARD_ACCESS_TOKEN_MEDIA = StringUrl('auth/media/sign-in-valid')

    # Logging
    LOG_ACTIVITIES = StringUrl('log/activities')
    LOG_MY_NOTIFY_DATA_ALL = StringUrl('log/notifies/me')
    LOG_MY_NOTIFY_DETAIL = StringUrl('log/notify/{pk}')
    LOG_MY_NOTIFY_COUNT = StringUrl('log/notifies/me/count')
    LOG_MY_NOTIFY_SEEN_ALL = StringUrl('log/notifies/me/seen-all')
    LOG_MY_NOTIFY_CLEAN_ALL = StringUrl('log/notifies/me/clean-all')

    # bookmarks
    BOOKMARKS_LIST = StringUrl('log/bookmarks')
    BOOKMARKS_DETAIL = StringUrl('log/bookmark/{pk}')

    # pin doc
    PIN_DOC_LIST = StringUrl('log/pin-docs')
    PIN_DOC_DETAIL = StringUrl('log/pin-doc/{pk}')

    # state of task background
    TASK_BG = StringUrl('task-bg/{pk}')

    # tenant
    TENANT_PLAN_LIST = StringUrl('tenant/tenant-plans')
    TENANT_DIAGRAM = StringUrl('tenant/org-chart')

    # account
    ACCOUNT_USER_COMPANY = StringUrl('account/user-company')
    ACCOUNT_USER_TENANT = StringUrl('account/user-tenant')
    ACCOUNT_USER_ADMIN_TENANT = StringUrl('account/user-admin-tenant')

    # 2FA
    TWO_FA = StringUrl('auth/2fa')
    TWO_FA_INTEGRATE = StringUrl('auth/2fa/integrate')
    TWO_FA_INTEGRATE_DETAIL = StringUrl('auth/2fa/integrate/{pk}')

    # employee
    EMPLOYEE_UPLOAD_AVATAR = StringUrl('hr/employee/{pk}/upload-avatar')
    EMPLOYEE_LIST = StringUrl('hr/employees')
    EMPLOYEE_ALL_LIST = StringUrl('hr/employees/all')
    EMPLOYEE_DETAIL = StringUrl('hr/employee')
    EMPLOYEE_DETAIL_PK = StringUrl('hr/employee/{pk}')
    EMPLOYEE_DETAIL_UPDATE_EMAIL_API_KEY_PK = StringUrl('hr/employee-email-api-key/{pk}')
    EMPLOYEE_DETAIL_APP_LIST = StringUrl('hr/employee/{pk}/app')
    EMPLOYEE_APPLICATION_ALL_LIST = StringUrl('hr/employee/{pk}/app/all')
    EMPLOYEE_APPLICATION_SUMMARY_LIST = StringUrl('hr/employee/{pk}/app/summary')
    EMPLOYEE_PERMISSION_SUMMARY_LIST = StringUrl('hr/employee/{pk}/permissions/summary')
    EMPLOYEE_PLAN_SUMMARY_LIST = StringUrl('hr/employee/{pk}/plan/summary')
    EMPLOYEE_COMPANY = StringUrl('hr/employee/company')
    EMPLOYEE_COMPANY_NEW = StringUrl('hr/employee/company/{company_id}')
    EMPLOYEE_TENANT = StringUrl('hr/employee/tenant')
    EMPLOYEE_COMPANY_LIST = StringUrl('hr/employees-company')
    EMPLOYEE_ADMIN_COMPANY = StringUrl('hr/employee-admin-company')

    # organization/group
    GROUP_LEVEL_LIST = StringUrl('hr/levels')
    GROUP_LEVEL_DETAIL = StringUrl('hr/level')
    GROUP_LIST = StringUrl('hr/groups')
    GROUP_DETAIL = StringUrl('hr/group')
    GROUP_DETAIL_PK = StringUrl('hr/group/{pk}')
    GROUP_PARENT = StringUrl('hr/group/parent')
    GROUP_PARENT_PK = StringUrl('hr/group/parent/{level}')
    GROUP_DD_LIST = StringUrl('hr/groups-dropdown')

    # home/company
    COMPANY_CONFIG = StringUrl('company/config')
    COMPANY_FUNCTION_NUMBER = StringUrl('company/function-number')
    ACCOUNTING_POLICIES_CONFIG = StringUrl('company/accounting-policies-config')
    COMPANY_LIST = StringUrl('company/list')
    COMPANY_DETAIL = StringUrl('company')
    COMPANY_DETAIL_LOGO = StringUrl('company/{pk}/logo')
    COMPANY_OVERVIEW = StringUrl('company/overview/list')
    COMPANY_USER_NOT_MAP_EMPLOYEE = StringUrl('company/user/available')
    COMPANY_USER_COMPANY = StringUrl('company/user-company')
    COMPANY_BANK_ACCOUNT_LIST = StringUrl('company/company-bank-account/list')

    # organization/role
    ROLE_LIST = StringUrl('hr/roles')
    ROLE_DETAIL = StringUrl('hr/role')
    ROLE_DETAIL_PK = StringUrl('hr/role/{pk}')
    ROLE_DETAIL_APP_LIST = StringUrl('hr/role/{pk}/app')

    # form
    FORM_LIST = StringUrl('form/list')
    FORM_DETAIL = StringUrl('form/detail/{pk}')
    FORM_DETAIL_THEME = StringUrl('form/detail/{pk}/theme')
    FORM_DETAIL_TURN_ON_OFF = StringUrl('form/detail/{pk}/turn-on-off')
    FORM_DETAIL_DUPLICATE = StringUrl('form/detail/{pk}/duplicate')
    FORM_DETAIL_FOR_ENTRIES = StringUrl('form/detail/{pk}/for-entries')
    FORM_PUBLISHED_FORM_DETAIL = StringUrl('form/published/form/{pk}')
    FORM_PUBLISHED_DETAIL = StringUrl('form/published/{pk}')
    FORM_PUBLISHED_RUNTIME_DETAIL = StringUrl('form/runtime/submit/{tenant_code}/{form_code}/{use_at}')
    FORM_PUBLISHED_RUNTIME_DETAIL_WITH_SUBMITTED = StringUrl(
        'form/runtime/submit/{tenant_code}/{form_code}/{use_at}/{pk}'
    )
    FORM_PUBLISHED_RUNTIME_CHECK_SUBMITTED = StringUrl('form/runtime/submitted/data/{tenant_code}/{form_code}')
    FORM_SANITIZE_HTML = StringUrl('form/sanitize-html')
    FORM_ENTRIES_LIST = StringUrl('form/entries/{pk}/list')
    FORM_ENTRIES_REF_NAME_LIST = StringUrl('form/entries/{pk}/ref-name/list')
    FORM_VALID_SESSION = StringUrl('form/runtime/auth/{tenant_code}/{form_code}')
    FORM_VALID_SESSION_PK = StringUrl('form/runtime/auth/{tenant_code}/{form_code}/{pk_form_session}')

    # comment
    COMMENT_LIST = StringUrl('comment/doc/{pk_doc}/{pk_app}/list')
    COMMENT_REPLIES_LIST = StringUrl('comment/reply/{pk}/list')
    COMMENT_ROOM_REPLIES_LIST = StringUrl('comment/room/{pk}/list')

    # print templates
    PRINT_TEMPLATES_APPS_LIST = StringUrl('printer/apps')
    PRINT_TEMPLATES_LIST = StringUrl('printer/list')
    PRINT_TEMPLATES_DETAIL = StringUrl('printer/detail/{pk}')
    PRINT_TEMPLATES_USING = StringUrl('printer/using/default/{application_id}')
    PRINT_TEMPLATES_USING_DETAIL = StringUrl('printer/using/detail/{pk}')

    # mail template
    MAILER_FEATURE_APP_LIST = StringUrl('mailer/feature/app/list')
    MAILER_FEATURE_LIST = StringUrl('mailer/feature/list')
    MAILER_FEATURE_BY_APPLICATION_LIST = StringUrl('mailer/feature/list/{application_id}')
    MAILER_FEATURE_DETAIL = StringUrl('mailer/feature/detail/{pk}')
    MAILER_SYSTEM_GET = StringUrl('mailer/system/get/{system_code}')
    MAILER_SYSTEM_PARAMS = StringUrl('mailer/system/params/{system_code}')
    MAILER_SYSTEM_DETAIL = StringUrl('mailer/system/detail/{pk}')
    MAILER_CONFIG_GET = StringUrl('mailer/config/get')
    MAILER_CONFIG_DETAIL = StringUrl('mailer/config/detail/{pk}')
    MAILER_CONFIG_DETAIL_CONNECTION_TEST = StringUrl('mailer/config/detail/{pk}/connection/test')
    MAILER_CONFIG_DETAIL_CONNECTION_TEST_DATA = StringUrl('mailer/config/detail/{pk}/connection/test/data')
    MAILER_LOG = StringUrl('mailer/log')

    # base
    PLAN_LIST = StringUrl('base/plans')
    TENANT_APPLICATION_LIST = StringUrl('base/tenant-applications')
    APPLICATION_DETAIL = StringUrl('base/application/{pk}')
    APPLICATION_PROPERTY_LIST = StringUrl('base/tenant-applications-property')
    APPLICATION_PROPERTY_PRINT_LIST = StringUrl('base/tenant-applications-property/print')
    APPLICATION_PROPERTY_MAIL_LIST = StringUrl('base/tenant-applications-property/mail')
    APPLICATION_PROPERTY_EMPLOYEE_LIST = StringUrl('base/applications-property-employee')
    APPLICATION_PERMISSION = StringUrl('base/permissions')
    INDICATOR_PARAM = StringUrl('base/indicator-params')

    TENANT = StringUrl('tenant/userlist')

    # F-Import-Data
    IMPORT_CORE_ACCOUNT_USER = StringUrl('import-data/core/account/user')
    IMPORT_HR_GROUP_LEVEL = StringUrl('import-data/hr/group-level')
    IMPORT_HR_GROUP = StringUrl('import-data/hr/group')
    IMPORT_HR_ROLE = StringUrl('import-data/hr/role')
    IMPORT_HR_EMPLOYEE = StringUrl('import-data/hr/employee')
    IMPORT_SALEDATA_CONTACT = StringUrl('import-data/saledata/contact')
    IMPORT_SALEDATA_ACCOUNT = StringUrl('import-data/saledata/account')
    IMPORT_SALEDATA_SALUTATION = StringUrl('import-data/saledata/salutation')
    IMPORT_SALEDATA_CURRENCY = StringUrl('import-data/saledata/currency')
    IMPORT_SALEDATA_ACCOUNT_GROUP = StringUrl('import-data/saledata/account/group')
    IMPORT_SALEDATA_ACCOUNT_TYPE = StringUrl('import-data/saledata/account/type')
    IMPORT_SALEDATA_INDUSTRY = StringUrl('import-data/saledata/industry')
    IMPORT_SALEDATA_PAYMENT_TERM = StringUrl('import-data/saledata/payment-term')
    IMPORT_SALEDATA_PRODUCT_UOMGROUP = StringUrl('import-data/saledata/product/uomgroup')
    IMPORT_SALEDATA_PRODUCT_PRODUCT_TYPE = StringUrl('import-data/saledata/product/product-type')
    IMPORT_SALEDATA_PRODUCT_PRODUCT_CATEGORY = StringUrl('import-data/saledata/product/product-category')
    IMPORT_SALEDATA_PRODUCT_UOM = StringUrl('import-data/saledata/product/uom')
    IMPORT_SALEDATA_PRODUCT_MANUFACTURER = StringUrl('import-data/saledata/product/manufacturer')
    IMPORT_SALEDATA_PRODUCT = StringUrl('import-data/saledata/product')
    IMPORT_SALEDATA_PRICE_TAX_CATEGORY = StringUrl('import-data/saledata/price/tax-category')
    IMPORT_SALEDATA_PRICE_TAX = StringUrl('import-data/saledata/price/tax')
    # HR

    # WORKFLOW
    WORKFLOW_OF_APPS = StringUrl('workflow/apps')
    WORKFLOW_OF_APP_DETAIL = StringUrl('workflow/app/{pk}')
    WORKFLOW = StringUrl('workflow')
    WORKFLOW_LIST = StringUrl('workflow/lists')
    WORKFLOW_CREATE = StringUrl('workflow/create')
    WORKFLOW_NODE_SYSTEM_LIST = StringUrl('workflow/nodes-system')
    WORKFLOW_CURRENT_OF_APPS = StringUrl('workflow/currents')

    # WORKFLOW RUNTIME
    RUNTIME_LIST = StringUrl('workflow/runtimes')
    RUNTIME_LIST_ME = StringUrl('workflow/runtimes/me')
    RUNTIME_DETAIL = StringUrl('workflow/runtime/{pk}')
    RUNTIME_DIAGRAM = StringUrl('workflow/diagram')
    RUNTIME_DIAGRAM_DETAIL = StringUrl('workflow/diagram/{pk}')
    RUNTIME_TASK_LIST = StringUrl('workflow/tasks')
    RUNTIME_TASK_DETAIL = StringUrl('workflow/task/{pk}')
    RUNTIME_AFTER_DETAIL = StringUrl('workflow/runtime-after/{pk}')

    # crm/contact
    CONTACT_LIST = StringUrl('saledata/contacts')
    CONTACT_DETAIL = StringUrl('saledata/contact/{pk}')
    CONTACT_LIST_NOT_MAP_ACCOUNT = StringUrl('saledata/contacts-not-map-account')

    # masterdata/lookup/contact
    SALUTATION_LIST = StringUrl('saledata/salutations')
    INTERESTS_LIST = StringUrl('saledata/interests')
    SALUTATION_DETAIL = StringUrl('saledata/salutation/{pk}')
    SALUTATION_DETAIL_PK = StringUrl('saledata/salutation/{pk}')
    INTEREST_DETAIL = StringUrl('saledata/interest/{pk}')

    MEETING_ROOM_LIST = StringUrl('meeting-schedule/meetingrooms')
    MEETING_ROOM_DETAIL = StringUrl('meeting-schedule/meetingroom/{pk}')
    MEETING_ZOOM_CONFIG_LIST = StringUrl('meeting-schedule/zoom-configs')
    MEETING_ZOOM_CONFIG_DETAIL = StringUrl('meeting-schedule/zoom-config/{pk}')

    PERIODS_CONFIG_LIST = StringUrl('saledata/periods')
    PERIODS_CONFIG_DETAIL = StringUrl('saledata/period/{pk}')

    REVENUE_PLAN_CONFIG_LIST = StringUrl('saledata/revenue-plan-config')
    BUDGET_PLAN_CONFIG_LIST = StringUrl('budget-plans/budget-plan-config')
    LIST_CAN_VIEW_COMPANY_BP = StringUrl('budget-plans/list-can-view-company-budget-plan')
    LIST_CAN_LOCK_BP = StringUrl('budget-plans/list-can-lock-budget-plan')

    # masterdata/lookup/account
    INDUSTRY_LIST = StringUrl('saledata/industries')
    ACCOUNT_TYPE_LIST = StringUrl('saledata/accounttypes')
    ACCOUNT_TYPE_DETAIL = StringUrl('saledata/accounttype/{pk}')
    ACCOUNT_GROUP_LIST = StringUrl('saledata/accountgroups')
    ACCOUNT_GROUP_DETAIL = StringUrl('saledata/accountgroup/{pk}')
    INDUSTRY_DETAIL = StringUrl('saledata/industry/{pk}')

    # crm/account
    ACCOUNT_LIST = StringUrl('saledata/accounts')
    CUSTOMER_LIST = StringUrl('saledata/customer/list')
    SUPPLIER_LIST = StringUrl('saledata/supplier/list')
    ACCOUNT_DETAIL = StringUrl('saledata/account/{pk}')
    ACCOUNTS_MAP_EMPLOYEES = StringUrl('saledata/accounts-map-employees')
    ACCOUNT_SALE_LIST = StringUrl('saledata/accounts-sale')
    ACCOUNT_DROPDOWN_LIST = StringUrl('saledata/accounts-dropdown')

    # masterdata/product
    PRODUCT_TYPE_LIST = StringUrl('saledata/product-types')
    PRODUCT_TYPE_DETAIL = StringUrl('saledata/product-type/{pk}')
    PRODUCT_CATEGORY_LIST = StringUrl('saledata/product-categories')
    PRODUCT_CATEGORY_DETAIL = StringUrl('saledata/product-category/{pk}')
    MANUFACTURER_LIST = StringUrl('saledata/manufacturers')
    MANUFACTURER_DETAIL = StringUrl('saledata/manufacturer/{pk}')
    UNIT_OF_MEASURE_GROUP = StringUrl('saledata/units-of-measure-group')
    UNIT_OF_MEASURE_GROUP_DETAIL = StringUrl('saledata/unit-of-measure-group/{pk}')
    UNIT_OF_MEASURE = StringUrl('saledata/units-of-measure')
    UNIT_OF_MEASURE_DETAIL = StringUrl('saledata/unit-of-measure/{pk}')
    UOM_OF_GROUP_LABOR_LIST = StringUrl('saledata/uom-group-labor')

    # product
    PRODUCT_LIST = StringUrl('saledata/products')
    PRODUCT_QUICK_CREATE = StringUrl('saledata/product-quick-create')
    PRODUCT_DETAIL = StringUrl('saledata/product/{pk}')
    PRODUCT_SALE_LIST = StringUrl('saledata/products-sale/list')
    PRODUCT_SALE_DETAIL = StringUrl('saledata/products-sale')
    PRODUCT_VARIANT_LIST = StringUrl('saledata/products-variants')
    PRODUCT_UPLOAD_AVATAR = StringUrl('saledata/product/{pk}/upload-avatar')
    PRODUCT_SI_SERIAL_NUMBER_LIST = StringUrl('saledata/product-si-serial-number-list')

    # advance payment
    CASHOUTFLOW_QUOTATION_LIST = StringUrl('cashoutflow/quotation-list')
    CASHOUTFLOW_SALE_ORDER_LIST = StringUrl('cashoutflow/sale-order-list')
    CASHOUTFLOW_SUPPLIER_LIST = StringUrl('cashoutflow/supplier-list')
    ADVANCE_PAYMENT_LIST = StringUrl('cashoutflow/advance-payments')
    ADVANCE_PAYMENT_DETAIL = StringUrl('cashoutflow/advance-payment/{pk}')
    ADVANCE_PAYMENT_PRINT = StringUrl('cashoutflow/advance-payment-print/{pk}')
    ADVANCE_PAYMENT_COST_LIST = StringUrl('cashoutflow/advance-payment-cost-list/list')

    # payment
    PAYMENT_LIST = StringUrl('cashoutflow/payments')
    PAYMENT_DETAIL = StringUrl('cashoutflow/payment/{pk}')
    PAYMENT_CONFIG_LIST = StringUrl('cashoutflow/payment-config')
    PAYMENT_COST_LIST = StringUrl('cashoutflow/payment-cost-list/list')
    PAYMENT_PRINT = StringUrl('cashoutflow/payment-print/{pk}')
    PAYMENT_COST_ITEMS_LIST = StringUrl('cashoutflow/payment-cost-items-list')

    # masterdata/price
    TAX_CATEGORY_LIST = StringUrl('saledata/tax-categories')
    TAX_LIST = StringUrl('saledata/taxes')
    TAX_DETAIL = StringUrl('saledata/tax/{pk}')
    TAX_CATEGORY_DETAIL = StringUrl('saledata/tax-category/{pk}')
    CURRENCY_LIST = StringUrl('saledata/currencies')
    CURRENCY_DETAIL = StringUrl('saledata/currency/{pk}')
    SYNC_SELLING_RATE = StringUrl('saledata/sync-selling-rate-with-VCB/{pk}')

    # price
    PRICE_LIST = StringUrl('saledata/prices')
    PRICE_DETAIL = StringUrl('saledata/price/{pk}')
    PRICE_DELETE = StringUrl('saledata/delete-price/{pk}')
    PRODUCTS_FOR_PRICE_LIST = StringUrl('saledata/update-products-for-price-list/{pk}')
    PRICE_LIST_DELETE_PRODUCT = StringUrl('saledata/delete-products-for-price-list/{pk}')
    PRODUCT_ADD_FROM_PRICE_LIST = StringUrl('saledata/create-product-from-price-list/{pk}')
    PRICE_LIST_ITEM_IMPORT_DB = StringUrl('saledata/price-list-item-import-db')
    PRODUCT_QUOTATION_LOAD_DB = StringUrl('saledata/product-quotation-load-db')
    DELETE_CURRENCY_FROM_PRICE_LIST = StringUrl('saledata/delete-currency-from-price-list/{pk}')

    # masterdata/document
    DOCUMENT_TYPE_LIST = StringUrl('saledata/document-type')
    DOCUMENT_TYPE_DETAIL = StringUrl('saledata/document-type/{pk}')
    # payment terms
    PAYMENT_TERMS = StringUrl('saledata/masterdata/config/payment-term')

    # expense
    EXPENSE_LIST = StringUrl('saledata/expenses')
    EXPENSE_DETAIL = StringUrl('saledata/expense/{pk}')
    EXPENSE_SALE_LIST = StringUrl('saledata/expenses-sale')

    # opportunity
    # main
    OPPORTUNITY_LIST = StringUrl('opportunity/list')
    OPPORTUNITY_DETAIL = StringUrl('opportunity/detail/{pk}')
    # activities
    OPPORTUNITY_CALL_LOG_LIST = StringUrl('opportunity/call-log/list')
    OPPORTUNITY_CALL_LOG_DETAIL = StringUrl('opportunity/call-log/{pk}')
    OPPORTUNITY_EMAIL_LIST = StringUrl('opportunity/send-email/list')
    OPPORTUNITY_EMAIL_DETAIL = StringUrl('opportunity/send-email/{pk}')
    OPPORTUNITY_MEETING_LIST = StringUrl('opportunity/meeting/list')
    OPPORTUNITY_MEETING_DETAIL = StringUrl('opportunity/meeting/{pk}')
    OPPORTUNITY_DOCUMENT_LIST = StringUrl('opportunity/document/list')
    OPPORTUNITY_DOCUMENT_DETAIL = StringUrl('opportunity/document/{pk}')
    OPPORTUNITY_ACTIVITY_LOGS = StringUrl('opportunity/activity-log/list')
    # config
    OPPORTUNITY_CONFIG_DETAIL = StringUrl('opportunity/config-detail')
    # stage
    OPPORTUNITY_CONFIG_STAGE_LIST = StringUrl('opportunity/stage/list')
    OPPORTUNITY_CONFIG_STAGE_DETAIL = StringUrl('opportunity/stage/{pk}')
    OPPORTUNITY_STAGE_CHECKING = StringUrl('opportunity/stage-checking')
    # related
    OPPORTUNITY_CUSTOMER_DECISION_FACTOR_LIST = StringUrl('opportunity/decision-factor/list')
    OPPORTUNITY_CUSTOMER_DECISION_FACTOR_DETAIL = StringUrl('opportunity/decision-factor/{pk}')
    OPPORTUNITY_MEMBER_LIST = StringUrl('opportunity/detail/{pk_opp}/member/list')
    OPPORTUNITY_MEMBER_DETAIL = StringUrl('opportunity/detail/{pk_opp}/member/{pk_member}')
    OPPORTUNITY_CONTRACT_SUMMARY = StringUrl('opportunity/contract-summary')

    # Application for Opportunity permission
    APPLICATION_OPPORTUNITY_PERMISSION = StringUrl('base/applications-opportunity-permit')
    APPLICATION_PROPERTY_OPPORTUNITY_LIST = StringUrl('base/applications-property-opportunity')

    # task
    OPPORTUNITY_TASK_CONFIG = StringUrl('task/config')
    OPPORTUNITY_TASK_STT_LIST = StringUrl('task/status')
    OPPORTUNITY_TASK_LIST = StringUrl('task/list')
    OPPORTUNITY_TASK_DETAIL = StringUrl('task/detail')
    OPPORTUNITY_TASK_LOG_WORK = StringUrl('task/log-work')
    OPPORTUNITY_TASK_STT_UPDATE = StringUrl('task/update-status')
    OPPORTUNITY_TASK_MY_TASK_REPORT = StringUrl('task/my-report')
    OPPORTUNITY_TASK_MY_TASK_SUMMARY_REPORT = StringUrl('task/my-summary-report')
    OPPORTUNITY_TASK_GROUP_ASSIGNEE_LIST = StringUrl('task/list-has-group-assign')
    OPPORTUNITY_TASK_ASSIGNEE_GROUP_LIST = StringUrl('task/assignee-group/list')

    # quotation
    QUOTATION_LIST = StringUrl('quotation/list')
    QUOTATION_DETAIL = StringUrl('quotation/{pk}')
    QUOTATION_DETAIL_PRINT = StringUrl('quotation/print/{pk}')
    QUOTATION_EXPENSE_LIST = StringUrl('quotation/quotation-expense-list/lists')
    QUOTATION_CONFIG = StringUrl('quotation/config')
    QUOTATION_INDICATOR_LIST = StringUrl('quotation/indicators')
    QUOTATION_INDICATOR_DETAIL = StringUrl('quotation/indicator/{pk}')
    QUOTATION_INDICATOR_RESTORE = StringUrl('quotation/indicator-restore/{pk}')

    # Bidding
    BIDDING_LIST = StringUrl('bidding/list')
    BIDDING_RESULT = StringUrl('bidding/result')
    ACCOUNT_FOR_BIDDING_LIST = StringUrl('bidding/account-list')
    DOCUMENT_MASTERDATA_BIDDING_LIST = StringUrl('bidding/document-list')
    BIDDING_DETAIL = StringUrl('bidding/detail')
    BIDDING_RESULT_CONFIG_LIST = StringUrl('bidding/bidding-result-config')

    # address
    COUNTRIES = StringUrl('base/location/countries')
    CITIES = StringUrl('base/location/cities')
    DISTRICTS = StringUrl('base/location/districts')
    WARDS = StringUrl('base/location/wards')
    BASE_CURRENCY = StringUrl('base/currencies')
    NPROVINCES = StringUrl('base/location/nprovinces')
    NWARDS = StringUrl('base/location/nwards')

    # master-data/ promotion
    PROMOTION_LIST = StringUrl('promotion/list')
    PROMOTION_DETAIL = StringUrl('promotion/detail')
    PROMOTION_CHECK_LIST = StringUrl('promotion/check-list')

    # shipping
    SHIPPING_LIST = StringUrl('saledata/shippings')
    SHIPPING_DETAIL = StringUrl('saledata/shipping/{pk}')
    SHIPPING_CHECK_LIST = StringUrl('saledata/shippings-check')

    # sale order
    SALE_ORDER_LIST = StringUrl('saleorder/list')
    SALE_ORDER_DETAIL = StringUrl('saleorder/{pk}')
    SALE_ORDER_DETAIL_PRINT = StringUrl('saleorder/print/{pk}')
    SALE_ORDER_EXPENSE_LIST = StringUrl('saleorder/saleorder-expense-list/lists')
    SALE_ORDER_CONFIG = StringUrl('saleorder/config')
    SALE_ORDER_INDICATOR_LIST = StringUrl('saleorder/indicators')
    SALE_ORDER_INDICATOR_DETAIL = StringUrl('saleorder/indicator/{pk}')
    SALE_ORDER_INDICATOR_RESTORE = StringUrl('saleorder/indicator-restore/{pk}')
    SALE_ORDER_PRODUCT_WO_LIST = StringUrl('saleorder/sale-order-product-wo/list')
    SALE_ORDER_RECURRENCE_LIST = StringUrl('saleorder/sale-order-recurrence/list')
    SALE_ORDER_DROPDOWN_LIST = StringUrl('saleorder/dropdown/list')

    # warehouse
    WAREHOUSE_LIST = StringUrl('saledata/warehouses')
    WAREHOUSE_LIST_FOR_INVENTORY_ADJUSTMENT = StringUrl('saledata/warehouses-for-inventory-adjustment')
    WAREHOUSE_DETAIL = StringUrl('saledata/warehouse/{pk}')
    WAREHOUSE_PRODUCT_LIST = StringUrl('saledata/warehouses-products')
    WAREHOUSE_PRODUCT_LIST_FOR_GOODS_TRANSFER = StringUrl('saledata/warehouses-products-for-goods-transfer')
    WAREHOUSE_LOT_LIST = StringUrl('saledata/warehouses-lots')
    WAREHOUSE_SERIAL_LIST = StringUrl('saledata/warehouses-serials')
    WAREHOUSE_STOCK_PRODUCT = StringUrl('saledata/warehouses/check/{product_id}/{uom_id}')
    WAREHOUSE_PRODUCT_ASSET_LIST = StringUrl('saledata/warehouses/product-asset/list')
    WAREHOUSE_FOR_INVENTORY_LIST = StringUrl('saledata/warehouses-for-inventory')

    # shipping unit
    ITEM_UNIT_LIST = StringUrl('base/item-units')

    # good receipt
    GOOD_RECEIPT_API = StringUrl('saledata/good-receipt')
    GOOD_RECEIPT_PRODUCT_API = StringUrl('saledata/good-receipt/product')

    # return advance
    RETURN_ADVANCE_LIST = StringUrl('cashoutflow/return-advances')
    RETURN_ADVANCE_DETAIL = StringUrl('cashoutflow/return-advance/{pk}')
    AP_LIST_FOR_RETURN = StringUrl('cashoutflow/ap-list-for-return')

    # transition data config
    DELIVERY_CONFIG = StringUrl('delivery/config')
    DELIVERY_PICKING_LIST = StringUrl('delivery/picking')
    DELIVERY_PICKING_DETAIL = StringUrl('delivery/picking/{pk}')
    DELIVERY_PICKING_DETAIL_PRODUCTS = StringUrl('delivery/picking/{pk}/products')
    DELIVERY_SALEORDER_CALL = StringUrl('delivery/sale-order/{pk}')
    DELIVERY_LEASEORDER_CALL = StringUrl('delivery/lease-order/{pk}')
    DELIVERY_SERVICEORDER_CALL = StringUrl('delivery/service-order/{pk}')
    DELIVERY_LIST = StringUrl('delivery')
    DELIVERY_SUB_LIST = StringUrl('delivery/sub/{pk}')
    DELIVERY_SUB_PRINT_LIST = StringUrl('delivery/sub-print/{pk}')
    DELIVERY_FOR_RECOVERY_LIST = StringUrl('delivery/for-recovery')
    DELIVERY_PRODUCT_LEASE_LIST = StringUrl('delivery/product-lease')
    DELIVERY_WORK_LOG_LIST = StringUrl('delivery/work-log')

    # Purchase
    PURCHASE_ORDER_LIST = StringUrl('purchasing/purchase-order/list')
    PURCHASE_ORDER_DETAIL = StringUrl('purchasing/purchase-order/{pk}')
    PURCHASE_ORDER_DETAIL_PK = StringUrl('purchasing/purchase-order/{pk}')
    PURCHASE_REQUEST_LIST_FOR_PQR = StringUrl('purchasing/purchase-request-for-pqr/list')
    PURCHASE_ORDER_PRODUCT_GR_LIST = StringUrl('purchasing/purchase-order-product-gr/list')
    PURCHASE_ORDER_SALE_LIST = StringUrl('purchasing/purchase-order/list-sale')
    PURCHASE_REQUEST_SALE_LIST = StringUrl('purchasing/purchase-request/list-sale')
    PURCHASE_QUOTATION_SALE_LIST = StringUrl('purchasing/purchase-quotation/list-sale')
    PURCHASE_ORDER_DROPDOWN_LIST = StringUrl('purchasing/purchase-order-dropdown/list')

    # Purchase request
    PURCHASE_REQUEST_LIST = StringUrl('purchasing/purchase-request/list')
    PURCHASE_REQUEST_DETAIL = StringUrl('purchasing/purchase-request/{pk}')
    PR_PRD_LIST = StringUrl('purchasing/pr-product/list')
    PR_SO_LIST = StringUrl('purchasing/pr-so-list')
    PR_SO_PRD_LIST = StringUrl('purchasing/pr-so-product-list/{pk}')
    PR_DP_LIST = StringUrl('purchasing/pr-dp-list')
    PR_DP_PRD_LIST = StringUrl('purchasing/pr-dp-product-list/{pk}')
    PR_SVO_LIST = StringUrl('purchasing/pr-svo-list')
    PR_SVO_PRD_LIST = StringUrl('purchasing/pr-svo-product-list/{pk}')

    # Purchasing
    PURCHASE_QUOTATION_REQUEST_LIST = StringUrl('purchasing/purchase-quotation-request/list')
    PURCHASE_QUOTATION_REQUEST_DETAIL = StringUrl('purchasing/purchase-quotation-request/{pk}')
    PURCHASE_QUOTATION_REQUEST_LIST_FOR_PQ = StringUrl('purchasing/purchase-quotation-request-for-pq/list')
    PURCHASE_QUOTATION_LIST = StringUrl('purchasing/purchase-quotation/list')
    PURCHASE_QUOTATION_DETAIL = StringUrl('purchasing/purchase-quotation/{pk}')
    PURCHASE_QUOTATION_PRODUCT_LIST = StringUrl('purchasing/purchase-quotation-product/list')

    # Process
    PROCESS_CONFIG_LIST = StringUrl('process/config/list')
    PROCESS_CONFIG_READY = StringUrl('process/config/list/ready')
    PROCESS_CONFIG_DETAIL = StringUrl('process/config/detail/{pk}')
    PROCESS_RUNTIME_LIST = StringUrl('process/runtime/list')
    PROCESS_RUNTIME_LIST_OF_ME = StringUrl('process/runtime/list/me')
    PROCESS_STAGES_APPS_OF_ME = StringUrl('process/runtime/stages-apps/me')
    PROCESS_DATA_MATCH = StringUrl('process/runtime/data-match')
    PROCESS_RUNTIME_DETAIL = StringUrl('process/runtime/detail/{pk}')
    PROCESS_RUNTIME_MEMBERS = StringUrl('process/runtime/detail/{pk}/members')
    PROCESS_RUNTIME_MEMBERS_SYNC = StringUrl('process/runtime/detail/{pk}/members/sync')
    PROCESS_RUNTIME_STAGES_APP_COMPLETE = StringUrl('process/runtime/app/{pk}')
    PROCESS_RUNTIME_MEMBER_DETAIL = StringUrl('process/runtime/member/{pk}')
    PROCESS_RUNTIME_LOG = StringUrl('process/runtime/detail/{pk}/log')

    # Chatbot
    CHATBOT_CHAT = StringUrl('chatbot/chat')

    # Expense item

    EXPENSE_ITEM_LIST = StringUrl('saledata/expense-items')
    EXPENSE_ITEM_DETAIL = StringUrl('saledata/expense-item/{pk}')

    # Goods receipt
    GOODS_RECEIPT_LIST = StringUrl('inventory/goods-receipt/list')
    GOODS_RECEIPT_DETAIL = StringUrl('inventory/goods-receipt/{pk}')
    GOODS_RECEIPT_DETAIL_PK = StringUrl('inventory/goods-receipt/{pk}')

    GOODS_DETAIL_LIST = StringUrl('inventory/goods-detail/list')
    GOODS_DETAIL_SERIAL_DATA_LIST = StringUrl('inventory/goods-detail-sn-data/list')
    GOODS_DETAIL_DETAIL = StringUrl('inventory/goods-detail/{pk}')
    CREATE_UPDATE_GOODS_DETAIL_DATA = StringUrl('inventory/create-update-goods-detail-data/list')
    GOODS_DETAIL_IMPORT_DB = StringUrl('inventory/goods-detail-import-db')

    INVENTORY_ADJUSTMENT_LIST = StringUrl('inventory/inventory-adjustments')
    INVENTORY_ADJUSTMENT_DETAIL = StringUrl('inventory/inventory-adjustment/{pk}')
    INVENTORY_ADJUSTMENT_PRODUCT_LIST = StringUrl('inventory/inventory-adjustment/product/list/{ia_id}')
    INVENTORY_ADJUSTMENT_PRODUCT_GR_LIST = StringUrl('inventory/inventory-adjustments-product-gr')
    INVENTORY_ADJUSTMENT_DROPDOWN_LIST = StringUrl('inventory/inventory-adjustments-dropdown')

    # Purchase request config
    PURCHASE_REQUEST_CONFIG = StringUrl('purchasing/purchase-request/config')

    # e-Office
    #  leave
    LEAVE_CONFIG = StringUrl('leave/config')
    LEAVE_CREATE = StringUrl('leave/leave-type/create')
    LEAVE_DETAIL = StringUrl('leave/leave-type/detail/{pk}')
    LEAVE_REQUEST = StringUrl('leave/request')
    LEAVE_REQUEST_DETAIL = StringUrl('leave/request/detail/{pk}')
    LEAVE_REQUEST_CALENDAR = StringUrl('leave/calendar')

    #  Working calendar config
    WORKING_CALENDAR_CONFIG = StringUrl('leave/working-calendar/config')
    WORKING_CALENDAR_YEAR = StringUrl('leave/working-calendar/year')
    WORKING_CALENDAR_HOLIDAY = StringUrl('leave/working-calendar/holiday')

    # leave available
    LEAVE_AVAILABLE = StringUrl('leave/available/list')
    LEAVE_AVAILABLE_DDLIST = StringUrl('leave/available/dd-list')
    LEAVE_AVAILABLE_UPDATE = StringUrl('leave/available/edit/{pk}')
    LEAVE_AVAILABLE_HISTORY = StringUrl('leave/available/history/{pk}')

    # meeting schedule
    MEETING_SCHEDULE_LIST = StringUrl('meeting-schedule/meetings-schedule')
    MEETING_SCHEDULE_DETAIL = StringUrl('meeting-schedule/meeting-schedule/{pk}')
    MEETING_SCHEDULE_CHECK = StringUrl('meeting-schedule/meeting-check')

    #  Goods transfer
    GOODS_TRANSFER_LIST = StringUrl('inventory/goods-transfer/list')
    GOODS_TRANSFER_DETAIL = StringUrl('inventory/goods-transfer/{pk}')

    # Goods issue
    GOODS_ISSUE_LIST = StringUrl('inventory/goods-issue/list')
    GOODS_ISSUE_DETAIL = StringUrl('inventory/goods-issue/{pk}')
    GIS_IA_LIST = StringUrl('inventory/inventory-adjustment-for-gis/list')
    GIS_IA_DETAIL = StringUrl('inventory/inventory-adjustment-for-gis/{pk}')
    GIS_PRODUCTION_ORDER_LIST = StringUrl('inventory/production-order-for-gis/list')
    GIS_PRODUCTION_ORDER_DETAIL = StringUrl('inventory/production-order-for-gis/{pk}')
    GIS_WORK_ORDER_LIST = StringUrl('inventory/work-order-for-gis/list')
    GIS_WORK_ORDER_DETAIL = StringUrl('inventory/work-order-for-gis/{pk}')
    GIS_PM_LIST = StringUrl('inventory/pm-for-gis/list')
    GIS_PM_DETAIL = StringUrl('inventory/pm-for-gis/{pk}')
    GIS_NONE_LIST = StringUrl('inventory/prd-wh-list-for-gis/list')
    GIS_LOT_LIST = StringUrl('inventory/lot-list-for-gis/list')
    GIS_SERIAL_LIST = StringUrl('inventory/serial-list-for-gis/list')
    GOODS_ISSUE_PRODUCT_LIST = StringUrl('inventory/goods-issue-product/list')

    # Report
    REPORT_REVENUE_LIST = StringUrl('report/revenue/list')
    REPORT_PRODUCT_LIST = StringUrl('report/product/list')
    REPORT_PRODUCT_LIST_FOR_DASHBOARD = StringUrl('report/product-for-dashboard/list')
    REPORT_CUSTOMER_LIST = StringUrl('report/customer/list')
    REPORT_PIPELINE_LIST = StringUrl('report/pipeline/list')
    REPORT_CASHFLOW_LIST = StringUrl('report/cashflow/list')
    REPORT_INVENTORY_COST_LIST = StringUrl('report/inventory-cost-report/list')
    REPORT_INVENTORY_STOCK_LIST = StringUrl('report/inventory-stock-report/list')
    BALANCE_INIT_LIST = StringUrl('report/balance-init/list')
    WAREHOUSE_AVAILABLE_PRODUCT_LIST = StringUrl('report/warehouse-available-product-list')
    WAREHOUSE_AVAILABLE_PRODUCT_DETAIL = StringUrl('report/warehouse-available-product-detail')
    REPORT_GENERAL_LIST = StringUrl('report/general/list')
    PO_REPORT_LIST = StringUrl('report/po-report/list')
    REPORT_LEASE_LIST = StringUrl('report/lease/list')

    # Final Acceptance
    FINAL_ACCEPTANCE_LIST = StringUrl('acceptance/final-acceptance/list')
    FINAL_ACCEPTANCE_DETAIL = StringUrl('acceptance/final-acceptance')

    # Business Trip
    BUSINESS_TRIP_LIST = StringUrl('business-trip/list')
    BUSINESS_TRIP_DETAIL = StringUrl('business-trip/detail')

    # Asset, Tools
    ASSET_TOOLS_PROVIDE = StringUrl('asset-tools/provide')
    ASSET_TOOLS_PROVIDE_DETAIL = StringUrl('asset-tools/provide/detail')
    ASSET_TOOLS_PRODUCT_LIST_BY_PROVIDE = StringUrl('asset-tools/provide/product-list-by-provide-id')
    ASSET_TOOLS_DELIVERY = StringUrl('asset-tools/delivery')
    ASSET_TOOLS_DELIVERY_DETAIL = StringUrl('asset-tools/delivery/detail')
    ASSET_TOOLS_LIST = StringUrl('asset-tools/list')
    ASSET_TOOLS_RETURN_LIST = StringUrl('asset-tools/asset-return')
    ASSET_TOOLS_RETURN_DETAIL = StringUrl('asset-tools/asset-return/detail')

    # Revenue plan
    REVENUE_PLAN_LIST = StringUrl('revenue-plans/list')
    REVENUE_PLAN_DETAIL = StringUrl('revenue-plans/detail/{pk}')
    REVENUE_PLAN_BY_REPORT_PERM_LIST = StringUrl('revenue-plans/list-by-report-perm')

    # Budget plan
    BUDGET_PLAN_LIST = StringUrl('budget-plans/list')
    BUDGET_PLAN_DETAIL = StringUrl('budget-plans/detail/{pk}')

    # Lead
    LEAD_LIST = StringUrl('lead/list')
    LEAD_LIST_FOR_OPP = StringUrl('lead/list-for-opp')
    LEAD_CHART = StringUrl('lead/chart-data')
    LEAD_DETAIL = StringUrl('lead/detail/{pk}')
    LEAD_STAGE_LIST = StringUrl('lead/list-lead-stage')
    LEAD_CALL_LIST = StringUrl('lead/call/list')
    LEAD_CALL_DETAIL = StringUrl('lead/call/detail/{pk}')
    LEAD_EMAIL_LIST = StringUrl('lead/email/list')
    LEAD_MEETING_LIST = StringUrl('lead/meeting/list')
    LEAD_MEETING_DETAIL = StringUrl('lead/meeting/detail/{pk}')
    LEAD_ACTIVITY_LIST = StringUrl('lead/activity/list')

    # Distribution plan
    DISTRIBUTION_PLAN_LIST = StringUrl('distribution-plans/list')
    DISTRIBUTION_PLAN_DETAIL = StringUrl('distribution-plans/detail/{pk}')

    # Bill of material
    BOM_LIST = StringUrl('production/bom/list')
    BOM_DETAIL = StringUrl('production/bom/{pk}')
    PRODUCT_LIST_FOR_BOM = StringUrl('production/product-list-for-BOM')
    LABOR_LIST_FOR_BOM = StringUrl('production/labor-list-for-BOM')
    MATERIAL_LIST_FOR_BOM = StringUrl('production/product-material-list-for-BOM')
    TOOL_LIST_FOR_BOM = StringUrl('production/product-tool-list-for-BOM')
    BOM_ORDER_LIST = StringUrl('production/bom-order/list')

    # AR Invoice
    DELIVERY_LIST_AR_INVOICE = StringUrl('ar-invoice/get-deliveries')
    SO_LIST_AR_INVOICE = StringUrl('ar-invoice/get-sale-order')
    AR_INVOICE_LIST = StringUrl('ar-invoice/list')
    AR_INVOICE_DETAIL = StringUrl('ar-invoice/detail/{pk}')
    AR_INVOICE_RECURRENCE_LIST = StringUrl('ar-invoice/recurrence/list')

    # AP Invoice
    GOOD_RECEIPT_LIST_AP_INVOICE = StringUrl('ap-invoice/get-goods-receipts')
    PO_LIST_AR_INVOICE = StringUrl('ap-invoice/get-purchase-order')
    AP_INVOICE_LIST = StringUrl('ap-invoice/list')
    AP_INVOICE_DETAIL = StringUrl('ap-invoice/detail/{pk}')

    # Goods Return
    SALE_ORDER_LIST_FOR_GOODS_RETURN = StringUrl('inventory/sale-orders-for-goods-return/list')
    DELIVERY_LIST_FOR_GOODS_RETURN = StringUrl('inventory/get-deliveries-for-goods-return')
    GOODS_RETURN_LIST = StringUrl('inventory/goods-return/list')
    GOODS_RETURN_DETAIL = StringUrl('inventory/goods-return/{pk}')

    # Goods Registration
    GOODS_REGISTRATION_LIST = StringUrl('inventory/goods-registration/list')
    GOODS_REGISTRATION_DETAIL = StringUrl('inventory/goods-registration/{pk}')
    GOODS_REGISTRATION_ITEM_SUB_LIST = StringUrl('inventory/gre-item-sub/list')
    GRE_ITEM_PRD_WH = StringUrl('inventory/gre-item-prd-wh')
    GRE_ITEM_PRD_WH_LOT = StringUrl('inventory/gre-item-prd-wh-lot')
    GRE_ITEM_PRD_WH_SN = StringUrl('inventory/gre-item-prd-wh-serial')
    PRODUCT_LIST_FOR_PROJECT = StringUrl('inventory/product-list-for-project')
    PRODUCT_LIST_FOR_NONE_PROJECT = StringUrl('inventory/product-list-for-none-project')
    GRE_ITEM_BORROW_LIST = StringUrl('inventory/gre-item-borrow/list')
    GRE_ITEM_BORROW_DETAIL = StringUrl('inventory/gre-item-borrow/{pk}')
    GRE_ITEM_AVAILABLE_QUANTITY = StringUrl('inventory/gre-item-available-quantity')
    NONE_GRE_ITEM_BORROW_LIST = StringUrl('inventory/none-gre-item-borrow/list')
    NONE_GRE_ITEM_BORROW_DETAIL = StringUrl('inventory/none-gre-item-borrow/{pk}')
    NONE_GRE_ITEM_AVAILABLE_QUANTITY = StringUrl('inventory/none-gre-item-available-quantity')
    GOODS_REGISTRATION_BORROW_LIST = StringUrl('inventory/goods-regis-borrow/list')

    INVOICE_SIGN_LIST = StringUrl('ar-invoice/sign/list')
    WAREHOUSE_INTERACT_LIST = StringUrl('saledata/warehouses/config-interact')
    WAREHOUSE_INTERACT_DETAIL = StringUrl('saledata/warehouses/config-interact/{pk}')

    # Diagram
    DIAGRAM_LIST = StringUrl('diagram/list')

    # Project
    PROJECT_CONFIG = StringUrl('project/config')
    PROJECT_LIST = StringUrl('project/list')
    PROJECT_DETAIL = StringUrl('project/detail/{pk}')
    PROJECT_EDIT = StringUrl('project/edit/{pk}')
    PROJECT_GROUP_LIST = StringUrl('project/group/list')
    PROJECT_GROUP_DD_LIST = StringUrl('project/group/list-dd')
    PROJECT_GROUP_DETAIL = StringUrl('project/group/detail')
    PROJECT_WORK_LIST = StringUrl('project/work/list')
    PROJECT_WORK_DETAIL = StringUrl('project/work/detail')
    PROJECT_MEMBER_ADD = StringUrl('project/{pk}/member/add')
    PROJECT_MEMBER_DETAIL = StringUrl('project/{pk}/member/detail/{pk_member}')
    PROJECT_UPDATE_ORDER = StringUrl('project/update-order/{pk}')
    PROJECT_TASK_LIST = StringUrl('project/assign-task-list')
    PROJECT_TASK_LIST_ALL = StringUrl('project/assign-task-list/all')
    PROJECT_TASK_LINK = StringUrl('project/assign-task-link/{pk}')
    PROJECT_EXPENSE_LIST = StringUrl('project/project-expense-home-list')
    PROJECT_WORK_EXPENSE_LIST = StringUrl('project/work-expense-list')
    PROJECT_BASELINE = StringUrl('project/baseline/list')
    PROJECT_BASELINE_DETAIL = StringUrl('project/baseline/detail')
    PROJECT_COMMENT_LIST = StringUrl('project/new/{news_id}/comments')
    PROJECT_NEWS_LIST = StringUrl('project/news')
    PROJECT_NEWS_COMMENT_FLOWS = StringUrl('project/news/comment/{pk}/flows')
    PROJECT_STATUS_UPDATE = StringUrl('project/close-open-project/{pk}')

    # Folder
    FOLDER_LIST = StringUrl('attachment/folder/list')
    FOLDER_MY_FILE_LIST = StringUrl('attachment/folder/list-my-space')
    FOLDER_LIST_SHARED_TO_ME = StringUrl('attachment/folder/list-share-to-me')
    FOLDER_DETAIL = StringUrl('attachment/folder')
    FOLDER_UPLOAD_FILE_LIST = StringUrl('attachment/folder-upload-file/list')
    FOLDER_CHECK_PERM = StringUrl('attachment/folder-check-perm')
    FILE_CHECK_PERM = StringUrl('attachment/file-check-perm')
    FOLDER_DOWNLOAD = StringUrl('attachment/folder/download/{pk}')

    # Zones
    ZONES_APPLICATION_LIST = StringUrl('base/zones-application/list')
    ZONES_LIST = StringUrl('base/zones/list')
    # Employee config on app
    APP_EMP_CONFIG_LIST = StringUrl('base/app-emp-config/list')

    # Budget report
    BUDGET_REPORT_COMPANY_LIST = StringUrl('report/budget-report-company/list')
    BUDGET_REPORT_GROUP_LIST = StringUrl('report/budget-report-group/list')
    BUDGET_REPORT_PAYMENT_LIST = StringUrl('report/budget-report-payment/list')

    # Contract
    CONTRACT_LIST = StringUrl('contract/list')
    CONTRACT_DETAIL = StringUrl('contract')

    # Production order
    PRODUCTION_ORDER_LIST = StringUrl('production/production-order/list')
    PRODUCTION_ORDER_DETAIL = StringUrl('production/production-order')
    PRODUCTION_ORDER_DD_LIST = StringUrl('production/production-order-dd/list')
    PRODUCTION_ORDER_MANUAL_DONE_LIST = StringUrl('production/production-order-manual-done/list')

    # Production report
    PRODUCTION_REPORT_LIST = StringUrl('production/production-report/list')
    PRODUCTION_REPORT_DETAIL = StringUrl('production/production-report')
    PRODUCTION_REPORT_DD_LIST = StringUrl('production/production-report-dd/list')
    PRODUCTION_REPORT_GR_LIST = StringUrl('production/production-report-gr/list')
    PRODUCTION_REPORT_PRODUCT_LIST = StringUrl('production/production-report-product/list')

    # Work order
    WORK_ORDER_LIST = StringUrl('production/work-order/list')
    WORK_ORDER_DETAIL = StringUrl('production/work-order')
    WORK_ORDER_DD_LIST = StringUrl('production/work-order-dd/list')
    WORK_ORDER_MANUAL_DONE_LIST = StringUrl('production/work-order-manual-done/list')

    # Recurrence
    RECURRENCE_LIST = StringUrl('recurrence/list')
    RECURRENCE_DETAIL = StringUrl('recurrence')
    RECURRENCE_ACTION_LIST = StringUrl('recurrence/action/list')
    RECURRENCE_ACTION_DETAIL = StringUrl('recurrence/action')

    # HRM
    HRM_EMPLOYEE_NOT_MAP_HRM = StringUrl('hrm/employee-not-map/list')
    HRM_EMPLOYEE_INFO_LIST = StringUrl('hrm/employee-info/list')
    HRM_EMPLOYEE_INFO_DETAIL = StringUrl('hrm/employee-info/detail/{pk}')
    HRM_EMPLOYEE_CONTRACT_LIST = StringUrl('hrm/employee-info/contract/list')
    HRM_EMPLOYEE_CONTRACT_DETAIL = StringUrl('hrm/employee-info/contract/detail/{pk}')
    HRM_EMPLOYEE_SIGNATURE_LIST = StringUrl('hrm/employee-info/signature/list')
    HRM_EMPLOYEE_SIGNATURE_UPDATE = StringUrl('hrm/employee-info/signature/update/{pk}')
    # HRM CONTRACT RUNTIME
    HRM_CONTRACT_RUNTIME = StringUrl('hrm/employee-info/contract-signing/create')
    HRM_CONTRACT_RUNTIME_DETAIL = StringUrl('hrm/employee-info/contract-signing/detail/{pk}')
    HRM_OVERTIME_REQUEST_LIST = StringUrl('hrm/overtime/request/list')
    HRM_OVERTIME_REQUEST_DETAIL = StringUrl('hrm/overtime/request/detail/{pk}')
    HRM_PAYROLL_TEMPLATE_LIST = StringUrl('hrm/payroll/template/request/list')
    HRM_PAYROLL_TEMPLATE_DETAIL = StringUrl('hrm/payroll/template/request/detail/{pk}')
    HRM_PAYROLL_ATTRIBUTE_LIST = StringUrl('hrm/payroll/template/component/list')
    HRM_PAYROLL_ATTRIBUTE_DETAIL = StringUrl('hrm/payroll/template/component/detail/{pk}')

    # Lease order
    LEASE_ORDER_CONFIG = StringUrl('leaseorder/config')
    LEASE_ORDER_LIST = StringUrl('leaseorder/list')
    LEASE_ORDER_DETAIL = StringUrl('leaseorder/{pk}')
    LEASE_ORDER_RECURRENCE_LIST = StringUrl('leaseorder/lease-order-recurrence/list')
    LEASE_ORDER_DROPDOWN_LIST = StringUrl('leaseorder/dropdown/list')

    # CONSULTING
    CONSULTING_LIST = StringUrl('consulting/list')
    CONSULTING_ACCOUNT_LIST = StringUrl('consulting/account/list')
    CONSULTING_PRODUCT_CATEGORY_LIST = StringUrl('consulting/product-category/list')
    CONSULTING_MASTERDATA_DOC_LIST = StringUrl('consulting/masterdata-doc/list')
    CONSULTING_DETAIL = StringUrl('consulting/detail')
    CONSULTING_OPP_DETAIL = StringUrl('consulting/opp-detail')

    # CONTRACT TEMPLATE
    CORE_CONTRACT_TEMPLATE_LIST = StringUrl('contract-template/list')
    CORE_CONTRACT_TEMPLATE_LIST_DD = StringUrl('contract-template/dd-list')
    CORE_CONTRACT_TEMPLATE_DETAIL = StringUrl('contract-template/detail/{pk}')

    # Cash inflow
    FINANCIAL_CASHINFLOW_LIST = StringUrl('financial-cashflow/cashinflows')
    FINANCIAL_CASHINFLOW_DETAIL = StringUrl('financial-cashflow/cashinflow/{pk}')
    CUSTOMER_ADVANCE_LIST_FOR_CASHINFLOW = StringUrl('financial-cashflow/customer-advance-for-cashinflow/list')
    AR_INVOICE_LIST_FOR_CASHINFLOW = StringUrl('financial-cashflow/ar-invoice-for-cashinflow/list')

    # Cash outflow
    FINANCIAL_CASHOUTFLOW_LIST = StringUrl('financial-cashflow/cashoutflows')
    FINANCIAL_CASHOUTFLOW_DETAIL = StringUrl('financial-cashflow/cashoutflow/{pk}')
    PO_PAYMENT_STAGE_LIST_FOR_COF = StringUrl('financial-cashflow/po-payment-stage-list-for-cof')
    AP_INVOICE_PO_PAYMENT_STAGE_LIST_FOR_COF = StringUrl('financial-cashflow/ap-invoice-po-payment-stage-list-for-cof')
    SO_EXPENSE_LIST_FOR_COF = StringUrl('financial-cashflow/so-expense-list-for-cof')
    SO_LIST_FOR_COF = StringUrl('financial-cashflow/so-list-for-cof')
    LO_EXPENSE_LIST_FOR_COF = StringUrl('financial-cashflow/lo-expense-list-for-cof')
    LO_LIST_FOR_COF = StringUrl('financial-cashflow/lo-list-for-cof')

    # Recon
    FINANCIAL_RECON_LIST = StringUrl('financial-reconciliation/list')
    FINANCIAL_RECON_DETAIL = StringUrl('financial-reconciliation/detail/{pk}')
    AP_INVOICE_LIST_FOR_RECON = StringUrl('financial-reconciliation/ap-invoice-for-recon/list')
    COF_LIST_FOR_RECON = StringUrl('financial-reconciliation/cash-outflow-for-recon/list')
    AR_INVOICE_LIST_FOR_RECON = StringUrl('financial-reconciliation/ar-invoice-for-recon/list')
    CIF_LIST_FOR_RECON = StringUrl('financial-reconciliation/cash-inflow-for-recon/list')

    # PARTNER CENTER
    # LIST
    PARTNER_CENTER_LIST_DATA_OBJ_LIST = StringUrl('partner-center/data-obj-list')
    LIST_LIST = StringUrl('partner-center/list/list')
    LIST_DETAIL = StringUrl('partner-center/list/detail')
    LIST_RESULT_LIST = StringUrl('partner-center/list/result-list')
    LIST_EMPLOYEE_LIST = StringUrl('partner-center/list/employee-list')
    LIST_CONTACT_LIST = StringUrl('partner-center/list/contact-list')
    LIST_INDUSTRY_LIST = StringUrl('partner-center/list/industry-list')
    LIST_OPP_CONFIG_STAGE_LIST = StringUrl('partner-center/list/opp-config-stage-list')
    LIST_ACCOUNT_LIST = StringUrl('partner-center/list/account-list')
    # Goods recovery
    GOODS_RECOVERY_LIST = StringUrl('inventory/goods-recovery/list')
    GOODS_RECOVERY_LEASE_GENERATE_LIST = StringUrl('inventory/goods-recovery-lease-generate/list')
    GOODS_RECOVERY_DETAIL = StringUrl('inventory/goods-recovery/{pk}')

    # Advance Filter
    ADVANCE_FILTER_LIST = StringUrl('report/advance-filter/list')
    ADVANCE_FILTER_DETAIL = StringUrl('report/advance-filter/detail')

    # masterdata/ fixed asset
    FIXED_ASSET_CLASSIFICATION_GROUP_LIST = StringUrl('saledata/fixed-asset/classification-group/list')
    FIXED_ASSET_CLASSIFICATION_LIST = StringUrl('saledata/fixed-asset/classification/list')

    # asset/ fixed asset
    FIXED_ASSET_LIST = StringUrl('asset/fixed-asset/list')
    FIXED_ASSET_DD_LIST = StringUrl('asset/fixed-asset/no-perm-list')
    FIXED_ASSET_DETAIL = StringUrl('asset/fixed-asset/detail')
    FIXED_ASSET_FOR_LEASE_LIST = StringUrl('asset/fixed-asset-for-lease/list')
    FIXED_ASSET_STATUS_LEASE_LIST = StringUrl('asset/fixed-asset-status-lease/list')

    # masterdata/ instrument tool
    INSTRUMENT_TOOL_CLASSIFICATION_LIST = StringUrl('saledata/tool/classification/list')
    INSTRUMENT_TOOL_CLASSIFICATION_DETAIL = StringUrl('saledata/tool/classification/detail')

    # asset/ instrument tool
    INSTRUMENT_TOOL_LIST = StringUrl('asset/instrument-tool/list')
    INSTRUMENT_TOOL_DD_LIST = StringUrl('asset/instrument-tool/no-perm-list')
    INSTRUMENT_TOOL_DETAIL = StringUrl('asset/instrument-tool/detail')
    CHART_OF_ACCOUNTS_LIST = StringUrl('accounting-setting/chart-of-accounts/list')
    CHART_OF_ACCOUNTS_DETAIL = StringUrl('accounting-setting/chart-of-accounts/{pk}')
    INSTRUMENT_TOOL_FOR_LEASE_LIST = StringUrl('asset/instrument-tool-for-lease/list')
    INSTRUMENT_TOOL_STATUS_LEASE_LIST = StringUrl('asset/instrument-tool-status-lease/list')

    DEFAULT_ACCOUNT_DETERMINATION_LIST = StringUrl('accounting-setting/default-account-determination/list')
    DEFAULT_ACCOUNT_DETERMINATION_DETAIL = StringUrl('accounting-setting/default-account-determination/detail/{pk}')
    WAREHOUSE_ACCOUNT_DETERMINATION_LIST = StringUrl('accounting-setting/warehouse-account-determination/list')
    WAREHOUSE_ACCOUNT_DETERMINATION_DETAIL = StringUrl('accounting-setting/warehouse-account-determination/detail/{pk}')
    PRODUCT_TYPE_ACCOUNT_DETERMINATION_LIST = StringUrl('accounting-setting/product-type-account-determination/list')
    PRODUCT_TYPE_ACCOUNT_DETERMINATION_DETAIL = StringUrl(
        'accounting-setting/product-type-account-determination/detail/{pk}')
    PRODUCT_ACCOUNT_DETERMINATION_LIST = StringUrl('accounting-setting/product-account-determination/list')
    PRODUCT_ACCOUNT_DETERMINATION_DETAIL = StringUrl('accounting-setting/product-account-determination/detail/{pk}')

    JOURNAL_ENTRY_LIST = StringUrl('journal-entry/list')
    JOURNAL_ENTRY_DETAIL = StringUrl('journal-entry/detail/{pk}')

    # asset/ fixed asset write off
    FIXED_ASSET_WRITE_OFF_LIST = StringUrl('asset/fixed-asset-writeoff/list')
    FIXED_ASSET_WRITE_OFF_DETAIL = StringUrl('asset/fixed-asset-writeoff/detail')

    # asset/ instrument write off
    INSTRUMENT_TOOL_WRITE_OFF_LIST = StringUrl('asset/instrument-tool-writeoff/list')
    INSTRUMENT_TOOL_WRITE_OFF_DETAIL = StringUrl('asset/instrument-tool-writeoff/detail')

    # masterdata/ bank, bank account
    BANK_LIST = StringUrl('saledata/bank/list')
    BANK_DETAIL = StringUrl('saledata/bank/detail')
    BANK_ACCOUNT_LIST = StringUrl('saledata/bank-account/list')
    BANK_ACCOUNT_DETAIL = StringUrl('saledata/bank-account/detail')

    # sales/group order
    GROUP_ORDER_PRODUCT_LIST = StringUrl('group-order/product/list')
    GROUP_ORDER_LIST = StringUrl('group-order/list')
    GROUP_ORDER_DETAIL = StringUrl('group-order/detail')

    # Payment plan
    PAYMENT_PLAN_LIST = StringUrl('paymentplan/list')

    #  KMS
    KMS_DOC_TYPE_LIST = StringUrl('kms/doc-approval/doc-type-list')
    KMS_DOC_TYPE_DETAIL = StringUrl('kms/doc-approval/doc-type-detail/{pk}')
    KMS_CONTENT_GROUP_LIST = StringUrl('kms/doc-approval/content-group-list')
    KMS_CONTENT_GROUP_DETAIL = StringUrl('kms/doc-approval/content-group-detail/{pk}')
    KMS_DOCUMENT_APPROVAL_LIST = StringUrl('kms/doc-approval/list')
    KMS_DOCUMENT_APPROVAL_DETAIL = StringUrl('kms/doc-approval/detail/{pk}')

    # sales/product modification
    PRODUCT_MODIFICATION_LIST = StringUrl('product-modification/list')
    PRODUCT_MODIFICATION_DETAIL = StringUrl('product-modification/detail/{pk}')
    PRODUCT_COMPONENT_LIST = StringUrl('product-modification/product-component-list')
    LATEST_COMPONENT_LIST = StringUrl('product-modification/latest-component-list')
    PRODUCT_MODIFIED_LIST = StringUrl('product-modification/product-modified-list')
    PRODUCT_MODIFIED_BEFORE_LIST = StringUrl('product-modification/product-modified-before-list')
    WAREHOUSE_LIST_BY_PRODUCT = StringUrl('product-modification/warehouse-list-by-product')
    PRODUCT_LOT_LIST = StringUrl('product-modification/product-lot-list')
    PRODUCT_SERIAL_LIST = StringUrl('product-modification/product-serial-list')
    PRODUCT_MODIFIED_DROPDOWN_LIST = StringUrl('product-modification/dropdown/list')
    PRODUCT_MODIFIED_PRODUCT_GR_LIST = StringUrl('product-modification/product-modification-product-gr/list')

    # sales/product modification bom
    PRODUCT_MODIFICATION_BOM_LIST = StringUrl('product-modification-bom/list')
    PRODUCT_MODIFICATION_BOM_DETAIL = StringUrl('product-modification-bom/detail/{pk}')
    PMBOM_PRODUCT_COMPONENT_LIST = StringUrl('product-modification-bom/product-component-list')
    PMBOM_LATEST_COMPONENT_LIST = StringUrl('product-modification-bom/latest-component-list')
    PMBOM_PRODUCT_MODIFIED_LIST = StringUrl('product-modification-bom/product-modified-list')
    PMBOM_PRODUCT_MODIFIED_BEFORE_LIST = StringUrl('product-modification-bom/product-modified-before-list')

    # KMS - Incoming Document
    INCOMING_DOCUMENT_LIST = StringUrl('kms/incoming-doc/list')
    INCOMING_DOCUMENT_DETAIL = StringUrl('kms/incoming-doc/detail/{pk}')

    # sales/equipment loan
    EQUIPMENT_LOAN_LIST = StringUrl('equipment-loan/list')
    EQUIPMENT_LOAN_DETAIL = StringUrl('equipment-loan/detail/{pk}')
    EL_PRODUCT_LIST = StringUrl('equipment-loan/el-product-list')
    EL_WAREHOUSE_LIST_BY_PRODUCT = StringUrl('equipment-loan/el-warehouse-list-by-product')
    EL_PRODUCT_LOT_LIST = StringUrl('equipment-loan/el-product-lot-list')
    EL_PRODUCT_SERIAL_LIST = StringUrl('equipment-loan/el-product-serial-list')

    # sales/equipment return
    EQUIPMENT_RETURN_LIST = StringUrl('equipment-return/list')
    EQUIPMENT_RETURN_DETAIL = StringUrl('equipment-return/detail/{pk}')
    ER_EL_LIST_BY_ACCOUNT = StringUrl('equipment-return/er-el-list-by-account')
    LOAN_PRODUCT_LIST = StringUrl('equipment-loan/loan-product-list')

    # masterdata/shift
    SHIFT_LIST = StringUrl('hrm/attendance/shift/list')
    SHIFT_DETAIL = StringUrl('hrm/attendance/shift/detail/{pk}')

    # attendance/shift assignment
    SHIFT_ASSIGNMENT_LIST = StringUrl('hrm/attendance/shift-assignment/list')

    # attendance/attendance
    ATTENDANCE_LIST = StringUrl('hrm/attendance/attendance/list')

    # attendance/device integrate
    ATTENDANCE_DEVICE_LIST = StringUrl('hrm/attendance/attendance-device/list')
    ATTENDANCE_DEVICE_DETAIL = StringUrl('hrm/attendance/attendance-device/{pk}')
    DEVICE_INTEGRATE_EMPLOYEE_LIST = StringUrl('hrm/attendance/device-integrate-employee/list')
    DEVICE_INTEGRATE_EMPLOYEE_DETAIL = StringUrl('hrm/attendance/device-integrate-employee/{pk}')

    # HRM - Absence Explanation
    ABSENCE_EXPLANATION_LIST = StringUrl('hrm/absenceexplanation/list')
    ABSENCE_EXPLANATION_DETAIL = StringUrl('hrm/absenceexplanation/detail/{pk}')

    # master data - attribute
    ATTRIBUTE_LIST = StringUrl('saledata/attribute/list')
    ATTRIBUTE_DETAIL = StringUrl('saledata/attribute/{pk}')
    PRODUCT_ATTRIBUTE_LIST = StringUrl('saledata/product-attribute/{pk}')

    # master data - shipment
    CONTAINER_LIST = StringUrl('saledata/shipment/container/list')
    CONTAINER_DETAIL = StringUrl('saledata/shipment/container/detail/{pk}')
    PACKAGE_LIST = StringUrl('saledata/shipment/package/list')
    PACKAGE_DETAIL = StringUrl('saledata/shipment/package/detail/{pk}')

    # service-order
    SERVICE_ORDER_LIST = StringUrl('serviceorder/list')
    SERVICE_ORDER_DETAIL = StringUrl('serviceorder/detail/{pk}')
    SERVICE_ORDER_DETAIL_DASHBOARD = StringUrl('serviceorder/detail-dashboard/{pk}')
    SO_WORK_ORDER_DETAIL = StringUrl('serviceorder/work-order-detail')

    # service-quotation
    SERVICE_QUOTATION_LIST = StringUrl('servicequotation/list')
    SERVICE_QUOTATION_DETAIL = StringUrl('servicequotation/detail/{pk}')
    SERVICE_QUOTATION_DETAIL_DASHBOARD = StringUrl('servicequotation/detail-dashboard/{pk}')

    # HRM - Payroll
    PAYROLL_CONFIG = StringUrl('hrm/payroll/payrollconfig/config')
