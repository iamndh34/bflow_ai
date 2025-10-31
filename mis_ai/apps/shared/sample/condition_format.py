data = [
    {'left': 'a', 'math': 'is', 'right': 'b', 'type': 'string'},
    'AND',
    {'left': 'a', 'math': 'is', 'right': 'b', 'type': 'string'},
    'AND',
    [
        {'left': 'b', 'math': '=', 'right': 1, 'type': 'number'},
        'OR',
        {'left': 'b', 'math': '=', 'right': 0, 'type': 'number'},
        'OR',
    ],
    'AND',
    [
        {'left': 'c', 'math': 'is', 'right': True, 'type': 'boolean'},
        'OR',
        {'left': 'c', 'math': 'is', 'right': False, 'type': 'boolean'},
        'OR',
    ],
    'AND',
    [
        {'left': 'c', 'math': 'is', 'right': True, 'type': 'boolean'},
        'OR',
        [
            {'left': 'c', 'math': 'is', 'right': True, 'type': 'boolean'},
            'OR',
            {'left': 'c', 'math': 'is', 'right': False, 'type': 'boolean'},
            'OR',
        ],
        'OR',
    ],
    'AND',
]

data_boolean_parse = [
    True,
    'AND',
    True,
    'AND',
    [
        True,
        'OR',
        False,
        'OR'
    ],
    'AND',
    [
        False,
        'OR',
        True,
        'OR'
    ],
    'AND',
]

data_boolean_parse_r2 = [
    True,
    'AND',
    True,
    'AND',
    True,  # group return
    'AND',
    True,  # group return
    'AND'
]

data_boolean_parse_r3 = True
