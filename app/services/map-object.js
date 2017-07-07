import Ember from 'ember';
// brining in Leaflet
/* globals L, Swiper */

// Service to hold the Leaflet object.

const {
    $,
    get,
    getProperties,
    inject: {
        service
    },
    Service,
    set
} = Ember;

export default Service.extend({

    dataColors: service(),
    vectorDetailContent: service(),

    init() {
        this._super(...arguments);
        set(this, 'map', '');
        set(this, 'leafletLayerGroup', L.layerGroup());
        set(this, 'baseMaps', {});
        set(this, 'leafletFeatureGroup', L.featureGroup());
        set(this, 'projectLayers', {
            rasters: {},
            vectors: {}
        });
        set(this, 'allBounds', L.latLngBounds());
        set(this, 'visiableRasters', false);
        set(this, 'visiableVectors', false);
    },

    createMap() {
        try {
            const atlmap = L.map('map', {
                center: [33.7489954, -84.3879824],
                zoom: 13,
                // zoomControl defaults to true
                // We add the zoom buttons just below to the top right.
                zoomControl: false
            });

            // Add some base layers
            const street = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
                maxZoom: 20,
                className: 'street base'
            });

            const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                className: 'satellite base'
            });

            const labels = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png', {
                className: 'labels base'
            });

            const greyscale = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                className: 'greyscale base'
            });

            const satellite = L.layerGroup([sat, labels]);

            set(this, 'baseMaps', {
                street,
                satellite,
                greyscale
            });

            // Zoom contorl, topright
            L.control.zoom({
                position: 'bottomleft'
            }).addTo(atlmap);

            // TODO would it be better to also track the layers as a group?
            // this.get('leafletLayerGroup').addTo(atlmap);

            // Create the object for Leafet in the mapObject service.
            this.set('map', atlmap);
            return atlmap;
        } catch(err) {
            // Map is likely already initialized
            return false;
        }
    },

    setUpProjectMap(project) {
        const { baseMaps, map } = this;
        // TODO: Move this to common remove function.
        map.on('click', () => {
            get(this, 'vectorDetailContent').removePopup();
            project.setProperties({
                showingSearch: false
            });
            $('#toggleResultsCheck').attr('checked', false);
        });

        // Add all the vector layers to the map.
        const vectors = project.get('vector_layer_project');
        vectors.forEach((vector) => {
            this.mapLayer(vector);
        });

        // Add all the raster layers to the map.
        const rasters = project.get('raster_layer_project');
        rasters.forEach((raster) => {
            this.mapLayer(raster);
        });

        map.flyTo(
            L.latLng(
                project.get('center_lat'),
                project.get('center_lng')
            ), project.get('zoom_level')
        );

        map.on('move', () => {
            project.setProperties({
                center_lat: map.getCenter().lat.toFixed(8),
                center_lng: map.getCenter().lng.toFixed(8),
                zoom_level: map.getZoom()
            });
        });

        map.on('zoom', () => {
            project.setProperties({
                zoom_level: map.getZoom()
            });
        });

        baseMaps[get(project, 'default_base_map')].addTo(map);
    },

    mapSingleLayer(layer) {
        const self = this;
        const map = get(this, 'map');
        const { markerColors, shapeColors } = get(this, 'dataColors');

        // const colorIndexes = {
        //     markerColorIndex: Math.floor(Math.random() * markerColors.length),
        //     shapeColorIndex: Math.floor(Math.random() * shapeColors.length)
        // };

        const colorValues = {
            markerColor: markerColors[Math.floor(Math.random() * markerColors.length)],
            shapeColor: shapeColors[Math.floor(Math.random() * shapeColors.length)]
        };

        switch (get(layer, 'data_type')) {
        case 'wms':
            {
                const wmsLayer = this.mapWms(layer);
                wmsLayer.addTo(map);
                layer.setProperties({
                    leaflet_object: wmsLayer
                });

                // TODO make use of this
                wmsLayer.on('load', () => {});

                break;
            }
        default:
            {
                layer.setProperties({
                    layerClass: `${get(layer, 'data-type')} map-marker vector-icon layer-${colorValues.markerColor.name}`,
                    colorName: colorValues.markerColor.name,
                    colorHex: colorValues.markerColor.hex
                });
                self.mapVector(layer);

                break;
            }
        }
        return true;
    },

    mapWms(layer, zIndex = 10) {
        const wmsLayer = L.tileLayer.wms(layer.get('url'), {
            layers: layer.get('layers'),
            format: 'image/png',
            transparent: true,
            mzxZoom: 20,
            zIndex,
            opacity: 1
        });

        this.get('leafletLayerGroup').addLayer(wmsLayer);
        this.get('projectLayers.rasters')[layer.get('slug')] = wmsLayer;

        return wmsLayer;
    },

    mapVector(layer) {
        const atlMap = get(this, 'map');
        set(layer, 'leaflet_object', L.featureGroup());
        const layerProps = getProperties(layer, 'colorHex', 'colorName', 'layerClass', 'leaflet_object', 'slug', 'title', 'features');

        const features = get(layer, 'vector_feature');
        features.forEach((feature) => {
            const featureProps = getProperties(feature, 'geometry_type', 'geojson', 'properties', 'feature_id');
            if (featureProps.properties.holc_grade) {
                const grade = featureProps.properties.holc_grade;
                if (grade === 'A') {
                    feature.setProperties({
                        colorName: 'green-500',
                        colorHex: '#4CAF50'
                    });
                } else if (grade === 'B') {
                    feature.setProperties({
                        colorName: 'blue-700',
                        colorHex: '#1E88E5'
                    });
                } else if (grade === 'C') {
                    feature.setProperties({
                        colorName: 'yellow-500',
                        colorHex: '#FFEB3B'
                    });
                } else if (grade === 'D') {
                    feature.setProperties({
                        colorName: 'red-500',
                        colorHex: '#F44336'
                    });
                }
                feature.setProperties({
                    markerDiv: `<span class='layer-list-item-icon vector-icon vector icon ${get(layer, 'data_type')} layer-${layerProps.colorName}'></span>`
                });
            } else {
                feature.setProperties({
                    colorName: layerProps.colorName,
                    colorHex: layerProps.colorHex,
                    markerDiv: `<span class='layer-list-item-icon vector-icon vector icon ${get(layer, 'data_type')} layer-${layerProps.colorName}'></span>`
                });
            }
            let newLeafletFeature = null;
            switch (featureProps.geometry_type) {
            case 'Point':
                {
                    const point = L.geoJSON(featureProps.geojson, {
                        pointToLayer(foo, latlng) {
                            const icon = L.divIcon({
                                className: `${layerProps.layerClass} ${featureProps.feature_id}`,
                                iconSize: null,
                                html: '<div class="shadow"></div><div class="icon" />'
                            });

                            newLeafletFeature = L.marker(latlng, {
                                color: get(feature, 'colorHex'),
                                icon,
                                title: layerProps.title
                            });
                            return newLeafletFeature;
                        }
                    });
                    point.on('add', () => {});
                    // point.addTo(atlMap);

                    newLeafletFeature.on('click', () => {
                        this.showDetails(feature);
                    });

                    layerProps.leaflet_object.addLayer(newLeafletFeature);
                    feature.setProperties({ leaflet_object: newLeafletFeature });

                    break;
                }
            case 'LineString':
            case 'Polygon':
            case 'MultiPolygon':
                {
                    const style = {
                        color: get(feature, 'colorHex'),
                        fillColor: get(feature, 'colorHex'),
                        className: `${layerProps.slug} layer-${get(feature, 'colorName')} ${featureProps.feature_id}`
                    };

                    newLeafletFeature = L.geoJSON(featureProps.geojson, {
                        style,
                        title: get(layer, 'title'),
                        // markerDiv: feature.markerDiv,
                        interactive: true
                    });
                    if (featureProps.geometry_type === 'MultiPolygon') {
                        newLeafletFeature.setStyle({ opacity: 0.7 });
                    }
                    newLeafletFeature.bindPopup();
                    // newLeafletFeature.addTo(atlMap);
                    newLeafletFeature.on('add', () => {
                        // Do someting to show layers are loading/loaded?
                    });
                    newLeafletFeature.on('click', (event) => {
                        event.target.closePopup();
                        this.showDetails(feature);
                    });
                    feature.setProperties({ leaflet_object: newLeafletFeature });
                    layerProps.leaflet_object.addLayer(newLeafletFeature);
                    break;
                }
            default: return true;
            }

            return true;
        });
        layerProps.leaflet_object.addTo(atlMap);
        return layerProps.leaflet_object;
    },

    mapLayer(layer) {
        const map = this.get('map');
        const layerProps = getProperties(layer, 'data_format', 'colorName', 'colorHex');
        const newLayer = layer.get(`${layerProps.data_format}_layer`);
        const newLayerProps = getProperties(newLayer, 'slug', 'data_type');

        newLayer.set('active_in_project', true);

        switch (newLayerProps.data_type) {
        case 'wms':
            {
                const wmsLayer = this.mapWms(newLayer);
                wmsLayer.addTo(map);
                wmsLayer.setZIndex(get(layer, 'position'));
                newLayer.setProperties({
                    leaflet_object: wmsLayer
                });

                // TODO make use of this
                wmsLayer.on('load', () => {});

                break;
            }

        case 'point-data':
        case 'polygon':
        case 'line-data':
        case 'dataset':
            {
                newLayer.setProperties({
                    layerClass: `${newLayerProps.slug} vectorData map-marker layer-${layerProps.colorName}`,
                    colorName: layer.get('colorName'),
                    colorHex: layer.get('colorHex')

                });
                this.mapVector(newLayer);
                break;
            }
        default:
            return true;
        }
        return true;
    },

    updateVectorStyle(vector) {
        const slug = vector.get('slug');
        const dataType = vector.get('data_type');
        vector.get('vector_feature').forEach((feature) => {
            if (dataType === 'polygon') {
                feature.get('leaflet_object').setStyle({
                    color: vector.get('colorHex'),
                    fillColor: vector.get('colorHex')
                });
            } else if (dataType === 'line-data') {
                feature.get('leaflet_object').setStyle({
                    color: vector.get('colorHex')
                });
            } else if (dataType === 'point-data') {
                // The Icon class doesn't have any methods like setStyle.
                const domClass = `.${slug}`;
                $(domClass).css('color', get(vector, 'colorHex'));
            }
        });
    },

    showDetails(properties) {
        let popupContent = properties;
        if (get(properties, 'properties.holc_id')) {
            popupContent += `<a href='https://atlmaps-data.s3.amazonaws.com/holc/${get(properties, 'properties.holc_id')}.pdf' target='_blank'><img style='float: right; box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12); padding-left: 2px;' src='https://atlmaps-data.s3.amazonaws.com/holc/${get(properties, 'properties.holc_id')}.png' /></a>`;
        }
        if (get(properties, 'youtube')) {
            popupContent += '<div class="video"><div class="video-wrapper">';
            popupContent += `<iframe src=//${get(properties, 'youtube')}?modestbranding=1&rel=0&showinfo=0&theme=light" frameborder="0" allowfullscreen></iframe>`;
            popupContent += '</div></div>';
        }
        if (get(properties, 'description')) {
            popupContent += `${get(properties, 'safe_description')}`;
        }

        // START GALLERY
        const oldSwiper = get(this, 'swiperObj');
        if (oldSwiper) {
            // If you don't remove all the slides, the next
            // gallery will start where the last one left off.
            // For example, a marker has two images and someone
            // closes it while looking at the second image. The next
            // one they open only has one. They will see a blank
            // container, but could swipe right to see the image.
            oldSwiper.removeAllSlides();
            oldSwiper.destroy({
                deleteInstance: true
            });
            set(this, 'swiperObj', null);
        }
        $('.swiper-wrapper').empty();
        if (get(properties, 'images')) {
            get(properties, 'images').forEach((image) => {
                $('.swiper-wrapper').append(`<div class="swiper-slide"><img src="${image}"></div>`);
                // $('<img />').load(() => {}).attr('src', image.url);
            });

            // if (feature.properties.images.length > 1) {
            const newSwiper = new Swiper('.swiper-container', {
                pagination: '.swiper-pagination',
                nextButton: '.swiper-button-next',
                prevButton: '.swiper-button-prev',
                slidesPerView: 1,
                paginationClickable: true,
                centeredSlides: true,
                zoom: true
            });
            set(this, 'swiperObj', newSwiper);
            // }
        }
        if (get(properties, 'image')) {
            $('.swiper-wrapper').append(`<img src="${get(properties, 'image')}">`);
        }
        // END GALLERY
        $('.active-marker').removeClass('active-marker');
        $(`.${get(properties, 'feature_id')}`).addClass('active-marker');
        $('div.vector-info').show();
        $('.vector-content.layer-icon').empty().append(get(properties, 'markerDiv'));
        $('.vector-detail-title-container .layer-title').empty().append(get(properties, 'layer_title'));
        $('.vector-detail-title-container .feature-title').empty().append(get(properties, 'name'));
        // $('.vector-content.title').empty().append(feature.properties.NAME);
        $('.vector-content.marker-content').empty().append(popupContent);
    }
});
