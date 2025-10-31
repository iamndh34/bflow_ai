from ._common import FieldMapCommon

CONTRACT_APPROVAL_DATA_MAP = {
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
    'abstract_content': FieldMapCommon(
        name_mapping=['abstract_content'],
    ).data,
    'trade_content': FieldMapCommon(
        name_mapping=['trade_content'],
    ).data,
    'legal_content': FieldMapCommon(
        name_mapping=['legal_content'],
    ).data,
    'payment_content': FieldMapCommon(
        name_mapping=['payment_content'],
    ).data,
}
