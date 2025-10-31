"""needed module import"""
import datetime
import os

from functools import wraps

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db import models
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.urls import reverse

from rest_framework import status
from rest_framework.response import Response

from .apis import RespData, PermCheck
from .apps_code_to_txt import AppsCodeToList
from .exceptions import handle_exception_all_view
from .http import HttpRequestControl
from .msg import AuthMsg, ServerMsg
from .breadcrumb import BreadcrumbView
from .menus import SpaceItem, SpaceGroup
from .caches import CacheController, CacheKeyCollect
from .constant import WORKFLOW_ACTION
from .utils import RandomGenerate

__all__ = [
    'mask_view',
    'session_flush',
    'MyJWTClient',
    'OutLayoutRender',
]

HEADERS_KEY_CACHED_ENABLE = 'HTTP_ENABLEXCACHECONTROL'


class ArgumentDecorator:
    """argument decorator"""

    @classmethod
    def get_headers_cached_enable(cls, request):
        if (
                request.method == 'GET' and
                hasattr(request, 'META') and
                isinstance(request.META, dict) and
                request.META.get(HEADERS_KEY_CACHED_ENABLE, None) == 'true'
        ):
            expires_string = (
                    datetime.datetime.now() + datetime.timedelta(minutes=1)
            ).strftime('%a, %d %b %Y %H:%M:%S GMT')
            return {
                'Cache-Control': 'public, max-age=60',  # 1 minutes
                'Expires': expires_string,
                'ETag': RandomGenerate.get_string(length=32),
            }
        return {}

    def __init__(self, login_require, auth_require, **kwargs):
        self.login_require = login_require
        self.auth_require = auth_require
        self.is_api = kwargs.get('is_api', False)
        self.template_path = kwargs.get('template_path', None)
        self.breadcrumb_name = kwargs.get('breadcrumb_name', None)
        self.real_path = kwargs.get('real_path', None)

    def activate_auth_require(self, user) -> True or Response or redirect:
        """active authentication request"""
        if self.login_require:
            if not user or isinstance(user, AnonymousUser):
                if self.is_api:
                    return Response({'detail': 'Authentication is not credentials.'})
                if self.real_path:
                    return True
                print('Have not logged in yet')
                return True
        return True

    def parse_breadcrumb(self):
        """parse menu breadcrumbs"""
        data = []
        if self.breadcrumb_name:
            c_key = f'breadcrumb_{self.breadcrumb_name}'
            data = CacheController.get(c_key)
            if not data:
                data = BreadcrumbView.parsed(self.breadcrumb_name) if self.breadcrumb_name else []
                CacheController.set(c_key, data)
                CacheController().append_by_all(CacheKeyCollect.BREADCRUMB, c_key)
        return data

    @staticmethod
    def parse_spaces(space_code: str, user) -> (list, list):
        """default parse space list"""

        def get_is_admin_company():
            if (
                    user and hasattr(user, 'employee_current_data')
                    and user.employee_current_data and isinstance(user.employee_current_data, dict)
                    and 'is_admin_company' in user.employee_current_data
                    and type(user.employee_current_data['is_admin_company']) == bool
            ):
                return user.employee_current_data['is_admin_company']
            return False

        return [
            SpaceGroup.get_space_all(is_hide_core=get_is_admin_company() is not True),
            SpaceItem.get_space_detail(space_code),
            SpaceItem.get_menus_of_space(space_code),
        ]

    @classmethod
    def parse_base(cls, user) -> dict:
        """parse base link"""
        if isinstance(user, get_user_model()):
            space_list, space_current_detail, space_menus = cls.parse_spaces(user.ui_space_selected, user)
            return {
                'id': str(user.id),
                'user_id': str(user.user_id),
                'first_name': str(user.first_name),
                'last_name': str(user.last_name),
                'fullname': user.get_full_name(),
                'username': user.username,
                'username_auth': user.username_auth,
                'email': user.email,
                'is_admin_tenant': user.is_admin_tenant,
                'tenant_current_data': user.tenant_current_data,
                'company_current_data': user.company_current_data,
                'space_current_data': user.space_current_data,
                'employee_current_data': user.employee_current_data,
                'companies_data': user.companies_data,
                'language': user.language,
                # data display menus and space
                'space_list': space_list,
                'space_current_detail': space_current_detail,
                'menus': space_menus,
                'avatar': user.avatar_url,
                'domain_cloud': f'{settings.MEDIA_PUBLIC_DOMAIN}',
                'avatar_prefix': 'p/f/avatar/',
                'app_name_translate': AppsCodeToList.get_data(),
            }
        return {}

    @classmethod
    def parse_url_pattern(cls, url_pattern_keys: list[str], cls_kwargs: dict[str, str]) -> dict[str, str]:
        result = {}
        if isinstance(url_pattern_keys, list) and isinstance(cls_kwargs, dict):
            for key in url_pattern_keys:
                result[key] = cls_kwargs[key] if key in cls_kwargs else None

            if 'pk' in cls_kwargs:
                result['pk'] = cls_kwargs['pk']
        return result


class OutLayoutRender:
    def __init__(self, request):
        self.request = request

    def render_404(self):
        return render(self.request, 'extends/systems/out-layout/404.html', {})

    def render_503(self):
        return render(self.request, 'extends/systems/out-layout/503.html', {})


def session_flush(request):
    try:
        if (
                request.user
                and request.user.is_authenticated is True
                and not isinstance(request.user, AnonymousUser)
                and isinstance(request.user, models.Model)
        ):
            request.user.access_token = None
            request.user.refresh_token = None
            request.user.save(update_fields=["access_token", "refresh_token"])
        request.user = AnonymousUser
        request.session.flush()
        return True
    except Exception as err:
        print('[session_flush]:', str(err))
    return False


class MyJWTClient:
    def __init__(self, user):
        user_model = get_user_model()
        if not (user and isinstance(user, user_model)):
            raise ValueError(f'The user must be is object of User Model: {str(user_model.__name__)}')
        if not (user.is_authenticated and not isinstance(user, AnonymousUser)):
            raise ValueError('The user must be authenticated')
        self.user = user
        self._token_parsed = {}

    @property
    def token_parsed(self) -> dict:
        access_token = getattr(self.user, 'access_token', None)
        if access_token:
            try:
                token_parsed = jwt.decode(access_token, options={"verify_signature": False})
            except jwt.exceptions.DecodeError:
                token_parsed = {}
            self._token_parsed = token_parsed
        return self._token_parsed

    def get_2fa_enabled(self):
        token_parsed = self.token_parsed
        if isinstance(token_parsed, dict):
            return token_parsed.get(settings.JWT_KEY_2FA_ENABLED, False)
        return False


def mask_view(**parent_kwargs):
    """mask func before api method call form client to UI"""
    # is_api: default False
    # auth_require: default False
    if not isinstance(parent_kwargs, dict):
        parent_kwargs = {}

    def decorated(func_view):

        # pylint: disable=R0911
        def wrapper(self, request, *args, **kwargs):
            if settings.IS_SERVER_MAINTAINING is True:
                return OutLayoutRender(request=request).render_503()

            # if settings.UI_ALLOW_AUTO_TENANT:
            #     state_http = HttpRequestControl(request=request).check()
            #     if not state_http:
            #         return OutLayoutRender(request=request).render_404()

            ctx = {}
            pk = kwargs.get('pk', None)

            # check authenticated
            login_require = parent_kwargs.get('login_require', False)
            auth_require = parent_kwargs.get('auth_require', False)
            if auth_require:
                login_require = True
            # is_notify_key = parent_kwargs.get('is_notify_key', settings.DEBUG_NOTIFY_KEY)  # default: True
            is_api = parent_kwargs.get('is_api', False)
            template_path = parent_kwargs.get('template', None)
            breadcrumb_name = parent_kwargs.get('breadcrumb', None)
            jsi18n = parent_kwargs.get('jsi18n', None)
            cls_check = ArgumentDecorator(
                login_require=login_require,
                auth_require=auth_require,
                is_api=is_api,
                template_path=template_path,
                breadcrumb_name=breadcrumb_name,
                real_path=request.path,
            )
            url_pattern_keys = parent_kwargs.get('url_pattern_keys', [])
            enable_page_content_css = parent_kwargs.get('enable_page_content_css', True)  # auto add page_content.css
            icon_cls = parent_kwargs.get('icon_cls', None)
            icon_bg = parent_kwargs.get('icon_bg', None)

            # fake call check permission to post, put, delete
            # fake call to URL then handle resp
            # call don't change or new data, API will return resp after check perm
            check_perm_state, check_perm_return = True, (None, 200)
            perm_check_cls: PermCheck = parent_kwargs.get('perm_check', None)
            if perm_check_cls and is_api is False:
                check_perm_state, check_perm_return = perm_check_cls.valid(
                    request=request,
                    view_kwargs=kwargs,
                )
                if check_perm_state is False:
                    if isinstance(check_perm_return, Response):
                        return check_perm_return
                    elif not (
                            check_perm_return and isinstance(check_perm_return, tuple) and len(check_perm_return) == 2
                    ):
                        check_perm_return = RespData.resp_403()

            # redirect or next step with is_auth
            # must be return ({Data|Dict}, {Http Status|Number}) or HttpResponse
            try:
                if check_perm_state:
                    view_return = func_view(self, request, *args, **kwargs)  # --> {'user_list': user_list}
                else:
                    view_return = check_perm_return
            except Exception as err:
                handle_exception_all_view(err, self)
                raise err

            if isinstance(view_return, (HttpResponse, Response)):  # pylint: disable=R1705
                return view_return
            else:
                data, http_status = None, 200
                # parse data
                if isinstance(view_return, (list, tuple)) and len(view_return) == 2:
                    data, http_status = view_return
                else:
                    data = view_return
                # data['status'] = http_status
                try:
                    data['status'] = http_status
                except Exception as err:
                    handle_exception_all_view(err, self)  # Log the exact error and send telegram
                    return HttpResponse(status=500)

                # [], 200 <--- accept
                # {'results': [], 'status_tmp': 201} <--- accept
                # [] <--- error

                # handle return HTTP
                if cls_check.is_api:
                    match http_status:
                        case status.HTTP_401_UNAUTHORIZED:
                            return Response(
                                {
                                    'data': AuthMsg.AUTH_EXPIRE,
                                    **data,
                                    'status': status.HTTP_401_UNAUTHORIZED
                                },
                                status=status.HTTP_401_UNAUTHORIZED
                            )
                        case status.HTTP_500_INTERNAL_SERVER_ERROR:
                            return Response(
                                {
                                    'data': ServerMsg.SERVER_ERR,
                                    'status': status.HTTP_500_INTERNAL_SERVER_ERROR
                                },
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR
                            )
                        case status.HTTP_400_BAD_REQUEST:
                            return Response(
                                {
                                    'data': data,
                                    'status': status.HTTP_400_BAD_REQUEST
                                },
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        case _:
                            return Response(
                                {
                                    'data': data,
                                    'status': http_status
                                },
                                headers=cls_check.get_headers_cached_enable(request=request),
                                status=http_status
                            )
                elif cls_check.template_path:
                    if request.user and not isinstance(request.user, AnonymousUser) and request.user.is_authenticated:
                        match http_status:
                            case status.HTTP_401_UNAUTHORIZED:
                                url_redirect = data.get('__url_redirect', None)
                                if url_redirect:
                                    return redirect(url_redirect)
                                session_flush(request=request)
                                print('Have not logged in yet')
                                return decorated
                            case status.HTTP_500_INTERNAL_SERVER_ERROR:
                                return HttpResponse(status=500)
                            case _:
                                ctx['pk'] = pk
                                ctx['fcm'] = {
                                    'key_pair': os.getenv("FCM_KEY_PAIR", ""),
                                    'config': os.getenv('FCM_CONFIG', '{}'),
                                }
                                ctx['jsi18n'] = jsi18n
                                ctx['is_ga_enabled'] = settings.GA_COLLECTION_ENABLED
                                ctx['ga_config'] = {
                                    'script': settings.GA_SCRIPT, 'code': settings.GA_CODE
                                } if settings.GA_COLLECTION_ENABLED else {}
                                ctx['enable_page_content_css'] = enable_page_content_css
                                ctx['is_debug_src'] = settings.DEBUG
                                ctx['is_debug'] = settings.DEBUG_JS
                                # ctx['is_notify_key'] = 1 if is_notify_key is True else 0
                                ctx['base'] = cls_check.parse_base(request.user)
                                ctx['base_workflow'] = WORKFLOW_ACTION if pk else {}
                                ctx['domain'] = {'media': settings.MEDIA_DOMAIN}
                                ctx['data'] = data
                                ctx['breadcrumb'] = cls_check.parse_breadcrumb()
                                ctx['url_pattern'] = cls_check.parse_url_pattern(url_pattern_keys, kwargs)
                                ctx['nav'] = {
                                    'menu_id_current': parent_kwargs.get('menu_active', None),
                                    'space_code_current': 1,
                                }
                                ctx['icon_cls'] = icon_cls
                                ctx['icon_bg'] = icon_bg
                                try:
                                    return render(request, cls_check.template_path, ctx)
                                except Exception as err:
                                    handle_exception_all_view(err, self)
                    return render(request, cls_check.template_path, ctx)
            raise ValueError(
                f'Return not map happy case. Over with: is_api={cls_check.is_api},'
                f'template={cls_check.template_path}'
            )

        return wraps(func_view)(wrapper)

    return decorated
