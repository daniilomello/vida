import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from "amazon-cognito-identity-js";

const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID;

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

let _otpUser: CognitoUser | null = null;

function makePool() {
  return new CognitoUserPool({ UserPoolId: USER_POOL_ID, ClientId: CLIENT_ID });
}

export async function signUp(email: string, password: string): Promise<void> {
  const pool = makePool();
  const attrs = [new CognitoUserAttribute({ Name: "email", Value: email })];
  return new Promise((resolve, reject) => {
    pool.signUp(email, password, attrs, [], (err) => {
      if (err) reject(new Error(err.message ?? "Sign up failed"));
      else resolve();
    });
  });
}

export async function signUpOtp(email: string): Promise<string> {
  const randomPw = `Aa1!${crypto.randomUUID().replace(/-/g, "")}`;
  await signUp(email, randomPw);
  return randomPw;
}

export async function confirmSignup(email: string, code: string): Promise<void> {
  const user = new CognitoUser({ Username: email, Pool: makePool() });
  return new Promise((resolve, reject) => {
    user.confirmRegistration(code, true, (err) => {
      if (err) reject(new Error(err.message ?? "Confirmation failed"));
      else resolve();
    });
  });
}

export async function initiateOtp(email: string): Promise<void> {
  const user = new CognitoUser({ Username: email, Pool: makePool() });
  user.setAuthenticationFlowType("CUSTOM_AUTH");
  _otpUser = user;

  return new Promise((resolve, reject) => {
    user.initiateAuth(new AuthenticationDetails({ Username: email }), {
      customChallenge: () => resolve(),
      onSuccess: () => resolve(),
      onFailure: (err) => {
        _otpUser = null;
        reject(new Error(err.message ?? "Failed to send code"));
      },
    });
  });
}

export async function verifyOtp(code: string): Promise<AuthTokens> {
  if (!_otpUser) throw new Error("No active OTP session");

  return new Promise((resolve, reject) => {
    _otpUser?.sendCustomChallengeAnswer(code, {
      onSuccess: (result) => {
        _otpUser = null;
        resolve({
          accessToken: result.getAccessToken().getJwtToken(),
          idToken: result.getIdToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
        });
      },
      onFailure: (err) => {
        _otpUser = null;
        reject(new Error(err.message ?? "Invalid or expired code"));
      },
      customChallenge: () => reject(new Error("Invalid code, please try again")),
    });
  });
}

export async function loginWithPassword(email: string, password: string): Promise<AuthTokens> {
  const user = new CognitoUser({ Username: email, Pool: makePool() });

  return new Promise<AuthTokens>((resolve, reject) => {
    user.authenticateUser(new AuthenticationDetails({ Username: email, Password: password }), {
      onSuccess: (result) => {
        resolve({
          accessToken: result.getAccessToken().getJwtToken(),
          idToken: result.getIdToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
        });
      },
      onFailure: (err) => reject(new Error(err.message ?? "Authentication failed")),
    });
  });
}
