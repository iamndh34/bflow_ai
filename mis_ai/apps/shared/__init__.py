"""declare all app in shared folder"""
from .apis import ServerAPI, ApiURL, PermCheck
from .decorators import mask_view
from .msg import AuthMsg, ServerMsg, HRMsg, WorkflowMsg, PermsMsg, MDConfigMsg, SaleMsg, PromotionMsg
from .breadcrumb import BreadcrumbView
from .caches import CacheController, CacheKeyCollect
from .components import ConditionFormset
from .utils import *
from .constant import *
from .templates_map_workflow import *
from .extends import BaseView
