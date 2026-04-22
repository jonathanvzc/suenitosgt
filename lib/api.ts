import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/errors";

export const apiSuccess = <T>(data: T, init?: ResponseInit) =>
  NextResponse.json(
    {
      success: true,
      ...data,
    },
    init
  );

export const apiError = (
  error: unknown,
  fallback = "Error interno del servidor",
  status = 500
) =>
  NextResponse.json(
    {
      success: false,
      message: getErrorMessage(error, fallback),
    },
    { status }
  );
