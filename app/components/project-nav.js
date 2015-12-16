import Ember from 'ember';

export default Ember.Component.extend({

	actions: {
		navigateProject: function(card){

            Ember.$("div.marker-data").hide();

            Ember.$(".project-nav").removeClass('active-button');

            Ember.$(".project-nav").addClass('transparent-button');

            if (Ember.$('.'+card).is(":visible")) {
                Ember.$('.'+card).slideToggle();
                Ember.$('#'+card).removeClass('active-button');
                Ember.$('#'+card).addClass('transparent-button');
            }
            else {
                Ember.$(".card").hide();
                Ember.$(".active_marker").removeClass("active_marker");
                Ember.$("."+card).slideToggle();
                Ember.$('#'+card).addClass('active-button');
                Ember.$('#'+card).removeClass('transparent-button');
            }
        },

		showRasterResults: function(){
			Ember.$('.raster-results').show();
			Ember.$('.vector-results').hide();
			Ember.$('.vector-result-tab').removeClass("active");
			Ember.$('.raster-result-tab').addClass("active");
		},

		showVectorResults: function(){
			Ember.$('.vector-results').show();
			Ember.$('.raster-results').hide();
			Ember.$('.raster-result-tab').removeClass("active");
			Ember.$('.vector-result-tab').addClass("active");
		},

		toggleFilter: function(filter) {
			Ember.$(".browse-cards div.browse-form").hide();
	        Ember.$(".browse-by-"+filter).show();
			Ember.$('.browse-options .btn').removeClass('active');
			Ember.$('.browse-options .'+ filter).addClass('active');
        },

	}
});
