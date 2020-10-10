---
title: Creating .d.ts Files from .js files
layout: docs
permalink: /docs/handbook/declaration-files/dts-from-js.html
oneline: "How to add d.ts generation to JavaScript projects"
translatable: true
---

[Dengan Typescript 3.7](/docs/handbook/release-notes/typescript-3-7.html#--declaration-and---allowjs), Typescript menambahkan dukungan untuk menghasilkan file .d.ts dari Javascript menggunakan sintaks JSDoc.

Pengaturan ini berarti Anda memiliki editor yang mendukung Typescript tanpa memindahkan proyek anda ke Typescript, atau harus memelihara file .d.ts di basis kodemu.
TypeScript mendukung sebagian besar tag JSDoc, Anda bisa menemukannya [di referensi ini](/docs/handbook/type-checking-javascript-files.html#supported-jsdoc).

## Menyiapkan proyekmu untuk menggunakan file .d.ts

Untuk menambahkan pembuatan file .d.ts di proyekmu, Anda perlu melakukan hingga empat langkah:

- Tambahkan TypeScript ke dependensi dev Anda
- Tambahkan `tsconfig.json` untuk mengkonfigurasi TypeScript
- Jalankan compiler TypeScript untuk menghasilkan file d.ts yang sesuai untuk file JS
- (opsional) Edit package.json Anda untuk mereferensikan tipe

### Menambahkan TypeScript

Anda bisa mempelajari cara melakukan ini di [halaman instalasi](/download) kami.

### TSConfig

TSConfig adalah file jsonc yang mengkonfigurasi kedua flag compiler Anda, dan menyatakan di mana mencari file.
Dalam kasus ini, Anda menginginkan file seperti berikut:

```json5
{
  // Change this to match your project
  include: ["src/**/*"],

  compilerOptions: {
    // Tells TypeScript to read JS files, as
    // normally they are ignored as source files
    allowJs: true,
    // Generate d.ts files
    declaration: true,
    // This compiler run should
    // only output d.ts files
    emitDeclarationOnly: true,
    // Types should go into this directory.
    // Removing this would place the .d.ts files
    // next to the .js files
    outDir: "dist",
  },
}
```

Anda dapat mempelajari lebih lanjut tentang opsi di [referensi tsconfig](/reference).
Alternatif untuk menggunakan file TSConfig adalah CLI, ini adalah perilaku yang sama seperti perintah CLI.

```sh
npx typescript src/**/*.js --declaration --allowJs --emitDeclarationOnly --outDir types
```

## Menjalankan compiler

Anda bisa mempelajari bagaimana melakukan ini di [halaman pemasangan](/download) Typescript kami.
Anda perlu memastikan file-file ini disertakan dalam package Anda jika Anda memiliki file dalam `gitignore` proyek Anda.

## Meng-edit file package.json

TypeScript mereplikasi resolusi node untuk modul di `package.json`, dengan langkah tambahan untuk menemukan file .d.ts.
Secara kasar, resolusi pertama-tama akan memeriksa bidang `"types"` opsional, kemudian bidang `"main"`, dan terakhir akan mencoba `index.d.ts` di root.

| Package.json              | Location of default .d.ts      |
| :------------------------ | :----------------------------- |
| No "types" field          | checks "main", then index.d.ts |
| "types": "main.d.ts"      | main.d.ts                      |
| "types": "./dist/main.js" | ./main/main.d.ts               |

Jika tidak ada, maka "main" akan digunakan

| Package.json             | Location of default .d.ts |
| :----------------------- | :------------------------ |
| No "main" field          | index.d.ts                |
| "main":"index.js"        | index.d.ts                |
| "main":"./dist/index.js" | ./dist/index.d.ts         |

## Tips

Jika kamu suka menulis tes untuk file .d.ts, coba [tsd](https://github.com/SamVerschueren/tsd).
