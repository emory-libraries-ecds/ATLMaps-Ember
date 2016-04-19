import Ember from 'ember';

/* globals L, Swiper */

// Service to hold the Leaflet object.

export default Ember.Service.extend({

    dataColors: Ember.inject.service('data-colors'),

    init(){
        this._super(...arguments);
        this.set('map', '');
    },

    createMap(){
        try {
            let _map = L.map('map', {
                center: [33.7489954,-84.3879824],
                zoom: 13,
                // zoomControl is a Boolean
                // We add the zoom buttons just below to the top right.
                zoomControl: false
            });

            // Layer contorl, topright
            L.control.zoom({ position: 'topright' }).addTo(_map);

            _map.on('click', function(){
                Ember.$("div.info").remove();
                Ember.$("div.marker-data").hide();
                Ember.$(".active_marker").removeClass("active_marker");
            	Ember.$(".browse-results").fadeOut();
                // this.send('activateVectorCard');
            });

            // TODO: Get rid of this. only here while we develop a way to bring the results back
            _map.on('dblclick', function(){
                Ember.$(".browse-results").fadeIn();
            });

            // Create the object for Leafet in the mapObject service.
            this.set('map', _map);
            return _map;
        }
        catch(err){
            // Map is likely already initialized
        }
    },

    mapLayer(layer){
        let map = this.get('map');
        let zIndex = layer.get('position') + 10;
        let markerColor = this.get('dataColors.markerColors')[layer.get('marker')];
        let shapeColors = this.get('dataColors.shapeColors');
        function shapeColor(){
            let colorName = Object.keys(shapeColors)[layer.get('marker')];
            return shapeColors[colorName];
        }

        layer.get(layer.get('data_format')+'_layer_id').then(function(newLayer) {

            let newLayerName = newLayer.get('name');
            let newLayerSlug = newLayer.get('slug');
            let newLayerInst = newLayer.get('institution.geoserver');
            let newLayerWorkspace = newLayer.get('workspace');
            let newLayerUrl = newLayer.get('url');
            newLayer.set('active_in_project', true);

            switch(newLayer.get('data_type')) {

                case 'planningatlanta':

                    var tile = L.tileLayer('http://static.library.gsu.edu/ATLmaps/tiles/' + newLayerName + '/{z}/{x}/{y}.png', {
                        layer: newLayerSlug,
                        tms: true,
                        minZoom: 13,
                        maxZoom: 19,
                        detectRetina: true
                    }).addTo(map).setZIndex(10).getContainer();

                    Ember.$(tile).addClass(newLayerSlug).addClass('wmsLayer').addClass('atLayer').css("zIndex", zIndex);

                    break;

                case 'atlTopo':

                    var topoTile = L.tileLayer('http://disc.library.emory.edu/atlanta1928topo/tilesTopo/{z}/{x}/{y}.jpg', {
                        layer: newLayerSlug,
                        tms: true,
                        minZoom: 13,
                        maxZoom: 19,
                        detectRetina: true
                    }).addTo(map).setZIndex(10).getContainer();

                    Ember.$(topoTile).addClass(newLayerSlug).addClass('wmsLayer').addClass('atLayer').css("zIndex", zIndex);

                    break;

                case 'wms':
                    var wmsLayer = L.tileLayer.wms(newLayerInst+ newLayerWorkspace + '/wms', {
                        layers: newLayerWorkspace + ':' + newLayerName,
                        format: 'image/png',
                        crs: L.CRS.EPSG4326,
                        transparent: true,
                        detectRetina: true
                    }).addTo(map).getContainer();

                    Ember.$(wmsLayer).addClass(newLayerSlug).addClass('atLayer').css("zIndex", zIndex);

                    break;

                // NOTE: At some point we'll move the vector data to GeoServer
                // case 'wfs':
                //  //http://geospatial.library.emory.edu:8081/geoserver/Sustainability_Map/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Sustainability_Map:Art_Walk_Points&maxFeatures=50&outputFormat=text%2Fjavascript&format_options=callback:processJSON&callback=jQuery21106192189888097346_1421268179487&_=1421268179488
                //  //http://geospatial.library.emory.edu:8081/geoserver/Sustainability_Map/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Sustainability_Map:Art_Walk_Points&maxFeatures=50&outputFormat=text/javascript
                //  var wfsLayer = institution.geoserver + layer.get('url') + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + layer.get('url') + ":" + layer.get('slug') + "&maxFeatures=50&outputFormat=text%2Fjavascript&format_options=callback:processJSON";

                //  Ember.$.ajax(wfsLayer,
                //      { dataType: 'jsonp' }
                //      ).done(function ( data ) {});

                //  // This part is the magic that makes the JSONP work
                //  // The string at the beginning of the JSONP is processJSON
                //  function processJSON(data) {
                //      points = wfsLayer(data,{
                //          //onEachFeature: onEachFeature,
                //          pointToLayer: function (feature, latlng) {
                //              return L.marker(latlng);
                //          }
                //      }).addTo(map);
                //  }

                //  break;

                case 'point-data':
                case 'polygon':
                case 'line-data':

                    function viewData(feature, layer) {
                        var popupContent = "";
                        if (feature.properties.name) {
                            popupContent += "<h2>"+feature.properties.name+"</h2>";
                        }
                        if (feature.properties.image) {
                            popupContent += "<a href='"+feature.properties.image.url+"' target='_blank'><img class='geojson' src='"+feature.properties.image.url+"' title='"+feature.properties.image.name+"' /></a>"+
                            "<span>Photo Credit: "+feature.properties.image.credit+"</span>";

                            Ember.$('<img />').load( function(){}).attr('src', feature.properties.image.url);
                        }
                        if (feature.properties.gx_media_links) {
                            popupContent += '<iframe width="100%" height="250" src="//' + feature.properties.gx_media_links + '?modestbranding=1&rel=0&showinfo=0&theme=light" frameborder="0" allowfullscreen></iframe>';
                        }
                        if (feature.properties.images) {
                            console.log(feature.properties.images);
                            popupContent += "<div class='gallery'><div class='swiper-wrapper'>";
                            feature.properties.images.forEach(function(image){
                                console.log(image.url);
                                popupContent += "<div class='swiper-slide' ><a href='"+image.url+"' target='_blank'><img class='geojson' src='"+image.url+"' title='"+image.name+"' /></a>"+
                                "<span>Photo Credit: "+image.credit+"</span></div>";

                                Ember.$('<img />').load( function(){}).attr('src', image.url);

                            });
                            popupContent += '</div><div class="swiper-pagination"></div><div class="swiper-button-next swiper-button-white"></div><div class="swiper-button-prev swiper-button-white"></div></div>';

                        }
                        if (feature.properties.description) {
                            popupContent += "<p>" + feature.properties.description + "</p>";
                        }
                        if (feature.properties.NAME) {
                            popupContent += "<h2>"+feature.properties.NAME+"</h2>";
                        }

                        layer.on('click', function() {
                            // Ember.$(".project-nav").removeClass('active-button');
                            // Ember.$(".project-nav").addClass('transparent-button');
                            // Ember.$('#vector-data').addClass('active-button');
                            Ember.$("div.marker-content").empty();
                            // Ember.$("div.marker-data").hide();
                            // Ember.$(".card").hide();
                            var $content = Ember.$("<article/>").html(popupContent);
                            if (Ember.$('.gallery').length > 0){
                                Ember.$('.gallery')[0].swiper.destroy();
                            }
                            Ember.$("div.marker-data").show();
                            Ember.$('div.marker-content').append($content);
                            Ember.$(".active_marker").removeClass("active_marker");
                            Ember.$(this._icon).addClass('active_marker');
                            new Swiper ('.gallery', {
                                pagination: '.swiper-pagination',
                                nextButton: '.swiper-button-next',
                                prevButton: '.swiper-button-prev',
                                slidesPerView: 1,
                                paginationClickable: true,
                                spaceBetween: 30,
                                loop: true
                            });
                        });

                    }

                    var layerClass = newLayerSlug + ' atLayer vectorData map-marker layer-' + markerColor;

                    let polyStyle = {
                            'color': shapeColor(),
                            'fillColor': shapeColor(),
                            'className': layerClass

                    };

                    if(newLayerUrl){

                        var vector = new L.GeoJSON.AJAX(newLayerUrl, {
                            style: polyStyle,
                            className: layerClass,
                            pointToLayer: function (feature, latlng) {
                                var icon = L.divIcon({
                                    className: layerClass,
                                    iconSize: null,
                                    html: '<div class="shadow"></div><div class="icon"></div>',
                                });

                                var marker = L.marker(latlng, {icon: icon});
                                return marker;
                            },
                            onEachFeature: viewData,
                        });
                        vector.addTo(map);
                    }
                    break;
            }
        });
    }
});
