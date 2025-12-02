# -*- coding: utf-8 -*-

from odoo import models, fields, api


class IsFormWidth(models.Model):
    _name = 'is.form.width'
    _description = 'Mémorisation des largeurs de formulaires'
    _rec_name = 'form_key'

    user_id = fields.Many2one('res.users', string='Utilisateur', required=True, ondelete='cascade', index=True)
    form_key = fields.Char(string='Clé du formulaire', required=True, index=True,
                           help="Identifiant unique du formulaire (model + view_id)")
    width_state = fields.Selection([
        ('normal', 'Normal (1534px)'),
        ('large', 'Large (1800px)'),
        ('full', 'Pleine largeur (100%)'),
    ], string='État de la largeur', default='normal',
       help="État actuel de la largeur du formulaire")

    _sql_constraints = [
        ('user_form_unique', 'unique(user_id, form_key)',
         'Une seule configuration par utilisateur et par formulaire')
    ]

    @api.model
    def get_form_width(self, form_key):
        """Récupère l'état de largeur pour l'utilisateur courant et le formulaire donné"""
        record = self.search([
            ('user_id', '=', self.env.uid),
            ('form_key', '=', form_key)
        ], limit=1)
        if record:
            return record.width_state
        return 'normal'

    @api.model
    def set_form_width(self, form_key, width_state):
        """Sauvegarde l'état de largeur pour l'utilisateur courant et le formulaire donné"""
        record = self.search([
            ('user_id', '=', self.env.uid),
            ('form_key', '=', form_key)
        ], limit=1)

        if record:
            record.write({'width_state': width_state})
        else:
            self.create({
                'user_id': self.env.uid,
                'form_key': form_key,
                'width_state': width_state
            })
        return True

    @api.model
    def get_all_widths(self):
        """Récupère toutes les préférences de largeur pour l'utilisateur courant"""
        records = self.search([('user_id', '=', self.env.uid)])
        result = {}
        for record in records:
            result[record.form_key] = record.width_state
        return result
