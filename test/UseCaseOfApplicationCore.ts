import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import {
  deployApplicationCoreFixture,
  deployMemberManagerFixture,
  deployProposalManagerFixture,
  deployVoteManagerFixture,
  deployExampleStorageFixture
} from "./Helpers";
import {ethers} from "hardhat";

describe("ApplicationCore", function () {
  describe("Deployment", function () {
    it("Should be installed pre-install applications", async function () {
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

      const applicationList = await applicationCore.getApplicationList();
      expect(applicationList.length).equal(3);
      expect(applicationList[0].name).equal("MemberManager");
      expect(applicationList[0].contractAddress).equal(await memberManager.getAddress());
      expect(applicationList[1].name).equal("ProposalManager");
      expect(applicationList[1].contractAddress).equal(await proposalManager.getAddress());
      expect(applicationList[2].name).equal("VoteManager");
      expect(applicationList[2].contractAddress).equal(await voteManager.getAddress());
      
    });
    it("Install applications should be executed normally", async function(){
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

      const { exampleStorage } = await loadFixture(
        deployExampleStorageFixture.bind(
          null,
          await proposalManager.getAddress()
        )
      );
      // Install ExampleStorage
      const name = "ExampleStorage";
      const contractAddress = await exampleStorage.getAddress();

      const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "address"],
        [name, contractAddress]
      );

      await proposalManager.addProposal(
        "Install Proposal",
        "Installing Example Storage",
        await applicationCore.getAddress(),
        "installApplication",
        encodedData
      );

      const proposalList = await proposalManager.getProposalList();
      expect(proposalList.length).to.equal(1);
      expect(proposalList[0].id).to.equal(0);
      expect(proposalList[0].title).to.equal("Install Proposal");
      expect(proposalList[0].description).to.equal("Installing Example Storage");

      await voteManager.connect(owner).createAndStartVote(0);
      await voteManager.connect(owner).vote(0, 0);
      await voteManager.connect(owner).finishVote(0);
      expect(await voteManager.isPassed(0)).to.equal(true);

      await proposalManager.connect(owner).executeProposal(0);
      const applicationList = await applicationCore.getApplicationList();
      expect(applicationList.length).equal(4);
      expect(applicationList[3].applicationId).equal(3);
      expect(applicationList[3].name).equal("ExampleStorage");
      expect(applicationList[3].contractAddress).equal(await exampleStorage.getAddress());
    });
  });
});
