/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const user = require('../../authentication/users/user.service');

const registerUser = async function(args) {
    try {
        // load the network configuration

        const ccpPath = path.resolve(__dirname, '../gateway/connection-org2.yaml');
        let connectionProfile = yaml.safeLoad(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caInfo = connectionProfile.certificateAuthorities['ca.org2.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), `../identity/user/${args.userName}/wallet`);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const userExists = await wallet.get(args.userName);
        if (userExists) {
            console.log(`An identity for the client user ${args.userName} already exists in the wallet`);
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'user1', enrollmentSecret: 'user1pw' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org2MSP',
            type: 'X.509',
        };
        await wallet.put(args.userName, x509Identity);
        
        // let userInfo = { name: args.userName, password: args.pwd, orgName: args.orgName, mobileNumber: args.userMobile, email: args.userEmail };
        // if (await user.registerUser(userInfo)) {
        //     console.log("User added to mongo. Creating certificate.");
        //  } else {
        //     console.log("User already exist in mongo. Creating certificate.");
        //     return { success: "400", message: "User Id already exist." };
        //  }
            
        console.log(`Successfully enrolled client user ${args.userName} and imported it into the wallet`);

        return true;
    } catch (error) {
        console.error(`Failed to enroll client user ${args.userName}: ${error}`);
        process.exit(1);
    }
}

exports.registerUser = registerUser;

