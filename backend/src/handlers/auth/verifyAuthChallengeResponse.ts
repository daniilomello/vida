import type { VerifyAuthChallengeResponseTriggerHandler } from 'aws-lambda';

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (event) => {
  const expected = event.request.privateChallengeParameters.answer;
  event.response.answerCorrect = event.request.challengeAnswer === expected;
  return event;
};
