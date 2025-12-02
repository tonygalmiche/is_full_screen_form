/** @odoo-module **/

import { registry } from "@web/core/registry";

/**
 * Ce service charge toutes les préférences de largeur de formulaire
 * au démarrage de l'application et les stocke dans un cache global.
 * Cela permet d'avoir les préférences disponibles immédiatement
 * sans attendre un appel RPC par formulaire.
 */

// Cache global accessible par is_full_screen_form.js
window.isFormWidthCache = {};
window.isFormWidthLoaded = false;

const formWidthService = {
    dependencies: ["orm"],
    
    async start(env, { orm }) {
        // Charger toutes les préférences au démarrage
        try {
            const widths = await orm.call("is.form.width", "get_all_widths", []);
            window.isFormWidthCache = widths || {};
            window.isFormWidthLoaded = true;
            console.log("[IsFullScreenForm] Préférences chargées au démarrage:", Object.keys(widths).length, "formulaires");
        } catch (error) {
            console.warn("[IsFullScreenForm] Erreur chargement préférences:", error);
            window.isFormWidthCache = {};
            window.isFormWidthLoaded = true;
        }
        
        return {
            getWidth(formKey) {
                return window.isFormWidthCache[formKey] || 'normal';
            },
            setWidth(formKey, state) {
                window.isFormWidthCache[formKey] = state;
            }
        };
    },
};

registry.category("services").add("isFormWidth", formWidthService);
