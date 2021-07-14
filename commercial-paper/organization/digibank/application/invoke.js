/*
SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access ehr network
 * 4. Construct request to issue ehr txs
 * 5. Submit transaction
 * 6. Process response
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');

// Main program function
const invokeSmartContract = async function (args) {

    console.log("The args are", args);
    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet(`../identity/user/${args.userName}/wallet`);

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        const userName = args.userName;
        
        // Load connection profile; will be used to locate a gateway
        const ccpPath = path.resolve(__dirname, '../gateway/connection-org1.yaml');
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
        await contract.submitTransaction(args.fcn, 
                                         args.national_identity, 
                                         args.name_of_person, 
                                         args.alternate_name, 
                                         args.date_of_birth,
                                         args.place_of_birth,
                                         args.place_of_issue);
        console.log('Transaction has been submitted');
        
        console.log('Transaction complete.');
    } catch (error) {

        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);

    } finally {

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        gateway.disconnect();
        return true;
    }
}

exports.invokeSmartContract = invokeSmartContract;

