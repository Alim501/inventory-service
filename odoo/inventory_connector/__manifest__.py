{
    'name': 'Inventory Connector',
    'version': '1.0',
    'summary': 'Import inventories from inventory-service',
    'category': 'Tools',
    'depends': ['base'],
    'data': [
        'security/ir.model.access.csv',
        'views/inventory_views.xml',
    ],
    'installable': True,
    'application': True,
}