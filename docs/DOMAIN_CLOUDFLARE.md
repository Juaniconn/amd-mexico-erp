# Dominio AMD en Cloudflare (producción)

Estado actual: tunnel **rápido** `*.trycloudflare.com` → `http://127.0.0.1:80` (nginx).

Objetivo: `app.amd-mexico.com` (o el hostname que elijas) vía **Cloudflare named tunnel** + DNS en Cloudflare (dominio migrado desde AWS Route53 o NS apuntando a Cloudflare).

## Prerrequisitos (los pones tú una vez)

1. Dominio en Cloudflare (DNS activo; free plan basta).
2. En este VPS: `cloudflared tunnel login` (abre URL; autoriza la cuenta).
3. Decidir hostname, ej. `app.amd-mexico.com`.

## Crear tunnel (una vez)

```bash
cloudflared tunnel create amd-erp
# Anota el Tunnel ID; credentials en ~/.cloudflared/<TUNNEL_ID>.json

cp /home/ubuntu/data/projets/amd_web_app/infra/cloudflare/config.template.yml \
   ~/.cloudflared/config.yml
# Edita: tunnel ID, credentials-file, hostname

cloudflared tunnel route dns amd-erp app.amd-mexico.com
```

## Systemd (reemplaza el quick-tunnel)

```bash
sudo cp /home/ubuntu/data/projets/amd_web_app/infra/cloudflare/cloudflared-amd-erp.service \
  /etc/systemd/system/
# Ajusta User= y rutas si hace falta
sudo systemctl daemon-reload
# Detén el quick-tunnel actual (proceso cloudflared --url ...)
sudo systemctl enable --now cloudflared-amd-erp.service
sudo systemctl status cloudflared-amd-erp.service
```

Nginx ya escucha `:80` y enruta `/api` → Nest y `/` → Next. El tunnel solo apunta a `http://127.0.0.1:80`.

## Checklist

- [ ] Dominio en Cloudflare
- [ ] `tunnel login` + `tunnel create`
- [ ] DNS CNAME `app` → `<id>.cfargotunnel.com`
- [ ] Service systemd activo
- [ ] HTTPS funciona en `https://app.amd-mexico.com`
- [ ] Actualizar `CURSOR.md` URL de acceso

Sin login Cloudflare en este host **no se puede terminar el DNS** desde aquí; la plantilla y el unit ya están listos.
