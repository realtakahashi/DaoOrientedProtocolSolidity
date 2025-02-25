import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deployMemberManagerFixture,
  deployProposalManagerFixture,
  deployVoteManagerFixture,
  deployApplicationCoreFixture,
} from "./Helpers";

describe("Use Case Of Member Management", function () {
  describe("VoteManager test case", function () {
    it("Reset test cases", async function () {
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

      // Reset PercentageForApproval
      const percentageForApproval = 40;
      const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [percentageForApproval]
      );

      await proposalManager.addProposal(
        "Reset PercentageForApproval",
        "Reset PercentageForApproval.",
        await voteManager.getAddress(),
        "setPercentageForApproval",
        encodedData
      );

      const proposalList = await proposalManager.getProposalList();
      expect(proposalList.length).to.equal(1);
      expect(proposalList[0][0]).to.equal(0);
      expect(proposalList[0][1]).to.equal("Reset PercentageForApproval");
      expect(proposalList[0][2]).to.equal("Reset PercentageForApproval.");

      await voteManager.connect(owner).createAndStartVote(0);
      await voteManager.connect(owner).vote(0, 0);
      await voteManager.connect(owner).finishVote(0);
      expect(await voteManager.isPassed(0)).to.equal(true);
      await proposalManager.connect(owner).executeProposal(0);
      expect(await voteManager.getPercentageForApproval()).to.equal(
        percentageForApproval
      );

      // Reset MinimumVotesPercentage
      const minimumVotesPercentage = 30;
      const encodedData2 = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [minimumVotesPercentage]
      );
      await proposalManager.addProposal(
        "Reset MinimumVotesPercentage",
        "Reset MinimumVotesPercentage.",
        await voteManager.getAddress(),
        "setMinimumVotesPercentage",
        encodedData2
      );

      const proposalList2 = await proposalManager.getProposalList();
      expect(proposalList2.length).to.equal(2);
      expect(proposalList2[1][0]).to.equal(1);
      expect(proposalList2[1][1]).to.equal("Reset MinimumVotesPercentage");
      expect(proposalList2[1][2]).to.equal("Reset MinimumVotesPercentage.");

      await voteManager.connect(owner).createAndStartVote(1);
      await voteManager.connect(owner).vote(1, 0);
      await voteManager.connect(owner).finishVote(1);
      expect(await voteManager.isPassed(1)).to.equal(true);
      await proposalManager.connect(owner).executeProposal(1);
      expect(await voteManager.getMinimumVotesPercentage()).to.equal(
        minimumVotesPercentage
      );
    });
    it("Error cases", async function () {
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

      await expect(
        voteManager
          .connect(otherAccount)
          .setManagers(
            await memberManager.getAddress(),
            await proposalManager.getAddress()
          )
      ).to.be.reverted; // Ownable: caller is not the owner

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

      const percentageForApproval = 40;
      const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [percentageForApproval]
      );

      await proposalManager.addProposal(
        "Reset PercentageForApproval",
        "Reset PercentageForApproval.",
        await voteManager.getAddress(),
        "setPercentageForApproval",
        encodedData
      );

      const proposalList = await proposalManager.getProposalList();
      expect(proposalList.length).to.equal(1);
      expect(proposalList[0][0]).to.equal(0);
      expect(proposalList[0][1]).to.equal("Reset PercentageForApproval");
      expect(proposalList[0][2]).to.equal("Reset PercentageForApproval.");

      await voteManager.connect(owner).createAndStartVote(0);
      await voteManager.connect(owner).finishVote(0);
      expect(await voteManager.isPassed(0)).to.equal(false);

      await expect(voteManager.connect(owner).vote(0, 0)).to.be.revertedWith(
        "VoteManager: vote is not in progress"
      );
      await expect(voteManager.connect(owner).finishVote(0)).to.be.revertedWith(
        "VoteManager: vote is not in progress"
      );

      // No interface for voteManager
      const dummyData = 30;
      const encodedData2 = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [dummyData]
      );
      await proposalManager.addProposal(
        "Non-exsit interface test",
        "Non-exsit interface test.",
        await voteManager.getAddress(),
        "nonExsitInterface",
        encodedData2
      );

      const proposalList2 = await proposalManager.getProposalList();
      expect(proposalList2.length).to.equal(2);
      expect(proposalList2[1][0]).to.equal(1);
      expect(proposalList2[1][1]).to.equal("Non-exsit interface test");
      expect(proposalList2[1][2]).to.equal("Non-exsit interface test.");

      await voteManager.connect(owner).createAndStartVote(1);
      await expect(voteManager.createAndStartVote(100)).to.be.revertedWith(
        "VoteManager: proposal does not exist"
      );
      await expect(
        voteManager.connect(otherAccount).createAndStartVote(1)
      ).to.be.revertedWith(
        "OwnableMemberManager: caller is not the election commissioner"
      );

      await voteManager.connect(owner).vote(1, 0);
      await expect(voteManager.connect(owner).vote(1, 0)).to.be.revertedWith(
        "VoteManager: member has already voted"
      );

      await voteManager.connect(owner).finishVote(1);
      expect(await voteManager.isPassed(1)).to.equal(true);
      await expect(
        proposalManager.connect(owner).executeProposal(1)
      ).to.be.revertedWith("VoteManager: interface not found");
    });
  });
});
