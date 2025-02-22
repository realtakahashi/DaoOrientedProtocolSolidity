import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { deployApplicationCoreFixture } from "./Helpers";

describe("ApplicationCore", function () {
  describe("Deployment", function () {
    it("Should be installed pre-install applications", async function () {
      const MEMBER_MANAGER_ADDRESS =
        "0xCC16907F3C6A3cB5CDd0CDcd372970c2ea98e127";
      const PROPOSAL_MANAGER_ADDRESS =
        "0x944fc7E61Ab3fe6ea1A04563Cfb36974CA77BdC1";
      const VOTE_MANAGER_ADDRESS = "0x8cE3a03265F89B103286746c8479e194306ee3De";

      const { applicationCore } = await loadFixture(
        deployApplicationCoreFixture.bind(
          null,
          MEMBER_MANAGER_ADDRESS,
          PROPOSAL_MANAGER_ADDRESS,
          VOTE_MANAGER_ADDRESS
        )
      );

      expect(await applicationCore._applicationCount()).to.equal(3);
      expect((await applicationCore._applications(0)).isPreinstalled).to.equal(
        true
      );
      expect((await applicationCore._applications(1)).isPreinstalled).to.equal(
        true
      );
      expect((await applicationCore._applications(2)).isPreinstalled).to.equal(
        true
      );
      expect((await applicationCore._applications(0)).version).to.equal("0.01");
      expect((await applicationCore._applications(1)).version).to.equal("0.01");
      expect((await applicationCore._applications(2)).version).to.equal("0.01");
      expect((await applicationCore._applications(0)).contractAddress).to.equal(
        "0xCC16907F3C6A3cB5CDd0CDcd372970c2ea98e127"
      );
      expect((await applicationCore._applications(1)).contractAddress).to.equal(
        "0x944fc7E61Ab3fe6ea1A04563Cfb36974CA77BdC1"
      );
      expect((await applicationCore._applications(2)).contractAddress).to.equal(
        "0x8cE3a03265F89B103286746c8479e194306ee3De"
      );
    });
  });
  //todo: Other tests shoould be added when the proposal manager are implemented.
});
