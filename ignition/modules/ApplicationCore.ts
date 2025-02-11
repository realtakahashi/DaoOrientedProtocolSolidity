// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MEMBER_MANAGER = "0xCC16907F3C6A3cB5CDd0CDcd372970c2ea98e127";
const PROPOSAL_MANAGER = "0x944fc7E61Ab3fe6ea1A04563Cfb36974CA77BdC1";
const VOTE_MANAGER = "0x8cE3a03265F89B103286746c8479e194306ee3De";

const ApplicationCoreModule = buildModule("ApplicationCoreModule", (m) => {
  const memberManager = m.getParameter("memberManager", MEMBER_MANAGER);
  const proposalManager = m.getParameter("proposalManager", PROPOSAL_MANAGER);
  const voteManager = m.getParameter("voteManager", VOTE_MANAGER);

  const applicationCore = m.contract(
    "ApplicationCore",
    [memberManager, proposalManager, voteManager],
    {}
  );

  return { applicationCore };
});

export default ApplicationCoreModule;
