import { SendEmailCommand } from "@aws-sdk/client-ses";
import type { CreateAuthChallengeTriggerHandler } from "aws-lambda";
import { sesClient } from "../../../clients/ses";

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  let secretCode: string;

  if (event.request.session.length === 0) {
    if (event.request.userNotFound) {
      throw new Error("No account found for this email address.");
    }

    secretCode = String(Math.floor(100000 + Math.random() * 900000));

    await sesClient.send(
      new SendEmailCommand({
        Destination: { ToAddresses: [event.request.userAttributes.email] },
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: `<p>Your Vida login code is: <strong>${secretCode}</strong></p><p>This code expires in 3 minutes.</p>`,
            },
            Text: {
              Charset: "UTF-8",
              Data: `Your Vida login code is: ${secretCode}. This code expires in 3 minutes.`,
            },
          },
          Subject: { Charset: "UTF-8", Data: "Your Vida login code" },
        },
        Source: process.env.SES_FROM_EMAIL ?? "noreply@vida.app",
      }),
    );
  } else {
    const prev = event.request.session[event.request.session.length - 1];
    secretCode = prev.challengeMetadata ?? "";
  }

  event.response.publicChallengeParameters = {
    email: event.request.userAttributes.email,
  };
  event.response.privateChallengeParameters = { answer: secretCode };
  event.response.challengeMetadata = secretCode;

  return event;
};
