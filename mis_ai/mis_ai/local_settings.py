import os
from django.conf import settings

DEBUG = True

ALLOWED_HOSTS = []

DATABASE_USER = 'truongpn'
DATABASE_PW = 'F#180399'

LOG_DIR = os.path.join(settings.BASE_DIR, 'logs')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s",
            'datefmt': "%d/%b/%Y-%H:%M:%S"
        },
        'simple': {
            'format': '[%(asctime)s] %(levelname)s %(message)s'
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': os.path.join(LOG_DIR, 'api.log'),
            'when': 'D',
            'interval': 1,
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'alert_file': {
            'level': 'INFO',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': os.path.join(LOG_DIR, 'alert.log'),
            'when': 'D',
            'interval': 1,
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'mqtt_file': {
            'level': 'INFO',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': os.path.join(LOG_DIR, 'mqtt.log'),
            'when': 'D',
            'interval': 1,
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'commands_log': {
            'level': 'INFO',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': os.path.join(LOG_DIR, 'commands.log'),
            'when': 'D',
            'interval': 1,
            'backupCount': 5,
            'formatter': 'simple',
        }
    },
    'loggers': {
        '': {
            'handlers': ['file'],
            'level': 'INFO',
        },
        'mqtt': {
            'handlers': ['mqtt_file'],
            'level': 'INFO'
        },
        'alert': {
            'handlers': ['alert_file'],
            'level': 'INFO'
        },
        'commands': {
            'handlers': ['commands_log'],
            'level': 'INFO'
        }
    },
}


API_DOMAIN = 'http://127.0.0.1:8000/api/'
# API_DOMAIN = 'http://api-cts-dev.cmis.com.vn/api/'
# API_DOMAIN = 'http://api-cts-sit.cmis.com.vn/api/'
# API_DOMAIN = 'http://api-cts-uat.cmis.com.vn/api/'
# API_DOMAIN = 'http://api-cts-preprod.cmis.com.vn/api/'
# API_DOMAIN = 'http://api-new-sit.cmis.com.vn/api/'

DATABASE_NAME = 'local'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'mis_ui',
        'USER': 'haind',
        'PASSWORD': '03112001!',
        'HOST': '127.0.0.1',
        'PORT': '3306',
    }
}

SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}
CACHE_EXPIRES = 0

PRODUCTION = False


COMPRESS_ENABLED = False

ALLOW_SIGN_OUT = False

SITE_ID = 1

API_SERVER_TIMEOUT = 50000

STATIC_VERSION_ENABLE = False

MQTT_TENANT = 'local-lhphuc'
MQTT_TOPIC_WBS_MONITOR = 'private/wbs/monitor/{plan_id}'
MQTT_TOPIC_WBS_MONITOR_FULL = MQTT_TENANT + '/' + MQTT_TOPIC_WBS_MONITOR
# MQTT_BROKER_PORT_WEB = 8084


LOGGING = {}

ZOOM_CLIENT_ID = 'KZPSercT1uP6gCRYtjk8A'
ZOOM_CLIENT_SECRET = '0mtt7IbJA16Q7etMAYJbedFFeqio85Cu'
ZOOM_ACCOUNT_ID = 'qyykpEHjSli4Bv-64WY7gQ'

# bflow ai
MONGO_URI = "mongodb://localhost:27017"
OPENAI_API_KEY = "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"
GROQ_API_KEY = "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"
