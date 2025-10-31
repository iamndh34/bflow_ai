"""system module"""
import string

import random

__all__ = [
    'RandomGenerate',
    'TypeCheck',
    'FORMATTING',
    'CustomizeEncoder',
]

from datetime import datetime, date
from typing import Union
from uuid import UUID

from django.conf import settings
from django.core.serializers.json import DjangoJSONEncoder


class RandomGenerate:
    """general random"""
    REPEAT_TIME_MAX = 10

    @classmethod
    def check_uppercase(
            cls, data: str, replace_random: bool = False, exclude_replace_idx: list = None
    ) -> (str or None, int):
        """check and return uppercase"""
        if isinstance(exclude_replace_idx, list):
            exclude_replace_idx = []
        if not any(x.isupper() for x in data):
            if replace_random:
                idx_replace = cls.get_int(len(data), excludes=exclude_replace_idx)
                data_arr = list(data)
                data_arr[idx_replace] = data_arr[idx_replace].upper()
                return str("".join(data_arr)), idx_replace
            return None, None
        return data, None

    @classmethod
    def check_lowercase(
            cls, data: str, replace_random: bool = False, exclude_replace_idx: list = None
    ) -> (str or None, int):
        """check and return lowercase"""
        if isinstance(exclude_replace_idx, list):
            exclude_replace_idx = []
        if not any(x.isupper() for x in data):
            if replace_random:
                idx_replace = cls.get_int(len(data), excludes=exclude_replace_idx)
                data_arr = list(data)
                data_arr[idx_replace] = data_arr[idx_replace].lower()
                return str("".join(data_arr)), idx_replace
            return None, None
        return data, None

    @classmethod
    def check_digits(
            cls, data: str, replace_random: bool = False, exclude_replace_idx: list = None
    ) -> (str or None, int):
        """check digit"""
        if isinstance(exclude_replace_idx, list):
            exclude_replace_idx = []
        if not any(x.isupper() for x in data):
            if replace_random:
                idx_replace = cls.get_int(len(data), excludes=exclude_replace_idx)
                data_arr = list(data)
                data_arr[idx_replace] = random.choice(string.digits)
                return str("".join(data_arr)), idx_replace
            return None, None
        return data, None

    @classmethod
    def get_int(
            cls, max_int: int, start_with=0, excludes=None, repeat_times=0
    ) -> int:
        """check number Int"""
        if repeat_times < cls.REPEAT_TIME_MAX:
            if not isinstance(excludes, list):
                excludes = []
            tmp = random.choice(range(start_with, max_int))
            if tmp in excludes:
                return cls.get_int(max_int, start_with, excludes, repeat_times + 1)
            return tmp
        return 0

    # pylint: disable=R0912
    # pylint: disable=R0913
    # pylint: disable=R0914
    @classmethod
    def get_string(
            cls,
            length=12,
            allow_upper=True, allow_digits=True, allow_special=False, allow_space=False,
            require_upper=False, require_digits=False, require_special=False,
            start_letter=False,
    ):
        """
        Always allow lowercase character then append more option character to choices
        Args:
            start_letter:
            length:
            allow_upper: Allow uppercase character exist in choices
            allow_digits: Allow digits character exist in choices
            allow_special: Allow specials character exist in choices
            allow_space: Allow whitespace character exist in choices
            require_special: Check and replace data returned for condition SPECIAL CHARACTER CHECK
            require_digits: Check and replace data returned for condition DIGITS CHECK
            require_upper: Check and replace data returned for condition UPPERCASE CHECK

        Returns:

        """
        if length and length > 0:
            # setup choices data
            arr_choices = string.ascii_lowercase
            if allow_upper is True:
                arr_choices += string.ascii_uppercase
            if allow_digits is True:
                arr_choices += string.digits
            if allow_special is True:
                arr_choices += string.punctuation
            if allow_space is True:
                arr_choices += string.whitespace

            # generate
            if start_letter:
                result = random.choice(string.ascii_letters) + "".join(
                    [random.choice(arr_choices) for _idx in range(0, length - 1)]
                )
            else:
                result = "".join([random.choice(arr_choices) for _idx in range(0, length)])

            # check required
            idx_used = []
            if require_upper:
                result_tmp, idx_upper = cls.check_uppercase(
                    data=result, replace_random=True, exclude_replace_idx=idx_used
                )
                idx_used.append(idx_upper)
                if not isinstance(result_tmp, str):
                    print('result over except case UPPER CHECK')
                else:
                    result = result_tmp

            if require_digits:
                result_tmp, idx_digits = cls.check_digits(
                    data=result, replace_random=True, exclude_replace_idx=idx_used
                )
                idx_used.append(idx_digits)
                if not isinstance(result_tmp, str):
                    print('result over except case UPPER CHECK')
                else:
                    result = result_tmp

            if require_special:
                result_tmp, idx_lower = cls.check_lowercase(
                    data=result, replace_random=True, exclude_replace_idx=idx_used
                )
                idx_used.append(idx_lower)
                if not isinstance(result_tmp, str):
                    print('result over except case UPPER CHECK')
                else:
                    result = result_tmp

            # return
            return str(result)
        return ''


class TypeCheck:
    @staticmethod
    def check_uuid(data: any, return_data=False) -> Union[UUID, bool, None]:
        # check
        try:
            if isinstance(data, UUID):
                data_checked = data
            else:
                data_checked = UUID(data)
        except (Exception,):
            data_checked = None

        # return
        if return_data is True:
            return data_checked if data_checked else None
        if data_checked:
            return True
        return False

    @classmethod
    def check_uuid_list(cls, data: list[any], return_data=False) -> Union[list, bool]:
        result = []
        if data and isinstance(data, list):
            for idx_val in data:
                tmp = cls.check_uuid(idx_val, return_data=return_data)
                if return_data is True:
                    if tmp is not None:
                        result.append(tmp)
                else:
                    result.append(tmp)
                    if tmp is False:
                        break

        if return_data is True:
            return result
        if len(result) == len(data) and all(result) is True:
            return True
        return False

    @classmethod
    def list_child_type(cls, data: list, child_type: type) -> bool:
        if isinstance(data, list):
            return all(isinstance(x, child_type) for x in data)
        return False

    @classmethod
    def dict_child_type(cls, data: dict, key_type: type, value_type: type) -> bool:
        if isinstance(data, dict):
            return all(
                all(
                    [isinstance(key, key_type), isinstance(value, value_type)]
                ) for key, value in data.items()
            )
        return False

    @staticmethod
    def get_bool(data: Union[str, int, bool]):
        if isinstance(data, bool):
            return data
        if data in ['true', 'True', '1', 1]:
            return True
        if data in ['false', 'False', '0', 0]:
            return False
        raise ValueError("Data isn't boolean format.")

    @classmethod
    def check_email(cls, data: str):
        if data and '@' in data:
            arr = data.split("@")
            if len(arr) >= 2:
                name = "@".join(arr[:len(arr) - 1])
                domain = arr[-1]
                if name and domain:
                    return True
        return False


class FORMATTING:
    DATETIME = settings.REST_FRAMEWORK['DATETIME_FORMAT']
    DATE = settings.REST_FRAMEWORK['DATE_FORMAT']
    PAGE_SIZE = settings.REST_FRAMEWORK['PAGE_SIZE']

    @classmethod
    def parse_datetime(cls, value):
        if isinstance(value, datetime):
            return datetime.strftime(value, cls.DATETIME) if value else None
        return str(value)

    @classmethod
    def parse_to_datetime(cls, value_str):
        if value_str:
            if isinstance(value_str, datetime):
                return value_str
            if isinstance(value_str, str):
                return datetime.strptime(value_str, cls.DATETIME)
        return None

    @classmethod
    def parse_date(cls, value):
        if isinstance(value, date):
            return datetime.strftime(value, cls.DATE) if value else None
        return str(value)

    @classmethod
    def parse_to_date(cls, value_str):
        if value_str:
            if isinstance(value_str, date):
                return value_str
            if isinstance(value_str, str):
                return datetime.strptime(value_str, cls.DATE)
        return None


class CustomizeEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, (UUID, datetime)):
            return str(obj)
        return super().default(obj)
