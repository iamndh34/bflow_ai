"""System module."""
from django import forms
from django.forms import formset_factory
from django.urls import reverse

from .. import WorkflowMsg
from ..form_custom import MultiForm

LOGIC_CONDITION = [
    ('AND', WorkflowMsg.LOGIC_AND),
    ('OR', WorkflowMsg.LOGIC_OR)
]


class ParameterFrom(forms.Form):
    """use for condition formset"""
    left_cond = forms.ChoiceField(label="Left condition", required=False)
    math = forms.ChoiceField(label="Math condition", required=False)
    right_cond = forms.ChoiceField(label="Right condition", required=False)
    type = forms.ChoiceField(label="Type condition", required=False, choices=LOGIC_CONDITION)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['left_cond'].widget.attrs.update(
            {
                'class': 'form-select',
                'data-multiple': 'false',
                'data-keyResp': 'application_property_list',
                'data-url': reverse("ApplicationPropertyListAPI"),
            }
        )
        self.fields['right_cond'].widget.attrs.update(
            {
                'class': 'dropdown-select_two',
                'data-multiple': 'false',
                'data-prefix': 'application_property_list',
                'data-url': reverse("ApplicationPropertyListAPI"),
            }
        )
        self.fields['math'].widget.attrs.update({'class': 'form-select'})


class ConditionForm(forms.Form):
    """use for condition formset"""
    name = forms.CharField(label='Condition name', max_length=80, required=False)
    logic = forms.ChoiceField(label='Logic', choices=LOGIC_CONDITION, required=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['logic'].widget.attrs.update({'title': 'Logic'})


class ConditionFormset(MultiForm):
    """params and condition formset"""
    """use for condition formset"""
    form_classes = {
        'condition': formset_factory(
            ConditionForm,
            can_order=True,
            can_delete=True,
            min_num=1,
            extra=0
        ),
        'parameter': formset_factory(
            ParameterFrom,
            can_order=True,
            can_delete=True,
            min_num=1,
            extra=0
        )
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
