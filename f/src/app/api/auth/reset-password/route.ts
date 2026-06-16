import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  code: z.string().min(6),
  new_password: z.string().min(6)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code, new_password } = schema.parse(body);

    // Make request to Django API from server-side (no CORS issues)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    const response = await fetch(`${apiUrl}/api/v1/accounts/reset-password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, code, new_password })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        {
          error: errorData || 'Failed to reset password'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e.message || 'Failed to reset password'
      },
      { status: 400 }
    );
  }
}
