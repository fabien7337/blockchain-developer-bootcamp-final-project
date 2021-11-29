require('dotenv').config()
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "localhost",
  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.RINKEBY_INFURA_ID}`,
      accounts: [ process.env.RINKEBY_PRIVATE_KEY ]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  }
}