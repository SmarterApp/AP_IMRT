/**
 * Builds a JSON payload for an ISS search request.
 */
var SearchPayloadBuilder = function () {
    var sortDirections = ["asc", "desc"];

    /**
     * Define the available search properties and their selectable values, if they have any.  The 'weight' value comes
     * from how often each filter was used in the SBAC production environment.  In the event a filter was never used,
     * its weight has been assigned to 1.
     */
    var searchProperties = [
        { name: "id", type: "match", weight: 9419 },
        { name: "stimulusId", type: "match", weight: 1360 },
        { name: "subject", type: "match", weight: 2442, supportsBlanks: true, values: ["ELA", "MATH"] },
        { name: "type", type: "match", weight: 687, supportsBlanks: false, values: ["eq", "ebsr", "gi", "htqo", "htqs", "mc", "mi", "ms", "sa", "ti", "wer", "stim", "tut"] },
        { name: "createDate", type: "dateRange", weight: 13, supportsBlanks: false },
        { name: "updateDate", type: "dateRange", weight: 1, supportsBlanks: false },
        { name: "createdBy", type: "contains", weight: 30, supportsBlanks: false },
        { name: "isBeingCreated", type: "boolean", weight: 244, supportsBlanks: false, values: [true, false] },
        { name: "workflowStatus", type: "match", weight: 2921, supportsBlanks: false, values: ["Draft", "InitialReview", "MultimediaUpload", "ContentReview", "EditorialReview", "SeniorContentReview", "SmarterContentAuditReview", "SmarterStudentSupportAuditReview", "EducatorCommitteeReview", "QualityCorrectionsContent", "QualityCorrectionsEditorial", "QualityCorrectionsSenior", "SmarterContentReview", "SmarterAccessibilityReview", "SmarterCopyEdit", "TextToSpeechUpload", "AccessibilityUpload", "AccessibilityReview", "FinalApproval", "FieldTest", "Calibrations", "DataReview", "PostFieldTestCorrections", "Operational", "Released", "Archived", "Rejected", "ParkingLot"] },
        { name: "workflowStatusUpdatedDate", type: "dateRange", weight: 81, supportsBlanks: false },
        { name: "daysInWorkflowStatus", type: "integerRange", weight: 3, supportsBlanks: false },
        { name: "associatedItemCount", type: "integerRange", weight: 1, supportsBlanks: false },
        { name: "englishPassagesCount", type: "integerRange", weight: 1, supportsBlanks: false },
        { name: "spanishPassagesCount", type: "integerRange", weight: 1, supportsBlanks: false },
        { name: "intendedGrade", type: "match", weight: 1405, supportsBlanks: true, values: ["3", "4", "5", "6", "7", "8", "11"] },
        { name: "primaryClaim", type: "match", weight: 1189, supportsBlanks: true, values: ["1", "2", "3", "4"] },
        { name: "primaryTarget", type: "match", weight: 200, supportsBlanks: true, values: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"] },
        { name: "contentTaskModel", type: "match", weight: 15, supportsBlanks: true },
        { name: "depthOfKnowledge", type: "match", weight: 1, supportsBlanks: true, values: ["1", "2", "3", "4"] },
        { name: "writingPurpose", type: "match", weight: 17, supportsBlanks: true, values: ["Narrative", "InformationalExplanatory", "OpinionArgumentative"] },
        { name: "primaryContentDomain", weight: 1, supportsBlanks: true, type: "contains" },
        { name: "primaryCommonCoreStandard", weight: 1, supportsBlanks: true, type: "contains" },
        { name: "secondaryClaim", type: "match", weight: 3, supportsBlanks: true, values: ["1", "2", "3", "4"] },
        { name: "secondaryTarget", type: "match", weight: 1, supportsBlanks: true, values: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"] },
        { name: "secondaryContentDomain", type: "contains", weight: 1, supportsBlanks: true },
        { name: "secondaryCommonCoreStandard", type: "contains", weight: 1, supportsBlanks: true },
        { name: "tertiaryClaim", type: "match", weight: 1, supportsBlanks: true, values: ["1", "2", "3", "4"] },
        { name: "tertiaryTarget", type: "match", weight: 1, supportsBlanks: true, values: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"] },
        { name: "tertiaryContentDomain", weight: 1, type: "contains", supportsBlanks: true },
        { name: "tertiaryCommonCoreStandard", weight: 1, type: "contains", supportsBlanks: true },
        { name: "quaternaryClaim", type: "match", weight: 1, supportsBlanks: true, values: ["1", "2", "3", "4"] },
        { name: "quaternaryTarget", type: "match", weight: 1, supportsBlanks: true, values: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"] },
        { name: "quaternaryContentDomain", type: "contains", weight: 1, supportsBlanks: true },
        { name: "quaternaryCommonCoreStandard", type: "contains", weight: 1, supportsBlanks: true },
        { name: "scoringEngine", type: "match", weight: 1, supportsBlanks: true, values: ["AutomaticWithKey", "AutomaticWithKeys", "AutomaticWithRubric", "HandScored"] },
        { name: "allowCalculator", type: "match", weight: 1, supportsBlanks: true, values: ["Yes", "No", "Neutral"] },
        { name: "testCategory", type: "match", weight: 1, supportsBlanks: true, values: ["Interim", "Practice", "Summative"] },
        { name: "performanceTask", type: "match", weight: 1, supportsBlanks: true, values: ["Yes", "No"] },
        { name: "organizationTypeId", type: "match", weight: 1069, supportsBlanks: true, values: ["Member", "Vendor", "Non-Member", "Smarter Balanced"] },
        { name: "organizationName", type: "contains", weight: 266, supportsBlanks: true },
        { name: "itemAuthor", type: "contains", weight: 213, supportsBlanks: true },
        { name: "isAslProvided", type: "match", weight: 1, supportsBlanks: false, values: ["Yes", "No"] },
        { name: "isAslRequired", type: "match", weight: 1, supportsBlanks: false, values: ["Yes", "No"] },
        { name: "isBrailleProvided", type: "match", weight: 1, supportsBlanks: false, values: ["Yes", "No"] },
        { name: "isBrailleRequired", type: "match", weight: 1, supportsBlanks: false, values: ["Yes", "No"] },
        { name: "isClosedCaptioningProvided", type: "match", weight: 1, supportsBlanks: false, values: ["Yes", "No"] },
        { name: "isClosedCaptioningRequired", type: "match", weight: 1, supportsBlanks: false, values: ["Yes", "No"] },
        { name: "isTranslationProvided", type: "match", weight: 1, supportsBlanks: false, values: ["Yes", "No"] },
        { name: "isTranslationRequired", type: "match", weight: 1, supportsBlanks: false, values: ["Yes", "No"] },
        { name: "isSightTTSProvided", type: "boolean", weight: 1, supportsBlanks: false, values: [true, false] },
        { name: "isVisualTTSProvided", type: "boolean", weight: 1, supportsBlanks: false, values: [true, false] },
        { name: "isVisualTTSRequired", type: "match", weight: 1, supportsBlanks: false, values: ["Yes", "No"] },
        { name: "englishContentLastUpdatedDate", type: "dateRange", weight: 1, supportsBlanks: false },
        { name: "spanishContentLastUpdatedDate", type: "dateRange", weight: 1, supportsBlanks: false },
        { name: "isAslUploadedPriorToLastContentUpdate", type: "boolean", weight: 1, supportsBlanks: false, values: [true, false] },
        { name: "isBrailleUploadedPriorToLastContentUpdate", type: "boolean", weight: 1, supportsBlanks: false, values: [true, false] },
        { name: "isClosedCaptioningUploadedPriorToLastContentUpdate", type: "boolean", weight: 1, supportsBlanks: false, values: [true, false] },
        { name: "isContentChangedAfterOperational", type: "boolean", weight: 1, supportsBlanks: false, values: [true, false] },
        { name: "hasUnresolvedUpdateNeed", type: "boolean", weight: 1, supportsBlanks: false, values: [true, false] },
        { name: "currentUpdateNeedCreatedDate", type: "dateRange", weight: 1, supportsBlanks: false },
        { name: "currentUpdateNeedInternalResolution", type: "match", weight: 1, supportsBlanks: true, values: ["NoAction", "DoNotScore", "DeactivateReject", "DeactivateFieldTest", "UpdateContentRedeploy"] },
        { name: "currentUpdateNeedInternalResolutionDate", type: "dateRange", weight: 1, supportsBlanks: true },
        { name: "currentUpdateNeedResolution", type: "match", weight: 1, supportsBlanks: true, values: ["NoAction", "DoNotScore", "DeactivateReject", "DeactivateFieldTest", "UpdateContentRedeploy"] },
        { name: "currentUpdateNeedResolutionDate", type: "dateRange", weight: 1, supportsBlanks: false },
        { name: "calculatedExposuresCount", type: "integerRange", weight: 1, supportsBlanks: true },
        { name: "calculatedFormCount", type: "integerRange", weight: 1, supportsBlanks: true },
        { name: "itemDifficultyQuintile", type: "integerRange", weight: 10, supportsBlanks: true },
        { name: "formType", type: "match", weight: 1, supportsBlanks: true, values: ["Operational", "FieldTest"] },
        { name: "assessmentType", type: "match", weight: 3, supportsBlanks: true, values: ["Interim", "Practice", "Summative", "SummativePaperPencil"] },
    ];

    /**
     * Create a JSON payload with filter(s), sort and page content for an ISS search request.
     *
     * @return {Object} JSON for a search request payload
     */
    getPayload = function() {
        var payload = {};

        payload.filters = getFilters(getRandomIntFromInterval(1, 3), searchProperties);
        payload.sort = getSort(payload.filters[0]);
        payload.page = getPage(getRandomIntFromInterval(0, 10), 100);

        return payload;
    },

    /**
     * Get a collection of filters for the search request payload.
     *
     * @param  {Number} quantity The number of filters to generate
     * @return {Array}           The collection of filters that were created.
     */
    getFilters = function(quantity, searchProperties) {
        var totalWeight = getTotalWeight(searchProperties);
        var filters = [];

        for (var i = 0; i < quantity; i++) {
            var searchProperty = getWeightedValueFromArray(getRandomIntFromInterval(1, totalWeight), searchProperties);

            var filter = getFilter(searchProperty);
            if (filter.property) {
                filters.push(filter);
            }

            searchProperties = searchProperties.filter(function(e) { return e.name !== searchProperty.name });
        }

        return filters;
    },

    /**
     * Get a page object for a search request.
     *
     * @param  {Number} number The page number (zero-based)
     * @param  {Number} size   The number of records to include in a page
     * @return {Object}        A page object with the page number and page size
     */
    getPage = function(number, size) {
        return {
            pageNumber: number,
            pageSize: size
        };
    },

    /**
     * Get a sort object for a filter.  The sort direction will be randomly
     * selected.
     *
     * @param  {Object} filter The filter to sort
     * @return {Object}        A sort object for the filter's property
     */
    getSort = function(filter) {
        return {
            property: filter.property,
            direction: getRandomValueFromArray(sortDirections)
        };
    },

    /**
     * Get a filter based on the search property that was selected
     *
     * @param {Object} searchProperty The search property on which the filter should be applied
     */
    getFilter = function(searchProperty) {
        var filter = {
            property: searchProperty.name
        };

        switch (searchProperty.type) {
            case "match":
            case "contains":
                var filterValues = [];
                // If the match filter has some pre-defined values to choose from, then choose some of those.
                // Otherwise, get some numbers that are between the min and max `id` column in the item table and use
                // those.
                if (searchProperty.values) {
                    var numberOfValues = getRandomIntFromInterval(1, searchProperty.values.length);
                    for (var i = 0; i < numberOfValues; i++) {
                        filterValues.push(getRandomValueFromArray(searchProperty.values));
                    }
                } else {
                    var numberOfValues = getRandomIntFromInterval(1, 100);
                    for (var i = 0; i < numberOfValues; i++) {
                        filterValues.push(getRandomIntFromInterval(214, 1669943127));
                    }
                }

                filter.values = filterValues;
                break;
            case "integerRange":
                var min = getRandomIntFromInterval(0, 10);
                var max = getRandomIntFromInterval(11, 30);
                filter.min = min;
                filter.max = max;
                break;
            case "boolean":
                filter.value = getRandomValueFromArray(searchProperty.values);
                break;
            case "dateRange":
                filter.from = getRandomDate(new Date(2018, 0, 1), 100);
                filter.to = getRandomDate(filter.from, 100);
                break;
            default:
                break;
        }

        if (searchProperty.supportsBlanks) {
            filter.includeBlanks = getRandomIntFromInterval(0, 1) === 1;
        }

        return filter;
    },

    /**
     * Choose a random value from an array.
     *
     * @param  {Array} values The array of possible values to choose from
     * @return {Object}       The value that was chosen
     */
    getRandomValueFromArray = function(values) {
        return values[getRandomIntFromInterval(0, values.length - 1)];
    },

    /**
     * Get a random number between a lower and upper bound.
     *
     * @param  {Number} min The lower-bound of the number range
     * @param  {Number} max The upper-bound of the number range
     * @return {Number}     The number chosen between the lower and upper bound
     */
    getRandomIntFromInterval = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },

    /**
     * Get a random date within a certain number of days after the provided start date
     *
     * @param  {Date} startDate      The minimum date after which the random date should be generated
     * @param  {Number} numberOfDays The maximum number of days after the start date the random date can be
     * @return {Date}                A date between the start date and start date + number of days
     */
    getRandomDate = function(startDate, numberOfDays) {
        return new Date(startDate.getTime() + (Math.random() * numberOfDays * 24 * 60 * 60 * 1000));
    },

    /**
     * Select an item from a collection based on its weight.
     *
     * @param  {Number} weightSelector    The weight of the item to select
     * @param  {Array} weightedCollection The weighted collection to choose an element from
     * @return {Object}                   The weighted item
     */
    getWeightedValueFromArray = function(weightSelector, weightedCollection) {
        for (var i = 0; i < weightedCollection.length; i++) {
            weightSelector -= weightedCollection[i].weight;
            if (weightSelector <= 0) {
                return weightedCollection[i];
            }
        }

        return {};
    },

    /**
     * Get the total weight of all search properties for use in weighted selection.
     *
     * @return {Number} The sum of the weight property from all search properties
     */
    getTotalWeight = function(weightedCollection) {
        var weightAggregate = 0;
        for (var i = 0; i < weightedCollection.length; i++) {
            weightAggregate += weightedCollection[i].weight;
        }

        return weightAggregate;
    };

    return {
        build: getPayload
    };
}();

// Build a search request payload and add it to jmeters' global variables, allowing it to be accessed by other
// components withiin the jmeter test (e.g. the search request execution sampler).  Need to call JSON.stringify here
// so the payload is handled correctly by jmeter.  Without the JSON.stringify, jmeter sees the search request payload
// object as [Object Object]
vars.put("searchPayload", JSON.stringify(SearchPayloadBuilder.build()));