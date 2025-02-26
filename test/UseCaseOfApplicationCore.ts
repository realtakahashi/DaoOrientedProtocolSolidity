import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import {
  deployApplicationCoreFixture,
  deployMemberManagerFixture,
  deployProposalManagerFixture,
  deployVoteManagerFixture,
  deployExampleStorageFixture,
  deploySimpleStorageFixture,
} from "./Helpers";
import { ethers } from "hardhat";

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
      expect(applicationList[0].contractAddress).equal(
        await memberManager.getAddress()
      );
      expect(applicationList[1].name).equal("ProposalManager");
      expect(applicationList[1].contractAddress).equal(
        await proposalManager.getAddress()
      );
      expect(applicationList[2].name).equal("VoteManager");
      expect(applicationList[2].contractAddress).equal(
        await voteManager.getAddress()
      );
    });
    it("Install applications should be executed normally", async function () {
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
      expect(proposalList[0].description).to.equal(
        "Installing Example Storage"
      );

      await voteManager.connect(owner).createAndStartVote(0);
      await voteManager.connect(owner).vote(0, 0);
      await voteManager.connect(owner).finishVote(0);
      expect(await voteManager.isPassed(0)).to.equal(true);

      expect(
        await applicationCore.isInstalledApplication(
          await exampleStorage.getAddress()
        )
      ).equal(false);

      await proposalManager.connect(owner).executeProposal(0);
      const applicationList = await applicationCore.getApplicationList();
      expect(applicationList.length).equal(4);
      expect(applicationList[3].applicationId).equal(3);
      expect(applicationList[3].name).equal("ExampleStorage");
      expect(applicationList[3].contractAddress).equal(
        await exampleStorage.getAddress()
      );
      expect(
        await applicationCore.isInstalledApplication(
          await exampleStorage.getAddress()
        )
      ).equal(true);

      // uninstall cases
      // Pre-install contract can not be uninstalled.
      const applicationId2 = 0;
      const encodedData2 = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [applicationId2]
      );

      await proposalManager.addProposal(
        "Uninstall Proposal",
        "Uninstalling Member Manager",
        await applicationCore.getAddress(),
        "unInstallApplication",
        encodedData2
      );

      const proposalList2 = await proposalManager.getProposalList();
      expect(proposalList2.length).to.equal(2);
      expect(proposalList2[1].id).to.equal(1);
      expect(proposalList2[1].title).to.equal("Uninstall Proposal");
      expect(proposalList2[1].description).to.equal(
        "Uninstalling Member Manager"
      );

      await voteManager.connect(owner).createAndStartVote(1);
      await voteManager.connect(owner).vote(1, 0);
      await voteManager.connect(owner).finishVote(1);
      expect(await voteManager.isPassed(1)).to.equal(true);

      expect(
        await applicationCore.isInstalledApplication(
          await memberManager.getAddress()
        )
      ).equal(true);

      await expect(
        proposalManager.connect(owner).executeProposal(1)
      ).to.be.rejectedWith(
        "Pre-install application can not be deleted, it can be only updated."
      );
      const applicationList2 = await applicationCore.getApplicationList();
      expect(applicationList2.length).equal(4);
      expect(
        await applicationCore.isInstalledApplication(
          await memberManager.getAddress()
        )
      ).equal(true);

      // Uninstall non-existed application
      const applicationId3 = 100;
      const encodedData3 = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [applicationId3]
      );

      await proposalManager.addProposal(
        "Uninstall Proposal",
        "Uninstalling Non Existed Application",
        await applicationCore.getAddress(),
        "unInstallApplication",
        encodedData3
      );

      const proposalList3 = await proposalManager.getProposalList();
      expect(proposalList3.length).to.equal(3);
      expect(proposalList3[2].id).to.equal(2);
      expect(proposalList3[2].title).to.equal("Uninstall Proposal");
      expect(proposalList3[2].description).to.equal(
        "Uninstalling Non Existed Application"
      );

      await voteManager.connect(owner).createAndStartVote(2);
      await voteManager.connect(owner).vote(2, 0);
      await voteManager.connect(owner).finishVote(2);
      expect(await voteManager.isPassed(2)).to.equal(true);

      await expect(
        proposalManager.connect(owner).executeProposal(2)
      ).to.be.rejectedWith(
        "The application does not exists."
      );
    });

    // Error cases
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

      const { storage } = await loadFixture(deploySimpleStorageFixture);
      const name = "SimpleStorage";
      const contractAddress = await storage.getAddress();

      const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "address"],
        [name, contractAddress]
      );

      await proposalManager.addProposal(
        "Install Proposal",
        "Installing Simple Storage",
        await applicationCore.getAddress(),
        "installApplication",
        encodedData
      );

      const proposalList = await proposalManager.getProposalList();
      expect(proposalList.length).to.equal(1);
      expect(proposalList[0].id).to.equal(0);
      expect(proposalList[0].title).to.equal("Install Proposal");
      expect(proposalList[0].description).to.equal("Installing Simple Storage");

      await voteManager.connect(owner).createAndStartVote(0);
      await voteManager.connect(owner).vote(0, 0);
      await voteManager.connect(owner).finishVote(0);
      expect(await voteManager.isPassed(0)).to.equal(true);

      await expect(
        proposalManager.connect(owner).executeProposal(0)
      ).to.be.rejectedWith("This contract does not have correct interface.");
    });
  });
});
