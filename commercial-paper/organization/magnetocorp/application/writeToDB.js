var schema = require('../schema/usrSchema');

var register = (user) => {
    var promise = new Promise((resolve, reject) => {
        var document = new schema(user);
        document.save().then(function (result) {

            if (result.isError) {
                var response = { isError: true, user: {} };
                resolve(response);
            } else {
                result = JSON.parse(JSON.stringify(result));
                result.text = text;
                var response = { isError: false, user: result };
                resolve(response);
            }

        }).catch((err) => {
            var response = { isError: true, user: {} };
            resolve(response);
        });
    });

    return promise;
};

module.exports = { register }
