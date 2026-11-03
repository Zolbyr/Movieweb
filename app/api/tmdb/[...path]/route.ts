import { NextRequest, NextResponse } from "next/server";

const allowedPath = /^(movie\/(now_playing|upcoming|popular|top_rated|[1-9]\d*(\/(videos|similar|reviews))?)|search\/movie|discover\/movie|genre\/movie\/list)$/;
const allowedParams = new Set(["language", "page", "query", "with_genres", "sort_by", "append_to_response"]);

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/");
  if (!allowedPath.test(path)) {
    return NextResponse.json({ error: "Энэ хүсэлтийг боловсруулах боломжгүй байна." }, { status: 400 });
  }

  const token = process.env.TMDB_TOKEN?.trim();
  if (!token || token === "your_tmdb_api_read_access_token") {
    return NextResponse.json({ error: "Киноны мэдээллийн үйлчилгээ түр ажиллахгүй байна. Дараа дахин оролдоно уу." }, { status: 503 });
  }

  const url = new URL(`https://api.themoviedb.org/3/${path}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    if (allowedParams.has(key)) url.searchParams.set(key, value);
  });
  url.searchParams.set("include_adult", "false");
  const page = url.searchParams.get("page");
  if (page && (!/^\d+$/.test(page) || Number(page) < 1 || Number(page) > 500)) {
    return NextResponse.json({ error: "Хуудасны дугаар буруу байна. Өөр хуудас сонгоно уу." }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: { accept: "application/json", Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}` },
      signal: AbortSignal.timeout(12000),
      next: { revalidate: path === "search/movie" ? 0 : 300 },
    });
    if (!response.ok) {
      const status = response.status === 404 ? 404 : response.status === 429 ? 429 : 502;
      const error = status === 404 ? "Энэ киноны мэдээлэл олдсонгүй." : status === 429 ? "Киноны мэдээллийн үйлчилгээ ачаалалтай байна. Түр хүлээгээд дахин оролдоно уу." : "Киноны мэдээллийн үйлчилгээтэй холбогдож чадсангүй. Дахин оролдоно уу.";
      return NextResponse.json({ error }, { status });
    }
    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ error: "Киноны мэдээллийн үйлчилгээнээс хариу ирсэнгүй. Түр хүлээгээд дахин оролдоно уу." }, { status: 502 });
  }
}
