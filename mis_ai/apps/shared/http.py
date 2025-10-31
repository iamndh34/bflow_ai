__all__ = ['HttpRequestControl']

from django.conf import settings


class HttpRequestControl:
    def __init__(self, request):
        self.request = request
        self.url_skip_check = ['/404', '/503', '/introduce', '/terms', '/help-and-support']

    def get_sub_domain(self):
        meta_hosts = self.request.META['HTTP_HOST']
        if meta_hosts and settings.UI_DOMAIN in meta_hosts:
            sub_code = meta_hosts.split(settings.UI_DOMAIN)[0]
            if sub_code.endswith("."):
                return sub_code[:-1].split(":")[0]
        return None

    def check(self, url_skip_check=None):
        if not url_skip_check:
            url_skip_check = []
        if self.request.path not in [*list(self.url_skip_check), *list(url_skip_check)]:
            sub_code = self.get_sub_domain()

            if sub_code:
                if "*" not in settings.UI_SUB_ALLOWED and sub_code not in settings.UI_SUB_ALLOWED:
                    return False

                if sub_code in settings.UI_SUB_DENIED:
                    return False
            else:
                return False
        return True
