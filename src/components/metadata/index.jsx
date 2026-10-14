import { APP_NAME, APP_URL } from "@/lib/constants";

// React 19 otomatis memindahkan <title>, <meta>, dan <link> ini ke <head>.
// Meta description umum ada di index.html.
export default function MetaData({ title, description }) {
  const fullTitle = title ? `${title} · ${APP_NAME}` : APP_NAME;

  return (
    <>
      <title>{fullTitle}</title>
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={APP_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:url" content={APP_URL} />
      {description && <meta property="og:description" content={description} />}
    </>
  );
}
