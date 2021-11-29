// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./interfaces/IUniswapV2Router01.sol";

/// @title Contract for simple index with a 50-50 BTC-USDC split
/// @author Fabien G.
contract SimpleIndex is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /// @dev The router used for the liquidity
    address private constant UNISWAP_V2_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    /// @dev The tokens used for the liquidity
    address private constant ETH = 0xc778417E063141139Fce010982780140Aa0cD5Ab;
    address private constant BTC = 0x577D296678535e4903D59A4C929B718e1D575e0A;
    address private constant USDC = 0xeb8f08a975Ab53E34D8a0330E0D34de942C95926;

    mapping (address => uint256) private USDC_balances;
    mapping (address => uint256) private BTC_balances;

    /// @notice The token we want to use for the liquidity. It is WETH by default
    function want() public pure returns (IERC20) {
        return IERC20(ETH);
    }

    /// @notice Deposit WETH to the index
    function deposit(uint256 _amount) public nonReentrant whenNotPaused {
        want().safeTransferFrom(msg.sender, address(this), _amount);
        uint256 _amount1 = _amount.div(2);
        uint256 _amount2 = _amount.sub(_amount1);

        addUSDC(_amount1);
        addBTC(_amount2);
    }

    /// @notice Swap WETH for USDC
    function addUSDC(uint256 _amount) internal {
        uint256 _before = IERC20(USDC).balanceOf(address(this));

        uint256 _amountMin = getAmountOutMin(ETH, USDC, _amount);
        swap(ETH, USDC, _amount, _amountMin);

        uint256 _after = IERC20(USDC).balanceOf(address(this));

        USDC_balances[msg.sender] = USDC_balances[msg.sender].add(_after.sub(_before));
    }

    /// @notice Swap WETH for BTC
    function addBTC(uint256 _amount) internal {
        uint256 _before = IERC20(BTC).balanceOf(address(this));

        uint256 _amountMin = getAmountOutMin(ETH, BTC, _amount);
        swap(ETH, BTC, _amount, _amountMin);

        uint256 _after = IERC20(BTC).balanceOf(address(this));

        BTC_balances[msg.sender] = BTC_balances[msg.sender].add(_after.sub(_before));
    }

    /// @notice Balance of BTC and USDC for a given address
    function balanceOf(address _address) view public returns (uint256[] memory) {
        uint256[] memory balances = new uint256[](2);

        balances[0] = USDC_balances[_address];
        balances[1] = BTC_balances[_address];

        return balances;
    }

    /// @notice Deposit All WETH to the index
    // function depositAll() external {
        // TODO: Deposit all WETH to the contract
    // }


    /// @notice Swap USDC for WETH
    function withdrawUSDC(uint256 _amount) internal returns (uint256) {
        uint256 _before = IERC20(ETH).balanceOf(address(this));

        uint256 _amountMin = getAmountOutMin(USDC, ETH, _amount);
        swap(USDC, ETH, _amount, _amountMin);

        uint256 _after = IERC20(ETH).balanceOf(address(this));

        return _after.sub(_before);
    }

    /// @notice Swap BTC for WETH
    function withdrawBTC(uint256 _amount) internal returns (uint256) {
        uint256 _before = IERC20(ETH).balanceOf(address(this));

        uint256 _amountMin = getAmountOutMin(BTC, ETH, _amount);
        swap(BTC, ETH, _amount, _amountMin);

        uint256 _after = IERC20(ETH).balanceOf(address(this));

        return _after.sub(_before);
    }

    /// @notice Withdraw All WETH from the contract
    function withdrawAll() external {
        uint256 amount1 = withdrawUSDC(USDC_balances[msg.sender]);
        uint256 amount2 = withdrawBTC(BTC_balances[msg.sender]);

        want().safeTransfer(msg.sender, amount1.add(amount2));

        USDC_balances[msg.sender] = 0;
        BTC_balances[msg.sender] = 0;
    }

    /// @notice Pause contract to stop deposit
    /// @dev Only the contract owner can call this
    function pause() public onlyOwner {
        _pause();
    }

    /// @notice Unpause contract to start deposit
    /// @dev Only the contract owner can call this
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Get the minimum amount of token we can swap
    function getAmountOutMin(address _tokenIn, address _tokenOut, uint256 _amountIn) internal view returns (uint256) {

        address[] memory path;
        if (_tokenIn == ETH || _tokenOut == ETH) {
            path = new address[](2);
            path[0] = _tokenIn;
            path[1] = _tokenOut;
        } else {
            path = new address[](3);
            path[0] = _tokenIn;
            path[1] = ETH;
            path[2] = _tokenOut;
        }

        uint256[] memory amountOutMins = IUniswapV2Router01(UNISWAP_V2_ROUTER).getAmountsOut(_amountIn, path);
        return amountOutMins[path.length -1];
    }

    /// @notice Swap tokens
    function swap(address _tokenIn, address _tokenOut, uint256 _amountIn, uint256 _amountOutMin) internal {

        IERC20(_tokenIn).approve(UNISWAP_V2_ROUTER, _amountIn);

        address[] memory path;
        if (_tokenIn == ETH || _tokenOut == ETH) {
            path = new address[](2);
            path[0] = _tokenIn;
            path[1] = _tokenOut;
        } else {
            path = new address[](3);
            path[0] = _tokenIn;
            path[1] = ETH;
            path[2] = _tokenOut;
        }

        IUniswapV2Router01(UNISWAP_V2_ROUTER).swapExactTokensForTokens(_amountIn, _amountOutMin, path, address(this), block.timestamp);
    }
}