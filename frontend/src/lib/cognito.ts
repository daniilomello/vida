import { AuthenticationDetails, CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";

const REGION = import.meta.env.VITE_COGNITO_REGION;
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const COGNITO_ENDPOINT = `https://cognito-idp.${REGION}.amazonaws.com/`;

interface AuthResult {
  AccessToken: string;
  IdToken: string;
  RefreshToken: string;
}

async function cognitoPost(target: string, body: object): Promise<Record<string, unknown>> {
  const res = await fetch(COGNITO_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": `AmazonCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      typeof data.message === "string" ? data.message : String(data.__type ?? "Cognito error");
    throw new Error(msg);
  }
  return data;
}

async function persistSession(
  accessToken: string,
  idToken: string,
  refreshToken: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/auth/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ accessToken, idToken, refreshToken }),
  });
  if (!res.ok) throw new Error("Failed to create session — backend not yet available");
}

export async function initiateOtp(email: string): Promise<string> {
  const data = await cognitoPost("InitiateAuth", {
    AuthFlow: "CUSTOM_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: { USERNAME: email },
  });
  return data.Session as string;
}

export async function verifyOtp(email: string, session: string, code: string): Promise<void> {
  const data = await cognitoPost("RespondToAuthChallenge", {
    ChallengeName: "CUSTOM_CHALLENGE",
    ClientId: CLIENT_ID,
    Session: session,
    ChallengeResponses: { USERNAME: email, ANSWER: code },
  });
  const result = data.AuthenticationResult as AuthResult;
  await persistSession(result.AccessToken, result.IdToken, result.RefreshToken);
}

export async function loginWithPassword(email: string, password: string): Promise<void> {
  const pool = new CognitoUserPool({ UserPoolId: USER_POOL_ID, ClientId: CLIENT_ID });
  const user = new CognitoUser({ Username: email, Pool: pool });
  const authDetails = new AuthenticationDetails({ Username: email, Password: password });

  await new Promise<void>((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: async (result) => {
        try {
          await persistSession(
            result.getAccessToken().getJwtToken(),
            result.getIdToken().getJwtToken(),
            result.getRefreshToken().getToken(),
          );
          resolve();
        } catch (err) {
          reject(err);
        }
      },
      onFailure: (err) => reject(new Error(err.message ?? "Authentication failed")),
    });
  });
}
