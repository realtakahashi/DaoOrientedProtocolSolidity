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
      ).to.be.rejectedWith("The application does not exists.");

      //Uninstall normally
      const applicationId4 = 3;
      const encodedData4 = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [applicationId4]
      );

      await proposalManager.addProposal(
        "Uninstall Proposal",
        "Uninstalling Application",
        await applicationCore.getAddress(),
        "unInstallApplication",
        encodedData4
      );

      const proposalList4 = await proposalManager.getProposalList();
      expect(proposalList4.length).to.equal(4);
      expect(proposalList4[3].id).to.equal(3);
      expect(proposalList4[3].title).to.equal("Uninstall Proposal");
      expect(proposalList4[3].description).to.equal("Uninstalling Application");

      await voteManager.connect(owner).createAndStartVote(3);
      await voteManager.connect(owner).vote(3, 0);
      await voteManager.connect(owner).finishVote(3);
      expect(await voteManager.isPassed(3)).to.equal(true);

      await proposalManager.connect(owner).executeProposal(3);

      const applicationList3 = await applicationCore.getApplicationList();
      expect(applicationList3.length).to.equal(3);
      expect(applicationList3[0].name).to.equal("MemberManager");
      expect(applicationList3[1].name).to.equal("ProposalManager");
      expect(applicationList3[2].name).to.equal("VoteManager");
    });

    //Update test
    it("Update test", async function () {
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

      // Update Member Manager
      const MemberManager = await ethers.getContractFactory("MemberManager");
      const updateMemberManager = await MemberManager.deploy(
        "Shin2",
        otherAccount.address,
        {}
      );

      const contractAddress = await updateMemberManager.getAddress();
      const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [contractAddress]
      );

      await proposalManager.addProposal(
        "Update Member Manager",
        "Update Member Manager",
        await applicationCore.getAddress(),
        "updateMemberManager",
        encodedData
      );

      const proposalList = await proposalManager.getProposalList();
      expect(proposalList.length).to.equal(1);
      expect(proposalList[0].id).to.equal(0);
      expect(proposalList[0].title).to.equal("Update Member Manager");
      expect(proposalList[0].description).to.equal("Update Member Manager");

      await voteManager.connect(owner).createAndStartVote(0);
      await voteManager.connect(owner).vote(0, 0);
      await voteManager.connect(owner).finishVote(0);
      expect(await voteManager.isPassed(0)).to.equal(true);

      await proposalManager.connect(owner).executeProposal(0);
      const applicationList = await applicationCore.getApplicationList();
      expect(applicationList.length).equal(3);
      expect(applicationList[0].applicationId).equal(0);
      expect(applicationList[0].name).equal("MemberManager");
      expect(applicationList[0].contractAddress).equal(
        await updateMemberManager.getAddress()
      );
      // Update Proposal Manager
      const ProposalManager = await ethers.getContractFactory(
        "ProposalManager"
      );
      const updateProposalManager = await ProposalManager.deploy({});

      const contractAddress2 = await updateProposalManager.getAddress();
      const encodedData2 = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [contractAddress2]
      );

      await proposalManager.addProposal(
        "Update Proposal Manager",
        "Update Proposal Manager",
        await applicationCore.getAddress(),
        "updateProposalManager",
        encodedData2
      );

      const proposalList2 = await proposalManager.getProposalList();
      expect(proposalList2.length).to.equal(2);
      expect(proposalList2[1].id).to.equal(1);
      expect(proposalList2[1].title).to.equal("Update Proposal Manager");
      expect(proposalList2[1].description).to.equal("Update Proposal Manager");

      await voteManager.connect(owner).createAndStartVote(1);
      await voteManager.connect(owner).vote(1, 0);
      await voteManager.connect(owner).finishVote(1);
      expect(await voteManager.isPassed(1)).to.equal(true);

      await proposalManager.connect(owner).executeProposal(1);
      const applicationList2 = await applicationCore.getApplicationList();
      expect(applicationList2.length).equal(3);
      expect(applicationList2[1].applicationId).equal(1);
      expect(applicationList2[1].name).equal("ProposalManager");
      expect(applicationList2[1].contractAddress).equal(
        await updateProposalManager.getAddress()
      );
      // Update Vote Manager
      const VoteManager = await ethers.getContractFactory("VoteManager");
      const updateVoteManager = await VoteManager.deploy(
        50,
        50,
        {}
      );

      const contractAddress3 = await updateVoteManager.getAddress();
      const encodedData3 = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address"],
        [contractAddress3]
      );

      await proposalManager.addProposal(
        "Update Vote Manager",
        "Update Vote Manager",
        await applicationCore.getAddress(),
        "updateVoteManager",
        encodedData3
      );

      const proposalList3 = await proposalManager.getProposalList();
      expect(proposalList3.length).to.equal(3);
      expect(proposalList3[2].id).to.equal(2);
      expect(proposalList3[2].title).to.equal("Update Vote Manager");
      expect(proposalList3[2].description).to.equal("Update Vote Manager");

      await voteManager.connect(owner).createAndStartVote(2);
      await voteManager.connect(owner).vote(2, 0);
      await voteManager.connect(owner).finishVote(2);
      expect(await voteManager.isPassed(2)).to.equal(true);

      await proposalManager.connect(owner).executeProposal(2);
      const applicationList3 = await applicationCore.getApplicationList();
      expect(applicationList3.length).equal(3);
      expect(applicationList3[2].applicationId).equal(2);
      expect(applicationList3[2].name).equal("VoteManager");
      expect(applicationList3[2].contractAddress).equal(
        await updateVoteManager.getAddress()
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

      // Non-existance interface
      const { exampleStorage } = await loadFixture(
        deployExampleStorageFixture.bind(
          null,
          await proposalManager.getAddress()
        )
      );

      const name2 = "ExampleStorage";
      const contractAddress2 = await exampleStorage.getAddress();

      const encodedData2 = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "address"],
        [name2, contractAddress2]
      );

      await proposalManager.addProposal(
        "Install Proposal",
        "Installing Example Storage",
        await applicationCore.getAddress(),
        "NonExistanceInterface",
        encodedData2
      );

      const proposalList2 = await proposalManager.getProposalList();
      expect(proposalList2.length).to.equal(2);
      expect(proposalList2[1].id).to.equal(1);
      expect(proposalList2[1].title).to.equal("Install Proposal");
      expect(proposalList2[1].description).to.equal("Installing Example Storage");

      await voteManager.connect(owner).createAndStartVote(1);
      await voteManager.connect(owner).vote(1, 0);
      await voteManager.connect(owner).finishVote(1);
      expect(await voteManager.isPassed(1)).to.equal(true);

      await expect(
        proposalManager.connect(owner).executeProposal(1)
      ).to.be.rejectedWith("ApplicationCore: interface not found");

    });
  });
});
