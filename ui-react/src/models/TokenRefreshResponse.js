// TokenRefreshResponse.js
export class TokenRefreshResponse {
  constructor(accessToken, refreshToken, grantType) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.grantType = grantType;
  }
}

export default TokenRefreshResponse; 