import { NextResponse } from "next/server";

export async function middleware(req) {
    const token = req.cookies.get("token");

    if (!token) {
        console.log("No token found, redirecting to login...");
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    try {
        console.log("Sending request to API for authorization...");

        const apiResponse = await fetch("http://localhost:5000/user/authorise", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token.value}`,
                "Content-Type": "application/json",
                Cookie: req.headers.get("cookie"), // Manually forward cookies
            },
        });

        console.log("API Response Status:", apiResponse.status);

        if (!apiResponse.ok) {
            console.log("Authorization failed, redirecting to /login");
            return NextResponse.redirect(new URL("/login", req.nextUrl));
        }

        console.log("Authorization successful");
        return NextResponse.next();
    } catch (error) {
        console.error("Authorization error:", error);
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
}

export const config = {
    matcher: ["/user/:path*", "/api/user/:path*","/chat/:path*"], 
};
