from odoo import models, fields, api


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    inventory_api_url = fields.Char(
        string='Inventory Service URL',
        config_parameter='inventory_connector.api_url',
        placeholder='https://your-backend.com/api/v1/inventory',
    )
