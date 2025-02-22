import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deployMemberManagerFixture,
  deployProposalManagerFixture,
  deployVoteManagerFixture,
  deployApplicationCoreFixture,
} from "./Helpers";

describe("MemberManager", function () {
  describe("Deployment", function () {
    it("Should be checked the first member.", async function () {
      const { memberManager, owner, otherAccount } = await loadFixture(
        deployMemberManagerFixture
      );
      const memberList = await memberManager.getMemberList();
      expect(memberList.length).to.equal(1);
      expect(memberList[0][0]).to.equal("Shin");

      expect(memberManager.isMember(owner));
      expect(!memberManager.isMember(otherAccount));
      expect(memberManager.isElectionCommissioner(owner));
      expect(!memberManager.isElectionCommissioner(otherAccount));
    });
  });
  describe("SetProposalManager", function () {
    it("Should be set the proposal manager.", async function () {
      const { memberManager } = await loadFixture(deployMemberManagerFixture);
      const { proposalManager } = await loadFixture(
        deployProposalManagerFixture
      );
      const { voteManager } = await loadFixture(
        deployVoteManagerFixture.bind(null, 50, 50)
      );
      await memberManager.setProposalManager(proposalManager.getAddress());
    });
  });
  describe("Functions", function () {
    it("Add member function works.", async function () {
      const { memberManager, owner, otherAccount } = await loadFixture(
        deployMemberManagerFixture
      );
      const { proposalManager } = await loadFixture(
        deployProposalManagerFixture
      );
      const { voteManager } = await loadFixture(
        deployVoteManagerFixture.bind(null, 50, 50)
      );

      await memberManager.setProposalManager(
        await proposalManager.getAddress()
      );
      await voteManager.setManagers(
        await memberManager.getAddress(),
        await proposalManager.getAddress()
      );

      const { applicationCore } = await loadFixture(
        deployApplicationCoreFixture.bind(
          null,
          await memberManager.getAddress(),
          await proposalManager.getAddress(),
          await voteManager.getAddress()
        )
      );

      await proposalManager.setManagersAndApplicationCore(
        await applicationCore.getAddress(),
        await memberManager.getAddress(),
        await voteManager.getAddress()
      );

      const name = "Saki";
      const eoaAddress = otherAccount.address;

      const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "address"],
        [name, eoaAddress]
      );

      await expect(proposalManager.connect(otherAccount).addProposal(
        "AddMember",
        "Adding a member.",
        await memberManager.getAddress(),
        "addMember",
        encodedData
      )).to.be.reverted;

      await proposalManager.addProposal(
        "AddMember",
        "Adding a member.",
        await memberManager.getAddress(),
        "addMember",
        encodedData
      );

      const proposalList = await proposalManager.getProposalList();
      expect(proposalList.length).to.equal(1);
      expect(proposalList[0][0]).to.equal(0);
      expect(proposalList[0][1]).to.equal("AddMember");
      expect(proposalList[0][2]).to.equal("Adding a member.");

      await expect (voteManager.connect(otherAccount).createAndStartVote(0)).to.be.reverted;
      await voteManager.connect(owner).createAndStartVote(0);

      await expect(voteManager.connect(otherAccount).vote(0, 0)).to.be.reverted;
      await voteManager.connect(owner).vote(0, 0);

      await expect(voteManager.connect(otherAccount).finishVote(0)).to.be.reverted;
      await voteManager.connect(owner).finishVote(0);
      expect(await voteManager.isPassed(0)).to.equal(true);

      await expect(proposalManager.connect(otherAccount).executeProposal(0)).to.be.reverted;
      await proposalManager.connect(owner).executeProposal(0);
      const memberList = await memberManager.getMemberList();
      expect(memberList.length).to.equal(2);
      expect(memberList[1][0]).to.equal(name);
      expect(memberList[1][1]).to.equal(eoaAddress);
    });
  });
});
