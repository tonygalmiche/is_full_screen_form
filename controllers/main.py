# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request


class IsFormWidthController(http.Controller):
    
    @http.route('/is_full_screen_form/get_all_widths', type='json', auth='user')
    def get_all_widths(self):
        """
        Retourne toutes les préférences de largeur de l'utilisateur courant
        sous forme de dictionnaire {form_key: width_state}
        """
        records = request.env['is.form.width'].search([
            ('user_id', '=', request.env.uid)
        ])
        return {r.form_key: r.width_state for r in records}
