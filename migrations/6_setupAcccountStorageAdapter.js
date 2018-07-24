/*jshint esversion: 6 */

const AccountStorageAdapter = artifacts.require("./AccountStorageAdapter.sol");
const { getTransactionConfig, getFormatedConsoleLabel } = require("./Helpers/MigrationHelper");
const { saveDeployedConfig, getNetworkDeployedConfig, deployedConfigPathConsts } = require("../deployedConfigHelper");
const { setValueByPath } = require("../commonLogic");

module.exports = function(deployer, network, accounts) {
    console.log(getFormatedConsoleLabel("Setup account storage adapter instance:"));

    const accountFields = [
        "email",
        "phone",
        "documents.id_card",
        "documents.passport",
        "documents.driver_license",
        "documents.residence_permit_card",
        "addresses.billing",
        "addresses.living",
        "device"
    ];

    const transactionConfig = getTransactionConfig(deployer, network, accounts);
    deployer.then(async () => {
        const accountStorageAdapterInstance = await AccountStorageAdapter.deployed();

        const deployedConfig = getNetworkDeployedConfig(web3.version.network);

        accountFields.forEach(async (accountField) => {
            console.log(`Add allowed field name "${accountField}"`);
            await accountStorageAdapterInstance.addAllowedFieldName(accountField, transactionConfig);
        });

        setValueByPath(deployedConfig, deployedConfigPathConsts.accountStorageAdapter.allowedFieldNames.path, accountFields);
        saveDeployedConfig();
    });
};