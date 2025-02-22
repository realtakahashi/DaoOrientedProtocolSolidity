import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deployMemberManagerFixture,
  deployProposalManagerFixture,
  deployVoteManagerFixture,
  deployApplicationCoreFixture,
} from "./Helpers";
import { string } from "hardhat/internal/core/params/argumentTypes";

describe("Use Case Of Member Management", function () {
  describe("Deployment", function () {
    it("Should be checked the first member.", async function () {
      const { memberManager, owner, otherAccount } = await loadFixture(
        deployMemberManagerFixture
      );
      const memberList = await memberManager.getMemberList();
      expect(memberList.length).to.equal(1);
      expect(memberList[0][0]).to.equal(0);
      expect(memberList[0][1]).to.equal("Shin");

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
    it("Add & Delete member function works.", async function () {
      const { memberManager, owner, otherAccount, thirdAccount } =
        await loadFixture(deployMemberManagerFixture);
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

      // Can not delete the election commissioner
      const deleteData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [0]
      );
      await proposalManager
        .connect(owner)
        .addProposal(
          "DeleteMember",
          "Deleting a member.",
          await memberManager.getAddress(),
          "deleteMember",
          deleteData
        );
      await voteManager.connect(owner).createAndStartVote(0);
      await voteManager.connect(owner).vote(0, 0);
      await voteManager.connect(owner).finishVote(0);
      await expect(proposalManager.connect(owner).executeProposal(0)).to.be
        .reverted;

      // Add second member
      const name = "Saki";
      const eoaAddress = otherAccount.address;

      const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "address"],
        [name, eoaAddress]
      );

      await expect(
        proposalManager
          .connect(otherAccount)
          .addProposal(
            "AddMember",
            "Adding a member.",
            await memberManager.getAddress(),
            "addMember",
            encodedData
          )
      ).to.be.reverted;

      await proposalManager.addProposal(
        "AddMember",
        "Adding a member.",
        await memberManager.getAddress(),
        "addMember",
        encodedData
      );

      const proposalList = await proposalManager.getProposalList();
      expect(proposalList.length).to.equal(2);
      expect(proposalList[1][0]).to.equal(1);
      expect(proposalList[1][1]).to.equal("AddMember");
      expect(proposalList[1][2]).to.equal("Adding a member.");

      await expect(voteManager.connect(otherAccount).createAndStartVote(1)).to
        .be.reverted;
      await voteManager.connect(owner).createAndStartVote(1);

      await expect(voteManager.connect(otherAccount).vote(1, 0)).to.be.reverted;
      await voteManager.connect(owner).vote(1, 0);

      await expect(voteManager.connect(otherAccount).finishVote(1)).to.be
        .reverted;
      await voteManager.connect(owner).finishVote(1);
      expect(await voteManager.isPassed(1)).to.equal(true);

      await expect(proposalManager.connect(otherAccount).executeProposal(1)).to
        .be.reverted;
      await proposalManager.connect(owner).executeProposal(1);
      const memberList = await memberManager.getMemberList();
      expect(memberList.length).to.equal(2);
      expect(memberList[1][0]).to.equal(1);
      expect(memberList[1][1]).to.equal(name);
      expect(memberList[1][2]).to.equal(eoaAddress);

      // Add third member
      const name2 = "Sei";
      const eoaAddress2 = thirdAccount.address;

      const encodedData2 = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "address"],
        [name2, eoaAddress2]
      );

      await proposalManager
        .connect(otherAccount)
        .addProposal(
          "AddMember2",
          "Adding another member.",
          await memberManager.getAddress(),
          "addMember",
          encodedData2
        );

      const proposalList2 = await proposalManager.getProposalList();
      expect(proposalList2.length).to.equal(3);
      expect(proposalList2[2][0]).to.equal(2);
      expect(proposalList2[2][1]).to.equal("AddMember2");
      expect(proposalList2[2][2]).to.equal("Adding another member.");

      await expect(voteManager.connect(owner).createAndStartVote(1)).to.be
        .reverted;
      await voteManager.connect(owner).createAndStartVote(2);

      await voteManager.connect(owner).vote(2, 0);
      await voteManager.connect(otherAccount).vote(2, 0);

      await voteManager.connect(owner).finishVote(2);
      expect(await voteManager.isPassed(2)).to.equal(true);

      await expect(proposalManager.connect(owner).executeProposal(1)).to.be
        .reverted;
      await proposalManager.connect(owner).executeProposal(2);
      const memberList2 = await memberManager.getMemberList();
      expect(memberList2.length).to.equal(3);
      expect(memberList2[2][0]).to.equal(2);
      expect(memberList2[2][1]).to.equal(name2);
      expect(memberList2[2][2]).to.equal(eoaAddress2);

      // Delete: Target id does not exist
      const deleteDataNotFound = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [100]
      );
      await proposalManager
        .connect(otherAccount)
        .addProposal(
          "DeleteMember",
          "Deleting a member.",
          await memberManager.getAddress(),
          "deleteMember",
          deleteDataNotFound
        );
      await voteManager.connect(owner).createAndStartVote(3);
      await voteManager.connect(otherAccount).vote(3, 0);
      await voteManager.connect(owner).vote(3, 0);
      await voteManager.connect(thirdAccount).vote(3, 1);
      await voteManager.connect(owner).finishVote(3);
      expect(await voteManager.isPassed(3)).to.equal(true);
      await expect(proposalManager.connect(owner).executeProposal(3)).to.be
        .reverted;

      // Delete the second member
      const deleteData2 = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [1]
      );
      await proposalManager
        .connect(thirdAccount)
        .addProposal(
          "DeleteMember",
          "Deleting a member.",
          await memberManager.getAddress(),
          "deleteMember",
          deleteData2
        );
      await voteManager.connect(owner).createAndStartVote(4);
      await voteManager.connect(owner).vote(4, 0);
      await voteManager.connect(otherAccount).vote(4, 1);
      await voteManager.connect(thirdAccount).vote(4, 0);
      await voteManager.connect(owner).finishVote(4);
      expect(await voteManager.isPassed(4)).to.equal(true);
      await proposalManager.connect(owner).executeProposal(4);
      const memberList3 = await memberManager.getMemberList();
      expect(memberList3.length).to.equal(2);
      expect(memberList3[0][0]).to.equal(0);
      expect(memberList3[0][1]).to.equal("Shin");
      expect(memberList3[1][0]).to.equal(2);
      expect(memberList3[1][1]).to.equal(name2);
      expect(memberList3[1][2]).to.equal(eoaAddress2);

      // Reset election commissioner
      const resetData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [2]
      );
      await proposalManager
        .connect(owner)
        .addProposal(
          "ResetElectionCommissioner",
          "Resetting the election commissioner.",
          await memberManager.getAddress(),
          "resetElectionCommissioner",
          resetData
        );
      await voteManager.connect(owner).createAndStartVote(5);
      await voteManager.connect(owner).vote(5, 0);
      // Other account is not a member
      await expect(voteManager.connect(otherAccount).vote(5, 1)).to.be.reverted;
      await voteManager.connect(thirdAccount).vote(5, 0);
      await voteManager.connect(owner).finishVote(5);
      expect(await voteManager.isPassed(5)).to.equal(true);
      await proposalManager.connect(owner).executeProposal(5);
      expect(!memberManager.isElectionCommissioner(owner));
      expect(memberManager.isElectionCommissioner(thirdAccount));

      // Delete owner
      const deleteData3 = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [0]
      );
      await proposalManager
        .connect(owner)
        .addProposal(
          "DeleteMember",
          "Deleting a member.",
          await memberManager.getAddress(),
          "deleteMember",
          deleteData3
        );
      await voteManager.connect(thirdAccount).createAndStartVote(6);
      await voteManager.connect(thirdAccount).vote(6, 0);
      await voteManager.connect(owner).vote(6, 1);
      await voteManager.connect(thirdAccount).finishVote(6);
      expect(await voteManager.isPassed(6)).to.equal(true);
      await proposalManager.connect(thirdAccount).executeProposal(6);
      const memberList4 = await memberManager.getMemberList();
      expect(memberList4.length).to.equal(1);
      expect(memberList4[0][0]).to.equal(2);
      expect(memberList4[0][1]).to.equal(name2);
      expect(memberList4[0][2]).to.equal(eoaAddress2);
    });
    it("Non-exist function does not work.", async function () {
      const { memberManager, owner, otherAccount, thirdAccount } =
        await loadFixture(deployMemberManagerFixture);
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

      const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "address"],
        ["Saki", otherAccount.address]
      );

      await proposalManager.addProposal(
        "NonExistFunction",
        "Non Exsit Function Test.",
        await memberManager.getAddress(),
        "NonExistFunction",
        encodedData
      );

      await voteManager.createAndStartVote(0);
      await voteManager.vote(0, 0);
      await voteManager.finishVote(0);
      expect(await voteManager.isPassed(0)).to.equal(true);
      await expect(proposalManager.executeProposal(0)).to.be.reverted;
    });
    it("Non-member can not select the election commissioner.", async function () {
      const { memberManager, owner, otherAccount, thirdAccount } =
        await loadFixture(deployMemberManagerFixture);
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

      const resetData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [100]
      );
      await proposalManager.addProposal(
        "ResetElectionCommissioner",
        "Resetting the election commissioner.",
        await memberManager.getAddress(),
        "resetElectionCommissioner",
        resetData
      );
      await voteManager.createAndStartVote(0);
      await voteManager.vote(0, 0);
      await voteManager.finishVote(0);
      expect(await voteManager.isPassed(0)).to.equal(true);
      await expect(proposalManager.connect(owner).executeProposal(0)).to.be
        .reverted;
    });
    it("Check error cases.", async function () {
      const { memberManager, owner, otherAccount, thirdAccount } =
        await loadFixture(deployMemberManagerFixture);
      const { proposalManager } = await loadFixture(
        deployProposalManagerFixture
      );
      const { voteManager } = await loadFixture(
        deployVoteManagerFixture.bind(null, 50, 50)
      );

      await expect(
        memberManager
          .connect(otherAccount)
          .setProposalManager(await proposalManager.getAddress())
      ).to.be.reverted;

      const dummyData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string"],
        ["dummy date"]
      );

      await expect(
        memberManager
          .connect(otherAccount)
          .externalExecuteInterface("dummy interface", dummyData)
      ).to.be.revertedWith("OwnableProposalManager: proposal manager is not set");

      await memberManager.setProposalManager(
        await proposalManager.getAddress()
      );

      await expect(
        memberManager
          .connect(otherAccount)
          .externalExecuteInterface("dummy interface", dummyData)
      ).to.be.revertedWith("OwnableProposalManager: caller is not the proposal manager");

    });
  });
});
