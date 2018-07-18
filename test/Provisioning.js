/*jshint esversion: 6 *//*jshint esversion: 6 */
var fs = require("fs");

let VerificationContractFactory = artifacts.require("./VerificationContractFactory.sol");
let BaseVerification = artifacts.require("./BaseVerification.sol");
let AccountStorageAdapter = artifacts.require("./AccountStorageAdapter.sol");
let ProvisioningContractFactory = artifacts.require("./ProvisioningContractFactory.sol");
let ProvisioningContract = artifacts.require("./ProvisioningContract.sol");

let { accountConsts, addAccountData, getAccountFieldLastMainData, getAccountFieldLastVerificationData } = require("./Helpers/AccountHelper.js")
const { loadDeployedConfigIntoCache, getNetworkDeployedConfig } = require("../deployedConfigHelper");
const { getValueByPath } = require("../commonLogic");



contract("Provisioning", function(accounts) {
    const network = "ganache";
    loadDeployedConfigIntoCache();
    const deployedConfig = getNetworkDeployedConfig(network);
    const configPath = "partiesConfig.createdParties";
    const partiesConfig = getValueByPath(deployedConfig, configPath);

    let uuidv4 = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    
    let accountAddress = accounts[0];

    let config = partiesConfig;
    let kimlicConfig = config["kimlic"];
    let relyingPartyConfig = config["firstRelyingParty"];
    let relyingPartySendConfig = { from: relyingPartyConfig.address };
    let kimlicSendConfig = { from: kimlicConfig.address };
    
    it("Should unlock relying party account", async () => {
        web3.personal.unlockAccount(kimlicConfig.address, kimlicConfig.password);
        web3.personal.unlockAccount(relyingPartyConfig.address, relyingPartyConfig.password);
    });
    
    let provisioningContractkey = uuidv4();
    let verificationContractkey = uuidv4();
    let fieldName = accountConsts.phoneFieldName;
    it("init account with verified data", async () => {
        let adapter = await AccountStorageAdapter.deployed();
        await addAccountData(adapter, accountAddress, accountConsts.phoneValue + "ProvisioningTest", fieldName);

        let verificationContractFactory = await VerificationContractFactory.deployed();
        await verificationContractFactory.createPhoneVerification(accountAddress, kimlicConfig.address,
            verificationContractkey, kimlicSendConfig);
        let verificationContractAddress =  await verificationContractFactory.getVerificationContract.call(verificationContractkey, kimlicSendConfig);
        let verificationContract = await BaseVerification.at(verificationContractAddress);
        await verificationContract.setVerificationResult(true, kimlicSendConfig);
    });


    it(`Should create provisioning contract`, async () => {
        let provisioningContractFactory = await ProvisioningContractFactory.deployed();
        await provisioningContractFactory.createProvisioningContract(accountAddress, fieldName, provisioningContractkey, relyingPartySendConfig);
    });
    
    var provisioningContractAddress;
    it(`Should return created provisioning contract by key ${provisioningContractkey}`, async () => {
        let provisioningContractFactory = await ProvisioningContractFactory.deployed();
        provisioningContractAddress =  await provisioningContractFactory.getProvisioningContract.call(provisioningContractkey, relyingPartySendConfig);
        assert.notEqual(provisioningContractAddress, "0x0000000000000000000000000000000000000000");
    });

    it(`Should get isVerificationFinished = true`, async () => {
        let provisioningContractFactory = await ProvisioningContract.at(provisioningContractAddress);
        let isVerificationFinished = await provisioningContractFactory.isVerificationFinished.call(relyingPartySendConfig);
        assert.equal(isVerificationFinished, true);
    });

    it(`Should set provisioning result`, async () => {
        let provisioningContractFactory = await ProvisioningContract.at(provisioningContractAddress);
        await provisioningContractFactory.setDataProvidedStatus(relyingPartySendConfig);
    });

    it(`Should return field data to owner.`, async () => {
        let provisioningContractFactory = await ProvisioningContract.at(provisioningContractAddress);
        let data = await provisioningContractFactory.getData.call(relyingPartySendConfig, relyingPartySendConfig);
        
        let adapter = await AccountStorageAdapter.deployed();
        let accountMainData = [ await getAccountFieldLastMainData(adapter, accountAddress, fieldName, kimlicSendConfig) ];
        let accountVerificationData = await getAccountFieldLastVerificationData(adapter, accountAddress, fieldName, kimlicSendConfig);
        let accountData = accountMainData.concat(accountVerificationData);
        assert.deepEqual(data, accountData);
    });
});