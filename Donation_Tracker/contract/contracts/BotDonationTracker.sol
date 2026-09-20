// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BotDonationTracker
 * @dev Decentralized Smart Contract for receiving, tracking, and managing BOT & ETH donations on-chain.
 */
contract BotDonationTracker {
    struct DonationRecord {
        address donor;
        uint256 amount;
        uint256 timestamp;
        string message;
    }

    address public owner;
    uint256 public totalDonationsCount;
    uint256 public totalAmountRaised;

    DonationRecord[] public donationHistory;

    event DonationReceived(
        address indexed donor,
        uint256 amount,
        uint256 timestamp,
        string message
    );

    event FundsWithdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Send BOT/ETH donation with an optional text memo/message
     * @param _message Custom donor message
     */
    function donate(string calldata _message) external payable {
        require(msg.value > 0, "Donation amount must be greater than zero");

        totalDonationsCount++;
        totalAmountRaised += msg.value;

        donationHistory.push(
            DonationRecord({
                donor: msg.sender,
                amount: msg.value,
                timestamp: block.timestamp,
                message: _message
            })
        );

        emit DonationReceived(msg.sender, msg.value, block.timestamp, _message);
    }

    /**
     * @dev Fallback receive function for raw native BOT/ETH transfers
     */
    receive() external payable {
        require(msg.value > 0, "Donation amount must be greater than zero");
        totalDonationsCount++;
        totalAmountRaised += msg.value;

        donationHistory.push(
            DonationRecord({
                donor: msg.sender,
                amount: msg.value,
                timestamp: block.timestamp,
                message: "Direct Native BOT Transfer"
            })
        );

        emit DonationReceived(msg.sender, msg.value, block.timestamp, "Direct Native BOT Transfer");
    }

    /**
     * @dev Returns total number of recorded donations
     */
    function getDonationCount() external view returns (uint256) {
        return donationHistory.length;
    }

    /**
     * @dev Returns the full array of donation records
     */
    function getDonationHistory() external view returns (DonationRecord[] memory) {
        return donationHistory;
    }

    /**
     * @dev Current native token (BOT/ETH) balance of this contract
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Withdraw all collected donation funds to the contract owner
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available to withdraw");

        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal transfer failed");

        emit FundsWithdrawn(owner, balance);
    }
}
