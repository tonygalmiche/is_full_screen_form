# InfoSaône - Élargir ou mettre en plein écran les vues formulaires

Module Odoo 18 permettant de changer dynamiquement la largeur des formulaires.

## Fonctionnalités

- **Bouton de changement de largeur** : Ajoute un bouton en haut à droite de tous les formulaires
- **3 états de largeur** :
  - **Normal** : 1534px (largeur par défaut d'Odoo)
  - **Large** : 1750px
  - **Pleine largeur** : 100%
- **Mémorisation** : La préférence de largeur est sauvegardée par utilisateur et par modèle
- **Préchargement** : Les préférences sont chargées au démarrage de la session pour éviter tout flash
- **Compatible chatter** : Le bouton est automatiquement masqué quand le chatter est affiché à droite

## Installation

1. Copier le module dans le répertoire des addons
2. Mettre à jour la liste des applications
3. Installer le module "InfoSaône - Élargir ou mettre en plein écran les vues formulaires"

## Utilisation

1. Ouvrir n'importe quel formulaire dans Odoo
2. Cliquer sur le bouton avec l'icône de redimensionnement (en haut à droite, à côté des boutons d'action)
3. Chaque clic fait passer à l'état suivant : Normal → Large → Pleine largeur → Normal...

Le tooltip du bouton indique la taille actuelle et la taille après clic.



## Dépendances

- `base`
- `web`

## Auteur

**InfoSaône / Tony Galmiche**  
http://www.infosaone.com

## Licence

AGPL-3
