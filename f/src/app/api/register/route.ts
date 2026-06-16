import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/services/auth-service';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().default('candidate')
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role } = schema.parse(body);

    const response = await authService.register({
      email,
      password,
      role
    });

    return NextResponse.json({
      user: {
        id: response.user.id,
        email: response.user.email,
        role: response.user.role
      }
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e.response?.data?.detail || e.message || 'Registration failed'
      },
      { status: 400 }
    );
  }
}
