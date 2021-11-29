SimpleIndex = {
  abi: null,
  address: null,

  init: () => {
    $.getJSON('contracts/SimpleIndex.json', function(data) {
      SimpleIndex.abi = data.abi;
    })
    $.getJSON('contracts/contract-address.json', function(data) {
      SimpleIndex.address = data.SimpleIndex;
    })
  },

  getBalances: async (address) => {
    const contract = new web3.eth.Contract(SimpleIndex.abi, SimpleIndex.address)
    return await contract.methods.balanceOf(address).call()
  }
}

WETH = {
  abi: null,
  address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',

  init: () => {
    $.getJSON('contracts/WETH.json', function(data) {
      WETH.abi = data
    })
  },
}

App = {

  init: () => {
    App.MetaMaskClientCheck()

    $('#approve-btn').click(async () => {
      $('#approve-btn').attr('disabled', true)
      $('#approve-btn').text('Waiting...')

      const account = web3.eth.defaultAccount
      const contract = new web3.eth.Contract(WETH.abi, WETH.address)

      const weiValue = Web3.utils.toWei('1', 'ether')
      const response = await contract.methods.approve(SimpleIndex.address, weiValue)
        .send({ from: account })
        .on('receipt', (receipt) => {
          $('#approve-btn').addClass('d-none')
          $('#deposit-btn').removeClass('d-none')
        })
        .on('error', (error) => {
          console.log('error', error)
        })
    })


    $('#deposit-btn').click(async () => {
      $('#deposit-btn').attr('disabled', true)
      $('#deposit-btn').text('Waiting...')

      const depositAmount = $('#deposit-amount').val()
      const weiValue = Web3.utils.toWei(depositAmount, 'ether')

      const account = web3.eth.defaultAccount
      const contract = new web3.eth.Contract(SimpleIndex.abi, SimpleIndex.address)

      const response = await contract.methods.deposit(weiValue)
        .send({ from: account })
        .on('receipt', (receipt) => {
          $('#deposit-btn').text('Deposit')
          $('#deposit-btn').attr('disabled', false)

          App.updateBalances()
        })
        .on('error', (error) => {
          console.log('error', error)
        })
    })

    $('#withdraw-btn').click(async () => {
      $('#withdraw-btn').attr('disabled', true)
      $('#withdraw-btn').text('Waiting...')

      const account = web3.eth.defaultAccount
      const contract = new web3.eth.Contract(SimpleIndex.abi, SimpleIndex.address)

      const response = await contract.methods.withdrawAll()
        .send({ from: account })
        .on('receipt', (receipt) => {
          $('#withdraw-btn').text('WITHDRAW ALL')
          $('#withdraw-btn').attr('disabled', false)

          App.updateBalances()
        })
        .on('error', (error) => {
          console.log('error', error)
        })
    })
  },

  MetaMaskClientCheck: () => {
    if (!App.isMetaMaskInstalled()) {
      $('#xconnect').text('You need Metamask!!!')
    } else {
      $('#xconnect').text('Connect to MetaMask')
      $('#xconnect').click(() => { App.onClickConnect() })
      getAccounts()
      web3 = new Web3(window.ethereum)
    }
  },

  isMetaMaskInstalled: () => {
    const { ethereum } = window
    return Boolean(ethereum && ethereum.isMetaMask)
  },

  onClickConnect: async () => {
      try {
        await ethereum.request({ method: 'eth_requestAccounts' })
        getAccounts()
      } catch (error) {
        console.error(error)
      }
  },

  updateBalances: async () => {
    const account = web3.eth.defaultAccount
    const balances = await SimpleIndex.getBalances(account)
    $('#btc-amount').text(balances[1].toString())
    $('#usdc-amount').text(balances[0].toString())

    return true
  },

  isApproved: async () => {
    const account = web3.eth.defaultAccount
    const contract = new web3.eth.Contract(WETH.abi, WETH.address)
    const allowance = await contract.methods.allowance(account, SimpleIndex.address).call()

    return allowance > 0
  }
}

const getAccounts = async () => {
    try {
      const chainId = await ethereum.request({ method: 'eth_chainId' })
      const accounts = await ethereum.request({ method: 'eth_accounts' })

      if (accounts.length == 0) {
        $('#xconnect').removeClass('d-none')
        $('#xaccount').addClass('d-none')
      } else {

        web3.eth.defaultAccount = accounts[0]
        const account = web3.eth.defaultAccount

        chain = 'Unsupported Network'
        if (chainId === '0x4') chain = 'Rinkeby'

        $('#xconnect').addClass('d-none')

        $('#xaccount').text(account.substring(0,6)+'...'+account.substr(account.length-4) + ' (' + chain + ')')
        $('#xaccount').removeClass('d-none')

        // IS APPROVED
        const isApproved = await App.isApproved()
        if (isApproved) {
          $('#approve-btn').addClass('d-none')
          $('#deposit-btn').removeClass('d-none')
        } else {
          $('#approve-btn').removeClass('d-none')
          $('#deposit-btn').addClass('d-none')
        }

        // UPDATE BALANCES
        App.updateBalances()
      }
    } catch (error) {
      console.error(error)
    }
}

$(function() {
  // Contracts init
  WETH.init()
  SimpleIndex.init()

  App.init()
})
