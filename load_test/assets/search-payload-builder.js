vars.put(SearchPayloadBuilder.build());

/**
 * Builds a JSON payload for an ISS search request.
 */
var SearchPayloadBuilder = function () {
    var sortDirections = ["asc", "desc"];
    var searchProperties = [
        { name: "id", type: "match" },
        { name: "stimulusId", type: "match" },
        { name: "subject", type: "match", supportsBlanks: true, values: ["ELA", "MATH"] },
        { name: "type", type: "match", supportsBlanks: false, values: ["eq", "ebsr", "gi", "htqo", "htqs", "mc", "mi", "ms", "sa", "ti", "wer", "stim", "tut"] },
        { name: "createDate", type: "dateRange", supportsBlanks: false },
        { name: "updateDate", type: "dateRange", supportsBlanks: false },
        { name: "createdBy", type: "contains", supportsBlanks: false },
        { name: "isBeingCreated", type: "boolean", supportsBlanks: false, values: [true, false] },
        { name: "workflowStatus", type: "match", supportsBlanks: false, values: ["Draft", "InitialReview", "MultimediaUpload", "ContentReview", "EditorialReview", "SeniorContentReview", "SmarterContentAuditReview", "SmarterStudentSupportAuditReview", "EducatorCommitteeReview", "QualityCorrectionsContent", "QualityCorrectionsEditorial", "QualityCorrectionsSenior", "SmarterContentReview", "SmarterAccessibilityReview", "SmarterCopyEdit", "TextToSpeechUpload", "AccessibilityUpload", "AccessibilityReview", "FinalApproval", "FieldTest", "Calibrations", "DataReview", "PostFieldTestCorrections", "Operational", "Released", "Archived", "Rejected", "ParkingLot"] },
        { name: "workflowStatusUpdatedDate", type: "dateRange", supportsBlanks: false },
        { name: "daysInWorkflowStatus", type: "integerRange", supportsBlanks: false },
        { name: "associatedItemCount", type: "integerRange", supportsBlanks: false },
        { name: "englishPassagesCount", type: "integerRange", supportsBlanks: false },
        { name: "spanishPassagesCount", type: "integerRange", supportsBlanks: false },
        { name: "intendedGrade", type: "match", supportsBlanks: true, values: ["3", "4", "5", "6", "7", "8", "11"] },
        { name: "primaryClaim", type: "match", supportsBlanks: true, values: ["1", "2", "3", "4"] },
        { name: "primaryTarget", type: "match", supportsBlanks: true, values: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"] },
        { name: "contentTaskModel", type: "match", supportsBlanks: true },
        { name: "depthOfKnowledge", type: "match", supportsBlanks: true, values: ["1", "2", "3", "4"] },
        { name: "writingPurpose", type: "match", supportsBlanks: true, values: ["Narrative", "InformationalExplanatory", "OpinionArgumentative"] },
        { name: "primaryContentDomain", supportsBlanks: true, type: "contains" },
        { name: "primaryCommonCoreStandard", supportsBlanks: true, type: "contains" },
        { name: "secondaryClaim", type: "match", supportsBlanks: true, values: ["1", "2", "3", "4"] },
        { name: "secondaryTarget", type: "match", supportsBlanks: true, values: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"] },
        { name: "secondaryContentDomain", type: "contains", supportsBlanks: true },
        { name: "secondaryCommonCoreStandard", type: "contains", supportsBlanks: true },
        { name: "tertiaryClaim", type: "match", supportsBlanks: true, values: ["1", "2", "3", "4"] },
        { name: "tertiaryTarget", type: "match", supportsBlanks: true, values: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"] },
        { name: "tertiaryContentDomain", type: "contains", supportsBlanks: true },
        { name: "tertiaryCommonCoreStandard", type: "contains", supportsBlanks: true },
        { name: "quaternaryClaim", type: "match", supportsBlanks: true, values: ["1", "2", "3", "4"] },
        { name: "quaternaryTarget", type: "match", supportsBlanks: true, values: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"] },
        { name: "quaternaryContentDomain", type: "contains", supportsBlanks: true },
        { name: "quaternaryCommonCoreStandard", type: "contains", supportsBlanks: true },
        { name: "scoringEngine", type: "match", supportsBlanks: true, values: ["AutomaticWithKey", "AutomaticWithKeys", "AutomaticWithRubric", "HandScored"] },
        { name: "allowCalculator", type: "match", supportsBlanks: true, values: ["Yes", "No", "Neutral"] },
        { name: "testCategory", type: "match", supportsBlanks: true, values: ["Interim", "Practice", "Summative"] },
        { name: "performanceTask", type: "match", supportsBlanks: true, values: ["Yes", "No"] },
        { name: "organizationTypeId", type: "match", supportsBlanks: true, values: ["Member", "Vendor", "Non-Member", "Smarter Balanced"] },
        { name: "organizationName", type: "contains", supportsBlanks: true },
        { name: "itemAuthor", type: "contains", supportsBlanks: true },
        { name: "isAslProvided", type: "match", supportsBlanks: false, values: ["Yes", "No"] },
        { name: "isAslRequired", type: "match", supportsBlanks: false, values: ["Yes", "No"] },
        { name: "isBrailleProvided", type: "match", supportsBlanks: false, values: ["Yes", "No"] },
        { name: "isBrailleRequired", type: "match", supportsBlanks: false, values: ["Yes", "No"] },
        { name: "isClosedCaptioningProvided", type: "match", supportsBlanks: false, values: ["Yes", "No"] },
        { name: "isClosedCaptioningRequired", type: "match", supportsBlanks: false, values: ["Yes", "No"] },
        { name: "isTranslationProvided", type: "match", supportsBlanks: false, values: ["Yes", "No"] },
        { name: "isTranslationRequired", type: "match", supportsBlanks: false, values: ["Yes", "No"] },
        { name: "isSightTTSProvided", type: "boolean", supportsBlanks: false, values: [true, false] },
        { name: "isVisualTTSProvided", type: "boolean", supportsBlanks: false, values: [true, false] },
        { name: "isVisualTTSRequired", type: "match", supportsBlanks: false, values: ["Yes", "No"] },
        { name: "englishContentLastUpdatedDate", type: "dateRange", supportsBlanks: false },
        { name: "spanishContentLastUpdatedDate", type: "dateRange", supportsBlanks: false },
        { name: "isAslUploadedPriorToLastContentUpdate", type: "boolean", supportsBlanks: false, values: [true, false] },
        { name: "isBrailleUploadedPriorToLastContentUpdate", type: "boolean", supportsBlanks: false, values: [true, false] },
        { name: "isClosedCaptioningUploadedPriorToLastContentUpdate", type: "boolean", supportsBlanks: false, values: [true, false] },
        { name: "isContentChangedAfterOperational", type: "boolean", supportsBlanks: false, values: [true, false] },
        { name: "hasUnresolvedUpdateNeed", type: "boolean", supportsBlanks: false, values: [true, false] },
        { name: "currentUpdateNeedCreatedDate", type: "dateRange", supportsBlanks: false },
        { name: "currentUpdateNeedInternalResolution", type: "match", supportsBlanks: true, values: ["NoAction", "DoNotScore", "DeactivateReject", "DeactivateFieldTest", "UpdateContentRedeploy"] },
        { name: "currentUpdateNeedInternalResolutionDate", type: "dateRange", supportsBlanks: true },
        { name: "currentUpdateNeedResolution", type: "match", supportsBlanks: true, values: ["NoAction", "DoNotScore", "DeactivateReject", "DeactivateFieldTest", "UpdateContentRedeploy"] },
        { name: "currentUpdateNeedResolutionDate", type: "dateRange", supportsBlanks: false },
        { name: "calculatedExposuresCount", type: "integerRange", supportsBlanks: true },
        { name: "calculatedFormCount", type: "integerRange", supportsBlanks: true },
        { name: "itemDifficultyQuintile", type: "integerRange", supportsBlanks: true },
        { name: "formType", type: "match", supportsBlanks: true, values: ["Operational", "FieldTest"] },
        { name: "assessmentType", type: "match", supportsBlanks: true, values: ["Interim", "Practice", "Summative", "SummativePaperPencil"] },
    ];

    /**
     * Create a JSON payload with filter(s), sort and page content for an ISS search request.
     *
     * @return {Object} JSON for a search request payload
     */
    getPayload = function() {
        var payload = {};

        payload.filters = getFilters(getRandomIntFromInterval(1, 3));;
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
    getFilters = function(quantity) {
        var filters = [];
        for (var i = 0; i < quantity; i++) {
            var searchProperty = getRandomValue(searchProperties);

            filters.push(getFilter(searchProperty));
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
            direction: getRandomValue(sortDirections)
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
                var filterValues = [];
                // If the match filter has some pre-defined values to choose from, then choose some of those.
                // Otherwise, get some numbers that are between the min and max `id` column in the item table and use
                // those.
                if (searchProperty.values) {
                    var numberOfValues = getRandomIntFromInterval(1, searchProperty.values.length);
                    for (var i = 0; i < numberOfValues; i++) {
                        filterValues.push(getRandomValue(searchProperty.values));
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
                filter.value = getRandomValue(searchProperty.values);
                break;
            case "contains":
                filter.values = [];
                var numberOfValues = getRandomIntFromInterval(1, searchProperty.values.length);
                for (var i = 0; i < numberOfValues; i++) {
                    filter.values.push(Math.random().toString(36).substr(2, 15));
                }
                break;
            case "dateRange":
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
    getRandomValue = function(values) {
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
    };

    return {
        build: getPayload
    };
}();