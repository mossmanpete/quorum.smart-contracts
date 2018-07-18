/*jshint esversion: 6 */
const ProvisioningContractFactory = artifacts.require("./ProvisioningContractFactory.sol");

const { getTransactionConfig, getFormatedConsoleLabel } = require("./Helpers/MigrationHelper");
const { loadDeployedConfigIntoCache, saveDeployedConfig, getNetworkDeployedConfig } = require("../deployedConfigHelper");
const { setValueByPath, getValueByPath } = require("../commonLogic");

module.exports = function(deployer, network, accounts) {
    console.log(getFormatedConsoleLabel("Setup provisioning contract factory instance:"));
    const transactionConfig = getTransactionConfig(deployer, network, accounts);

    deployer.then(async () => {
        loadDeployedConfigIntoCache();
        const deployedConfig = getNetworkDeployedConfig(network);

        const configPath = "provisioningContractFactory.intersets";
        let provisioningContractFactoryInterestsConfig = getValueByPath(deployedConfig, configPath);

        const provisioningContractFactoryInstance = await ProvisioningContractFactory.deployed();
        let interests = {
            communityTokenWallet: 25,
            coOwner: 25,
            attestationParty: 25,
            account: 25,
        };
        interests = { ...provisioningContractFactoryInterestsConfig, ...interests };
        
        console.log(JSON.stringify(interests, null, 4));
        await provisioningContractFactoryInstance.setInterestsPercent(interests.communityTokenWallet,
            interests.coOwner, interests.attestationParty, interests.account, transactionConfig);
        
        setValueByPath(deployedConfig, configPath, interests);
        saveDeployedConfig();
    });
};
