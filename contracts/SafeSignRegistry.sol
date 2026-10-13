// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SafeSignRegistry
 * @dev Stores immutable AI security reports on Monad Testnet.
 * Allows users to register smart contract audit results and look up historical reports by code hash.
 */
contract SafeSignRegistry {
    struct Report {
        address reporter;
        bytes32 codeHash;
        uint8 score;
        string verdict;
        uint256 timestamp;
    }

    // Mapping from keccak256(sourceCode) to list of reports
    mapping(bytes32 => Report[]) private _reportsByCodeHash;

    // Global list of all saved reports for public feed
    Report[] private _allReports;

    event ReportSaved(
        address indexed reporter,
        bytes32 indexed codeHash,
        uint8 score,
        string verdict,
        uint256 timestamp
    );

    /**
     * @notice Save a new security assessment report on-chain
     * @param codeHash keccak256 hash of the analyzed contract source code
     * @param score AI risk score from 0 (safe) to 100 (dangerous)
     * @param verdict "Safe", "Caution", or "Dangerous"
     */
    function saveReport(
        bytes32 codeHash,
        uint8 score,
        string calldata verdict
    ) external {
        require(score <= 100, "Score must be between 0 and 100");

        Report memory newReport = Report({
            reporter: msg.sender,
            codeHash: codeHash,
            score: score,
            verdict: verdict,
            timestamp: block.timestamp
        });

        _reportsByCodeHash[codeHash].push(newReport);
        _allReports.push(newReport);

        emit ReportSaved(
            msg.sender,
            codeHash,
            score,
            verdict,
            block.timestamp
        );
    }

    /**
     * @notice Retrieve all reports for a specific contract code hash
     * @param codeHash keccak256 hash of the contract
     */
    function getReports(bytes32 codeHash) external view returns (Report[] memory) {
        return _reportsByCodeHash[codeHash];
    }

    /**
     * @notice Retrieve all reports saved in the registry
     */
    function getAllReports() external view returns (Report[] memory) {
        return _allReports;
    }

    /**
     * @notice Retrieve total number of reports saved
     */
    function totalReports() external view returns (uint256) {
        return _allReports.length;
    }
}
