/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');


// Main program function
const querySmartContract = async function (args) {

    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet(`../identity/user/${args.userName}/wallet`);

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        // const userName = 'isabella.issuer@magnetocorp.com';
        const userName = args.userName;

        // Load connection profile; will be used to locate a gateway
        const ccpPath = path.resolve(__dirname, '../gateway/connection-org2.yaml');
        let connectionProfile = yaml.safeLoad(fs.readFileSync(ccpPath, 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled: true, asLocalhost: true }
        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access PaperNet network
        console.log('Use network channel: mychannel.');

        const network = await gateway.getNetwork('mychannel');

        // Get addressability to commercial paper contract
        console.log('Use org.papernet.elm smart contract.');

        const contract = await network.getContract('elm_test');

        // to be committed to the ledger.
        const response = await contract.submitTransaction(args.fcn, args.national_identity);
        console.log('Transaction complete.');
         return response;
    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);

    } finally {
        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        gateway.disconnect();
        //return response;
    }
}

exports.querySmartContract = querySmartContract;

