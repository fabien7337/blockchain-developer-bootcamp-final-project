# Final project - Crypto indexes

## Demo access:
https://consensys-bootcamp.onrender.com

## How to run this project locally:

### Prerequisites

* NodeJS >= v14
* Hardhat
* npm

### Smart Contracts

They are located in contracts folder `/contracts`

Follow these steps to use smart contract:
1. Navigate to root folder
2. Install all dependencies: `npm i`
3. Compile contracts: `npx hardhat compile`
4. Run an ETH archive mainnet node: `npx hardhat node --fork [YOUR_RINKEBY_ARCHIVE_NODE]` (moralis.io offers free archive node)
5. Compile: `npx hardhat compile`
6. Deploy: `npx hardhat run scripts/deploy.js --network rinkeby`
7. Test: `npx hardhat test`

### Frontend

* `lite-server` at the root of the project
* Open `http://localhost:3000`

## Screencast link

https://youtu.be/9m-rTor7vAE

## Public Ethereum wallet for certification:

`0x587F9edB6239F6434B9391315146f202c6db70c8`

## Project description

The goal of this project is to offer a smart and easy way to invest in the crypto market through an index.
You deposit ETH into a smart contract and the smart contract will swap 50% of the ETH to BTC and 50% of the ETH to USDC.

## Simple workflow

1. Enter service web site
2. Login with Metamask
3. Deposit ETH (smart contract call)
4. Check Balance (smart contract call, only read)
5. Withdraw all ETH (smart contract call)
5. Check Balance, should be 0 (smart contract call, only read)

## Directoy Structure

- `frontent`: Project UI
- `contracts`: Smart contracts that are deployed in the Rinkeby testnet.
- `migrations`: Migration files for deploying contracts in `contracts` directory.
- `test`: Tests for smart contracts.

## Environment variables

```
cp .env.example .env
```
And edit the variables

## TODO

- [ ] Partial Withdrawal
- [ ] Deposit all
- [ ] Issue an ERC-20 token as a receipt for deposit
- [ ] Validate User inputs at frontend and verify in modifiers before function execution.
- [ ] Run a MythX scan
- [ ] Admin UI to pause/unpause the contract