require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    // rinkeby: {
    //   host: "localhost", // Connect to geth on the specified
    //   port: 8545,
    //   from: "0x0085f8e72391Ce4BB5ce47541C846d059399fA6c", // default address to use for any transaction Truffle makes during migrations
    //   network_id: 4,
    // }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  // compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      version : "^0.8.0"
    }
  // }
}
