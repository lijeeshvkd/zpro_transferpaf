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
                    FromDate: "",
                    ToDate: ""
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
                    FromDate: "",
                    ToDate: ""
                }
            });
        },

        onActivate() {
            this._toggleStatus(this.getView().getModel("viewModel").getProperty("/transferData"), "A");
        },

        onDeActivate() {
            this._toggleStatus(this.getView().getModel("viewModel").getProperty("/transferData"), "D");
        },

        _toggleStatus(oData, sAction) {
            const oViewModel = this.getView().getModel("viewModel");
            const oModel = this.getOwnerComponent().getModel();

            if (!oModel || typeof oModel.create !== "function") {
                console.error("No default OData model available on the component.");
                return;
            }

            delete oData.__metadata; // Remove metadata if present
            oData.Action = sAction; // Set action to Activate or De-Activate

            oModel.create("/ES_PAF_FORWARD", oData, {
                success: (oResponse) => {
                    const sMessage = sAction === "A" ? "Record activated successfully." : "Record de-activated successfully.";
                    sap.m.MessageToast.show(sMessage);
                    this.initalizeModel();
                },
                error: (oError) => {
                    const sErrorMessage = sAction === "A" ? "Error activating record." : "Error de-activating record.";
                    console.error(sErrorMessage, oError);
                    sap.m.MessageToast.show(`${sErrorMessage} Please check the console for details.`);
                }
            });
        }
    });
});