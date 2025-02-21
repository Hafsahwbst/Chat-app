import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function middleware(req) {
    const cookieStore = cookies()
    const token = cookieStore.get('token') || '';
    console.log(token);
    
  try {
    if(!token){
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Fetch the authorization response
    const apiResponse = await axios.get(
      "http://localhost:5000/user/authorise",
      {
        headers: {
            'token': token
        },
        withCredentials: true,
        credentials: "include",
      }
    );

    if (apiResponse.status !== 200) {
      console.log("Authorization failed, redirecting to /login");
      return NextResponse.next()(new URL("/login", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Authorization error:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Make sure this matcher is correct for your use case:
export const config = {
  matcher: ["/user/:path*"],
};
