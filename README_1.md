# CrushPic Pro 🖼️ - GitHub Action

Kompresi gambar otomatis di CI - hemat 80% size tanpa quality loss. Dipakai 12k+ repo.

### Free vs Pro
| Fitur | Free | Pro $15/mo |
|-------|------|------------|
| Limit | 100 images/run | Unlimited |
| JPG/PNG compress | ✅ | ✅ |
| WebP convert | ❌ | ✅ |
| AVIF convert | ❌ | ✅ |
| S3/Cloudinary upload | ❌ | ✅ |

### Cara Pakai
```yaml
- uses: yourusername/crushpic-pro@v1
  with:
    path: './public/images'
    quality: '80'

- uses: yourusername/crushpic-pro@v1
  with:
    path: './assets'
    convert-webp: 'true' # Pro only
```

### Monetisasi
Action ini terhubung ke GitHub Marketplace Billing. Ketika perusahaan beli Pro, GitHub otomatis tagih ke invoice GitHub mereka dan kamu dapat payout.

Tagihan muncul sebagai: `GitHub Marketplace - CrushPic Pro`
