from ._common import FieldMapCommon

GOODS_RECEIPT_DATA_MAP = {
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
    'customer': FieldMapCommon(
        name_mapping=['supplier'],
    ).data,
    'contact': FieldMapCommon(
        name_mapping=['contact'],
    ).data,
}
