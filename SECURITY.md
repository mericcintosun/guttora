# SECURITY: Guttora

## 1. Contract addresses and chain id

None. Guttora has no blockchain component: no contracts, no chain, no wallet code.

## 2. Permissions the app requests

- None from a wallet.
- The browser microphone, requested only when you press "Start listening" on `/play` (`start()` in `components/drip-listener.tsx`). Loading any page never asks for it. The `Permissions-Policy` header allows the microphone for this origin only, and turns off the camera and geolocation.
- Audio is processed in the tab and never uploaded. A recording you choose with "Or a recording" is decoded locally in the browser.
- The repair list lives in this browser's localStorage under `guttora.repair-list.v1`. Nothing is stored on a server.
- The clipboard is written only when you press "Copy repair request".

## 3. Approvals and spenders

None.

## 4. Source

- Source: https://github.com/mericcintosun/guttora
- Deployed at: https://guttora.vercel.app

## Reporting a problem

Open a GitHub issue on https://github.com/mericcintosun/guttora. Please leave out personal data and audio you do not want made public.
