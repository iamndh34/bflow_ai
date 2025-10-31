from ._common import FieldMapCommon

INSTRUMENT_TOOL_DATA_MAP = {
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
    'code': FieldMapCommon(
        name_mapping=['code'],
    ).data,
    'classification': FieldMapCommon(
        name_mapping=['classification'],
    ).data,
    'asset_sources': FieldMapCommon(
        name_mapping=['asset_sources'],
    ).data,
    'unit_price': FieldMapCommon(
        name_mapping=['unit_price'],
    ).data,
    'quantity': FieldMapCommon(
        name_mapping=['quantity'],
    ).data,
    'measure_unit': FieldMapCommon(
        name_mapping=['measure_unit'],
    ).data,
    'total_value': FieldMapCommon(
        name_mapping=['total_value'],
    ).data,
}

INSTRUMENT_TOOL_WRITEOFF_DATA_MAP = {
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
}