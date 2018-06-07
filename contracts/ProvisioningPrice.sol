pragma solidity ^0.4.23;

import "./Ownable.sol";
import "./AccountStorageAdapter.sol";

contract ProvisioningPrice is Ownable {

    /// private attributes ///
    mapping (uint=>uint) private _priceMap;

    /// public methods ///
    function setPrice(AccountStorageAdapter.AccountFieldName accountFieldName, uint price) public onlyOwner() {
        _priceMap[uint(accountFieldName)] = price;
    }

    function getPrice(AccountStorageAdapter.AccountFieldName accountFieldName) public view returns (uint price) {
        price = _priceMap[uint(accountFieldName)];
    }
}