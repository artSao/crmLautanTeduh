import { NextRequest } from "next/server";

const REMOTE_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://rakaascode.site/api";

function getTargetUrl(pathSegments: string[] | undefined, search: string) {
  const baseUrl = new URL(REMOTE_API_BASE_URL);
  const path = pathSegments?.join("/") ?? "";
  const targetUrl = new URL(baseUrl.toString());
  targetUrl.pathname = `${baseUrl.pathname.replace(/\/$/, "")}/${path}`;
  targetUrl.search = search;
  return targetUrl.toString();
}

async function proxy(request: NextRequest, params: { path?: string[] }) {
  const targetUrl = getTargetUrl(params.path, request.nextUrl.search);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("origin");
  headers.delete("referer");

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.body,
    duplex: "half",
  } as RequestInit & { duplex?: "half" });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("transfer-encoding");

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxy(request, await context.params);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxy(request, await context.params);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxy(request, await context.params);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxy(request, await context.params);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxy(request, await context.params);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  return proxy(request, await context.params);
}
