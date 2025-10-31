"""system module."""
from django.utils.translation import gettext_lazy as _


class WorkflowMsg:  # pylint: disable=too-few-public-methods
    """Workflow message translations"""
    WORKFLOW_CREATE = _('Workflow create successfully')
    WORKFLOW_UPDATE = _('Workflow update successfully')
    ACTION_CREATE = _("Create")
    ACTION_APPROVED = _("Approve")
    ACTION_REJECT = _("Reject")
    ACTION_RETURN = _("Return")
    ACTION_RECEIVE = _("Receive")
    ACTION_TODO = _("To do")
    MATH_TYPE_IS = _("is")
    MATH_TYPE_IS_NOT = _("is not")
    MATH_TYPE_IS_EMPTY = _("is empty")
    MATH_TYPE_IS_NOT_EMPTY = _("is not empty")
    MATH_TYPE_CONTAINS = _("contains")
    MATH_TYPE_NOT_CONTAINS = _("does not contain")
    MATH_TYPE_BEFORE = _("is before")
    MATH_TYPE_AFTER = _("is after")
    MATH_TYPE_ON_BEFORE = _("is on or before")
    MATH_TYPE_ON_AFTER = _("is on or after")
    MATH_TYPE_WITHIN = _("is within")
    LOGIC_AND = _("And")
    LOGIC_OR = _("Or")
