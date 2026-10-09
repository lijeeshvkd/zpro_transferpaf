sap.ui.define([
    "sap/ui/core/format/DateFormat"
], (DateFormat) => {
    "use strict";

    return {
        formatDate(value) {
            if (!value) {
                return "";
            }

            const oDate = new Date(value);
            if (Number.isNaN(oDate.getTime())) {
                return value;
            }

            const oDateFormat = DateFormat.getDateInstance({ pattern: "dd/MM/yyyy" });
            return oDateFormat.format(oDate);
        }
    };
});
