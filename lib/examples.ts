export const SAFE_CONTRACT_EXAMPLE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SafeCommunityToken
 * @dev Standard, immutable fixed-supply ERC-20 token.
 * No hidden fees, no minting backdoor, no drain functions, no blacklists.
 */
contract SafeCommunityToken {
    string public name = "Safe Community Token";
    string public symbol = "SAFE";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        // Fixed supply of 1,000,000 tokens minted once at launch
        totalSupply = 1_000_000 * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;

        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        require(spender != address(0), "Approve to zero address");
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");

        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;

        emit Transfer(from, to, amount);
        return true;
    }
}
`;

export const SCAM_CONTRACT_EXAMPLE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RocketMoonGem
 * @dev Deceptive ERC-20 token with hidden malicious honeypot backdoors:
 * 1. Owner can mint unlimited tokens at any time to dilute users.
 * 2. Hidden 90% fee/tax on transfers diverted to owner's private wallet.
 * 3. Owner can drain user balances and emergency withdraw all contract assets.
 * 4. Arbitrary blacklisting prevents investors from selling.
 */
contract RocketMoonGem {
    string public name = "Rocket Moon Gem";
    string public symbol = "ROCKET";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => bool) public isBlacklisted;

    // Hidden fee: 90% tax on sales
    uint256 public feePercent = 90;
    address public feeCollector;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event FundsDrained(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        feeCollector = msg.sender;
        totalSupply = 1_000_000 * 10 ** 18;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    // BACKDOOR 1: Owner can mint infinite tokens to dump on the market
    function mintUnlimited(address to, uint256 amount) external onlyOwner {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    // BACKDOOR 2: Owner can freeze any wallet from ever transferring or selling
    function blacklistAddress(address user, bool status) external onlyOwner {
        isBlacklisted[user] = status;
    }

    // BACKDOOR 3: Hidden 90% sell tax sent directly to owner wallet
    function transfer(address to, uint256 amount) external returns (bool) {
        require(!isBlacklisted[msg.sender], "Address is blacklisted");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        uint256 fee = (amount * feePercent) / 100;
        uint256 netAmount = amount - fee;

        balanceOf[msg.sender] -= amount;
        balanceOf[feeCollector] += fee;
        balanceOf[to] += netAmount;

        emit Transfer(msg.sender, feeCollector, fee);
        emit Transfer(msg.sender, to, netAmount);
        return true;
    }

    // BACKDOOR 4: Owner can directly drain token balances from any victim's wallet
    function emergencyDrainVictim(address victim) external onlyOwner {
        uint256 victimBalance = balanceOf[victim];
        balanceOf[victim] = 0;
        balanceOf[owner] += victimBalance;
        emit FundsDrained(victim, victimBalance);
    }

    // BACKDOOR 5: Owner can withdraw any native coin sent to contract
    function withdrawAllEther() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
`;
