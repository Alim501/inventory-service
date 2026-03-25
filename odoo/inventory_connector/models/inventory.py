import requests
from odoo import models, fields, api
from odoo.exceptions import UserError

class InventoryImport(models.Model):
    _name = 'inventory.import'
    _description = 'Imported Inventory'

    name = fields.Char(string='Title', required=True)
    description = fields.Text(string='Description')
    category = fields.Char(string='Category')
    item_count = fields.Integer(string='Item Count')
    api_token = fields.Char(string='API Token')
    last_imported = fields.Datetime(string='Last Imported')
    field_ids = fields.One2many('inventory.field', 'inventory_id', string='Fields')

    def action_import(self):
        if not self.api_token:
            raise UserError('API Token is required')

        url = 'http://host.docker.internal:3001/api/v1/inventory'  # /api prefix is global in NestJS

        try:
            response = requests.get(url, headers={'x-api-token': self.api_token})
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            raise UserError(f'Import failed: {str(e)}')

        self.write({
            'name': data['title'],
            'description': data.get('description'),
            'category': data.get('category'),
            'item_count': data['itemCount'],
            'last_imported': fields.Datetime.now(),
        })

        # Удаляем старые поля
        self.field_ids.unlink()

        # Создаём новые
        for field in data['fields']:
            agg = field.get('aggregation')
            agg_text = ''

            if agg:
                if field['fieldType'] == 'number':
                    agg_text = f"min: {agg['min']}, max: {agg['max']}, avg: {round(agg['avg'], 2)}"
                elif 'topValues' in agg:
                    top = ', '.join([f"{v['value']} ({v['count']})" for v in agg['topValues']])
                    agg_text = f"Top values: {top}"

            self.env['inventory.field'].create({
                'inventory_id': self.id,
                'field_name': field['fieldName'],
                'field_type': field['fieldType'],
                'aggregation': agg_text,
            })

        return True


class InventoryField(models.Model):
    _name = 'inventory.field'
    _description = 'Inventory Field'

    inventory_id = fields.Many2one('inventory.import', string='Inventory', ondelete='cascade')
    field_name = fields.Char(string='Field Name')
    field_type = fields.Char(string='Field Type')
    aggregation = fields.Char(string='Aggregation')