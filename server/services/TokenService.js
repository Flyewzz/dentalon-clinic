// tokenService.js
const jwt = require('jsonwebtoken');
const Token = require('../domain/model/Token');
const User = require('../domain/model/User');

const JWT_ACCESS_EXPIRATION = '15m';
const JWT_REFRESH_EXPIRATION = '7d';

class TokenService {
    constructor(jwt_data) {
        this.jwt_secret = jwt_data.jwt_secret;
        this.refresh_token_secret = jwt_data.refresh_token_secret;  
    }

    async generateNewTokens(user, ipAddress) {
        const accessToken = jwt.sign(
            {userId: user._id, role: user.role},
            this.jwt_secret,
            {expiresIn: JWT_ACCESS_EXPIRATION}
        );

        const refreshToken = jwt.sign(
            {userId: user._id, role: user.role},
            this.refresh_token_secret,
            {expiresIn: JWT_REFRESH_EXPIRATION}
        );

        const newToken = new Token({
            userId: user._id,
            token: refreshToken,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // expires in 7 days
            createdByIp: ipAddress
        });

        await newToken.save();
        return {accessToken, refreshToken};
    }
    
    async refreshAccessToken(refreshToken) {
        const tokenDoc = await Token.findOne({token: refreshToken, revoked: {$exists: false}});
        if (!tokenDoc || tokenDoc.expires < new Date()) {
            return null;
        }

        const payload = jwt.verify(refreshToken, this.refresh_token_secret);
        return this.generateNewTokens(await User.findById(payload.userId), tokenDoc.createdByIp);
    }
    
}

module.exports = TokenService;
