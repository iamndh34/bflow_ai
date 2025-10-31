from ._common import FieldMapCommon

ADVANCE_DATA_MAP = {
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
    'advance_payment_type': FieldMapCommon(
        name_mapping=['advance_payment_type'],
    ).data,
    'supplier_id': FieldMapCommon(
        name_mapping=['supplier_id'],
    ).data,
    'method': FieldMapCommon(
        name_mapping=['method'],
    ).data,
    'return_date': FieldMapCommon(
        name_mapping=['return_date'],
    ).data,
    'money_gave': FieldMapCommon(
        name_mapping=['money_gave'],
    ).data,
    # tab line detail
    'ap_item_list': FieldMapCommon(
        name_mapping=['ap_item_list'],
    ).data,
    # tab plan
    'plan_tab': FieldMapCommon(
        name_mapping=['plan_tab'],
    ).data,
    # tab file
    'attachment': FieldMapCommon(
        name_mapping=['attachment'],
    ).data,
    'advance_value': FieldMapCommon(
        name_mapping=['advance_value'],
    ).data,
}
