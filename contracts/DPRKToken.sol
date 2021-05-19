pragma solidity ^0.5.16;

contract DPRKToken {
    // Name - optional
    string public name = "DPRK Token";
    // Symbol - optional 
    string public symbol = "DPRK";
    // Standard - custom
    string public standard = "DPRK Token v1.0";
    // constructor
    uint256 public totalSupply; 

    // contract event
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );
    
    // hash table of balances
    mapping(address => uint256) public balanceOf;

    // constructor
    constructor(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        // _underscore is just a convention
        totalSupply = _initialSupply;
        
        // allocate initial supply
    }

    // transfer / pay function
    function transfer(address _to, uint256 _value) public returns (bool success) {
    // raise exception if sender balance less than passed _value
    // if true, continue function execution else kill
    require(balanceOf[msg.sender] >= _value);
    
    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;
    // transfer event
    emit Transfer(msg.sender, _to, _value);
    // return boolean value
    return true;
    }
}