from ._common import FieldMapCommon

BIDDING_DATA_MAP = {
    'opportunity': FieldMapCommon(
        name_mapping=['opportunity'],
    ).data,
    'employee_inherit_id': FieldMapCommon(
        name_mapping=['employee_inherit_id'],
    ).data,
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
    'bid_value': FieldMapCommon(
        name_mapping=['bid_value'],
    ).data,
    'bid_bond_value': FieldMapCommon(
        name_mapping=['bid_bond_value'],
    ).data,
    'bid_date': FieldMapCommon(
        name_mapping=['bid_date'],
    ).data,
    'venture_partner': FieldMapCommon(
        name_mapping=['venture_partner'],
    ).data,
    'security_type': FieldMapCommon(
        name_mapping=['security_type'],
    ).data,
    'document_data': FieldMapCommon(
        name_mapping=['document_data'],
    ).data,
    'attachment': FieldMapCommon(
        name_mapping=['attachment'],
    ).data,
    'tinymce_content': FieldMapCommon(
        name_mapping=['tinymce_content'],
    ).data,
}
