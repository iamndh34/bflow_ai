from ._common import FieldMapCommon

FIXED_ASSET_DATA_MAP = {
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
    'code': FieldMapCommon(
        name_mapping=['code'],
    ).data,
    'classification': FieldMapCommon(
        name_mapping=['classification'],
    ).data,
    'product': FieldMapCommon(
        name_mapping=['product'],
    ).data,
    'manage_department': FieldMapCommon(
        name_mapping=['manage_department'],
    ).data,
    'use_department': FieldMapCommon(
        name_mapping=['use_department'],
    ).data,
    'original_cost': FieldMapCommon(
        name_mapping=['original_cost'],
    ).data,
    'accumulative_depreciation': FieldMapCommon(
        name_mapping=['accumulative_depreciation'],
    ).data,
    'net_book_value': FieldMapCommon(
        name_mapping=['net_book_value'],
    ).data,
    'asset_sources': FieldMapCommon(
        name_mapping=['asset_sources'],
    ).data,
}

FIXED_ASSET_WRITEOFF_DATA_MAP = {
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
}
