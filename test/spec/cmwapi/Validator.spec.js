define(["cmwapi/Validator"], function(Validator) {

    describe("Channels tests.", function() {

        describe("Verify the validator ", function() {

            it("validates the CMWAPI 1.1 allowed request types.", function() {
                var types = ['about', 'format', 'view'];
                var results = Validator.validRequestTypes(types);
                expect(results.result).toBe(true);
            });

            it("fails incorrect CMWAPI 1.1 allowed request types.", function() {
                var results = Validator.validRequestTypes(['ghi']);

                expect(results.result).toBe(false);
            });

            it("validates the CMWAPI 1.1 allowed map types.", function() {
                var types = ['2-D', '3-D', 'other'];
                var results = Validator.validMapType(types[0]);
                expect(results.result).toBe(true);

                results = Validator.validMapType(types[1]);
                expect(results.result).toBe(true);

                results = Validator.validMapType(types[2]);
                expect(results.result).toBe(true);
            });

            it("fails incorrect CMWAPI 1.1 allowed map types.", function() {
                var results = Validator.validMapType(['ghi']);

                expect(results.result).toBe(false);
            });

            it("validates undefined objects for payloads and returns a payload array of a single empty object", function() {
                var results = Validator.validObjectOrArray();

                expect(results.result).toBe(true);
                expect(results.payload.length).toEqual(1);
            });

            it("validates an object as a valid payload and returns a payload array of one element", function() {
                var results = Validator.validObjectOrArray({overlayId: 'myOverlayId'});

                expect(results.result).toBe(true);
                expect(results.payload.length).toEqual(1);
                expect(results.payload[0].overlayId).toEqual("myOverlayId");
            });

            it("validates an object array as a valid payload and returns that as the payload", function() {
                var results = Validator.validObjectOrArray([{
                    overlayId: 'myOverlayId1'
                },{
                    overlayId: 'myOverlayId2'
                }]);

                expect(results.result).toBe(true);
                expect(results.payload.length).toEqual(2);
                expect(results.payload[0].overlayId).toEqual("myOverlayId1");
                expect(results.payload[1].overlayId).toEqual("myOverlayId2");
            });

            it("does not validate non objects or object arrays as payloads", function() {
                var results = Validator.validObjectOrArray(1);

                expect(results.result).toBe(false);
                expect(results.msg).not.toBeUndefined();
            });

        });
    });
});