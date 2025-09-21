from django import template

register = template.Library()

@register.filter
def lookup(dictionary, key):
    """
    Template filter to lookup dictionary values by key
    Usage: {{ dict|lookup:key }}
    """
    if isinstance(dictionary, dict):
        return dictionary.get(key, '')
    return ''

@register.filter
def pprint(value):
    """
    Pretty print for displaying JSON/dict data
    """
    import json
    try:
        if isinstance(value, (dict, list)):
            return json.dumps(value, indent=2)
        return str(value)
    except:
        return str(value)
    
@register.filter
def get_key(value, arg):
    """Get a dictionary item by key (supports hyphens)"""
    try:
        return value.get(arg, '')
    except Exception:
        return ''