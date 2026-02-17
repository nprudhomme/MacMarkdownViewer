# Project Notes

## Code Signing & Notarization

The app is signed and notarized by Apple with a Developer ID certificate. Do not add Gatekeeper warnings or `xattr -cr` workarounds in documentation.

- Signing identity: `Developer ID Application: NICOLAS PATRICK PRUD'HOMME (44DTA694H9)`
- Release workflow handles: certificate import, code signing, hardened runtime, notarization
- CI workflow uses `--no-sign` (no certificate available on CI runners)
