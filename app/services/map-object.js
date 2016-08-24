import Ember from 'ember';

/* globals L */

// Service to hold the Leaflet object.

const {
    inject: {
        service
    },
    Service
} = Ember;

export default Service.extend({

    dataColors: service(),
    vectorDetailContent: service(),

    init() {
        this._super(...arguments);
        this.set('map', '');
        this.set('leafletGroup', L.layerGroup());
        this.set('projectLayers', {});
    },

    createMap(project) {
        try {
            // Add some base layers
            let street = L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors Georgia State University and Emory University'
            });

            let satellite = L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/{type}/{mapID}/{scheme}/{z}/{x}/{y}/{size}/{format}?app_id={app_id}&app_code={app_code}&lg={language}', {
                attribution: 'Map &copy; 2016 <a href="http://developer.here.com">HERE</a>',
                subdomains: '1234',
                base: 'aerial',
                type: 'maptile',
                scheme: 'satellite.day',
                app_id: '1Igi60ZMWDeRNyjXqTZo',
                app_code: 'eA64oCoCX3KZV8bwLp92uQ',
                mapID: 'newest',
                maxZoom: 20,
                language: 'eng',
                format: 'png8',
                size: '256'
            });

            let _map = L.map('map', {
                center: [33.7489954, -84.3879824],
                zoom: 13,
                // zoomControl is a Boolean
                // We add the zoom buttons just below to the top right.
                zoomControl: false,
                layers: [satellite, street]
            });

            Ember.$(satellite.getContainer()).addClass('satellite').addClass('base');
            Ember.$(street.getContainer()).addClass('street').addClass('base');

            // Layer contorl, topright
            L.control.zoom({
                position: 'topright'
            }).addTo(_map);

            // this.get('leafletGroup').addTo(_map);

            _map.on('click', function() {
                // Ember.$("div.info").remove();
                Ember.$('div.vector-info').hide();
                Ember.$('.active_marker').removeClass('active_marker');
                Ember.$('.vector-content.marker-content').empty();
                project.setProperties({
                    showing_browse_results: false
                });
                // this.send('activateVectorCard');
            });

            // let baseMaps = {
            //     "satellite": satellite,
            //     "street": osm
            // }
            //
            // L.control.layers(baseMaps,null).addTo(_map);
            // Create the object for Leafet in the mapObject service.
            this.set('map', _map);
            // Add all the vector layers to the map.
            let _this = this;
            project.get('vector_layer_project_ids').then(function(vectors) {
                vectors.forEach(function(vector) {
                    _this.mapLayer(vector);
                });
            });

            // Add all the raster layers to the map.
            project.get('raster_layer_project_ids').then(function(rasters) {
                rasters.forEach(function(raster) {
                    _this.mapLayer(raster);
                });
            });

            _map.flyTo(L.latLng(project.get('center_lat'), project.get('center_lng')), project.get('zoom_level'));
            Ember.$('.base').hide();
            Ember.$('.' + project.get('default_base_map')).show();
            return _map;
        } catch (err) {
            // Map is likely already initialized
        }
    },

    mapLayer(layer) {
        let _this = this;
        let map = this.get('map');
        let zIndex = layer.get('position') + 10;

        layer.get(layer.get('data_format') + '_layer_id').then(function(newLayer) {

            let newLayerName = newLayer.get('name');
            let newLayerTitle = newLayer.get('title');
            let newLayerSlug = newLayer.get('slug');
            let dataType = newLayer.get('data_type');
            // let newLayerInst = newLayer.get('institution.geoserver');
            // let newLayerWorkspace = newLayer.get('workspace');
            let newLayerUrl = newLayer.get('url');
            newLayer.set('active_in_project', true);

            switch (dataType) {

                case 'planningatlanta':

                    let tile = L.tileLayer('http://static.library.gsu.edu/ATLmaps/tiles/' + newLayerName + '/{z}/{x}/{y}.png', {
                        layer: newLayerSlug,
                        tms: true,
                        minZoom: 13,
                        maxZoom: 19,
                        detectRetina: true
                    }).addTo(map).setZIndex(10).getContainer();

                    Ember.$(tile).addClass(newLayerSlug).addClass('wmsLayer').addClass('atLayer').css('zIndex', zIndex);

                    break;

                case 'atlTopo':

                    let topoTile = L.tileLayer('http://disc.library.emory.edu/atlanta1928topo/tilesTopo/{z}/{x}/{y}.jpg', {
                        layer: newLayerSlug,
                        tms: true,
                        minZoom: 13,
                        maxZoom: 19,
                        detectRetina: true,
                        errorTileUrl: 'http://inspiresara.com/wp-content/uploads/2015/04/Peanut-butter-jelly-time.gif'
                    }).addTo(map).setZIndex(10).getContainer();

                    Ember.$(topoTile).addClass(newLayerSlug).addClass('wmsLayer').addClass('atLayer').css('zIndex', zIndex);

                    break;

                case 'wms':
                    let wmsLayer = L.tileLayer.wms(newLayerUrl, {
                        layers: newLayer.get('layers'),
                        format: 'image/png',
                        transparent: true,
                        maxZoom: 20,
                        // detectRetina: true,
                        className: newLayerSlug,
                        zIndex: zIndex,
                        opacity: 1
                    });

                    // let layerObj = {name: newLayerSlug, mapObj: wmsLayer};
                    // layerObj[newLayerSlug] = wmsLayer;
                    _this.get('projectLayers')[newLayerSlug] = wmsLayer;

                    _this.get('leafletGroup').addLayer(wmsLayer);
                    wmsLayer.addTo(map);

                    // Ember.$(wmsLayer.getContainer()).addClass(newLayerSlug).addClass('atLayer').css("zIndex", zIndex);

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

                    switch (dataType) {
                        case 'point-data':
                            let markerColors = _this.get('dataColors.markerColors');
                            newLayer.setProperties({
                                color_name: markerColors[layer.get('marker')].name,
                                color_hex: markerColors[layer.get('marker')].hex

                            });
                            let layerClass = newLayerSlug + ' atLayer vectorData map-marker layer-' + newLayer.get('color_name');
                            let markerDiv = '<span class="map-marker vector-icon vector ' + dataType + ' layer-' + newLayer.get('color_name') + '"></span>';
                            if (newLayerUrl) {
                                let points = new L.GeoJSON.AJAX(newLayerUrl, {
                                    pointToLayer: function(feature, latlng) {
                                        let icon = L.divIcon({
                                            className: layerClass,
                                            iconSize: null,
                                            html: '<div class="shadow"></div><div class="icon"></div>'
                                        });

                                        let marker = L.marker(latlng, {
                                            icon: icon,
                                            title: newLayerTitle,
                                            markerDiv: markerDiv
                                        });

                                        return marker;
                                    },

                                    onEachFeature: _this.get('vectorDetailContent.viewData')
                                });
                                _this.get('projectLayers')[newLayerSlug] = points;
                                points.addTo(map);
                            }
                            break;

                        case 'polygon':
                        case 'line-data':

                            let shapeColors = _this.get('dataColors.shapeColors');
                            newLayer.setProperties({
                                color_name: shapeColors[layer.get('marker')].name,
                                color_hex: shapeColors[layer.get('marker')].hex

                            });
                            // let layerClass = newLayerSlug + ' atLayer vectorData map-marker layer-' + newLayer.get('color_name');
                            let shapeLayerClass = newLayerSlug + ' vectorData map-marker layer-' + newLayer.get('color_name');
                            let vectorDiv = '<div class="map-marker vector-icon vector pull-left ' + dataType + ' layer-' + newLayer.get('color_name') + '"></div>';

                            let polyStyle = {
                                'color': newLayer.get('color_hex'),
                                'fillColor': newLayer.get('color_hex'),
                                'className': shapeLayerClass

                            };
                            if (newLayerUrl) {
                                let content = _this.get('vectorDetailContent.viewData');
                                let vector = new L.GeoJSON.AJAX(newLayerUrl, {
                                    style: polyStyle,
                                    className: shapeLayerClass,
                                    title: newLayerTitle,
                                    markerDiv: vectorDiv,
                                    onEachFeature: content
                                });
                                _this.get('projectLayers')[newLayerSlug] = vector;
                                vector.addTo(map);
                            }
                            break;
                    }
                    break;
            }
        });
    },

    updateVectorStyle(vector) {
        let slug = vector.get('slug');
        let dataType = vector.get('data_type');
        if (dataType === 'polygon') {
            this.get('projectLayers')[slug].setStyle({
                color: vector.get('color_hex'),
                fillColor: vector.get('color_hex')
            });
        } else if (dataType === 'line-data') {
            this.get('projectLayers')[slug].setStyle({
                color: vector.get('color_hex')
            });
        } else if (dataType === 'point-data') {
            // The Icon class doesn't have any methods like setStyle.
            Ember.$('.leaflet-marker-icon.' + slug).css({
                color: vector.get('color_hex')
            });
        }
    }
});
