import Ember from 'ember';
import { EKMixin, keyUp } from 'ember-keyboard';

const {
    Component,
    inject: { service },
    get,
    on,
    set
} = Ember;

// EKX Mixin is Ember Keyboard Mixin so we can use ESC to close modal.
export default Component.extend(EKMixin, {
    cookies: service(),

    classNames: ['intro-modal-link'],

    activateKeyboard: on('init', function() {
        set(set, 'keyboardActivated', true);
    }),

    closeWithEsc: on(keyUp('Escape'), function() {
        let project = get(this, 'project');
        project.setProperties({ suppressIntro: true });
    }),

    actions: {

        toggleIntro() {
            this.sendAction('action');
        },

        supressIntro() {
            let model = get(this, 'project');
            console.log('this', model.id);
            let cookieService = get(this, 'cookies');
            let cookieName = `noIntro${model.id}`;
            console.log('cookieName', cookieName);

            if (model.hasSuppressCookie === true) {
                console.log('cookieName-true', cookieName);
                cookieService.clear(cookieName);
                model.setProperties({ hasSuppressCookie: false });
            } else {
                console.log('cookieName-false', cookieName);
                cookieService.write(cookieName, `Surppress-intro-for-project-${model.id}-on-ATLMaps.`);
                model.setProperties({ hasSuppressCookie: true });
            }

        }

    }
});
