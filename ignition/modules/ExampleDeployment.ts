import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ExampleDeployModule", (m) => {
  // 1. Deploy core components
  const memberManager = m.contract("MemberManager",["Shin"]);
  const proposalManager = m.contract("ProposalManager");
  const voteManager = m.contract("VoteManager", [50, 50]);
  const applicationCore = m.contract("ApplicationCore", [
    memberManager,
    proposalManager,
    voteManager,
  ]);

  // 2. Initilization
  m.call(memberManager, "setProposalManager", [proposalManager]);
  m.call(voteManager, "setManagers", [memberManager, proposalManager]);
  m.call(proposalManager, "setManagersAndApplicationCore", [
    applicationCore,
    memberManager,
    voteManager,
  ]);

  return { memberManager, proposalManager, voteManager, applicationCore };
});
