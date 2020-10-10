---
title: Mixins
layout: docs
permalink: /docs/handbook/mixins.html
oneline: Using the mixin pattern with TypeScript
translatable: true
---

Bersamaan dengan hierarki OO tradisional, cara populer lainnya untuk membangun kelas dari komponen yang dapat digunakan kembali adalah membangunnya dengan menggabungkan kelas parsial yang lebih sederhana.
Anda mungkin sudah familiar dengan ide mixin atau ciri untuk bahasa seperti Scala, dan polanya juga mendapatkan popularitas di komunitas JavaScript.

## Bagaimana Cara Kerja Mixin?

Pola ini bergantung pada penggunaan Generik dengan warisan kelas untuk memperluas kelas dasar.
Dukungan mixin terbaik TypeScript dilakukan melalui pola ekspresi kelas.
Anda dapat membaca lebih lanjut mengenai bagaimana pola ini bekerja di [Javscript disini](https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/).

Untuk memulai, kita akan butuh kelas yang akan diterapkan mixin:

```ts twoslash
class Sprite {
  name = "";
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}
```

Kemudian kamu butuh sebuah type dan sebuah fungsi factory yang mengembalikan sebuah ekspresi kelas untuk meng-extend kelas dasar.

```ts twoslash
// Untuk memulai, kita membutuhkan tipe yang akan kita gunakan untuk memperluas kelas lain.
// Tanggung jawab utama adalah mendeklarasikan bahwa tipe yang diteruskan adalah sebuah kelas.

type Constructor = new (...args: any[]) => {};

// Mixin ini menambahkan property scale, dengan getter dan setter
// untuk mengubahnya dengan properti private yang dienkapsulasi:

function Scale<TBase extends Constructor>(Base: TBase) {
  return class Scaling extends Base {
    // Mixin mungkin tidak mendeklarasikan property private/protected
    // namun, Anda dapat menggunakan field private ES2020
    _scale = 1;

    setScale(scale: number) {
      this._scale = scale;
    }

    get scale(): number {
      return this._scale;
    }
  };
}
```

Setelah hal-hal diatas siap, Anda dapat membuat kelas yang mewakili kelas dasar dengan mixin yang diterapkan:

```ts twoslash
class Sprite {
  name = "";
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}
type Constructor = new (...args: any[]) => {};
function Scale<TBase extends Constructor>(Base: TBase) {
  return class Scaling extends Base {
    // Mixin mungkin tidak mendeklarasikan property private/protected
    // namun, Anda dapat menggunakan field private ES2020
    _scale = 1;

    setScale(scale: number) {
      this._scale = scale;
    }

    get scale(): number {
      return this._scale;
    }
  };
}
// ---potong---
// Buat kelas baru dari kelas Sprite,
// dengan Mixin Scale:
const EightBitSprite = Scale(Sprite);

const flappySprite = new EightBitSprite("Bird");
flappySprite.setScale(0.8);
console.log(flappySprite.scale);
```

## Mixin yang Dibatasi

Dalam bentuk di atas, mixin tidak memiliki pengetahuan yang mendasari kelas yang dapat menyulitkan pembuatan desain yang diinginkan.

Untuk memodelkan ini, kami memodifikasi tipe konstruktor asli untuk menerima argumen generic.

```ts twoslash
// Ini adalah konstruktor kita sebelumnya:
type Constructor = new (...args: any[]) => {};
// Sekarang kami menggunakan versi generik yang dapat menerapkan batasan
// pada kelas tempat mixin ini diterapkan
type GConstructor<T = {}> = new (...args: any[]) => T;
```

Ini memungkinkan untuk membuat kelas yang hanya bekerja dengan kelas dasar yang dibatasi:

```ts twoslash
type GConstructor<T = {}> = new (...args: any[]) => T;
class Sprite {
  name = "";
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}
// ---potong---
type Positionable = GConstructor<{ setPos: (x: number, y: number) => void }>;
type Spritable = GConstructor<typeof Sprite>;
type Loggable = GConstructor<{ print: () => void }>;
```

Kemudian Anda dapat membuat mixin yang hanya berfungsi jika Anda memiliki basis tertentu untuk dibangun:

```ts twoslash
type GConstructor<T = {}> = new (...args: any[]) => T;
class Sprite {
  name = "";
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}
type Positionable = GConstructor<{ setPos: (x: number, y: number) => void }>;
type Spritable = GConstructor<typeof Sprite>;
type Loggable = GConstructor<{ print: () => void }>;
// ---potong---

function Jumpable<TBase extends Positionable>(Base: TBase) {
  return class Jumpable extends Base {
    jump() {
      // Mixin ini hanya akan berfungsi jika itu melewati kelas dasar
      // yang telah ditetapkan setPos
      // karena kendala Positionable.
      this.setPos(0, 20);
    }
  };
}
```

## Pola Alternatif

Versi sebelumnya dari dokumen ini merekomendasikan cara untuk menulis mixin di mana Anda membuat runtime dan hierarki type secara terpisah, lalu menggabungkannya di akhir:

```ts twoslash
// @strict: false
// Setiap mixin adalah kelas ES tradisional
class Jumpable {
  jump() {}
}

class Duckable {
  duck() {}
}

// Termasuk basisnya
class Sprite {
  x = 0;
  y = 0;
}

// Kemudian Anda membuat antarmuka yang menggabungkan mixin
// yang diharapkan dengan nama yang sama sebagai basis Anda
interface Sprite extends Jumpable, Duckable {}
// Terapkan mixin ke dalam kelas dasar melalui
// JS saat runtime
applyMixins(Sprite, [Jumpable, Duckable]);

let player = new Sprite();
player.jump();
console.log(player.x, player.y);

// Ini dapat hidup di mana saja di basis kode Anda:
function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name)
      );
    });
  });
}
```

Pola ini tidak terlalu bergantung pada compiler, dan lebih banyak pada basis kode Anda untuk memastikan runtime dan sistem tipe tetap sinkron dengan benar.

## Kendala

Pola mixin didukung secara native di dalam compiler TypeScript oleh code flow analysis.
Ada beberapa kasus di mana Anda dapat mencapai tepi dukungan native.

#### Decorator dan Mixin [`#4881`](https://github.com/microsoft/TypeScript/issues/4881)

Anda tidak bisa menggunakan decorator untuk menyediakan mixin melalui code flow analysis:

```ts twoslash
// @experimentalDecorators
// @errors: 2339
// Fungsi dekorator yang mereplikasi pola mixin:
const Pausable = (target: typeof Player) => {
  return class Pausable extends target {
    shouldFreeze = false;
  };
};

@Pausable
class Player {
  x = 0;
  y = 0;
}

// Kelas Player tidak menggabungkan type dekorator:
const player = new Player();
player.shouldFreeze;

// Aspek runtime ini dapat direplikasi secara manual
// melalui komposisi tipe atau penggabungan interface.
type FreezablePlayer = typeof Player & { shouldFreeze: boolean };

const playerTwo = (new Player() as unknown) as FreezablePlayer;
playerTwo.shouldFreeze;
```

#### Static Property Mixins [`#17829`](https://github.com/microsoft/TypeScript/issues/17829)

Pola ekspresi kelas membuat singletons, jadi mereka tidak dapat dipetakan pada sistem type untuk mendukung tipe variabel yang berbeda.

Anda bisa mengatasinya dengan menggunakan fungsi untuk mengembalikan kelas Anda yang berbeda berdasarkan generik:

```ts twoslash
function base<T>() {
  class Base {
    static prop: T;
  }
  return Base;
}

function derived<T>() {
  class Derived extends base<T>() {
    static anotherProp: T;
  }
  return Derived;
}

class Spec extends derived<string>() {}

Spec.prop; // string
Spec.anotherProp; // string
```
