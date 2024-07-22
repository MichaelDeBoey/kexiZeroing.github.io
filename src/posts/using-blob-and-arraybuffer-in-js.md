---
layout: "../layouts/BlogPost.astro"
title: "Using Blob and ArrayBuffer in JavaScript"
slug: using-blob-and-arraybuffer-in-js
description: ""
added: "Nov 18 2022"
tags: [js]
updatedDate: "Aug 15 2023"
---

## Blob concepts
Blob means "Binary Large Object" and it’s an opaque representation of a chunk of bytes. Blob can be read as text or binary data, or converted into a ReadableStream so its methods can be used for processing the data. The File interface is based on Blob, inheriting blob functionality and expanding it to support files on the user's system.

A Blob has its size and MIME type just like a file has, and it can be created using `Blob(array, options)` constructor. The constructor takes an array of values *(Blob, ArrayBuffer, TypedArray, DataView, String)*. Even if you have just one string to put in the blob, you must wrap it in an array. Once you have a Blob object, you can access its size (the length in bytes of the content of the blob) and type.

```js
new Blob(["<h1>This is my blob content</h1>"], { type : "text/plain" });

const obj = { hello: "world" };
const blob = new Blob([JSON.stringify(obj, null, 2)], {
  type: "application/json",
});
```

Once you have a Blob/File then you can use it:
- upload via fetch as a file or stream
- add a link in a webpage to the file
- display it as an image (if image)
- read the text contents (json, txt, html...)

As we have `file://` URLs, referencing to a real file in a local filesystem. Similarly, we have `blob://` URLs referencing to a blob. `blob://` URLs can be used almost wherever we use regular URLs. The `URL.createObjectURL()` static method creates a string containing a URL representing the object given in the parameter. **The URL lifetime is tied to the document in the window on which it was created.** To release an object URL, call `URL.revokeObjectURL()`.

```js
let blobHtml = new Blob(['<html><head><title>Hello Blob</title></head><body><h1 style="color: red">Hello JavaScript!</h1></body></html>'], { type: 'text/html' });

let link = document.createElement('a');
link.href = URL.createObjectURL(blobHtml);

document.body.appendChild(link);
```

```js
// blob url as the image source
const input = document.querySelector('input[type=file]');

input.addEventListener('change', e => {
  const img = document.createElement('img');
  const imageBlob = URL.createObjectURL(input.files[0]);
  img.src = imageBlob;

  img.onload = function() {
    URL.revokeObjectURL(imageBlob);
  }

  input.parentNode.replaceChild(img, input);
});
```

## Difference between an ArrayBuffer and a Blob
ArrayBuffer object is used to represent generic, fixed-length raw binary data buffer. You cannot directly manipulate the contents of an ArrayBuffer; instead, you create one of the typed array objects or a DataView object which represents the buffer in a specific format, and use that to read and write the contents of the buffer.

- Unless you need the ability to write/edit (using an **ArrayBuffer**), then **Blob** format is probably best.
- An **ArrayBuffer** can be manipulated by using TypedArrays and DataView, whereas **Blob** is immutable.
- **Blob** can become an **ArrayBuffer** using FileReader's `readAsArrayBuffer()` method. **ArrayBuffer** can also become **Blob** by using `new Blob([buffer])`.

```js
const blobText = new Blob(['abc'], { type: 'text/plain' });

// readAsArrayBuffer, an event-based API
let reader = new FileReader();
reader.onload = (evt) => {
  console.log(evt.target.result);
};
reader.readAsArrayBuffer(blobText);

// readAsArrayBuffer - the `result` property contains an ArrayBuffer representing the file's data.
// readAsDataURL - the `result` property contains the data as a `data:URL` representing the file's data as a base64 encoded string.
// readAsText - the `result` property contains the contents of the file as a text string.

// `arrayBuffer()` method of the Blob returns a Promise that resolves with the contents of the blob 
// as binary data contained in an ArrayBuffer.
blobText.arrayBuffer().then((buffer) => {
  console.log(buffer);
})
```

## TypedArray
A TypedArray object describes an array-like view of an underlying binary data buffer, and you use it to read and write the contents of the buffer. When creating an instance of a TypedArray subclass (e.g. Int8Array), an array buffer is created internally in memory or, if an ArrayBuffer object is given as constructor argument, that ArrayBuffer is used instead.

A buffer (implemented by the ArrayBuffer object) is an object representing a chunk of data; it has no format to speak of, and offers no mechanism for accessing its contents. In order to access the memory contained in a buffer, you need to use a view. A view provides a context — that is, a data type, starting offset, and number of elements — that turns the data into an actual typed array.

> Typed Arrays were designed by the WebGL standards committee, for performance reasons. Typically Javascript arrays are generic and can hold objects, other arrays and so on - and the elements are not necessarily sequential in memory, like they would be in C. WebGL requires buffers to be sequential in memory, because that's how the underlying C API expects them. If Typed Arrays are not used, passing an ordinary array to a WebGL function requires a lot of work. For performance-sensitive WebGL applications this could cause a big drop in the framerate.

<img alt="typed_arrays" src="https://raw.gitmirror.com/kexiZeroing/blog-images/main/typed_arrays.png" width="550" />

| Type |  Description | Size in bytes
|  ---- | ---- | ---- | 
| Int8Array    | 8-bit two's complement signed integer | 1
| Uint8Array   | 8-bit unsigned integer	   | 1
| Uint16Array  | 16-bit unsigned integer   | 2
| Uint32Array  | 32-bit unsigned integer	 | 4
| Float64Array | 64-bit IEEE floating point number | 8


`TypedArray.prototype.buffer` represents the ArrayBuffer referenced by a TypedArray at construction time. The value is established when the TypedArray is constructed and cannot be changed.

```js
function typedArrayToURL(typedArray, mimeType) {
  return URL.createObjectURL(new Blob([typedArray.buffer], { type: mimeType }));
}
// an array of 8-bit unsigned integers
const bytes = new Uint8Array(26);

for (let i = 0; i < 26; i++) {
  bytes[i] = 65 + i;
}

const url = typedArrayToURL(bytes, "text/plain");

const link = document.createElement("a");
link.href = url;
link.innerText = "Open the array URL";

document.body.appendChild(link);
```

## Buffers in Node.js
In Node.js, buffers are a special type of object that can store raw binary data. A buffer represents a chunk of memory allocated in your computer. Once set, the size of a buffer cannot be changed. A buffer stores bytes.

Node.js exposes the Buffer class in the global scope. With this API, you get a series of functions and abstractions to manipulate raw binaries. A buffer in Node.js looks like this:

```
<Buffer 61 2e 71 3b 65 2e 31 2f 61 2e>
```

In above example, you can see 10 pairs of letters and numbers (Node.js displays bytes using the hexadecimal system). Each pair represents a byte stored in the buffer. The total size of this particular buffer is 10.

`Buffer.from()` method is the most straightforward way to create a buffer. It accepts a string, an array, an ArrayBuffer, or another buffer instance.

```js
// If no enconding is passed in the second parameter, defaults to 'utf-8'.
let bufferOne = Buffer.from('This is a buffer example.');
console.log(bufferOne);

// Output: <Buffer 54 68 69 73 20 69 73 20 61 20 62 75 66 66 65 72 20 65 78 61 6d 70 6c 65 2e>

// Create an empty buffer with a size of 10 bytes.
const emptyBuf = Buffer.alloc(10);

// Output: <Buffer 00 00 00 00 00 00 00 00 00 00>
```
