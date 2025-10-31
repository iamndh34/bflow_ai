from ._common import FieldMapCommon

LEASE_ORDER_DATA_MAP = {
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
    'opportunity': FieldMapCommon(
        name_mapping=['opportunity'],
    ).data,
    'customer': FieldMapCommon(
        name_mapping=['customer'],
    ).data,
    'contact': FieldMapCommon(
        name_mapping=['contact'],
    ).data,
    'sale_person': FieldMapCommon(
        name_mapping=['sale_person'],
    ).data,
    'payment_term': FieldMapCommon(
        name_mapping=['payment_term'],
    ).data,
    'lease_products_data': FieldMapCommon(
        name_mapping=['lease_products_data', 'lease_products_data_readonly'],
        readonly_not_disable=['lease_products_data_readonly'],
    ).data,
    'lease_logistic_data': FieldMapCommon(
        name_mapping=['lease_logistic_data', 'lease_logistic_data_readonly'],
        readonly_not_disable=['lease_logistic_data_readonly'],
    ).data,
    'lease_costs_data': FieldMapCommon(
        name_mapping=['lease_costs_data', 'lease_costs_data_readonly'],
        readonly_not_disable=['lease_costs_data_readonly'],
    ).data,
    'lease_expenses_data': FieldMapCommon(
        name_mapping=['lease_expenses_data'],
    ).data,
    'lease_indicators_data': FieldMapCommon(
        name_mapping=['lease_indicators_data'],
    ).data,
}
