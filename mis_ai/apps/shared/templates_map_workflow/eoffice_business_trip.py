from ._common import FieldMapCommon

BUSINESS_TRIP_DATA_MAP = {
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
    'departure': FieldMapCommon(
        name_mapping=['departure'],
    ).data,
    'destination': FieldMapCommon(
        name_mapping=['destination'],
    ).data,
    'date_f': FieldMapCommon(
        name_mapping=['date_f'],
    ).data,
    'employee_on_trip': FieldMapCommon(
        name_mapping=['employee_on_trip'],
    ).data,
    'date_t': FieldMapCommon(
        name_mapping=['date_t'],
    ).data,
    'morning_f': FieldMapCommon(
        name_mapping=['morning_f'],
    ).data,
    'morning_t': FieldMapCommon(
        name_mapping=['morning_t'],
    ).data,
    'total_day': FieldMapCommon(
        name_mapping=['total_day'],
        readonly_not_disable=['total_day'],
    ).data,
    'expense_items': FieldMapCommon(
        name_mapping=['expense_items'],
    ).data,
    'attachment': FieldMapCommon(
        name_mapping=['attachment'],
        cls_border_zones=['dad-file-control-group']
    ).data,
}
