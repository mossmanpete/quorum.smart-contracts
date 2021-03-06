pragma solidity ^0.4.23;


import "./KimlicContractsContext.sol";
import "./BaseStorage.sol";
import "./WithKimlicContext.sol";

/// @title AccountStorage
/// @notice Contract which serves as access control layer between BaseStorage and AccountStorageAdapter
/// @author Bohdan Grytsenko
contract AccountStorage is BaseStorage, WithKimlicContext {
    
    /// constructors ///
    constructor (address contextStorage) public WithKimlicContext(contextStorage) {
    }

    /// modifiers ///
    modifier accessRestriction() {
        KimlicContractsContext context = getContext();
        require(msg.sender == address(context.getAccountStorageAdapter()) || msg.sender == context.owner());
        _;
    }

}