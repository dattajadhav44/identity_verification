const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    orgName: {type: String, required: true},
    mobileNumber: {type:String, required: true},
    email: {type:String, required: true},
    isActive: {type: Boolean, required: true, default: true}
});

schema.set('toJSON', {virtuals: true});

module.exports=mongoose.model("org1Users", schema);
