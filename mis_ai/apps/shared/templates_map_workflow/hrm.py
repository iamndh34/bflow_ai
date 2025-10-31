__all__ = ['OVERTIME_REQUEST_DATA_MAP', 'PAYROLL_TEMPLATE_DATA_MAP']

from ._common import FieldMapCommon

OVERTIME_REQUEST_DATA_MAP = {
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
    'employee_inherit': FieldMapCommon(
        name_mapping=['employee_inherit'],
    ).data,
    'employee_created': FieldMapCommon(
        name_mapping=['employee_created'],
    ).data,
    'start_date': FieldMapCommon(
        name_mapping=['start_date'],
    ).data,
    'end_date': FieldMapCommon(
        name_mapping=['end_date'],
    ).data,
    'start_time': FieldMapCommon(
        name_mapping=['start_time'],
    ).data,
    'end_time': FieldMapCommon(
        name_mapping=['end_time'],
    ).data,
    'ot_type': FieldMapCommon(
        name_mapping=['ot_type'],
    ).data,
    'shift': FieldMapCommon(
        name_mapping=['shift'],
    ).data,
}

PAYROLL_TEMPLATE_DATA_MAP = {
    'title': FieldMapCommon(
        name_mapping=['title'],
    ).data,
    'department_applied': FieldMapCommon(
        name_mapping=['department_applied'],
    ).data,
    'remarks': FieldMapCommon(
        name_mapping=['remarks'],
    ).data,
    'attribute_list': FieldMapCommon(
        name_mapping=['attribute_list'],
    ).data,
}
