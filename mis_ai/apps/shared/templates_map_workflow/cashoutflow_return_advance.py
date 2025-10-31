from ._common import FieldMapCommon

RETURN_ADVANCE_DATA_MAP = {
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
    'method': FieldMapCommon(
        name_mapping=['method'],
    ).data,
    'cost': FieldMapCommon(
        name_mapping=['cost'],
    ).data,
    'money_received': FieldMapCommon(
        name_mapping=['money_received'],
    ).data,
}
