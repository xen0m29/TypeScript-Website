---
display: "Menghapus Komentar"
oneline: "Menghapus Komentar di TypeScript sehingga tidak muncul di JavaScript"
---

Menghapus semua komentar pada berkas TypeScript pada saat mengonversi ke berkas JavaScript. Pengaturan bawaannya adalah `false`

Sebagai contoh, ini adalah berkas TypeScript yang memiliki komentar JSDoc:

```ts
/** Terjemahan dari 'Hello world' ke bahasa Indonesia */
export const helloWorldID = "Halo Dunia";
```

Ketika `removeComments` disetel ke `true`:

```ts twoslash
// @showEmit
// @removeComments: true
/** Terjemahan dari 'Hello world' ke bahasa Indonesia */
export const helloWorldID = "Halo Dunia";
```

Tanpa menyetel `removeComments` atau menjadikannya sebagai `false`:

```ts twoslash
// @showEmit
// @removeComments: false
/** Terjemahan dari 'Hello world' ke bahasa Indonesia */
export const helloWorldID = "Halo Dunia";
```

Artinya, komentar anda akan muncul di kode JavaScript
