import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import type { CreateAuthChallengeTriggerHandler } from 'aws-lambda';

const ses = new SESClient({ region: process.env.AWS_REGION ?? 'us-east-1' });

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  let secretCode: string;

  if (event.request.session.length === 0) {
    secretCode = String(Math.floor(100000 + Math.random() * 900000));

    await ses.send(
      new SendEmailCommand({
        Destination: { ToAddresses: [event.request.userAttributes.email] },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: `<p>Your Vida login code is: <strong>${secretCode}</strong></p><p>This code expires in 3 minutes.</p>`,
            },
            Text: {
              Charset: 'UTF-8',
              Data: `Your Vida login code is: ${secretCode}. This code expires in 3 minutes.`,
            },
          },
          Subject: { Charset: 'UTF-8', Data: 'Your Vida login code' },
        },
        Source: process.env.SES_FROM_EMAIL!,
      }),
    );
  } else {
    // Reuse the code stored in challengeMetadata from the previous attempt
    const prev = event.request.session[event.request.session.length - 1];
    secretCode = prev.challengeMetadata!;
  }

  event.response.publicChallengeParameters = {
    email: event.request.userAttributes.email,
  };
  event.response.privateChallengeParameters = { answer: secretCode };
  event.response.challengeMetadata = secretCode;

  return event;
};
