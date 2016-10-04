/* @flow */

exports.accessTokenLength = 256;

exports.getDatabaseURL = function(): ?string {
    if (isAppStagingInstance()) {
        return process.env.STAGING_BLANKY_DATABASE_URL;
    } else if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "testing") {
        return process.env.TESTING_BLANKY_DATABASE_URL;
    } else {
        return process.env.BLANKY_DATABASE_URL;
    }
};

var isAppStagingInstance = function(): boolean {
    return __dirname.indexOf("staging") >= 0;  // server.js belongs to a directory that contains word "staging". I recommend hosting your code in /staging.blanky.com/app/server.js for the staging environment.
};
exports.isAppStagingInstance = isAppStagingInstance;
