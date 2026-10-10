sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "zprotransferpaf/model/formatter"
], (Controller, JSONModel, formatter) => {
    "use strict";
    return Controller.extend("zprotransferpaf.controller.Main", {
        formatter: formatter,
        onInit() {
            const oModel = new JSONModel({
                transferData: {
                    Myid: "",
                    Toid: "",
                    FromDate: null,
                    ToDate: null
                }
            });
            this.getView().setModel(oModel, "viewModel");
            this.initalizeModel();
        },
        
        initalizeModel() {
            const oViewModel = this.getView().getModel("viewModel");
            const oModel = this.getOwnerComponent().getModel();

            if (!oModel || typeof oModel.read !== "function") {
                console.error("No default OData model available on the component.");
                return;
            }

            oModel.read("/ES_PAF_FORWARD(Myid='')", {
                success: (oData) => {
                    oViewModel.setProperty("/transferData", oData || {});
                },
                error: (oError) => {
                    console.error("Error fetching data:", oError);
                }
            });
        },

        onReset() {
            this.getView().getModel("viewModel").setData({
                transferData: {
                    Myid: "",
                    Toid: "",
                    FromDate: null,
                    ToDate: null
                }
            });
        },

        // onActivate() {
        //     this._toggleStatus(this.getView().getModel("viewModel").getProperty("/transferData"), "A");
        // },

        // onDeActivate() {
        //     this._toggleStatus(this.getView().getModel("viewModel").getProperty("/transferData"), "D");
        // },

        // _toggleStatus(oData, sAction) {
        //     const oViewModel = this.getView().getModel("viewModel");
        //     const oModel = this.getOwnerComponent().getModel();

        //     if (!oModel || typeof oModel.create !== "function") {
        //         console.error("No default OData model available on the component.");
        //         return;
        //     }

        //     delete oData.__metadata; // Remove metadata if present
        //     oData.Action = sAction; // Set action to Activate or De-Activate

        //     oModel.create("/ES_PAF_FORWARD", oData, {
        //         success: (oResponse) => {
        //             const sMessage = sAction === "A" ? "Record activated successfully." : "Record de-activated successfully.";
        //             sap.m.MessageToast.show(sMessage);
        //             this.initalizeModel();
        //         },
        //         error: (oError) => {
        //             const sErrorMessage = sAction === "A" ? "Error activating record." : "Error de-activating record.";
        //             console.error(sErrorMessage, oError);
        //             sap.m.MessageToast.show(`${sErrorMessage} Please check the console for details.`);
        //         }
        //     });
        // },

        _validateRequiredFields() {
            const aFields = [
                {
                    control: this.byId("forwardIt"),
                    isValid: () => Boolean(this.byId("forwardIt").getValue().trim()),
                    message: "Forward ID is required."
                },
                {
                    control: this.byId("fromDate"),
                    isValid: () => Boolean(this.byId("fromDate").getDateValue()),
                    message: "From Date is required."
                },
                {
                    control: this.byId("toDate"),
                    isValid: () => Boolean(this.byId("toDate").getDateValue()),
                    message: "To Date is required."
                }
            ];
            let bIsValid = true;

            aFields.forEach(({ control, isValid, message }) => {
                const bFieldIsValid = isValid();
                control.setValueState(bFieldIsValid ? "None" : "Error");
                control.setValueStateText(bFieldIsValid ? "" : message);
                bIsValid = bIsValid && bFieldIsValid;
            });

            return bIsValid;
        },

        onSave() {
            if (!this._validateRequiredFields()) {
                return;
            }

            const oViewModel = this.getView().getModel("viewModel");
            const oData = oViewModel.getProperty("/transferData");
            const oModel = this.getOwnerComponent().getModel();

            if (!oModel || typeof oModel.create !== "function") {
                console.error("No default OData model available on the component.");
                return;
            }

            oData.Action = oData.Status; // Set action based on the selected status
            delete oData.__metadata; // Remove metadata if present

            oModel.create("/ES_PAF_FORWARD", oData, {
                success: (oResponse) => {
                    new sap.m.Dialog({
                        title: "Success",
                        type: "Message",
                        state: "Success",
                        content: new sap.m.Text({ text: oData.Status === "A" ? "Record activated successfully." : "Record de-activated successfully." }),
                        beginButton: new sap.m.Button({
                            text: "OK",
                            press: function () {
                                this.getParent().close();
                            }
                        })
                    }).open();
                    this.initalizeModel();
                },
                error: (oError) => {
                    console.error("Error saving record:", oError);
                    new sap.m.Dialog({
                        title: "Error",
                        type: "Message",
                        state: "Error",
                        content: new sap.m.Text({ text: "Error saving record. Please check the console for details." }),
                        beginButton: new sap.m.Button({
                            text: "OK",
                            press: function () {
                                this.getParent().close();
                            }
                        })
                    }).open();
                }
            });
        }
    });
});