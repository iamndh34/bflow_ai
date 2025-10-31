from ._common import FieldMapCommon

PURCHASE_REQUEST_DATA_MAP = {
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
    'supplier': FieldMapCommon(
        name_mapping=['supplier'],
    ).data,
    'contact': FieldMapCommon(
        name_mapping=['contact'],
    ).data,
}
