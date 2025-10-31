"""system module"""
import json
import uuid
import datetime
import ast
from operator import add
from collections import OrderedDict
from itertools import chain
from copy import deepcopy

from django.core.exceptions import ValidationError, NON_FIELD_ERRORS
from django.forms.utils import ErrorList
from django.utils.safestring import mark_safe

from six.moves import reduce


class MultiForm:
    """multi form class"""
    form_classes = {}

    def __init__(self, *args, data=None, files=None, **kwargs):
        self.data, self.files = data, files
        kwargs.update(data=data, files=files)

        self.initials = kwargs.pop('initial', None)
        if self.initials is None:
            self.initials = {}
        self.forms = OrderedDict()
        self.cross_form_errors = []

        for key, form_class in self.form_classes.items():
            fargs, fkwargs = self.get_form_args_kwargs(key, args, kwargs)
            self.forms[key] = form_class(*fargs, **fkwargs)

    def get_form_args_kwargs(self, key, args, kwargs):
        """get kwargs from args"""
        fkwargs = kwargs.copy()
        prefix = kwargs.get('prefix')
        if prefix is None:
            prefix = key
        else:
            prefix = f'{0}__{1}'.format(key, prefix)
        fkwargs.update(
            initial=self.initials.get(key),
            prefix=prefix,
        )
        return args, fkwargs

    def __str__(self):
        return self.as_table()

    def __getitem__(self, key):
        return self.forms[key]

    @property
    def errors(self):
        """error method"""
        errors = {}
        for form_name in self.forms:
            form = self.forms[form_name]
            for field_name in form.errors:
                try:
                    for key, value in field_name.items():
                        errors[form.add_prefix(key)] = value
                except TypeError as type_error:
                    # errors[form.add_prefix(field_name)] = form.errors[field_name]
                    # pass
                    if isinstance(field_name, str):
                        errors[form.add_prefix(field_name)] = form.errors[field_name]
                    else:
                        print(f"An error occurred while processing {field_name}: {type_error}")
                        # raise
        if self.cross_form_errors:
            errors[NON_FIELD_ERRORS] = self.cross_form_errors
        return errors

    @property
    def fields(self):
        """field tag"""
        fields = []
        for form_name in self.forms:
            form = self.forms[form_name]
            for field_name in form.fields:
                fields += [form.add_prefix(field_name)]
        return fields

    def __iter__(self):
        return chain.from_iterable(self.forms.values())

    @property
    def is_bound(self):
        """property bound"""
        return any(form.is_bound for form in self.forms.values())

    def clean(self):
        """clean data"""
        return self.cleaned_data

    def add_crossform_error(self, error):
        """add mess error"""
        self.cross_form_errors.append(error)

    def is_valid(self):
        """check is form valid"""
        forms_valid = all(form.is_valid() for form in self.forms.values())
        try:
            self.cleaned_data = self.clean()
        except ValidationError as error:
            self.add_crossform_error(error)
        return forms_valid and not self.cross_form_errors

    def non_field_errors(self):
        """if non field error"""
        form_errors = (
            form.non_field_errors() for form in self.forms.values()
            if hasattr(form, 'non_field_errors')
        )
        return ErrorList(chain(self.cross_form_errors, *form_errors))

    def as_table(self):
        """field is table"""
        return mark_safe(''.join(form.as_table() for form in self.forms.values()))

    def as_ul(self):
        """field is url"""
        return mark_safe(''.join(form.as_ul() for form in self.forms.values()))

    def as_p(self):
        """field is P tag"""
        return mark_safe(''.join(form.as_p() for form in self.forms.values()))

    def is_multipart(self):
        """filed is many part"""
        return any(form.is_multipart() for form in self.forms.values())

    @property
    def media(self):
        """property is media"""
        return reduce(add, (form.media for form in self.forms.values()))

    def hidden_fields(self):
        """field is type hidden"""
        return [field for field in self if field.is_hidden]

    def visible_fields(self):
        """field type is visible"""
        return [field for field in self if not field.is_hidden]

    @property
    def cleaned_data(self):
        """property clean data"""
        return OrderedDict(
            (key, form.cleaned_data)
            for key, form in self.forms.items() if form.is_valid()
        )

    @cleaned_data.setter
    def cleaned_data(self, data):
        """set clean data"""
        for key, value in data.items():
            child_form = self[key]
            if hasattr(child_form, 'forms'):
                for formlet, formlet_data in zip(child_form.forms, value):
                    formlet.cleaned_data = formlet_data
            else:
                child_form.cleaned_data = value


def convert_data_format(data):
    """datetime data format"""
    data_copy = deepcopy(data)
    for key, value in data.items():
        if isinstance(value, uuid.UUID):
            data_copy[key] = str(value)
        elif isinstance(value, datetime.datetime):
            data_copy[key] = value.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(value, datetime.date):
            data_copy[key] = value.strftime('%Y-%m-%d')
        elif isinstance(value, datetime.time):
            data_copy[key] = value.strftime('%H:%M:%S')
        elif value is None and key != 'parent_n':
            data_copy.pop(key)
    return data_copy


def convert_data(data):
    """convert formset data"""
    if isinstance(data, list):  # pylint: disable=R1705
        arr_data = []
        for item in data:
            if 'DELETE' in item:
                if bool(item.get('DELETE')) is False:
                    if 'ORDER' in item:
                        item['order'] = item.get('ORDER') + 1
                        del item['ORDER']
                    item = convert_data_format(item)
                    arr_data.append(item)
            else:
                item = convert_data_format(item)
                arr_data.append(item)
        return arr_data
    else:
        return convert_data_format(data)


def get_data_transition(payload, self, name):
    """get transition data"""
    transitions = convert_data(self.cleaned_data.get(name))
    for transition in transitions:
        if len(transition.get('name')) == 0:
            del transition['name']

        condition = transition.get('condition')
        routing_audit = transition.get('routing_audit')
        if routing_audit:
            if transition['routing_rule'] == 'audit' or transition['routing_rule'] == 'joint':
                routing_audit = ast.literal_eval(routing_audit)
                temp = []
                for item in routing_audit:
                    if 'id' in item:
                        temp.append(item['id'])
                    else:
                        temp.append(item)
                transition['routing_audit'] = temp
        else:
            transition['routing_audit'] = []

        condition = [] if len(condition) == 0 else json.loads(condition)
        transition.update({'condition': condition})
    payload.update({name: transitions})
