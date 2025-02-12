import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("ApplicationCore", function () {
  async function deployApplicationCoreFixture() {

    const MEMBER_MANAGER = "0xCC16907F3C6A3cB5CDd0CDcd372970c2ea98e127";
    const PROPOSAL_MANAGER = "0x944fc7E61Ab3fe6ea1A04563Cfb36974CA77BdC1";
    const VOTE_MANAGER = "0x8cE3a03265F89B103286746c8479e194306ee3De";

    const [owner, otherAccount] = await hre.ethers.getSigners();

    const ApplicationCore = await hre.ethers.getContractFactory("ApplicationCore");
    const applicationCore = await ApplicationCore.deploy(MEMBER_MANAGER, PROPOSAL_MANAGER, VOTE_MANAGER, {});

    return { applicationCore, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should be installed pre-install applications", async function () {
      const { applicationCore } = await loadFixture(deployApplicationCoreFixture);

      expect(await applicationCore._applicationCount()).to.equal(3);
      expect((await applicationCore._applications(0)).isPreinstalled).to.equal(true);
      expect((await applicationCore._applications(1)).isPreinstalled).to.equal(true);
      expect((await applicationCore._applications(2)).isPreinstalled).to.equal(true);
      expect((await applicationCore._applications(0)).version).to.equal("0.01");
      expect((await applicationCore._applications(1)).version).to.equal("0.01");
      expect((await applicationCore._applications(2)).version).to.equal("0.01");
      expect((await applicationCore._applications(0)).contractAddress).to.equal("0xCC16907F3C6A3cB5CDd0CDcd372970c2ea98e127");
      expect((await applicationCore._applications(1)).contractAddress).to.equal("0x944fc7E61Ab3fe6ea1A04563Cfb36974CA77BdC1");
      expect((await applicationCore._applications(2)).contractAddress).to.equal("0x8cE3a03265F89B103286746c8479e194306ee3De");
    });
  });
  //todo: Other tests shoould be added when the proposal manager are implemented.

});
