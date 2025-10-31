from ._common import FieldMapCommon

SALE_ORDER_DATA_MAP = {
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
    'opportunity_id': FieldMapCommon(
        name_mapping=['opportunity_id'],
    ).data,
    'customer_data__id': FieldMapCommon(
        name_mapping=['customer_id', 'customer_data__id'],
    ).data,
    'contact': FieldMapCommon(
        name_mapping=['contact'],
    ).data,
    'employee_inherit_id': FieldMapCommon(
        name_mapping=['employee_inherit_id'],
    ).data,
    'payment_term': FieldMapCommon(
        name_mapping=['payment_term'],
    ).data,
    'sale_order_products_data': FieldMapCommon(
        name_mapping=['sale_order_products_data', 'sale_order_products_data_readonly'],
        readonly_not_disable=['sale_order_products_data_readonly'],
    ).data,
    'sale_order_logistic_data': FieldMapCommon(
        name_mapping=['sale_order_logistic_data', 'sale_order_logistic_data_readonly'],
        readonly_not_disable=['sale_order_logistic_data_readonly'],
    ).data,
    'sale_order_costs_data': FieldMapCommon(
        name_mapping=['sale_order_costs_data', 'sale_order_costs_data_readonly'],
        readonly_not_disable=['sale_order_costs_data_readonly'],
    ).data,
    'sale_order_expenses_data': FieldMapCommon(
        name_mapping=['sale_order_expenses_data'],
    ).data,
    'sale_order_indicators_data': FieldMapCommon(
        name_mapping=['sale_order_indicators_data'],
    ).data,
    'print_document': FieldMapCommon(
        id_mapping=['print_document'],
    ).data,
}
