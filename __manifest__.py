# -*- coding: utf-8 -*-
{
    "name": "InfoSaône - Élargir ou mettre en plein écran les vues formulaires dans Odoo 18",
    "version": "18.0.1.0.0",
    "author": "InfoSaône / Tony Galmiche",
    "category": "InfoSaône",
    "summary": "Permet de changer la largeur des formulaires (1534px, 1750px ou 100%)",
    "description": """
        Ce module ajoute un bouton en haut à droite de tous les formulaires permettant 
        de changer leur largeur avec 3 états :
        - Normal : 1534px (largeur par défaut d'Odoo)
        - Large : 1750px
        - Pleine largeur : 100%
        
        La préférence de largeur est mémorisée par utilisateur et par formulaire.
        Les préférences sont chargées au démarrage de la session pour éviter tout flash.
    """,
    "maintainer": "InfoSaône",
    "website": "http://www.infosaone.com",
    "depends": [
        'base',
        'web',
    ],
    "data": [
        'security/ir.model.access.csv',
    ],
    "assets": {
        'web.assets_backend': [
            'is_full_screen_form/static/src/js/is_form_width_service.js',
            'is_full_screen_form/static/src/js/is_full_screen_form.js',
            'is_full_screen_form/static/src/scss/is_full_screen_form.scss',
        ],
    },
    "installable": True,
    "auto_install": False,
    "application": False,
    "license": "AGPL-3",
}
