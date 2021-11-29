const swapNativeForToken = async ({ unirouter, amount, nativeTokenAddr, token, recipient, swapSignature }) => {
    if (token.address === nativeTokenAddr) {
      await wrapNative(amount, nativeTokenAddr);
      return;
    }

    try {
      await unirouter[swapSignature](0, [nativeTokenAddr, token.address], recipient, 5000000000, {
        value: amount,
      });
    } catch (e) {
      console.log(`Could not swap for ${token.address}: ${e}`);
    }
};

const getUnirouterData = () => {
  return {
    address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    interface: "IUniswapV2Router02",
    swapSignature: "swapExactETHForTokens",
  };
};

module.exports = {
    swapNativeForToken,
    getUnirouterData,
};