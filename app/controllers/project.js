import Ember from 'ember';
import DS from 'ember-data';

/* global L */
/* global shuffle */
/* global Sortable */
/* global Draggabilly */


export default Ember.Controller.extend({
	
	isShowingRasterModal: false,

	isShowingVectorModal: false,

	rasterLayers: function() {

        var rasterLayers = DS.PromiseObject.create({
            promise: this.store.find('raster-layer', {projectID: this.model.get('id')})
        });

        rasterLayers.then(function(){
            // Maybe remove a laoding gif?
        });

        return rasterLayers;


    }.property(),

    vectorLayers: function() {

        var vectorLayers = DS.PromiseObject.create({
            promise: this.store.find('vector-layer', {projectID: this.model.get('id')})
        });

        vectorLayers.then(function(){
            // Maybe remove a laoding gif?
        });

        return vectorLayers;


    }.property(),

    isEditing: false,
		
	actions: {

		toggleRasterModal: function(){
	    	this.toggleProperty('isShowingRasterModal');
	    },

	   	toggleVectorModal: function(){
	    	this.toggleProperty('isShowingVectorModal');
	    },

	    init: function() {
	    	//Ember.run.later((function() {
	    	Ember.run.scheduleOnce('afterRender', function() {
	    	console.log('sweet');
	    	var el = document.getElementById("layer_sort");
                Sortable.create(el, {
                    handle: '.handle',
                    animation: 150,
                    ghostClass: "sorting",
                    onUpdate: function () {
                        var IDs = [];
                        // Get the raster layers in the project by the id.
                        Ember.$(".raster-list").find(".raster-layer").each(function(){
                            IDs.push(this.id);
                        });
                        var layerLength = IDs.length;
                        Ember.$.each(IDs, function(index, value){
                            // So here we are taking the length of the array, subtracting 
                            // the index of the layer and then adding 10 to reorder them.
                            // It's just that easy.
                            var zIndex = layerLength - index + 10;
                            Ember.$("."+value).css("zIndex", zIndex);
                        });
                    }
                });

                new Draggabilly( '.draggable', {
                    handle: '.mdi-action-open-with'
                });
            });
	    },

		// mapLayer expects `layer` to be a layer object.
		mapLayer: function(layer, marker_color, position){

		var slug = layer.get('layer');
		var map = this.globals.mapObject;

		var institution = layer.get('institution');

		var markerColor = this.globals.color_options[marker_color];

		Ember.$("#layer-list").append("<div>"+layer.get('name')+"</div>");

		var zIndex = position + 10;

		switch(layer.get('layer_type')) {
		
			case 'planningatlanta':

				var tile = L.tileLayer('http://static.library.gsu.edu/ATLmaps/tiles/' + layer.get('layer') + '/{z}/{x}/{y}.png', {
					layer: layer.get('layer'),
					tms: true,
					minZoom: 13,
					maxZoom: 19,
					detectRetina: true
				}).addTo(map).setZIndex(10).getContainer();

				Ember.$(tile).addClass(slug).addClass('wmsLayer').addClass('atLayer').css("zIndex", zIndex);

				break;

			case 'wms':

				var wmsLayer = L.tileLayer.wms(institution.geoserver + layer.get('url') + '/wms', {
					layers: layer.get('url') + ':' + layer.get('layer'),
					format: 'image/png',
					crs: L.CRS.EPSG4326,
					transparent: true,
					detectRetina: true
				}).addTo(map).bringToFront().getContainer();

				Ember.$(wmsLayer).addClass(slug).zIndex(zIndex).addClass('atLayer').css("zIndex", zIndex);

				break;

			// case 'wfs':
			// 	//http://geospatial.library.emory.edu:8081/geoserver/Sustainability_Map/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Sustainability_Map:Art_Walk_Points&maxFeatures=50&outputFormat=text%2Fjavascript&format_options=callback:processJSON&callback=jQuery21106192189888097346_1421268179487&_=1421268179488
			// 	//http://geospatial.library.emory.edu:8081/geoserver/Sustainability_Map/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Sustainability_Map:Art_Walk_Points&maxFeatures=50&outputFormat=text/javascript
			// 	var wfsLayer = institution.geoserver + layer.get('url') + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + layer.get('url') + ":" + layer.get('layer') + "&maxFeatures=50&outputFormat=text%2Fjavascript&format_options=callback:processJSON";

			// 	Ember.$.ajax(wfsLayer,
			// 		{ dataType: 'jsonp' }
			// 		).done(function ( data ) {});

			// 	// This part is the magic that makes the JSONP work
			// 	// The string at the beginning of the JSONP is processJSON
			// 	function processJSON(data) {
			// 		points = wfsLayer(data,{
			// 			//onEachFeature: onEachFeature,
			// 			pointToLayer: function (feature, latlng) {
			// 				return L.marker(latlng);
			// 			}
			// 		}).addTo(map);
			// 	}

			// 	break;

			case 'geojson':                    
				function viewData(feature, layer) {
					var popupContent = "<h2>"+feature.properties.name+"</h2>";
					if (feature.properties.image) {
						popupContent += "<a href='"+feature.properties.image.url+"' target='_blank'><img class='geojson' src='"+feature.properties.image.url+"' title='"+feature.properties.image.name+"' /></a>"+
						"<span>Photo Credit: "+feature.properties.image.credit+"</span>";

						Ember.$('<img />').load( function(){
  							shuffle.init();
						}).attr('src', feature.properties.image.url);
					}
					if (feature.properties.description) {
						popupContent += "<p>" + feature.properties.description + "</p>";
					}
					if (feature.properties.gx_media_links) {
						popupContent += '<iframe width="375" height="250" src="//' + feature.properties.gx_media_links + '?modestbranding=1&rel=0&showinfo=0&theme=light" frameborder="0" allowfullscreen></iframe>';
					}
					if (feature.properties.images) {
						popupContent += feature.properties.images;
					}

					layer.on('click', function() {
						Ember.$(".project-nav").removeClass('active-button');
						Ember.$("div.marker-content").empty();
						Ember.$("div.marker-data").hide();
						Ember.$(".card").hide();
						var $content = Ember.$("<article/>").html(popupContent);
						Ember.$("div.marker-data").show();
						Ember.$('div.marker-content').append($content);

						Ember.$(".active_marker").removeClass("active_marker");
						Ember.$(this._icon).addClass('active_marker');
					});

				}

				if(layer.get('url')){
					new L.GeoJSON.AJAX(layer.get('url'), {

						pointToLayer: function (feature, latlng) {
							var layerClass = slug + ' atLayer vectorData map-marker layer-' + markerColor;
							var icon = L.divIcon({
								className: layerClass,
								iconSize: null,
								html: '<div class="shadow"></div><div class="icon"></div>'
							});

							var marker = L.marker(latlng, {icon: icon});   

							return marker;
						},
						onEachFeature: viewData,
					}).addTo(map);
				}
				break;

			}

		},

		opacitySlider: function(layer){

        	Ember.$(".slider."+layer.get('layer')).noUiSlider({
            	start: [ 10 ],
            	connect: false,
             	range: {
                	'min': 0,
                	'max': 10
              	}
            });

            Ember.$(document).on('slide','.card .slider',function(){
			    var $this = Ember.$(this);
			    $this.siblings('input').val($this.val()).change();
			 });

		},

		colorIcons: function(layer, marker){
			Ember.$("span.geojson."+layer.get('layer_type')+"."+layer.get('layer')).addClass("map-marker layer-"+this.globals.color_options[marker]);
		},

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

        backToProjects: function(){
        	this.transitionToRoute('projects');
        },

        closeMarkerInfo: function() {
            Ember.$("div.marker-data").hide();
            Ember.$(".active_marker").removeClass("active_marker");
        },

        editProject: function() {
            this.toggleProperty('isEditing');
            this.send('init');
        },

        cancelUpdate: function(model) {
            this.toggleProperty('isEditing');
            // This will change to `model.rollbackAttributes()`
            // in the near future.
            this.send('init');
            model.rollback();
            

        },
        
        updateProjectInfo: function(model) {
            model.save();
        },
		
	}
});
