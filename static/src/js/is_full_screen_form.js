/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { FormController } from "@web/views/form/form_controller";
import { useService } from "@web/core/utils/hooks";
import { onMounted, onWillStart, useRef } from "@odoo/owl";

/**
 * Ce module patche le FormController pour ajouter un bouton permettant de 
 * changer la largeur des formulaires avec 3 états :
 * - normal: 1534px (valeur par défaut d'Odoo)
 * - large: 1750px
 * - full: 100% (pleine largeur)
 * 
 * L'état est mémorisé par utilisateur et par formulaire dans le modèle is.form.width
 * Les préférences sont chargées au démarrage via is_form_width_service.js
 */

// Les 3 états possibles avec leurs icônes et tooltips
const WIDTH_STATES = {
    normal: {
        next: 'large',
        icon: 'fa-expand',
        tooltip: 'Actuel: 1534px → Clic: 1750px',
        maxWidth: '1534px'
    },
    large: {
        next: 'full',
        icon: 'fa-arrows-alt',
        tooltip: 'Actuel: 1750px → Clic: 100%',
        maxWidth: '1750px'
    },
    full: {
        next: 'normal',
        icon: 'fa-compress',
        tooltip: 'Actuel: 100% → Clic: 1534px',
        maxWidth: '100%'
    }
};

patch(FormController.prototype, {
    setup() {
        super.setup(...arguments);
        
        // Ne pas ajouter le bouton dans les dialogues ou sur mobile
        if (this.env.inDialog || this.env.isSmall) {
            return;
        }
        
        // Service ORM pour communiquer avec le backend
        this.isFormWidthOrm = useService("orm");
        
        // Référence au root element du FormController
        this.isFormRootRef = useRef("root");
        
        // Clé unique pour identifier ce formulaire (pour la sauvegarde)
        this.isFormKey = this._isCreateFormKey();
        
        // Récupérer l'état depuis le cache global (chargé au démarrage)
        // Le cache est rempli par is_form_width_service.js avant le premier formulaire
        this._isCurrentWidthState = (window.isFormWidthCache && window.isFormWidthCache[this.isFormKey]) || 'normal';
        
        console.log("[IsFullScreenForm] Setup formKey:", this.isFormKey, "state:", this._isCurrentWidthState);
        
        // Si le cache n'est pas encore chargé, charger depuis le serveur
        onWillStart(async () => {
            if (!window.isFormWidthLoaded) {
                await this._isPreloadFormWidth();
            }
        });
        
        // Appliquer le style et ajouter le bouton après le montage
        onMounted(() => {
            // Toujours appliquer le style (même pour 'normal' car d'autres modules peuvent élargir)
            this._isApplyFormWidth();
            this._isAddWidthButton();
        });
    },

    /**
     * Crée une clé unique pour identifier ce formulaire
     * Utilise uniquement le resModel pour avoir une largeur par modèle
     */
    _isCreateFormKey() {
        return this.props.resModel || 'default';
    },

    /**
     * Applique le style directement sur les éléments DOM
     */
    _isApplyFormWidth() {
        const state = this._isCurrentWidthState;
        const stateConfig = WIDTH_STATES[state];
        if (!stateConfig) return;
        
        const rootEl = this.isFormRootRef?.el;
        if (!rootEl) return;
        
        const maxWidth = stateConfig.maxWidth;
        
        // Appliquer sur .o_form_sheet_bg
        const sheetBg = rootEl.querySelector('.o_form_sheet_bg');
        if (sheetBg) {
            sheetBg.style.maxWidth = 'none';
            // Marquer comme prêt pour révéler le formulaire (voir CSS)
            sheetBg.classList.add('is-width-ready');
        }
        
        // Appliquer sur .o_form_sheet
        const sheet = rootEl.querySelector('.o_form_sheet');
        if (sheet) {
            sheet.style.maxWidth = maxWidth;
            sheet.style.marginLeft = 'auto';
            sheet.style.marginRight = 'auto';
        }
        
        // Appliquer sur le chatter (si pas en mode aside)
        const chatter = rootEl.querySelector('.o-mail-Form-chatter:not(.o-aside) .o-mail-Chatter');
        if (chatter) {
            chatter.style.maxWidth = maxWidth;
            chatter.style.marginLeft = 'auto';
            chatter.style.marginRight = 'auto';
        }
        
        // Appliquer sur .o_form_nosheet
        const nosheet = rootEl.querySelector('.o_form_nosheet');
        if (nosheet) {
            nosheet.style.maxWidth = maxWidth;
            nosheet.style.marginLeft = 'auto';
            nosheet.style.marginRight = 'auto';
        }
        
        console.log("[IsFullScreenForm] Style appliqué:", maxWidth);
    },

    /**
     * Précharge l'état de largeur depuis le serveur (fallback si cache pas prêt)
     */
    async _isPreloadFormWidth() {
        const formKey = this.isFormKey;
        if (!formKey) return;
        
        // Vérifier le cache global
        if (window.isFormWidthCache && window.isFormWidthCache[formKey]) {
            this._isCurrentWidthState = window.isFormWidthCache[formKey];
            return;
        }
        
        try {
            const widthState = await this.isFormWidthOrm.call(
                "is.form.width",
                "get_form_width",
                [formKey]
            );
            if (window.isFormWidthCache) {
                window.isFormWidthCache[formKey] = widthState;
            }
            this._isCurrentWidthState = widthState;
            console.log("[IsFullScreenForm] ✓ Serveur:", widthState);
        } catch (error) {
            console.warn("[IsFullScreenForm] Erreur:", error);
            this._isCurrentWidthState = 'normal';
        }
    },

    /**
     * Ajoute le bouton de changement de largeur dans le control panel
     */
    _isAddWidthButton() {
        const rootEl = this.isFormRootRef?.el;
        if (!rootEl) return;
        
        // Vérifier si le chatter est en mode aside (à droite) - ne pas afficher le bouton
        const chatterAside = rootEl.querySelector('.o-mail-Form-chatter.o-aside');
        if (chatterAside) {
            console.log("[IsFullScreenForm] Chatter aside, pas de bouton");
            return;
        }
        
        // Trouver le control panel navigation
        const formViewContainer = rootEl.closest('.o_form_view_container') || rootEl.closest('.o_view_controller');
        if (!formViewContainer) return;
        
        const actionContainer = formViewContainer.closest('.o_action_manager') || document;
        const controlPanel = actionContainer.querySelector('.o_control_panel_navigation');
        if (!controlPanel) return;
        
        // Vérifier si le bouton existe déjà
        if (controlPanel.querySelector('.o_form_width_toggle')) return;
        
        // Créer le bouton
        const button = document.createElement('button');
        button.className = 'btn btn-secondary o_form_width_toggle ms-1';
        button.type = 'button';
        
        const stateConfig = WIDTH_STATES[this._isCurrentWidthState];
        button.title = stateConfig.tooltip;
        button.innerHTML = `<i class="fa ${stateConfig.icon}"></i>`;
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this._isOnWidthToggle();
        });
        
        controlPanel.appendChild(button);
        this._isWidthButton = button;
        
        console.log("[IsFullScreenForm] Bouton ajouté");
    },

    /**
     * Met à jour l'icône du bouton selon l'état actuel
     */
    _isUpdateButtonIcon() {
        if (!this._isWidthButton) return;
        
        const stateConfig = WIDTH_STATES[this._isCurrentWidthState];
        this._isWidthButton.title = stateConfig.tooltip;
        this._isWidthButton.innerHTML = `<i class="fa ${stateConfig.icon}"></i>`;
    },

    /**
     * Gère le clic sur le bouton de changement de largeur
     */
    async _isOnWidthToggle() {
        const currentState = this._isCurrentWidthState;
        const stateConfig = WIDTH_STATES[currentState];
        const nextState = stateConfig.next;
        
        console.log("[IsFullScreenForm] Toggle:", currentState, "->", nextState);
        
        // Mettre à jour l'état local et le cache global
        this._isCurrentWidthState = nextState;
        if (window.isFormWidthCache) {
            window.isFormWidthCache[this.isFormKey] = nextState;
        }
        
        // Appliquer le style
        this._isApplyFormWidth();
        
        // Mettre à jour le bouton
        this._isUpdateButtonIcon();
        
        // Sauvegarder sur le serveur
        try {
            await this.isFormWidthOrm.call(
                "is.form.width",
                "set_form_width",
                [this.isFormKey, nextState]
            );
            console.log("[IsFullScreenForm] ✓ Sauvegardé:", nextState);
        } catch (error) {
            console.warn("[IsFullScreenForm] Erreur sauvegarde:", error);
        }
    }
});
