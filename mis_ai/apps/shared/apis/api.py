"""share all popular class function for use together purpose"""
import json
from copy import deepcopy
from typing import Callable, TypedDict, Union, Literal
import requests

from urllib import parse

from django.db.models import Model
from django.conf import settings
from django.http import response
from django.urls import reverse
from requests_toolbelt import MultipartEncoder
from rest_framework import status
from rest_framework_simplejwt.tokens import UntypedToken

from .urls_map import ApiURL, StringUrl

api_url_refresh_token = ApiURL.refresh_token

REQUEST_TIMEOUT = 1 + 60


class PermCheck:
    def __init__(
            self, url: StringUrl, method: Literal['GET', 'POST', 'PUT', 'DELETE', 'get', 'post', 'put', 'delete'],
            fill_key: list[str] = None, fixed_fill_key: dict = None,
            data: dict = None,
    ):
        self.url = url
        self.method = method.upper()
        self.fill_key = fill_key if isinstance(fill_key, list) else []
        self.fixed_fill_key = fixed_fill_key if isinstance(fixed_fill_key, dict) else {}
        self.data = data if isinstance(data, dict) else {}

    def parse_url(self, view_kwargs: dict):
        fill_data = {**self.fixed_fill_key}
        for key in self.fill_key:
            data_key = view_kwargs.get(key, None)
            if data_key:
                fill_data[key] = data_key
            else:
                return None
        return self.url.fill_key(**fill_data)

    def valid(self, request, view_kwargs: dict = None) -> (bool, tuple):
        real_url = self.parse_url(view_kwargs=view_kwargs if isinstance(view_kwargs, dict) else {})
        if real_url:
            cls_api = ServerAPI(
                request=request,
                user=request.user,
                url=real_url,
                is_check_perm=True,
            )
            if self.method == 'GET':
                resp = cls_api.get(data=self.data)
            elif self.method == 'POST':
                resp = cls_api.post(data=self.data)
            elif self.method == 'PUT':
                resp = cls_api.put(data=self.data)
            elif self.method == 'DELETE':
                resp = cls_api.delete(data=self.data)
            else:
                return False, RespData.resp_403()

            if not resp.state:
                if resp.status == 401:
                    return False, (
                        {
                            '__url_redirect': resp.resp_401_redirect_url(next_url=request.path)
                        },
                        status.HTTP_401_UNAUTHORIZED
                    )
                return False, resp.auto_return()
            return True, RespData.resp_200(data={})
        return False, RespData.resp_403()


class RespDict(TypedDict, total=False):
    """response dictionary type"""
    state: Callable[[bool or None], bool or None]
    status: Callable[[int or None], int or None]
    result: Callable[[list or dict], list or dict]
    errors: Callable[[dict], dict]
    page_size: Callable[[int], int]
    page_count: Callable[[int], int]
    page_next: Callable[[int], int]
    page_previous: Callable[[int], int]
    all: Callable[[dict], dict]


# pylint: disable=R0902
class RespData:
    """
    Object convert response data
        state: bool : state call API
        result: dict or list : data
        errors: dict : errors server return
    """

    def __init__(
            self,
            _state=None, _result=None, _errors=None, _status=None,
            _page_size=None, _page_count=None, _page_next=None, _page_previous=None,
            _resp=None,
    ):
        """
        Properties will keep type of attribute that is always correct
        Args: attribute of Http Response
            _state: status_code | success: 200 - 200 | fail: others
            _result: .json()['result'] | 'result' is default
                     | You can custom key - confirm with API Docs
            _errors: .json()['errors'] | 'errors' is default
                     | You can custom key - confirm with API Docs
        """
        self._resp = _resp
        self._state = _state if _state is not None else False
        self._result = _result if _result is not None else {}
        self._errors = _errors if _errors is not None else {}
        self._status = _status if _status is not None else status.HTTP_500_INTERNAL_SERVER_ERROR
        self._page_size = _page_size if _page_size is not None else 0
        self._page_count = _page_count if _page_count is not None else 0
        self._page_next = _page_next if _page_next is not None else 0
        self._page_previous = _page_previous if _page_previous is not None else 0

    @property
    def real_resp(self):
        return self._resp

    @property
    def state(self) -> bool:
        """property state"""
        if isinstance(self._state, int):
            if 200 <= self._state < 300:
                return True
            return False
        if settings.RAISE_EXCEPTION_DEBUG is False:
            return False
        raise AttributeError(
            f'[Response Data Parser][STATE] '
            f'convert process is incorrect when it return {type(self._state)}'
            f'({str(self._state)[:30]}) '
            f'instead of BOOLEAN types.'
        )

    @property
    def result(self) -> dict or list:
        """result property"""
        if isinstance(self._result, (dict, list)):
            return self._result
        if settings.RAISE_EXCEPTION_DEBUG is False:
            return {}
        raise AttributeError(
            f'[Response Data Parser][RESULT] '
            f'convert process is incorrect when it return {type(self._result)}'
            f'({str(self._result)[:30]}) '
            f'instead of LIST or DICT types.'
        )

    @property
    def errors(self) -> dict:
        """property errors"""
        if isinstance(self._errors, dict):
            return self._errors
        if settings.RAISE_EXCEPTION_DEBUG is False:
            return {}
        raise AttributeError(
            f'[Response Data Parser][ERRORS] '
            f'convert process is incorrect when it return {type(self._errors)}'
            f'({str(self._errors)[:30]}) '
            f'instead of DICT types.'
        )

    @property
    def status(self) -> int:
        """property status"""
        if isinstance(self._status, int):
            return self._status
        if settings.RAISE_EXCEPTION_DEBUG is False:
            return status.HTTP_500_INTERNAL_SERVER_ERROR
        raise AttributeError(
            f'[Response Data Parser][STATUS] '
            f'convert process is incorrect when it return {type(self._errors)}'
            f'({str(self._errors)[:30]}) '
            f'instead of INTEGER types.'
        )

    @property
    def page_size(self) -> int:
        """property page size"""
        if isinstance(self._page_size, int):
            return self._page_size
        if settings.RAISE_EXCEPTION_DEBUG is False:
            return 0
        raise AttributeError(
            f'[Response Data Parser][PAGE_SIZE] '
            f'convert process is incorrect when it return {type(self._errors)}'
            f'({str(self._errors)[:30]}) '
            f'instead of INTEGER types.'
        )

    @property
    def page_count(self) -> int:
        """property page count"""
        if isinstance(self._page_count, int):
            return self._page_count
        if settings.RAISE_EXCEPTION_DEBUG is False:
            return 0
        raise AttributeError(
            f'[Response Data Parser][PAGE_COUNT] '
            f'convert process is incorrect when it return {type(self._errors)}'
            f'({str(self._errors)[:30]}) '
            f'instead of INTEGER types.'
        )

    @property
    def page_next(self) -> int:
        """property next"""
        if isinstance(self._page_next, int):
            return self._page_next
        if settings.RAISE_EXCEPTION_DEBUG is False:
            return 0
        raise AttributeError(
            f'[Response Data Parser][PAGE_NEXT] '
            f'convert process is incorrect when it return {type(self._errors)}'
            f'({str(self._errors)[:30]}) '
            f'instead of INTEGER types.'
        )

    @property
    def page_previous(self) -> int:
        """property page prev"""
        if isinstance(self._page_previous, int):
            return self._page_previous
        if settings.RAISE_EXCEPTION_DEBUG is False:
            return 0
        raise AttributeError(
            f'[Response Data Parser][PAGE_PREVIOUS] '
            f'convert process is incorrect when it return {type(self._errors)}'
            f'({str(self._errors)[:30]}) '
            f'instead of INTEGER types.'
        )

    def get_full_data(self, func_change_data: RespDict = None) -> dict:
        """get all record API"""
        data_all = DictFillResp({}).fill_full(self)  # call fill data to dict
        allow_change_keys = data_all.keys()
        if func_change_data:
            for key, func_call in func_change_data.items():
                if key == 'all':
                    data_all = func_call(data_all)
                elif key in allow_change_keys:
                    data_all[key] = func_call(data_all[key])
        return data_all

    def auto_return(
            self,
            key_success: str = None,
            callback_success: callable = None,
            status_success: int = None,
            callback_errors: callable = None,

    ) -> tuple[dict or list, int]:
        if not status_success:
            status_success = status.HTTP_200_OK

        if self.state:
            page_info = {
                settings.UI_RESP_KEY_PAGE_SIZE: self.page_size,
                settings.UI_RESP_KEY_PAGE_COUNT: self.page_count,
                settings.UI_RESP_KEY_PAGE_NEXT: self.page_next,
                settings.UI_RESP_KEY_PAGE_PREVIOUS: self.page_previous,
            }
            if callback_success:
                return {**callback_success(self.result), **page_info}, status_success
            if key_success:
                return {key_success: self.result, **page_info}, status_success
            return self.result, status_success
        elif self.status == 401:
            auth_error_code = self.errors.get('auth_error_code', None)
            return self.resp_401(auth_error_code=auth_error_code)
        elif self.status == 403:
            return self.resp_403()
        elif self.status == 404:
            return self.resp_404()
        elif self.status == 405:
            return self.resp_403()
        elif self.status == 429:
            return self.resp_429()
        elif self.status >= 500:
            return self.resp_500()
        if callback_errors:
            return self.resp_400(errors_data=callback_errors(self.errors))
        return self.resp_400({'errors': self.errors})

    @classmethod
    def resp_200(cls, data: list or dict):
        return data, status.HTTP_200_OK

    @classmethod
    def resp_400(cls, errors_data: dict):
        return {'render_api_status': 1400, **errors_data}, status.HTTP_400_BAD_REQUEST

    @classmethod
    def resp_401(cls, auth_error_code='authentication_failed'):
        ctx = {'auth_error_code': auth_error_code}
        return ctx, status.HTTP_401_UNAUTHORIZED  # mask_view return 302 (redirect to log in)

    def resp_401_redirect_url(self, next_url):
        auth_error_code = self.errors.get('auth_error_code', None)
        if auth_error_code == 'authentication_2fa_failed':
            return reverse('TwoFAVerifyView') + f'?next={next_url}'
        return reverse('AuthLogin') + f'?next={next_url}'

    @classmethod
    def resp_403(cls):
        return {'render_api_status': 1403}, status.HTTP_403_FORBIDDEN

    def resp_429(self):
        retry_after = self.real_resp.headers.get('retry-after', 0)
        return {'render_api_status': 1429, 'retry_after': retry_after}, status.HTTP_429_TOO_MANY_REQUESTS

    @classmethod
    def resp_404(cls):
        return {'render_api_status': 1404}, status.HTTP_404_NOT_FOUND

    @classmethod
    def resp_500(cls):
        return {'render_api_status': 1500}, status.HTTP_500_INTERNAL_SERVER_ERROR


class DictFillResp(dict):
    """fill data for response request"""

    def fill_state(self, resp: RespData):
        """get state"""
        self[settings.UI_RESP_KEY_STATE] = resp.state
        return self

    def fill_status(self, resp: RespData):
        """get status"""
        self[settings.UI_RESP_KEY_STATUS] = resp.status
        return self

    def fill_result(self, resp: RespData):
        """get result"""
        self[settings.UI_RESP_KEY_RESULT] = resp.result
        return self

    def fill_errors(self, resp: RespData):
        """get errors"""
        self[settings.UI_RESP_KEY_ERRORS] = resp.errors
        return self

    def fill_page_size(self, resp: RespData):
        """get page size"""
        self[settings.UI_RESP_KEY_PAGE_SIZE] = resp.page_size
        return self

    def fill_page_count(self, resp: RespData):
        """get page count"""
        self[settings.UI_RESP_KEY_PAGE_COUNT] = resp.page_count
        return self

    def fill_page_next(self, resp: RespData):
        """get page next"""
        self[settings.UI_RESP_KEY_PAGE_NEXT] = resp.page_next
        return self

    def fill_page_previous(self, resp: RespData):
        """get page prev"""
        self[settings.UI_RESP_KEY_PAGE_PREVIOUS] = resp.page_previous
        return self

    def fill_full(self, resp):
        """add all method"""
        self.fill_state(resp)
        self.fill_status(resp)
        self.fill_result(resp)
        self.fill_errors(resp)
        self.fill_page_count(resp)
        self.fill_page_next(resp)
        self.fill_page_previous(resp)
        return self


class APIUtil:
    """class with all method and default setup for request API calling"""
    key_auth = settings.API_KEY_AUTH
    prefix_token = settings.API_PREFIX_TOKEN
    key_auth_refresh = settings.API_KEY_AUTH_REFRESH
    key_response_data = settings.API_KEY_RESPONSE_DATA
    key_response_err = settings.API_KEY_RESPONSE_ERRORS
    key_response_status = settings.API_KEY_RESPONSE_STATUS
    key_response_page_size = settings.API_KEY_RESPONSE_PAGE_SIZE
    key_response_page_count = settings.API_KEY_RESPONSE_PAGE_COUNT
    key_response_page_next = settings.API_KEY_RESPONSE_PAGE_NEXT
    key_response_page_previous = settings.API_KEY_RESPONSE_PAGE_PREVIOUS

    def __init__(self, user_obj: Model = None, response_origin: bool = False):
        self.user_obj = user_obj
        self.response_origin = response_origin
        self.data_backup = None

    @classmethod
    def key_authenticated(cls, access_token: str) -> dict:
        """
        Return dict for update headers | Authorization header + Bearer + Access Token.
        Args:
            access_token:

        Returns:

        """
        return {cls.key_auth: f'{cls.prefix_token} {access_token}'}

    @classmethod
    def key_authenticated_refresh(cls, refresh_token: str) -> dict:
        return {cls.key_auth_refresh: refresh_token}

    @classmethod
    def get_new_token(cls, refresh_token) -> str or None:
        """
        Call API refresh token
        Args:
            refresh_token: refresh_token in User Object

        Returns:

        """
        if refresh_token:
            resp_obj = ServerAPI(url=api_url_refresh_token).post(
                data={'refresh': refresh_token}
            )
            if resp_obj.state and resp_obj.result and isinstance(resp_obj.result, dict):
                if resp_obj.result.get('access_token', None):
                    return resp_obj.result['access_token']
        return None

    @classmethod
    def refresh_token(cls, user_obj: Model) -> dict:
        """
        Call get refresh token after update access_token to User Model
        Args:
            user_obj: (User Model) : get refresh_token from user -> call
            -> update access_token -> save

        Returns: (dict) : it for update to headers before call API

        """
        access_token = cls.get_new_token(refresh_token=getattr(user_obj, 'refresh_token', None))
        if access_token:
            user_obj.access_token = access_token
            user_obj.save()
            return {'Authorization': f'Bearer {access_token}'}
        return {}

    @classmethod
    def get_data_from_resp(cls, resp: response) -> RespData:
        """
        Parse Http Response to RespData Object
        Args:
            resp: (HttpResponse)

        Returns: RespData Object

        """
        if resp.status_code == 500:
            resp_json = {
                cls.key_response_err: {'detail': 'Server Error'},
            }
        elif resp.status_code in [204, 404]:
            return RespData(
                _state=resp.status_code,
                _result={},
                _status=resp.status_code,
            )
        else:
            resp_json = resp.json()
        return RespData(
            _state=resp.status_code,
            _result=resp_json.get(cls.key_response_data, {}),
            _errors=resp_json.get(cls.key_response_err, {}),
            _status=resp_json.get(cls.key_response_status, resp.status_code),
            _page_size=resp_json.get(cls.key_response_page_size, resp.status_code),
            _page_count=resp_json.get(cls.key_response_page_count, None),
            _page_next=resp_json.get(cls.key_response_page_next, None),
            _page_previous=resp_json.get(cls.key_response_page_previous, None),
            _resp=resp,
        )

    def handle_expired_token(self, resp_parsed_before: RespData = None) -> (bool, dict or RespData):
        if resp_parsed_before:
            auth_error_code = resp_parsed_before.errors.get('auth_error_code', None)
            if auth_error_code == 'authentication_2fa_failed':
                pass
        headers_upgrade = self.refresh_token(user_obj=self.user_obj)
        if headers_upgrade:
            return True, headers_upgrade
        return False, None

    def call_get(self, safe_url: str, headers: dict, **kwargs) -> RespData:
        """
        Support ServerAPI call to server get data (refresh token after recall if token is expires)
        Args:
            safe_url: (string) url parsed
            headers: (dict) headers add to

        Returns: RespData object have attribute state, result, errors
            state: (bool) True if status_code is range (200, 300) else False : Is success call
            result: (dict or list) : is Response Data from API
            errors: (dict) : is Error Data from API
        """

        try:
            resp = requests.get(url=safe_url, headers=headers, timeout=REQUEST_TIMEOUT, **kwargs)
        except requests.exceptions.RequestException:
            # except requests.exceptions.HTTPError:
            # except requests.exceptions.ConnectionError:
            # except requests.exceptions.Timeout:
            return RespData(
                _state=False,
                _result={},
                _status=503,
            )

        resp_parsed = self.get_data_from_resp(resp) if self.response_origin is False else resp
        if resp.status_code == 401:
            if self.user_obj:
                state_refresh, headers_upgrade = self.handle_expired_token(
                    resp_parsed_before=resp_parsed if self.response_origin is False else None
                )
                if state_refresh and headers_upgrade:
                    # refresh token
                    headers.update(headers_upgrade)
                    resp = requests.get(url=safe_url, headers=headers, timeout=REQUEST_TIMEOUT, **kwargs)
                    resp_parsed = self.get_data_from_resp(resp) if self.response_origin is False else resp
        return resp_parsed

    def call_post(
            self,
            safe_url: str,
            headers: dict,
            data: Union[dict, MultipartEncoder],
            **kwargs
    ) -> RespData:
        """
        Support ServerAPI call to server with POST method.
        (refresh token after recall if token is expires)
        Args:
            safe_url: (string) url parsed
            headers: (dict) headers add to request
            data: (dict) body data of request

        Returns: RespData object have attribute state, result, errors
            state: (bool) True if status_code is range (200, 300) else False : Is success call
            result: (dict or list) : is Response Data from API
            errors: (dict) : is Error Data from API
        """
        if 'content-type' in headers:
            content_type = headers.get('content-type', None)
        elif 'Content-Type' in headers:
            content_type = headers.get('Content-Type', None)
        else:
            content_type = None

        config = {
            'url': safe_url,
            'headers': headers,
            'timeout': REQUEST_TIMEOUT,
            **kwargs
        }

        # using for case data changes after 1st call API.
        # Reuse at 2nd call API -> API Server request.data -> crash or hang!
        # only use copy data to data_backup when content-type is multipart/form-data
        #   2nd use requests_toolbelt.MultipartEncoder -> cur of MultiEncoder file at end -> hang!
        self.data_backup = data

        def re_update_data_call(for_backup=False):
            if content_type:
                if content_type.startswith('multipart/form-data'):
                    # config['files'] = data  # using when upload only file (! requests_toolbelt.MultipartEncoder)
                    if for_backup:
                        config['data'] = self.data_backup
                    else:
                        # self.data_backup = deepcopy(data)
                        config['data'] = data
                elif content_type.startswith('application/json'):
                    if for_backup:
                        config['json'] = self.data_backup
                    else:
                        config['json'] = data
                else:
                    if for_backup:
                        config['data'] = self.data_backup
                    else:
                        config['data'] = data
            else:
                headers['content-type'] = 'application/json'
                config['data'] = data

        re_update_data_call()

        try:
            resp = requests.post(**config)
        except requests.exceptions.RequestException:
            # except requests.exceptions.HTTPError:
            # except requests.exceptions.ConnectionError:
            # except requests.exceptions.Timeout:
            return RespData(
                _state=False,
                _result={},
                _status=500,
            )

        resp_parsed = self.get_data_from_resp(resp) if self.response_origin is False else resp
        if resp.status_code == 401:
            if self.user_obj:
                state_refresh, headers_upgrade = self.handle_expired_token(
                    resp_parsed_before=resp_parsed if self.response_origin is False else None
                )
                if state_refresh and headers_upgrade:
                    # refresh token
                    headers.update(headers_upgrade)
                    # re-update data in call again
                    re_update_data_call(for_backup=True)
                    # re-call API
                    resp = requests.post(**config)
                    resp_parsed = self.get_data_from_resp(resp) if self.response_origin is False else resp
        return resp_parsed

    def call_put(self, safe_url: str, headers: dict, data: dict, **kwargs) -> RespData:
        """
        Support ServerAPI call to server with PUT method.
        (refresh token after recall if token is expires)
        Args:
            safe_url: (string) url parsed
            headers: (dict) headers add to request
            data: (dict) body data of request

        Returns: RespData object have attribute state, result, errors
            state: (bool) True if status_code is range (200, 300) else False : Is success call
            result: (dict or list) : is Response Data from API
            errors: (dict) : is Error Data from API
        """
        if 'content-type' in headers:
            content_type = headers.get('content-type', None)
        elif 'Content-Type' in headers:
            content_type = headers.get('Content-Type', None)
        else:
            content_type = None

        config = {
            'url': safe_url,
            'headers': headers,
            'timeout': REQUEST_TIMEOUT,
            **kwargs
        }

        def re_update_data_call(for_backup=False):
            if content_type:
                print('content_type:', content_type)
                if content_type.startswith('multipart/form-data'):
                    # config['files'] = data  # using when upload only file (! requests_toolbelt.MultipartEncoder)
                    if for_backup:
                        config['data'] = self.data_backup
                    else:
                        self.data_backup = deepcopy(data)
                        config['data'] = data
                elif content_type.startswith('application/json'):
                    if for_backup:
                        config['json'] = self.data_backup
                    else:
                        config['json'] = data
                else:
                    if for_backup:
                        config['data'] = self.data_backup
                    else:
                        config['data'] = data
            else:
                headers['content-type'] = 'application/json'
                config['data'] = data

        re_update_data_call()

        print('call_put: ', config)
        try:
            resp = requests.put(**config)
        except requests.exceptions.RequestException:
            # except requests.exceptions.HTTPError:
            # except requests.exceptions.ConnectionError:
            # except requests.exceptions.Timeout:
            return RespData(
                _state=False,
                _result={},
                _status=500,
            )

        resp_parsed = self.get_data_from_resp(resp) if self.response_origin is False else resp
        if resp.status_code == 401:
            if self.user_obj:
                state_refresh, headers_upgrade = self.handle_expired_token(
                    resp_parsed_before=resp_parsed if self.response_origin is False else None
                )
                if state_refresh and headers_upgrade:
                    # refresh token
                    headers.update(headers_upgrade)
                    re_update_data_call(for_backup=True)
                    resp = requests.put(**config)
                    resp_parsed = self.get_data_from_resp(resp) if self.response_origin is False else resp
        return resp_parsed

    def call_delete(self, safe_url: str, headers: dict, data: dict, **kwargs) -> RespData:
        """
        Support ServerAPI call to server with DELETE method.
        (refresh token after recall if token is expires)
        Args:
            safe_url: (string) url parsed
            headers: (dict) headers add to request
            data: (dict) body data of request

        Returns: RespData object have attribute state, result, errors
            state: (bool) True if status_code is range (200, 300) else False : Is success call
            result: (dict or list) : is Response Data from API
            errors: (dict) : is Error Data from API
        """

        try:
            resp = requests.delete(
                url=safe_url, headers=headers, json=data,
                timeout=REQUEST_TIMEOUT,
                **kwargs
            )
        except requests.exceptions.RequestException:
            # except requests.exceptions.HTTPError:
            # except requests.exceptions.ConnectionError:
            # except requests.exceptions.Timeout:
            return RespData(
                _state=False,
                _result={},
                _status=500,
            )

        resp_parsed = self.get_data_from_resp(resp) if self.response_origin is False else resp
        if resp.status_code == 401:
            if self.user_obj:
                state_refresh, headers_upgrade = self.handle_expired_token(
                    resp_parsed_before=resp_parsed if self.response_origin is False else None
                )
                if state_refresh and headers_upgrade:
                    # refresh token
                    headers.update(headers_upgrade)
                    resp = requests.delete(
                        url=safe_url, headers=headers, json=data,
                        timeout=REQUEST_TIMEOUT,
                        **kwargs
                    )
                    resp_parsed = self.get_data_from_resp(resp) if self.response_origin is False else resp
                elif isinstance(headers_upgrade, RespData):
                    return headers_upgrade
        return resp_parsed


class ServerAPI:
    """
    Public class and call from views/utils
    """

    KEY_SESSION_DEVICE_ID = "Device-ID"
    KEY_X_SOURCE = "web"

    def __init__(self, url, **kwargs):
        self.cus_headers = kwargs.get('cus_headers', None)
        api_domain = kwargs.get('api_domain', settings.API_DOMAIN)
        self.user = kwargs.get('user', None)
        if url.startswith('\\'):
            self.url = api_domain + url[1:]
        else:
            self.url = api_domain + url

        self.is_minimal = kwargs.get('is_minimal', False)
        self.is_secret_ui = kwargs.get('is_secret_ui', False)
        self.request = kwargs.get('request', None)
        self.is_check_perm = kwargs.get('is_check_perm', False)
        self.has_refresh_token = kwargs.get('has_refresh_token', False)
        self.response_origin = kwargs.get('return_response_origin', False)

        if self.request:
            self.query_params = getattr(self.request, 'query_params', {})
        else:
            self.query_params = {}

        params = kwargs.get('params', {})
        self.query_params = {
            **self.query_params,
            **(params if isinstance(params, dict) else {}),
        }

        self.headers_tmp = kwargs.get('headers', {})

        self.is_dropdown = kwargs.get('is_dropdown', False)

    @property
    def setup_header_dropdown(self):
        if self.request:
            data_is_dd = self.request.META.get('HTTP_DTISDD', None)
            if data_is_dd == 'true' or self.is_dropdown is True:
                return {'DATAISDD': 'true'}
        return {}

    @classmethod
    def get_language_client(cls, request):
        if request and request.headers:
            return request.headers.get('Accept-Language', settings.LANGUAGE_CODE)
        return 'vi'

    @classmethod
    def get_device_id(cls, request):
        if request and request.session.get(cls.KEY_SESSION_DEVICE_ID, None):
            return request.session.get(cls.KEY_SESSION_DEVICE_ID)
        return ''

    @property
    def headers(self) -> dict:
        """
        Setup headers for request
        Returns: Dict
            'content-type': 'application/json',
            'Accept-Language': 'vi',
            'X-Source: 'web',
            'Device-ID': '...',
        """

        data = {
            'content-type': 'application/json',
            'Accept-Language': self.get_language_client(request=self.request),
            'X-Source': self.KEY_X_SOURCE,
            'Device-ID': self.get_device_id(request=self.request),
            **self.setup_header_dropdown,
            **self.headers_tmp,
        }
        if self.user and getattr(self.user, 'access_token', None):
            data.update(APIUtil.key_authenticated(access_token=self.user.access_token))
        if self.user and getattr(self.user, 'refresh_token', None) and self.has_refresh_token is True:
            data.update(APIUtil.key_authenticated_refresh(refresh_token=self.user.refresh_token))
        if self.is_minimal is True or self.query_params.get('is_minimal', False) is True:
            data[settings.API_KEY_MINIMAL] = settings.API_KEY_VALUE_MINIMAL

        if self.is_check_perm is True:
            data['DATAHASPERM'] = 'true'

        if self.is_secret_ui:
            data.update(
                {
                    settings.MEDIA_KEY_FLAG: 'true',
                    settings.MEDIA_KEY_SECRET_TOKEN_UI: settings.MEDIA_SECRET_TOKEN_UI,
                }
            )
        if self.cus_headers:
            return {
                **data,
                **self.cus_headers
            }
        return data

    @property
    def setup_query_params(self):
        ctx = {}
        if hasattr(self.request, 'query_params'):
            return {
                key: value
                for key, value in self.request.query_params.dict().items() if key not in ['_'] and value
            }
        return ctx

    @property
    def api_cls(self) -> APIUtil:
        return APIUtil(
            user_obj=self.user,
            response_origin=self.response_origin,
        )

    def get(self, data=None, **kwargs):
        """
        Support call request API with GET method.
        Args:
            data: (dict) : will url encode and append to real url ()

        Returns: APIUtil --> call_get()
        """

        params = {
            **self.setup_query_params,
            **(data if isinstance(data, dict) else {}),
        }

        url_encode = [f"{str(key)}={parse.quote(str(val))}" for key, val in params.items()]
        safe_url = self.url + f'?{"&".join(url_encode)}'
        return self.api_cls.call_get(safe_url=safe_url, headers=self.headers, **kwargs)

    def post(self, data, **kwargs) -> RespData:
        """
        Support call request API with POST method.
        Args:
            data: (dict): body data of request

        Returns: APIUtil --> call_post()
        """
        if isinstance(data, (dict, MultipartEncoder)):
            return self.api_cls.call_post(
                safe_url=self.url,
                headers=self.headers,
                data=data, **kwargs
            )
        raise ValueError('Body data for POST request must be dictionary or MultipartEncoder')

    def put(self, data, **kwargs) -> RespData:
        """
        Support call request API with PUT method.
        Args:
            data: (dict): body data of request

        Returns: APIUtil --> call_put()
        """
        if isinstance(data, (dict, MultipartEncoder)):
            return self.api_cls.call_put(
                safe_url=self.url,
                headers=self.headers,
                data=data, **kwargs
            )
        raise ValueError('Body data for POST request must be dictionary')

    def delete(self, data: dict = dict, **kwargs) -> RespData:
        """
        Support call request API with DELETE method.
        Args:
            data: (dict): body data of request

        Returns: APIUtil --> call_delete()
        """
        return self.api_cls.call_delete(
            safe_url=self.url,
            headers=self.headers,
            data=data if data and isinstance(data, dict) else {},
            **kwargs
        )

    @classmethod
    def empty_200(cls):
        return {}, status.HTTP_200_OK

    def check_2fa_of_user_token(self) -> bool or str:
        # True: accept continue
        # 'REDIRECT_VERIFIED_OTP': goto verify otp page
        if self.user:
            token = UntypedToken(self.user.access_token)
            verified_2fa = token.payload.get(settings.JWT_KEY_2FA_VERIFIED, None)
            if verified_2fa is not True and self.user.auth_2fa is True:
                return 'REDIRECT_VERIFIED_OTP'
        return True
