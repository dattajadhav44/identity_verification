package main

/* Imports
 * 4 utility libraries for formatting, handling bytes, reading and writing JSON, and string manipulation
 * 2 specific Hyperledger Fabric specific libraries for Smart Contracts
 */
import (
	"bytes"
	"encoding/json"
	"strconv"
	"time"
	"errors"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// Define the Smart Contract structure
type ELM_SmartContract struct {
	contractapi.Contract
}

// Define the patient structure, with 4 properties.  Structure tags are used by encoding/json library
type User_Details struct {
	National_Identity string `json:"national_identity"`
	Name_Of_Person    string `json:"name_of_person"`
	Alternate_Name    string `json:"alternate_name"`
	Date_Of_Birth     string `json:"date_of_birth"`
	Place_Of_Birth    string `json:"place_of_birth"`
	Place_Of_Issue    string `json:"place_of_issue"`
	Is_Verified        bool   `json:"is_verified"`
}

/*
 * The Invoke method is called as a result of an application request to run the Smart Contract "ehr_smart_contract"
 * The calling application program has also specified the particular smart contract function to be called, with arguments
 */

func (s *ELM_SmartContract) CreateNationalId(ctx contractapi.TransactionContextInterface, 
	                                         national_identity string, 
											 name_of_person string, 
											 alternate_name string,
											 date_of_birth string, 
											 place_of_birth string, 
											 place_of_issue string) error {
	

	var person_info = User_Details{National_Identity: national_identity, 
		                           Name_Of_Person: name_of_person, 
								   Alternate_Name: alternate_name, 
								   Date_Of_Birth: date_of_birth, 
								   Place_Of_Birth: place_of_birth, 
								   Place_Of_Issue: place_of_issue,
								   Is_Verified: false}

	userAsBytes, _ := json.Marshal(person_info)
	ctx.GetStub().PutState(national_identity, userAsBytes)

	return nil
}

func (s *ELM_SmartContract) QueryNationalId(ctx contractapi.TransactionContextInterface, national_identity string) (string, error) {
	
	userAsBytes, err := ctx.GetStub().GetState(national_identity)
	
    if err != nil {
        return "", errors.New("Unable to interact with world state")
    }

    if userAsBytes == nil {
        return "", fmt.Errorf("Cannot read world state pair with key %s. Does not exist", national_identity)
    }

	print("printing the output of QueryNational Id", userAsBytes)
    return string(userAsBytes), nil
}

func (s *ELM_SmartContract) VerifyNationalId(ctx contractapi.TransactionContextInterface, national_identity string) (string, error) {
	
	userAsBytes, err := ctx.GetStub().GetState(national_identity)
	
    if err != nil {
        return "", errors.New("Unable to interact with world state")
    }
    
    if userAsBytes == nil {
        return "", fmt.Errorf("Cannot read world state pair with key %s. Does not exist", national_identity)
    }

	updateInfo := &User_Details{}
	errOne := json.Unmarshal(userAsBytes, updateInfo)
	if errOne != nil {
		return "", errors.New("Cannot read world state pair with key %s. Does not exist")
	}
	u_id := updateInfo.National_Identity
	u_nm := updateInfo.Name_Of_Person
	u_anm := updateInfo.Alternate_Name
	u_dob := updateInfo.Date_Of_Birth
	u_pob := updateInfo.Place_Of_Birth
	u_poi := updateInfo.Place_Of_Issue
	u_isv := updateInfo.Is_Verified
  
	if u_isv == true {
	   return string("The National Id is already verified by the concern authority"), nil   
	} else {
		var user_info = User_Details{National_Identity: u_id, 
			Name_Of_Person: u_nm, 
			Alternate_Name: u_anm, 
			Date_Of_Birth: u_dob, 
			Place_Of_Birth: u_pob, 
			Place_Of_Issue: u_poi, 
			Is_Verified: true}

		verifiedUserAsBytes, _ := json.Marshal(user_info)
		ctx.GetStub().PutState(u_id, verifiedUserAsBytes)

		print("National id has been verified and marked the status as True")
		return string("User id verified."), nil
	}
	
}

func (s *ELM_SmartContract) QueryAllByNationalId(ctx contractapi.TransactionContextInterface, national_identity string) (string, error) {
	resultsIterator, err := ctx.GetStub().GetHistoryForKey(national_identity)
	if err != nil {
		return "", errors.New("Unable to interact with world state") 
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing historic values for the patient
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return "", errors.New("Unable to interact with world state")
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")
		// if it was a delete operation on given key, then we need to set the corresponding value null. Else, we will write the response.Value as-is (as the Value itself a JSON marble)
		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}

		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		buffer.WriteString("\"")

		buffer.WriteString(", \"IsDelete\":")
		buffer.WriteString("\"")
		buffer.WriteString(strconv.FormatBool(response.IsDelete))
		buffer.WriteString("\"")

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- get history of all the user returning:\n%s\n", buffer.String())
	return string(buffer.Bytes()), nil
}
