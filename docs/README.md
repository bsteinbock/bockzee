# Bockzee Public Support Site (GitHub Pages)

This folder contains the public website required for Apple App Store Connect:

- Support URL page: `index.html`
- Privacy Policy URL page: `privacy.html`
- Terms of Service page: `terms.html`

## Files

- `index.html` - public support page with contact details and links
- `privacy.html` - privacy policy
- `terms.html` - terms of service
- `styles.css` - shared site styling

## Publish On GitHub Pages

1. Push this repository to GitHub.
2. In GitHub, open: `Settings` -> `Pages`.
3. Under `Build and deployment`:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/docs`
4. Save and wait for deployment.
5. Confirm the published site URL shown in Pages settings.

## App Store Connect URLs

After deployment, replace `<username>` with your GitHub username:

- Support URL:
  `https://<username>.github.io/bockzee/`
- Privacy Policy URL:
  `https://<username>.github.io/bockzee/privacy.html`
- Terms of Service URL:
  `https://<username>.github.io/bockzee/terms.html`

## Quick Validation Checklist

1. Open all public URLs in mobile and desktop browsers.
2. Confirm Support page includes a working support email.
3. Confirm Privacy Policy is publicly reachable without login.
4. Confirm Terms page is linked from Support and Privacy pages.
