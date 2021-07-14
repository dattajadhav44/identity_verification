# identity_verification

# Please follow the below steps to execute this project

# PRE-REQUISITE
   a - Please make sure you have all the tools/softwares installed on your machine which required to run Fabric.
   
   b - Please make sure you download all the binaries from Hyperledger official site. Please use the below latest.
       ex - curl -sSL https://bit.ly/2ysbOFE | bash -s

    
1. Please clone this repository in your system.
       ex - git clone https://github.com/dattajadhav44/identity_verification.git

2. cd commercial-paper             [ Note - Navigate to commercial directory]

3. RUN the ./network-clean.sh file, this will clean up the stuff. 
       ex - ./network-clean.sh  

4. RUN the ./network-starter.sh file, this script will generate the artifacts/certificates, bring up the network,create a channel and join the channel
       ex - ./network-starter.sh

5. Go to organization directory to do the further activities. 
       ex - cd organization/magnetocorp

6. RUN pre-requisite.sh file, this will do below things for you. Make sure you pass the "elm_test" param to this script. Because this is contract name which we have used in our JS files in SKD. 
       a - Set/Export the environment variables. 
       b - compile and package chaincode.
       c - Install and first organization i.e Org2 will approve the chaincode. 
       4 - Will check the readiness of the chaincode. 
    ex - ./pre-requisite.sh elm_test 

7. Come back to organization location 
    ex cd ../

8. Go to digibank directory.
    ex - cd digibank 

9. RUN pre-requisite.sh file, this will do below things for you. Make sure you pass the "elm_test" param to this script. Because this is contract name which we have used in our JS files in SKD. 
       a - Set/Export the environment variables. 
       b - compile and package chaincode.
       c - Install and second organization i.e Org1 will approve the chaincode. 
       d - Will check the readiness of the chaincode.
       e - Commit the "elm_test" chaincode on both the peers.
    ex - ./pre-requisite.sh elm_test 
10. Now, please do the docker ps - you should have below things up and running.
       a - Two Orgs peers i.e Peer0 from Org1 and Peer0 Org2.
       b - Two CA i.e ca_1 Org1 and ca_2 Org2
       c - One Orderer running
       d - Two Couch DB, i.e couch0 from Org1 and couch1 Org2.
       e - Two chaincode running on Peer0.Org1 and Peer0.Org2

11. Come back to Organization folder to run the nodejs app
    ex - cd ../

12 Do npm install to download all the dependancies. 
    ex - npm install

13 Start the express app node, which will start linstening at 7913 PORT
    ex - node app.js

Great - You have a come a long way, smile please :)

## Now, please follow the below API Calls, execute them POSTMAN or Swagger anything that you are comfortable with. 

1. POST http://localhost:7913/api/v1/users/registration   - This is user registration API, this does registration on Blockchain as well as in MongoDB, but currently mongo db code is commented. 
    Body - 
    {
        "userName": "Dan Morries",
        "orgName": "Org1"
    }

2. POST http://localhost:7913/api/v1/identity/createNationalId  - This would create a National ID on Blockchain.
    Body -
    {
        "national_identity": "KS12347",
        "name_of_person": "Dan Morries",
        "alternate_name": "Dan Morries",
        "date_of_birth": "15/07/1985",
        "place_of_birth": "New York",
        "place_of_issue": "New Jersy",
        "fcn": "CreateNationalId",
        "orgName": "Org1",
        "userName": "Dan Morries"
    }

3. GET http://localhost:7913/api/v1/identity/getNationalId  - Get registered national ID.
    Body -
    {
        "userName": "Dan Morries",
        "orgName": "Org1",
        "national_identity": "KS12347",
        "fcn": "QueryNationalId"
    }

4. GET http://localhost:7913/api/v1/identity/getNationalId - Get All the registered national ID's.
    Body - 
    {
        "userName": "Dan Morries",
        "orgName": "Org1",
        "national_identity": "KS12347",
        "fcn": "QueryAllByNationalId"
    }

5. POST http://localhost:7913/api/v1/identity/verify/nationalId - Verify the national identity.
    Body -
    {
        "userName": "Dan Morries",
        "orgName": "Org1",
        "national_identity": "KS12347",
        "fcn": "VerifyNationalId"
    }

If all of the API execution is successfull, then many congratulations :) Great job!!! 