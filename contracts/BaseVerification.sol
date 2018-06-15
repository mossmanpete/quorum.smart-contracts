pragma solidity ^0.4.23;


import "./openzeppelin-solidity/Ownable.sol";
import "./KimlicContractsContext.sol";
import "./AccountStorageAdapter.sol";
import "./WithKimlicContext.sol";
import "./KimlicToken.sol";

contract BaseVerification is Ownable, WithKimlicContext {
    AccountStorageAdapter.AccountFieldName public accountFieldName;
    address public coOwner;
    bool public isVerified;
    uint public dataIndex;
    address public verificator;

    address internal _accountAddress;
    uint internal _rewardAmount;

    constructor(
        address contextStorage, uint rewardAmount, address account, address coOwnerAddress, uint index, address verificatorAddress,
        AccountStorageAdapter.AccountFieldName fieldName) public WithKimlicContext(contextStorage) Ownable() {

        coOwner = coOwnerAddress;
        _accountAddress = account;
        dataIndex = index;
        verificator = verificatorAddress;
        _rewardAmount = rewardAmount;
        accountFieldName = fieldName;
    }

    function setVerificationResult(bool verificationResult) public onlyOwner() {
        KimlicContractsContext context = getContext();
        KimlicToken token = context.getKimlicToken();
        require(token.balanceOf(address(this)) == _rewardAmount);
        
        isVerified = verificationResult;

        token.transfer(owner, _rewardAmount);

        context.getAccountStorageAdapter().setAccountFieldVerificationData(
            _accountAddress, accountFieldName, verificationResult, address(this), block.timestamp);
    }
}
