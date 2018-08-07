/*jshint esversion: 6 */
const ProvisioningContractFactory = artifacts.require("./ProvisioningContractFactory.sol");

const { getFormatedConsoleLabel, setValueByPath, getValueByPath, combinePath } = require("../commonLogic/commonLogic");
const { saveDeployedConfig, getNetworkDeployedConfig, deployedConfigPathConsts } = require("../deployedConfigHelper");

module.exports = function(deployer) {
    console.log(getFormatedConsoleLabel("Setup provisioning contract factory tokens lock period:"));

    deployer.then(async () => {
        const deployedConfig = getNetworkDeployedConfig(web3.version.network);

        const configPath = deployedConfigPathConsts.accountStorageAdapter.allowedFieldNames.path;
        const accountFields = getValueByPath(deployedConfig, configPath);
        const tokensLockPeriod = {
            "email": 5,
            "phone": 2,
            "documents.id_card": 30,
            "documents.passport": 30,
            "documents.driver_license": 30,
            "documents.residence_permit_card": 30,
            "addresses.billing": 30,
            "addresses.living": 30
        };

        accountFields.forEach(async (fieldName) => {
            if (fieldName == "device") {
                return;
            }
            const provisioningContractFactoryInstance = await ProvisioningContractFactory.deployed();

            const lockPeriod = tokensLockPeriod[fieldName];
            console.log(`${fieldName} lock period: ${lockPeriod}`);
            await provisioningContractFactoryInstance.setTokensLockPeriod(fieldName, lockPeriod);

            const path = deployedConfigPathConsts.provisioningContractFactory.accountField.tokensLockPeriod.pathTemplate;
            const configPath = combinePath(path, { accountField: fieldName })
            setValueByPath(deployedConfig, configPath, lockPeriod);
        });
        saveDeployedConfig();
    });
};