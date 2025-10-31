from ._common import FieldMapCommon

PAYMENT_DATA_MAP = {
    'opportunity_id': FieldMapCommon(
        name_mapping=['opportunity_id'],
    ).data,
    'employee_inherit_id': FieldMapCommon(
        name_mapping=['employee_inherit_id'],
    ).data,
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
    'date_created': FieldMapCommon(
        name_mapping=['date_created'],
    ).data,
    'employee_created_id': FieldMapCommon(
        name_mapping=['employee_created_id'],
    ).data,
    'quotation_id': FieldMapCommon(
        name_mapping=['quotation_id'],
    ).data,
    'sale_order_id': FieldMapCommon(
        name_mapping=['sale_order_id'],
    ).data,
    'is_internal_payment': FieldMapCommon(
        name_mapping=['is_internal_payment'],
    ).data,
    'employee_payment_id': FieldMapCommon(
        name_mapping=['employee_payment_id'],
    ).data,
    'supplier_id': FieldMapCommon(
        name_mapping=['supplier_id'],
    ).data,
    'method': FieldMapCommon(
        name_mapping=['method'],
    ).data,
    # tab line detail
    'payment_expense_valid_list': FieldMapCommon(
        name_mapping=['payment_expense_valid_list'],
    ).data,
    # tab plan
    'plan_tab': FieldMapCommon(
        name_mapping=['plan_tab'],
    ).data,
    # tab file
    'attachment': FieldMapCommon(
        name_mapping=['attachment'],
    ).data,
    'payment_value': FieldMapCommon(
        name_mapping=['payment_value'],
    ).data,
}
