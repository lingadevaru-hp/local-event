// src/pages/api/status.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    status: 'OK',
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    clerkSecretKey: process.env.CLERK_SECRET_KEY ? 'Set' : 'Not Set',
    environment: process.env.NODE_ENV,
  });
}