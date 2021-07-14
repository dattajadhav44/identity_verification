#!/bin/bash
source <(./magnetocorp.sh)
./magnetocorp.sh 
cd $PWD/contract-go
go mod vendor
cd ..
rm -rf "${1}.tar.gz"
echo "Creating chaincode package"
peer lifecycle chaincode package "${1}.tar.gz" --lang golang --path ./contract-go --label "${1}_0"
sleep 5

echo "Installing chaincode on first node"
peer lifecycle chaincode install "${1}.tar.gz"
sleep 5

echo "Exporting package ID of node 1 so that it can be used further"
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[0].package_id')
echo $PACKAGE_ID
sleep 5

echo "Approving installed chaincode on first node"
peer lifecycle chaincode approveformyorg  --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
                                          --channelID mychannel  \
                                          --name $1 \
                                          -v 0  \
                                          --package-id $PACKAGE_ID \
                                          --sequence 1  \
                                          --tls  \
                                          --cafile $ORDERER_CA
sleep 5

echo "Check readiness of the chaincode if its approved or not"
peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name $1 -v 0 --sequence 1
sleep 5

echo " Go to the second terminal now i.e on Digibank and run the pre-requisite script"
