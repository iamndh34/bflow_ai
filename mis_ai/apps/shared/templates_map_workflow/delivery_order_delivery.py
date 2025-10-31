from ._common import FieldMapCommon

DELIVERY_DATA_MAP = {
    'estimated_delivery_date': FieldMapCommon(
        name_mapping=['estimated_delivery_date'],
    ).data,
    'actual_delivery_date': FieldMapCommon(
        name_mapping=['actual_delivery_date'],
    ).data,
    'remarks': FieldMapCommon(
        name_mapping=['remarks'],
    ).data,
    'employee_inherit': FieldMapCommon(
        name_mapping=['employee_inherit'],
    ).data,
    'attachments': FieldMapCommon(
        name_mapping=['attachments'],
    ).data,
    'shipping_address': FieldMapCommon(
        name_mapping=['shipping_address'],
    ).data,
    'billing_address': FieldMapCommon(
        name_mapping=['billing_address'],
    ).data,
    'ready_quantity': FieldMapCommon(
        name_mapping=['ready_quantity'],
    ).data,
    'products': FieldMapCommon(
        name_mapping=['products'],
    ).data,
}
