# Homepage Dashboard

A static single-page link dashboard for self-hosted apps and infra tools.

Links are loaded by the browser from `/config.json` at runtime. The build is generic:
deploy the same `dist/` directory everywhere and provide a different mounted `config.json`
per server.

## Development

```bash
pnpm install
pnpm dev
```

For local links, copy `config.example.json` to `config.json` and edit it. That file is ignored by git.
The Vite dev server exposes it at `/config.json`. With no config present, the app starts as a blank slate and
shows an empty state.

## Build

```bash
pnpm build
```

The static output is written to `dist/` and can be served by any static file server.

## Runtime config

Create a `config.json` next to the deployed static app, or mount it so Caddy serves it at `/config.json`.
Changing links only requires editing that file and refreshing the browser; no rebuild is needed.

Shape:

```json
{
  "title": "homebase",
  "links": [
    {
      "name": "Jellyfin",
      "description": "Media streaming",
      "href": "http://jellyfin.example.lan",
      "fallbackHref": "http://jellyfin.tailnet-name.ts.net",
      "icon": "Film",
      "group": "Media",
      "status": "online",
      "newTab": true
    }
  ]
}
```

`href` is the primary URL. `fallbackHref` is optional; when present, clicks briefly probe `href`
first and open `fallbackHref` if the primary URL cannot be reached. If both probes fail, the app
opens `href` so the browser shows the real connection error.

See `config.example.json` for a complete dummy config. Real `config.json` files are ignored and should not be
committed.

## Deployment

Build once, copy `dist/` to the static web root, and mount a hand-edited config file separately.

The included `Caddyfile` expects:

- Static build files at `/srv/homepage-dashboard`
- Runtime config mounted at `/config/config.json`

Example Docker run using the stock Caddy image:

```bash
pnpm build
docker run --rm -p 8080:80 \
  -v "$PWD/dist:/srv/homepage-dashboard:ro" \
  -v "/path/on/server/config.json:/config/config.json:ro" \
  -v "$PWD/Caddyfile:/etc/caddy/Caddyfile:ro" \
  caddy:2
```

On a fresh server, start with:

```bash
cp config.example.json /path/on/server/config.json
```

Then edit `/path/on/server/config.json` by hand for that server's LAN/Tailscale links.

## Self-hosted runner deploy

Pushes to `main` run `.github/workflows/deploy.yml` on a self-hosted runner with the `homepage-dashboard` label.
The runner builds the app and deploys `dist/` locally to `/srv/homepage-dashboard`.

The runner user must be able to write to:

```text
/srv/homepage-dashboard
```

The workflow does not write the runtime config. Keep the production config on the server at:

```text
/config/config.json
```
