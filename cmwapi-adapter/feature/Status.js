define(["cmwapi/cmwapi"], function(cmwapi) {
    /**
     * @copyright © 2013 Environmental Systems Research Institute, Inc. (Esri)
     *
     * @license
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at<br>
     * <br>
     *     {@link http://www.apache.org/licenses/LICENSE-2.0}<br>
     * <br>
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * @version 1.1
     *
     * @module cmwapi-adapter/feature/Status
     */

    /**
     * @constructor
     * @param map {Object}
     * @alias module:cmwapi-adapter/feature/Status
     */
    var Status = function(overlayManager, map) {
        var me = this;

        /**
         * Handler for feature status request
         * @method handleRequest
         * @param sender {String} The id of the widgets making the request to update the feature
         * @memberof module:cmwapi-adapter/feature/Status#
         */
        me.handleRequest = function(sender) {
            var treeArray = overlayManager.getOverlayTree();
            for(var i = 0; i < treeArray.length; i++) {
                handleTree(treeArray[i]);
            }
        };
        cmwapi.feature.status.request.addHandler(me.handleRequest);

        var handleTree = function(tree) {
            for(var i = 0; i < tree.children.length; i++) {
                if(tree.children[i].type === 'feature') {
                    handleFeature(tree, tree.children[i]);
                } else {
                    handleTree(tree.children[i]);
                }
            }
        }

        var handleFeature = function(overlay, feature) {
            var format = feature.format;
            if(format === 'kml') {
                // handleKml(overlay, feature);
            } else if(format === "wms") {
                // handleWms(overlay,feature)
            } else if (format === 'arcgis-feature') {
                handleArcgisFeature(overlay, feature);
            } else if (format === 'arcgis-dynamicmapservice') {
                // handleArcgisDynamicMapService(overlay, feature);
            } else if (format === 'arcgis-imageservice') {
                // handleArcgisImageService(overlay, feature);
            }
        }

        var handleArcgisFeature = function(overlay, feature) {
            var layer = feature.esriObject;
            var fields = layer.fields;

            var toSend = [];
            for(var i = 0; i < fields.length; i++) {
                if(fields[i].type === "esriFieldTypeDouble" ||
                   fields[i].type === "esriFieldTypeInteger") {
                    toSend.push({
                        overlayId: overlay.id,
                        overlayName: overlay.name,
                        featureId: feature.id,
                        featureName: feature.name,
                        sublayerId: fields[i].name
                    });
                }
            }
            if(toSend.length > 0) {
                //console.log(cmwapi);
                cmwapi.feature.status.sublayers.send(toSend);
            }
        }

        /**
         * Handler for feature status start
         * @method handleStart
         * @param sender {String} The id of the widgets making the request to update the feature
         * @param eventTypes {Array<String>} types One or more of the
         *     {@link module:cmwapi/Validator/SUPPORTED_EVENT_TYPES|SUPPORTED_EVENT_TYPES} values.
         * @param overlayId {String}
         * @param featureId {String}
         * @param [subfeatureId] {String}
         * @memberof module:cmwapi-adapter/feature/Status#
         */
        me.handleStart = function(sender, eventTypes, overlayId, featureId, subfeatureId) {
            var overlay = overlayManager.overlays[overlayId];
            if(!overlay) {
                var msg = "Overlay not found with id " + overlayId;
                sendError(sender, msg, {type: "map.feature.status.start", msg: msg});
            } else {
                var feature = overlay.features[featureId];
                if(!feature) {
                    var msg = "Feature not found with id " + featureId;
                    sendError(sender, msg, {type: "map.feature.status.start", msg: msg});
                } else {
                    //find sublayer
                    //sublayer.on[EventType](report);
                    console.log("need to look for sublayer")

                    if(feature.format === "arcgis-feature") {
                        feature.esriObject.gaugeHandler = feature.esriObject.on('mouse-over', function(mouseEvent) {
                            console.log(mouseEvent.graphic.attributes[subfeatureId]);
                            cmwapi.feature.status.report.send({
                                overlayId: overlayId,
                                featureId: featureId,
                                subfeatureId: subfeatureId,
                                featureValue: mouseEvent.graphic.attributes[subfeatureId]
                            });
                        });
                    }
                }
            }
        };
        cmwapi.feature.status.start.addHandler(me.handleStart);

        /**
         * Handler for feature status stop
         * @method handleStop
         * @param sender {String} The id of the widgets making the request to update the feature
         * @param eventTypes {Array<String>} types One or more of the
         *     {@link module:cmwapi/Validator/SUPPORTED_EVENT_TYPES|SUPPORTED_EVENT_TYPES} values.
         * @param overlayId {String}
         * @param featureId {String}
         * @param subfeatureId {String}
         * @memberof module:cmwapi-adapter/feature/Status#
         */
        me.handleStop = function(sender, eventTypes, overlayId, featureId, subfeatureId) {
            //need to pull a reference to the handler described by the params
            //handler.removeEvent();
            var overlay = overlayManager.overlays[overlayId];
            if(!overlay) {
                var msg = "Overlay not found with id " + overlayId;
                sendError(sender, msg, {type: "map.feature.status.start", msg: msg});
            } else {
                var feature = overlay.features[featureId];
                if(!feature) {
                    var msg = "Feature not found with id " + featureId;
                    sendError(sender, msg, {type: "map.feature.status.start", msg: msg});
                } else {
                    //find sublayer
                    //sublayer.on[EventType](report);
                    console.log("need to look for sublayer")
                    if(feature.format === "arcgis-feature") {
                        feature.esriObject.gaugeHandler.remove();
                        delete feature.esriObject.gaugeHandler;
                    }
                }
            }
        };
        cmwapi.feature.status.stop.addHandler(me.handleStop);
    };

    return Status;
});