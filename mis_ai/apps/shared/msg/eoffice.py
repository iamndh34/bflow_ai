from django.utils.translation import gettext_lazy as _


class LeaveMsg:
    LEAVE_TYPE_CREATE = _('Leave type create successfully')
    LEAVE_TYPE_DELETE = _('Leave type delete successfully')
    LEAVE_TYPE_UPDATE = _('Leave type update successfully')
    PAID_BY_ONE = _('Company salary')
    PAID_BY_TWO = _('Social insurance')
    PAID_BY_THREE = _('Unpaid')
    WORKING_YEAR_CREATE = _("Working year create successfully")
    WORKING_YEAR_DELETE = _("Working year deleted successfully")
    WORKING_HOLIDAY_CREATE = _("The holiday create successfully")
    WORKING_HOLIDAY_UPDATE = _("The holiday has been updated successfully")
    WORKING_HOLIDAY_DELETE = _("The holiday deleted")
    LEAVE_REQUEST_CREATE = _("Leave request create successfully")
    LEAVE_AVAILABLE_UPDATE = _("Leave available update successfully")
    LEAVE_ACTION_INS = _("Increase")
    LEAVE_ACTION_DES = _("Decrease")


class BusinessTripMsg:
    BUSINESS_TRIP = _('Business trip')


class AssetToolsMsg:
    ASSET_TOOLS = _('Asset, Tools')
    PROVIDE = _('Provide')
    DELIVERY = _('Delivery')
    RETURN = _('Return')


class MeetingScheduleMsg:
    MEETING_CREATE = _('Meeting schedule create successfully')
    MEETING_UPDATE = _('Meeting schedule update successfully')

