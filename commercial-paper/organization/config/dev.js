var config = {
	"PORT" : 27017,
	"MONGODB_DBNAME": "elm_database"
};

config.MONGODB_URI = `mongodb://localhost/${config.MONGODB_DBNAME}`;

module.exports = config;