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

    // approval event to transfer on behalf of account
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );
    
    // hash table of balances
    mapping(address => uint256) public balanceOf;
    // allowances hash table
    mapping(address => mapping(address => uint256)) public allowance;


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

    // delegated transfers

    // approve function
    function approve(address _spender, uint256 _value) public returns (bool success) {
        // allowance
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // transferFrom
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        // require from account has tokens && allowance has enough tokens
        require(_value <= allowance[_from][msg.sender]);
        

        // change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        // update allowance
        allowance[_from][msg.sender] -= _value;

        // call transfer event
        emit Transfer(_from, _to, _value);
        // return bool
        return true;
    }   
}

