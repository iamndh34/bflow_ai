from ._common import FieldMapCommon

SALE_DATA_CONTACT_MAP = {
    'account_name': FieldMapCommon(name_mapping=['account_name']).data,
    'additional_information': FieldMapCommon(
        name_mapping=['facebook', 'twitter', 'linkedln', 'gmail', 'interests', 'tags'],
        id_border_zones=['home_address_id'],
    ).data,
    'address_information': FieldMapCommon(
        id_mapping=[
            'detail-modal-work-address', 'workcity', 'workdistrict', 'workward',
            'detail-modal-home-address', 'homecity', 'homedistrict', 'homeward',
        ],
        id_border_zones=['work_address_id'],
    ).data,
    'report_to': FieldMapCommon(
        name_mapping=['report_to'],
    ).data,
    'email': FieldMapCommon(
        name_mapping=['email'],
    ).data,
    'mobile': FieldMapCommon(
        name_mapping=['mobile'],
    ).data,
    'phone': FieldMapCommon(
        name_mapping=['phone']
    ).data,
    'salutation': FieldMapCommon(
        name_mapping=['salutation'],
    ).data,
    'avatar': FieldMapCommon(
        name_mapping=['avatar'],
        id_border_zones=['upload-area'],
    ).data,
    'biography': FieldMapCommon(
        name_mapping=['bio'],
    ).data,
    'job_title': FieldMapCommon(
        name_mapping=['job_title'],
    ).data,
    'owner': FieldMapCommon(
        name_mapping=['owner'],
    ).data,
    'fullname': FieldMapCommon(
        name_mapping=['first_name', 'last_name', 'fullname'],
        readonly_not_disable=['fullname'],
    ).data,
}
