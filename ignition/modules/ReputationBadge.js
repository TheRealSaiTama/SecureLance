const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ReputationBadge", (m) => {
  // Deploy the contract with the deployer as the initial owner
  const badgeContract = m.contract("ReputationBadge", [m.getAccount(0)]);
  
  return { badgeContract };
});