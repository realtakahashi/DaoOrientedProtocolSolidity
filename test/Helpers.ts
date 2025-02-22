import hre from "hardhat";

export async function deployMemberManagerFixture() {
  const [owner, otherAccount] = await hre.ethers.getSigners();

  const MemberManager = await hre.ethers.getContractFactory("MemberManager");
  const memberManager = await MemberManager.deploy("Shin", owner.address, {});

  return { memberManager, owner, otherAccount };
}

export async function deployProposalManagerFixture() {
  const [owner, otherAccount] = await hre.ethers.getSigners();

  const ProposalManager = await hre.ethers.getContractFactory(
    "ProposalManager"
  );
  const proposalManager = await ProposalManager.deploy({});

  return { proposalManager };
}

export async function deployVoteManagerFixture(
  percentageForApproval: number,
  minimumVotesPercentage: number
) {
  const [owner, otherAccount] = await hre.ethers.getSigners();

  const VoteManager = await hre.ethers.getContractFactory("VoteManager");
  const voteManager = await VoteManager.deploy(
    percentageForApproval,
    minimumVotesPercentage,
    {}
  );

  return { voteManager };
}

export async function deployApplicationCoreFixture(
  memberManager: string,
  proposalManager: string,
  voteManager: string
) {
  const [owner, otherAccount] = await hre.ethers.getSigners();

  const ApplicationCore = await hre.ethers.getContractFactory(
    "ApplicationCore"
  );
  const applicationCore = await ApplicationCore.deploy(
    memberManager,
    proposalManager,
    voteManager,
    {}
  );

  return { applicationCore, owner, otherAccount };
}
