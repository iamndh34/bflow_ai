"""init folder"""
from django.utils.translation import gettext_lazy as _

from .auth import AuthMsg
from .server import ServerMsg
from .hr import HRMsg
from .workflow import WorkflowMsg
from .permissions import PermsMsg
from .sale import MDConfigMsg
from .sales import SaleMsg
from .promotion import PromotionMsg
from .eoffice import LeaveMsg, MeetingScheduleMsg
from .goodsreceipt import GRMsg
from .purchasing import PurchasingMsg
from .saleorder import SOMsg
from .report import ReportMsg
from .templates import TemplateMsg
from .application import AppMsg
from .core import CoreMsg
from .masterdata import MDMsg
from .production import ProductionMsg
from .kms import KMSMsg


class BaseMsg:
    NOT_FOUND = _('The record is not found')
    EXCEPTION = _('The process raise exception')
    SUCCESS = _('Successful')
    CREATE = _('Create')
    UPDATE = _('Update')
    DELETE = _('Delete')
    DRAFT = _('Draft')
    CREATED = _('Created')
    ADDED = _('Added')
    FINISH = _('Finish')
    APPROVED = _('Approved')
    CANCEL = _('Cancel')
    CREATE_OK = _('Create successfully')
    UPDATE_OK = _('Update successfully')
    DELETE_OK = _('Delete successfully')
