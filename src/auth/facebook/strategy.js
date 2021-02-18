/**
 * Module dependencies.
 */
var passport = require('passport-strategy'),
    util = require('util'),
    lookup = require('./utils').lookup;


/**
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
    if (typeof options == 'function') {
        verify = options;
        options = {};
    }
    if (!verify) { throw new TypeError('FacebookStrategy requires a verify callback'); }

    this._usernameField = options.usernameField || 'userID';
    this._passwordField = options.passwordField || 'accessToken';

    passport.Strategy.call(this);
    this.name = 'facebook';
    this._verify = verify;
    this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on the contents of a form submission.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
    options = options || {};
    var username = lookup(req.body.authResponse, this._usernameField) || lookup(req.query, this._usernameField);
    var password = lookup(req.body.authResponse, this._passwordField) || lookup(req.query, this._passwordField);

    if (!username || !password) {
        return this.fail({ message: options.badRequestMessage || 'Missing credentials' }, 400);
    }

    var self = this;

    function verified(err, user, info) {
        if (err) { return self.error(err); }
        if (!user) { return self.fail(info); }
        self.success(user, info);
    }

    try {
        if (self._passReqToCallback) {
            this._verify(req, username, password, verified);
        } else {
            this._verify(username, password, verified);
        }
    } catch (ex) {
        return self.error(ex);
    }
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;