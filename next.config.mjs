/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org", port: "", pathname: "/t/p/**", search: "" },
      { protocol: "https", hostname: "media.urgoo.oneline.mn", port: "", pathname: "/films/**", search: "" },
      { protocol: "https", hostname: "www.tengis.mn", port: "", pathname: "/**" },
      { protocol: "https", hostname: "thumbnail.primecineplex.mn", port: "", pathname: "/**" },
      { protocol: "https", hostname: "www.primecineplex.mn", port: "", pathname: "/**" },
    ],
  },
};

export default nextConfig;
