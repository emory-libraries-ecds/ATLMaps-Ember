import Ember from 'ember';

export default Ember.Component.extend({
    showIntro: Ember.inject.service(),
    classNames: ['intro-modal-link'],

    didInitAttrs: function(){

        // Pick the layout from the attribute
        if (this.get('template') === 'article-and-video'){
			this.set('av', true);
		}
        else if (this.get('template') === 'article-only'){
            this.set('a', true);
        }
        else if (this.get('template') === 'video-only'){
            this.set('v', true);
        }

    },

    actions: {

        toggleIntro: function() {
            this.sendAction('action');
        },

        supressIntro: function(){
            var projectID = this.get('project.id');

            this.get('showIntro').setCookie(projectID);
        },

    }
});
