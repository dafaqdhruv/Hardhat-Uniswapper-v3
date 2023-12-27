const { assert, expect } = require("chai");
const hre = require("hardhat");
const { run } = require("hardhat");
const chai = require("chai");

const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

const WETH = require("../weth.json");

require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");

describe("swap", function () {
    it("Should swap tokens", async function () {
      [signer] = await hre.ethers.getSigners();

      const weth = new hre.ethers.Contract(WETH_ADDRESS, WETH, signer);
      const tx = await weth.deposit({ value: hre.ethers.utils.parseEther("5") });
      const balance = await weth.balanceOf(signer.address)
      console.log(balance)
      await tx.wait(1);
      console.log(tx.hash)

      await run("swap", {
        amount: "0.001",
        from: WETH_ADDRESS,
        to: USDC_ADDRESS,
        recipient: signer.address,
      })
    });
})
