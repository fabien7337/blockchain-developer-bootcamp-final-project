const { ethers } = require("hardhat")
const { expect } = require("chai")
const { swapNativeForToken, getUnirouterData } = require("../utils/testHelpers")

const config = {
    testAmount: ethers.utils.parseEther("0.01"),
    wrapNative: '0xc778417E063141139Fce010982780140Aa0cD5Ab', // WETH RINKEBY
}

describe("SimpleIndex", function() {
    let deployer, user, otherUser, want, SimpleIndex, simpleIndex, WETH
    let testAmount = ethers.utils.parseEther("0.01")

    before(async function() {
        SimpleIndex = await ethers.getContractFactory("SimpleIndex")
    })

    beforeEach(async function() {
        const signers = await ethers.getSigners()
        deployer = signers[0]
        user = signers[1]
        otherUser = signers[2]

        simpleIndex = await SimpleIndex.deploy()
        await simpleIndex.deployed()

        const wantAddr = await simpleIndex.want()
        want = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", wantAddr)

        const unirouterData = getUnirouterData('ETH')
        unirouter = await ethers.getContractAt(unirouterData.interface, unirouterData.address)
    })

    it("Returns the user balance", async () => {
        const wantBalanceStart = await want.balanceOf(user.address)

        await want.connect(user).approve(simpleIndex.address, wantBalanceStart)
        await simpleIndex.connect(user).deposit(testAmount)
        const balances = await simpleIndex.balanceOf(user.address)

        expect(balances[0]).to.be.gt(0)
        expect(balances[1]).to.be.gt(0)
    })

    it("User can deposit and withdraw from the vault", async () => {
        const wantBalanceStart = await want.balanceOf(user.address)

        await want.connect(user).approve(simpleIndex.address, wantBalanceStart)
        await simpleIndex.connect(user).deposit(testAmount)
        await simpleIndex.connect(user).withdrawAll()

        const wantBalanceEnd = await want.balanceOf(user.address)

        expect(wantBalanceEnd).to.be.lte(wantBalanceStart)
        expect(wantBalanceEnd).to.be.gt(wantBalanceStart.mul(99).div(100))
    })

    it("User can deposit multiple times and withdraw from the vault", async () => {
        const wantBalanceStart = await want.balanceOf(user.address)
        const amount1 = testAmount
        const amount2 = testAmount

        await want.connect(user).approve(simpleIndex.address, wantBalanceStart)
        await simpleIndex.connect(user).deposit(amount1)
        await simpleIndex.connect(user).deposit(amount2)
        await simpleIndex.connect(user).withdrawAll()

        const wantBalanceEnd = await want.balanceOf(user.address)

        expect(wantBalanceEnd).to.be.lte(wantBalanceStart)
        expect(wantBalanceEnd).to.be.gt(wantBalanceStart.mul(99).div(100))
    })

    it("New user deposit/withdrawals don't lower other users balances.", async () => {
        // USER DEPOSIT
        const wantBalanceStart = await want.balanceOf(user.address)
        await want.connect(user).approve(simpleIndex.address, testAmount)
        await simpleIndex.connect(user).deposit(testAmount)

        // OTHER USER DEPOSIT
        await want.connect(otherUser).approve(simpleIndex.address, testAmount)
        await simpleIndex.connect(otherUser).deposit(testAmount)

        // USER WITHDRAW
        await simpleIndex.connect(user).withdrawAll()
        const wantBalanceEnd = await want.balanceOf(user.address)

        expect(wantBalanceStart).to.be.gt(0)
        expect(wantBalanceEnd).to.be.gt(wantBalanceStart.mul(99).div(100))
    })

    it("Owner can pause", async () => {
        // USER DEPOSIT
        const wantBalanceStart = await want.balanceOf(user.address)
        await want.connect(user).approve(simpleIndex.address, wantBalanceStart)
        await simpleIndex.connect(user).deposit(testAmount)

        await simpleIndex.connect(deployer).pause()

        // User can't deposit
        const wantOtherBalance = await want.balanceOf(otherUser.address)
        await want.connect(otherUser).approve(simpleIndex.address, wantOtherBalance)
        const tx = simpleIndex.connect(otherUser).deposit(testAmount)
        await expect(tx).to.be.revertedWith("Pausable: paused")

        // User can still withdraw
        await simpleIndex.connect(user).withdrawAll()
        const wantBalanceEnd = await want.balanceOf(user.address)
        expect(wantBalanceEnd).to.be.gt(wantBalanceStart.mul(99).div(100))
    })

    it("Owner can unpause", async () => {
        await simpleIndex.connect(deployer).pause()

        // USER CAN'T DEPOSIT => PAUSED
        const wantBalanceStart = await want.balanceOf(user.address)
        await want.connect(user).approve(simpleIndex.address, wantBalanceStart)
        const tx = simpleIndex.connect(user).deposit(testAmount)
        await expect(tx).to.be.revertedWith("Pausable: paused")

        await simpleIndex.connect(deployer).unpause()

        // USER CAN DEPOSIT => UNPAUSED
        await want.connect(user).approve(simpleIndex.address, wantBalanceStart)
        await simpleIndex.connect(user).deposit(testAmount)

        // User can withdraw
        await simpleIndex.connect(user).withdrawAll()
        const wantBalanceEnd = await want.balanceOf(user.address)
        expect(wantBalanceEnd).to.be.gt(wantBalanceStart.mul(99).div(100))
    })

    it("It has the correct owner.", async () => {
        const simpleIndexOwner = await simpleIndex.owner()

        expect(simpleIndexOwner).to.equal(deployer.address)
    })

})