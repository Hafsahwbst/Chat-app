"use client";
import { Stack } from "@mui/material";
import Link from "next/link";

const ResetPasswordSuccess = () => {
  return (
    <div
      style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}
    >
      <div>
        <Stack
          alignItems="center"
          spacing={2}
          style={{ marginBottom: "2rem", textAlign: "center" }}
        >
          <h1>Password successfully reset!</h1>
          <p>Let&apos;s go! Your password has been changed successfully!</p>
          <Link
            href="/login"
            style={{
              fontSize: "0.875rem",
              color: "#000",
              textDecoration: "underline",
            }}
          >
            Login
          </Link>
        </Stack>
      </div>
    </div>
  );
};

export default ResetPasswordSuccess;