import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deployMemberManagerFixture,
  deployProposalManagerFixture,
  deployVoteManagerFixture,
  deployApplicationCoreFixture,
} from "./Helpers";

describe("Error Case Of Propsal Management", function () {
  describe("Check Errors", function () {
    it("Error logics work", async function () {
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

      await expect(
        proposalManager
          .connect(otherAccount)
          .setManagersAndApplicationCore(
            await applicationCore.getAddress(),
            await memberManager.getAddress(),
            await voteManager.getAddress()
          )
      ).to.be.reverted;

      await proposalManager.setManagersAndApplicationCore(
        await applicationCore.getAddress(),
        await memberManager.getAddress(),
        await voteManager.getAddress()
      );

      const dummyData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [0]
      );
      await expect(
        proposalManager
          .connect(owner)
          .addProposal(
            "Set Non-Install Contract",
            "Set Non-Install Contract",
            await otherAccount.getAddress(),
            "Dummy",
            dummyData
          )
      ).to.be.revertedWith("ProposalManager: target contract is not installed");

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
      await voteManager.connect(owner).vote(0, 1);
      await voteManager.connect(owner).finishVote(0);
      await expect(
        proposalManager.connect(owner).executeProposal(0)
      ).to.be.revertedWith("ProposalManager: vote is not approved");
    });
    it("Ownable MemeberManager error logics works.", async function () {
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
      await expect(memberManager.setProposalManager(
        await proposalManager.getAddress()
      )).to.be.rejectedWith("OwnableProposalManager: proposal manager is already set");

      // await voteManager.setManagers(
      //   await memberManager.getAddress(),
      //   await proposalManager.getAddress()
      // );

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
      await expect(
        voteManager.connect(owner).createAndStartVote(0)
      ).to.be.rejectedWith("OwnableMemberManager: member manager is not set");
      await expect(voteManager.connect(owner).vote(0, 0)).to.be.rejectedWith(
        "OwnableMemberManager: member manager is not set"
      );
    });
    it("Ownable ProposalManager error logics works.", async function () {
      const { memberManager, owner, otherAccount, thirdAccount } =
        await loadFixture(deployMemberManagerFixture);
      const { proposalManager } = await loadFixture(
        deployProposalManagerFixture
      );
      const { voteManager } = await loadFixture(
        deployVoteManagerFixture.bind(null, 50, 50)
      );

      // await memberManager.setProposalManager(
      //   await proposalManager.getAddress()
      // );
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
      await expect(
        proposalManager.connect(owner).executeProposal(0)
      ).to.be.revertedWith(
        "OwnableProposalManager: proposal manager is not set"
      );

    });
  });
});
