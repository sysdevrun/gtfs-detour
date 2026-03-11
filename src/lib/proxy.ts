const PROXY_BASE = 'https://gtfs-proxy.sys-dev-run.re/proxy/';

export function getProxyUrl(url: string): string {
  if (!url.startsWith('https://')) {
    throw new Error('URL must start with https://');
  }
  return PROXY_BASE + url.substring(8);
}

export function maybeProxy(url: string): string {
  if (
    url.startsWith('blob:') ||
    url.startsWith('http://localhost') ||
    url.startsWith('http://127.0.0.1')
  ) {
    return url;
  }
  if (url.startsWith('https://')) {
    return getProxyUrl(url);
  }
  return url;
}
