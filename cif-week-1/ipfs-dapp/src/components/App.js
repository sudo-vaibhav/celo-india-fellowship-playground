import React, { Component } from 'react';
import './App.css';
import { create } from "ipfs-http-client"
import Web3 from "web3"
import Sticker from "../abis/Sticker.json"

const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol : "https"
})



class App extends Component {
  state = {
    buffer: null,
    imagePath: "",
    account: "",
    contract:{}
  }
  captureFile = (e) => {
    console.log("file captured")
    const file = e.target.files[0]
    const reader = new window.FileReader() // used to convert file to buffer
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      const buffer = Buffer(reader.result)
      console.log("buffer",
        buffer
      )
      this.setState({
        buffer
      })
    }
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      alert("please install a ethereum wallet")
    }
  }

  async loadBlockchainData() {
    const account = (await window.web3.eth.getAccounts())[0]
    console.log("account: ",account)
    this.setState({account})
  }

  async fetchSticker() {
    const stickerInfo = await (this.state.contract.methods.imagePath().call())
    console.log(stickerInfo)
    this.setState({
      imagePath: stickerInfo
    })
  }
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    const networkId = await window.web3.eth.net.getId()
    const networkData = Sticker.networks[networkId]
    if (!networkData) {
      alert("smart contract not deployed to detected network")
    }
    else {
      const contract = new window.web3.eth.Contract(Sticker.abi, networkData.address)
      console.log("contract",contract)
      this.setState({
        contract
      })
      await this.fetchSticker()
    }


  }
  // one path that i generated : QmSEn6LZYy4ifSRfYSXoC2yJJXZNoe8zf1hNqtTRkUoS2u
  // https://ipfs.infura.io/ipfs/QmSEn6LZYy4ifSRfYSXoC2yJJXZNoe8zf1hNqtTRkUoS2u
  onSubmit = async (e) => {
    e.preventDefault()
    console.log("submitting form and adding file to ipfs")
    
    const result = await ipfs.add(this.state.buffer)
    console.log("ipfs result : ", result)
    this.state.contract.methods.setSticker(result.path).send({
      from: this.state.account
    })
    .then(r => {
        console.log("receipt : ", r)
        this.setState({
          imagePath : result.path
        })
    })

  }
  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <div
            className="navbar-brand col-sm-3 col-md-2 mr-0"
          >
            Meme of the Day
          </div>
          <div className="ml-auto text-light">
            {this.state.account}
          </div>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto ">

                <img src={"https://ipfs.infura.io/ipfs/"+this.state.imagePath} className="App-logo" alt="sticker" />
                <h2 className="mt-3">Change Meme</h2>
                <form className="mt-3" onSubmit={this.onSubmit}>
                  <input type="file" onChange={this.captureFile}/>
                  <button className="btn-primary btn">Submit</button>
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
