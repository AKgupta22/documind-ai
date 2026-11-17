import type { SignupErrorResponse, SignupResponse } from '@documind/shared';
import type { RequestHandler } from 'express';
import type { PrismaClient } from '../generated/prisma/client';
import { signupUser, validateSignupRequest } from '../services/auth.service';

export function createSignupController(prisma: PrismaClient): RequestHandler {
  return async (request, response) => {
    const validation = validateSignupRequest(request.body);

    if (!validation.ok) {
      const body: SignupErrorResponse = {
        error: 'Validation failed',
        fieldErrors: validation.fieldErrors,
      };

      response.status(400).json(body);
      return;
    }

    const result = await signupUser(prisma, validation.data);

    if (!result.ok) {
      const body: SignupErrorResponse = {
        error: 'An account with this email already exists.',
        fieldErrors: { email: 'This email is already registered.' },
      };

      response.status(409).json(body);
      return;
    }

    const body: SignupResponse = { user: result.user };

    response.status(201).json(body);
  };
}
