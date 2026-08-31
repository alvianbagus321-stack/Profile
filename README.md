# Alvian Bagus Wijaksono — Portfolio

Portfolio pribadi Alvian Bagus Wijaksono — siswa X-4, SMA Negeri 1 Babat, Lamongan.

Dibangun murni dengan **HTML + CSS + JavaScript** tanpa framework, siap di-hosting di **GitHub Pages**.

## Pratinjau lokal

Cukup buka `index.html` di browser, atau jalankan server statis:

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

## Struktur

```
index.html
assets/
  css/style.css
  js/main.js
  favicon.svg
  og.png
  screenshots/*.svg   # pratinjau karya (placeholder SVG, mudah diganti foto asli)
```

## Fitur

- Dark, editorial — navy berlapis dengan aksen biru → violet → cyan
- Hero: nama gradient fill, glow ambien, marquee ticker teknologi di bawahnya
- Animasi scroll sinematik (translate + blur + scale), grid bergerak, 3 blob float, grain halus
- Tombol magnetik (desktop) &amp; kartu proyek 3D tilt dengan spotlight mengikuti kursor
- Progress bar gradien, underline nav gradien, kartu ber-shadow &amp; glow
- Skill dengan level jujur: **Dasar / Menengah / Mahir**
- Playground "Profil dalam Kode" — Python palsu dengan tombol ▶ Run
- Proyek nyata dari GitHub (`Ai-code`, `Camera-ai`, `Items-reconigtion-`, `Bazar-X-4-web`)
- Status **Dalam Pengembangan** untuk proyek yang belum rilis
- Garis waktu perjalanan belajar, galeri dengan lightbox, kontak langsung ke WhatsApp
- Scroll reveal, parallax halus, kursor custom (desktop), latar interaktif
- SEO lengkap: title, meta description, Open Graph, Twitter card, JSON-LD, favicon
- Responsif, aksesibel, hormat pada `prefers-reduced-motion`

## Cara mengganti tangkapan layar

File di `assets/screenshots/` adalah placeholder SVG. Ganti dengan tangkapan layar asli
(jpg/png) lalu sesuaikan `src` di `index.html` — ukuran disarankan 1200×700 untuk cover
proyek dan 720×1600 untuk galeri.

---

© 2026 Alvian Bagus Wijaksono
