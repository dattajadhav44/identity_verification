const User = require('./user.model');
const bcrypt = require("bcryptjs");

let registerUser = async (userParms) => {
    if (await User.findOne({ name: userParms.name })) {
        return false
    }

    const user = new User(userParms);

    if (userParms.password) {
        user.password = bcrypt.hashSync(userParms.password, 10);
    }

    console.log("user:" + user);

    await user.save();
    return true;
};

let validateUser = async (name, password) => {
    const user = await User.findOne({ name });
    let response = []
    let loginRes;
    if (user && bcrypt.compareSync(password, user.password)) {
        loginRes = { "Status": true }
        response.push(loginRes);
        return response;
    }
    loginRes = { "Status": false }
    response.push(loginRes);
    return response;
};

module.exports = {
    validateUser,
    registerUser
}
