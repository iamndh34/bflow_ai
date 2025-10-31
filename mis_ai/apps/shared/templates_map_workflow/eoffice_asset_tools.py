__all__ = ['ASSET_PROVIDE_DATA_MAP', 'ASSET_DELIVERY_DATA_MAP', 'ASSET_RETURN_DATA_MAP']

from ._common import FieldMapCommon

ASSET_PROVIDE_DATA_MAP = {
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
    'date_created': FieldMapCommon(
        name_mapping=['date_created'],
    ).data,
    'employee_inherit': FieldMapCommon(
        name_mapping=['employee_inherit'],
    ).data,
    'products': FieldMapCommon(
        name_mapping=['products'],
    ).data,
    'remark': FieldMapCommon(
        name_mapping=['remark'],
    ).data,
    'attachments': FieldMapCommon(
        name_mapping=['attachments'],
    ).data,
}

ASSET_DELIVERY_DATA_MAP = {
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
    'date_created': FieldMapCommon(
        name_mapping=['date_created'],
    ).data,
    'remark': FieldMapCommon(
        name_mapping=['remark'],
    ).data,
    'products': FieldMapCommon(
        name_mapping=['products'],
    ).data,
    'attachments': FieldMapCommon(
        name_mapping=['attachments'],
    ).data,
}

ASSET_RETURN_DATA_MAP = {
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
    'date_return': FieldMapCommon(
        name_mapping=['date_return'],
    ).data,
    'remark': FieldMapCommon(
        name_mapping=['remark'],
    ).data,
    'products': FieldMapCommon(
        name_mapping=['products'],
    ).data,
    'attachments': FieldMapCommon(
        name_mapping=['attachments'],
    ).data,
}
