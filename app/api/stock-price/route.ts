import { NextRequest, NextResponse } from "next/server";

// In-memory rate limiter: 10 requests per minute per IP
const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;
const rateMap = new Map<string, { count: number; resetTime: number }>();

// Prune stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateMap) {
    if (now > entry.resetTime) {
      rateMap.delete(ip);
    }
  }
}, 5 * 60_000);

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  const ticker = request.nextUrl.searchParams.get("ticker");

  if (!ticker || !/^[A-Z]{1,5}$/.test(ticker)) {
    return NextResponse.json(
      { success: false, error: "Invalid ticker symbol" },
      { status: 400 }
    );
  }

  const finnhubKey = process.env.FINNHUB_API_KEY;

  // Try Finnhub first
  if (finnhubKey) {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${finnhubKey}`
      );

      if (response.ok) {
        const data = await response.json();
        const quote = data?.c;
        if (quote && quote > 0) {
          return NextResponse.json({
            success: true,
            price: parseFloat(quote.toFixed(2)),
            source: "Finnhub",
          });
        }
      }
    } catch {
      // Finnhub failed, try fallback
    }
  }

  // Try Yahoo Finance as fallback
  try {
    const response = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`
    );

    if (response.ok) {
      const data = await response.json();
      const quote = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (quote) {
        return NextResponse.json({
          success: true,
          price: parseFloat(quote.toFixed(2)),
          source: "Yahoo",
        });
      }
    }
  } catch {
    // Yahoo also failed
  }

  return NextResponse.json(
    { success: false, error: "Could not fetch price from any source" },
    { status: 502 }
  );
}
