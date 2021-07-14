/*
 * SPDX-License-Identifier: Apache-2.0
 */

package main

import (

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {

	elmContract := new(ELM_SmartContract)

    cc, err := contractapi.NewChaincode(elmContract)

    if err != nil {
        panic(err.Error())
    }

    if err := cc.Start(); err != nil {
        panic(err.Error())
    }
}
