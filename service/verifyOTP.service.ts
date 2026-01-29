"use server"

import { cookies } from 'next/headers'
import { api } from './api'

interface verifyOTPResponse{
    user: {
      name: string;
      email: string;
      password: string;
      id: string;
      role: string;
      status: string;
      planPaid: boolean;
      createdAt: Date;
  },
  token: string;
}

export async function verifyOTP(email: string, code: string) {
     const res: {data:verifyOTPResponse} = await api.post(
      "/auth/verify",
      { email, code },
      { withCredentials: true }
    );
    const cookieStore = await cookies()
    console.log(res)
    cookieStore.set('token', res.data.token, { httpOnly: true, path: '/' })

    return {user: res.data.user, token: res.data.token};
}
