__all__ = ['FieldMapCommon']


class FieldMapCommon:
    """
    ALL_STYLE: "add required label", "remove disable", "remove readonly", "add border"
    ---
    name_mapping: ALL_STYLE
    id_mapping: ALL_STYLE
    readonly_not_disable: ALL_STYLE, exclude "remove readonly"
    id_border_zones: Only apply "add border", "add readonly"
    cls_border_zones: Only apply "add border", "add readonly"
    """
    name_mapping: list[str]
    id_mapping: list[str]
    readonly_not_disable: list[str]
    id_border_zones: list[str]
    cls_border_zones: list[str]

    def __init__(
            self,
            name_mapping: list[str] = None,
            id_mapping: list[str] = None,
            readonly_not_disable: list[str] = None,
            id_border_zones: list[str] = None,
            cls_border_zones: list[str] = None,
    ):
        self.name_mapping = name_mapping if isinstance(name_mapping, list) else []
        self.id_mapping = id_mapping if isinstance(id_mapping, list) else []
        self.readonly_not_disable = readonly_not_disable if isinstance(readonly_not_disable, list) else []
        self.id_border_zones = id_border_zones if isinstance(id_border_zones, list) else []
        self.cls_border_zones = cls_border_zones if isinstance(cls_border_zones, list) else []

    @property
    def data(self):
        return {
            'name': self.name_mapping,
            'id': self.id_mapping,
            'readonly_not_disable': self.readonly_not_disable,
            'id_border_zones': self.id_border_zones,
            'cls_border_zones': self.cls_border_zones,
        }
