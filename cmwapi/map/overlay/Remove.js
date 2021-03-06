define(["cmwapi/Channels", "cmwapi/Validator"], function(Channels, Validator) {

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
     * @description The Remove module provides methods for using an overlay removal OWF Eventing channel
     * according to the [CMWAPI 1.1 Specification](http://www.cmwapi.org).  This module
     * abstracts the OWF Eventing channel mechanism from client code and validates messages
     * using specification rules.  Any errors are published
     * on the map.error channel using an {@link module:cmwapi/map/Error|Error} module.
     *
     * According to the
     * CMWAPI Specification payloads sent over the channel may require validation of individual parameters or
     * default values for omitted parameters.  Where possible, this module abstracts those rules from client code.
     * Both the send and addHandler functions will auto-fill defaults for missing parameters. Further, addHandler
     * will wrap any passed-in function with payload validation code, so that they fail fast on invalid payloads and
     * do not push bad data into any map specific handlers.  A summary of payload errors is pushed to the
     * {@link module:cmwapi/map/Error|Error} channel if that occurs.
     *
     * @version 1.1
     *
     * @exports cmwapi/map/overlay/Remove
     */
    var Remove = {

        /**
         * Send information that supports the deletion of a map overlay.
         * @param {Object|Array} data
         * @param {string} [data.overlayId] The ID of the overlay.  If a valid ID string is not specified, the sending widget's ID is used.
         */
        send: function(data) {

            var validData = Validator.validObjectOrArray( data );
            var payload = validData.payload;

            // If the data was not in proper payload structure, an Object or Array of objects,
            // note the error and return.
            if (!validData.result) {
                Error.send( OWF.getInstanceId(), Channels.MAP_OVERLAY_REMOVE, data,
                    validData.msg);
                return;
            }

            // Check all the overlay objects; fill-in any missing attributes.
            for (var i = 0; i < payload.length; i ++) {
                // The overlayId is optional; defaults to widget id if not specified.
                payload[i].overlayId = (payload[i].overlayId) ? payload[i].overlayId : OWF.getInstanceId();
            }

            // Since everything is optional, no major data validation is performed here.  Send
            // along the payload.
            if (payload.length === 1) {
                OWF.Eventing.publish(Channels.MAP_OVERLAY_REMOVE, Ozone.util.toString(payload[0]));
            }
            else {
                OWF.Eventing.publish(Channels.MAP_OVERLAY_REMOVE, Ozone.util.toString(payload));
            }

        },

        /**
         * Subscribes to the overlay remove channel and registers a handler to be called when messages
         * are published to it.
         *
         * @param {module:cmwapi/map/overlay/Remove~Handler} handler An event handler for any removal messages.
         * @return {module:cmwapi/map/overlay/Remove~Handler} The original event handler wrapped in CMWAPI payload validation code.
         *     Where appropriate default values for missing payload attributes are filled in and
         *     invalid payloads are noted on the Error channel prior to execution of the
         *     the input handler.  Invalid payloads will short-circuit execution of the provided handler.
         */
        addHandler: function(handler) {

            // Wrap their handler with validation checks for API for folks invoking outside of our calls
            var newHandler = function(sender, msg) {

                // Parse the sender and msg to JSON.
                var jsonSender = Ozone.util.parseJson(sender);
                var jsonMsg = (Validator.isString(msg)) ? Ozone.util.parseJson(msg) : msg;
                var data = (Validator.isArray(jsonMsg)) ? jsonMsg : [jsonMsg];

                for (var i = 0; i < data.length; i ++) {
                    // The overlayId is optional; defaults to widget id if not specified.
                    data[i].overlayId = (data[i].overlayId) ? data[i].overlayId : jsonSender.id;
                }

                handler(jsonSender.id, (data.length === 1) ? data[0] : data);
            };

            OWF.Eventing.subscribe(Channels.MAP_OVERLAY_REMOVE, newHandler);
            return newHandler;
        },

        /**
         * Stop listening to the channel and handling events upon it.
         */
        removeHandlers: function() {
            OWF.Eventing.unsubscribe(Channels.MAP_OVERLAY_REMOVE);
        }

        /**
         * A function for handling channel messages.
         * @callback module:cmwapi/map/overlay/Remove~Handler
         * @param {string} sender The widget sending a format message
         * @param {Object|Array} data  A data object or array of data objects.
         * @param {string} data.overlayId The ID of the overlay.
         */

    };

    return Remove;

});
