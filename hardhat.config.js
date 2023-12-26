require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config()

const { task } = require("hardhat/config");
const JSBI = require("jsbi");

const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core')
const { AlphaRouter, SwapType } = require("@uniswap/smart-order-router");

const IERC20Metadata = require("./artifacts/contracts/IERC20Metadata.sol/IERC20Metadata.json");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
      },
      {
        version: "0.4.18",
      },
    ]
  },
  mocha: {
    timeout: 2000000,
  },
  networks: {
    hardhat: {
      chainId: 1,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 5,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 1,
    },
    localhost:{
      url: `http://127.0.0.1:8545/`,
      chainId: 1, // 31337,
    },
  },
};


const CHAIN_ID = module.exports.networks.localhost.chainId
const RPC_URL = module.exports.networks.localhost.url

task("swap", "Swap tokens between src to dest")
  .addParam("amount", "Amount of token to be swapped")
  .addParam("from", "Contract address of Source Token")
  .addParam("to", "Contract address of Target Token")
  .addParam("recipient", "Recipient of token")
  .setAction(async (taskArgs, {ethers}) => {
    const fromTokenAddress = taskArgs.from
    const toTokenAddress = taskArgs.to

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

    const router = new AlphaRouter({
      chainId: CHAIN_ID,
      provider,
    })

    const srcContract = await ethers.getContractAt(IERC20Metadata.abi, fromTokenAddress, wallet)
    const srcName = await srcContract.name()
    const srcToken = new Token (
      CHAIN_ID,
      fromTokenAddress,
      await srcContract.decimals(),
      srcName,
    )

    const destContract = await ethers.getContractAt(IERC20Metadata.abi, toTokenAddress, wallet)
    const destName = await destContract.name()
    const destToken = new Token (
      CHAIN_ID,
      toToken,
      await destContract.decimals(),
      destName,
    )

    console.log("Swapping %d %s Tokens for maximum %s Tokens", taskArgs.amount, srcName, destName)

    const options = {
      recipient: taskArgs.recipient,
      slippageTolerance: new Percent(50, 10_000),   // To-Do
      deadline: Math.floor(Date.now() / 1000 + 1800),
      type: SwapType.SWAP_ROUTER_02,
    }

    const rawTokenAmountIn = fromReadableAmount(taskArgs.amount, srcToken.decimals)
    const route = await router.route(
      CurrencyAmount.fromRawAmount(srcToken, rawTokenAmountIn),
      destToken,
      TradeType.EXACT_INPUT,
      options
    )

    const approvalTx = await srcContract.approve(process.env.ROUTER_ADDRESS, approvalAmount)
    await approvalTx.wait(1);

    const tx = await wallet.sendTransaction({
      data: route?.methodParameters?.calldata,
      to: process.env.ROUTER_ADDRESS,
      value: route?.methodParameters?.value,
      from: taskArgs.recipient,
      maxFeePerGas: 100000000000,
      maxPriorityFeePerGas: 100000000000,
    })
    const txReceipt = await tx.wait(1);
    console.log("txHash = ", txReceipt.transactionHash)
})

function fromReadableAmount(amount, decimals) {
  const extraDigits = Math.pow(10, countDecimals(amount))
  const adjustedAmount = amount * extraDigits
  return JSBI.divide(
      JSBI.multiply(
      JSBI.BigInt(adjustedAmount),
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))
      ),
      JSBI.BigInt(extraDigits)
  )
}

function countDecimals(x) {
  if (Math.floor(x) === x) {
    return 0;
  }
  return x.toString().split(".")[1].length || 0;
}


// Goerli address
//
// const srcTokenAddr = "0x0B1ba0af832d7C05fD64161E0Db78E85978E8082";
// const srcTokenName = "WETH";
// const destTokenAddr = "0xa2bd28f23A78Db41E49db7d7B64b6411123a8B85";
// const destTokenName = "USDC";
