---
title: "Fetch API requests and CORS"
description: ""
added: "Aug 9 2020"
tags: [js, web]
updatedDate: Feb 17 2025"
---

## Fetch API
Fetch method allows you to make network requests similar to `XMLHttpRequest`. The main difference is that the Fetch API uses `Promise`, which enables a simpler and cleaner API, avoiding callback hell and having to remember the complex API of XHR.

The `fetch()` method takes one mandatory argument, the path to the resource you want to fetch. It returns a Promise that resolves to the Response to that request even if the server response is an HTTP error status. Once a Response is retrieved, there are a number of methods available to define what the body content is and how it should be handled.

> At the heart of Fetch are the Interface abstractions of HTTP [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request), [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response), and [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers), along with a `fetch()` method for initiating asynchronous resource requests.

- The Promise returned from `fetch()` **won’t reject on HTTP error status even if the response is an HTTP 404 or 500**. Instead, it will resolve normally and only reject on network failure or if anything prevented the request from completing. So a `then()` handler must check the `Response.ok` or `Response.status` properties.
- To make a fetch request with cookies, set the credentials in init option. `credentials: 'include'` means always include credentials, even cross-origin. If a cookie's SameSite attribute is set to `Strict` or `Lax`, then the cookie will not be sent cross-site, even if credentials is set to include.
- CORS mode is enabled by default in `fetch()`.

### Init options
- **method**: e.g., GET, POST. Note that the `Origin` header is not set on Fetch requests with a method of HEAD or GET. (GET is default)
- **headers**: Any headers you want to add to your request, contained within a `Headers` object or an object literal.
- **body**: Any body that you want to add to your request. Note that a request using the GET or HEAD method cannot have a body.
- **mode**: The mode you want to use for the request, e.g., `cors`, `no-cors`, or `same-origin`. (`cors` is default)
- **credentials**: The request credentials you want to use for the request, e.g., `omit`, `same-origin`, or `include`. To automatically send cookies for the current domain, this option must be provided. (`same-origin` is default)

In addition, the `keepalive` option can be used to allow the request to outlive the page. Fetch with the `keepalive` flag is a replacement for the `Navigator.sendBeacon()` API.

```javascript
async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  return response.json();
}

postData('https://example.com/answer', { answer: 42 })
  .then(data => {
    console.log(data);
  });
```

```javascript
// Checking if the fetch is successful
fetch('flowers.jpg')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.blob();
  })
  .then(myBlob => {
    myImage.src = URL.createObjectURL(myBlob);
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });
```

```javascript
// Uploading a file
const formData = new FormData();
const fileField = document.querySelector('input[type="file"]');

formData.append('username', 'abc123');
formData.append('avatar', fileField.files[0]);

fetch('https://example.com/profile/avatar', {
  method: 'PUT',
  body: formData  // this automatically sets the "Content-Type" header to `multipart/form-data`
})
  .then(response => response.json())
  .then(result => {
    console.log('Success:', result);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

```javascript
// URLSearchParams as a fetch body
async function isPositive(value) {
  const response = await fetch(`http://text-processing.com/api/sentiment/`, {
    method: 'POST',
    // this automatically sets the "Content-Type" header to `application/x-www-form-urlencoded`
    body: new URLSearchParams({ text: value }) 
  });
  const json = await response.json();
  return json.label === 'pos';
}
```

### Abort API
When the Fetch API was initially introduced, there was no way to set a timeout at all. Browsers have recently added support for the `Abort API` to support timeouts.

```js
const controller = new AbortController();
const signal = controller.signal;

const url = "video.mp4";
const downloadBtn = document.querySelector(".download");
const abortBtn = document.querySelector(".abort");

downloadBtn.addEventListener("click", fetchVideo);

abortBtn.addEventListener("click", () => {
  controller.abort();
});

function fetchVideo() {
  fetch(url, { signal })
    .then((response) => {
      console.log("Download complete", response);
    })
    .catch((err) => {
      console.error(`Download error: ${err.message}`);
    });
}
```

```js
const controller = new AbortController()

controller.signal.addEventListener('abort', () => {
  console.log(controller.signal.reason) // "user cancellation"
})

// Provide a custom reason to this abort.
controller.abort('user cancellation')
```

You can use `AbortSignal.timeout()` to automatically create the abort signal which will abort after that duration. No need to create an `AbortController` if all you want is to cancel a request after it exceeds a timeout.

```js
try {
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  const result = await res.blob();
  // …
} catch (err) {
  if (err.name === "TimeoutError") {
    console.error("Timeout: It took more than 5 seconds to get the result.");
  } else if (err.name === "AbortError") {
    console.error("Fetch aborted by user action"),
  } else if (err.name === "TypeError") {
    console.error("AbortSignal.timeout() method is not supported");
  }
}
```

```js
// `AbortSignal.any()`: will abort whichever is sooner
const req = await fetch('/api/data', {
  signal: AbortSignal.any([
    AbortSignal.timeout(2000),
    controller.signal
  ])
});
```

### Build on Fetch
- [wretch](https://github.com/elbywan/wretch) is a tiny wrapper built around fetch.
- Axios is great *(Axios is based on XMLHttpRequests)*, but a bit large on kb compared to wretch. [Redaxios](https://github.com/developit/redaxios) is a great small alternative to axios.
- [Ky](https://github.com/sindresorhus/ky) is a tiny and elegant HTTP client based on the browser Fetch API.
- [upfetch](https://github.com/L-Blondy/up-fetch) is an advanced fetch client builder with standard schema validation, automatic response parsing, smart defaults and more.

Make a fetch request with schema validation. The response is already parsed and properly typed based on the schema.
```js
import { z } from 'zod'

const posts = await upfetch('/posts/1', {
  schema: z.object({
    id: z.number(),
    title: z.string(),
  }),
})
```

## POST Requests
The HTTP POST method sends data to the server. The type of the body of the request is indicated by the `Content-Type` header.

When using cURL, `-d` means transfer payload, `-H` is the header info included in requests, `GET` is the default one, use `-X` to support other HTTP verbs.

```bash
# application/x-www-form-urlencoded
curl -d "param1=value1&param2=value2" -H "Content-Type: application/x-www-form-urlencoded" -X POST http://localhost:3000/data
# in nodeJs, `req.body` is a string, and use `&` to split the string to get parameters 

# application/json
curl -d '{"key1":"value1", "key2":"value2"}' -H "Content-Type: application/json" -X POST http://localhost:3000/data
# in nodeJs, use `JSON.parse(req.body)` to get parameters 
```

> More options for curl, check `open x-man-page://curl`
> - **-I, --head**: Fetch the headers only. When used on an FTP or FILE, displays the file size and last modification time only.
> - **-i, --include**: Include the HTTP response headers in the output.
> - **-v, --verbose**: Makes curl verbose during the operation. Useful for seeing what's going on under the hood. Try `curl -vI https://www.baidu.com` as an exmple.
> - **-o, --output \<file\>**: Write to file instead of stdout.

A POST request is typically sent via an HTML form. In this case, the content type is selected by the string in the **`enctype` attribute** of the `form` element.

- **application/x-www-form-urlencoded**: the keys and values are encoded in key-value tuples separated by `'&'`, with a `'='` between the key and the value. Non-alphanumeric characters in both keys and values are percent encoded. (default type)
- **multipart/form-data**: each value is sent as a block of data ("body part"), with a user agent defined delimiter ("boundary") separating each part. The keys are given in the `Content-Disposition` header of each part.
- **text/plain**

> In a regular HTTP response, the `Content-Disposition` response header is a header indicating if the content is expected to be displayed *inline* in the browser, that is, as a Web page or as part of a Web page, or as an *attachment*, that is downloaded and saved locally. e.g. `Content-Disposition: inline` and `Content-Disposition: attachment; filename="file.jpg"`.

```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="picture.png"
```
Means "I don't know what this is. Please save it as a file, preferably named `picture.png`".

```
Content-Type: image/png
Content-Disposition: attachment; filename="picture.png"
```
Means "This is a PNG image. Please save it as a file, preferably named `picture.png`".

Use `multipart/form-data` when your form includes any `<input type="file">` elements. **Characters are NOT encoded** (No encoding means you save a lot of CPU cycles and keeps the total body size small). This is important when the form has a file upload control. You want to send the file binary and this ensures that bitstream is not altered.

- Fields are separated by the given boundary string. The browser must choose a boundary that will not appear in any of the fields, so this is why the boundary may vary between requests.
- Every field gets some sub headers before its data: `Content-Disposition: form-data`, the field name, the filename, followed by the data.

<img alt="form-data" src="https://raw.gitmirror.com/kexiZeroing/blog-images/main/008vxvgGly1h7pzihd80yj31440gy40l.jpg" width="700"> 

### Process the form data
1. What does `body-parser` do with express? Originally, there was only `body-parser`, not `express.json()`. `body-parser` extracts the entire body portion of an incoming request stream and exposes it on `req.body`. As of Express version 4.16+, their own `body-parser` implementation is now included in the default Express package so there is no need for you to download another dependency.

    ```js
    app.use(express.json());
    // Parsing the URL-encoded data with the `querystring` library (when false) or the `qs` library (when true). To be simple,`querystring` cannot parse nested object.
    // test the differences: https://stackblitz.com/edit/node-xa27zd?file=index.js
    app.use(express.urlencoded({ extended: false }));
    ```

2. However, `body-parser` does not handle multipart bodies. [Multer](https://github.com/expressjs/multer) is a Node.js middleware for handling `multipart/form-data`, which is primarily used for uploading files.

    ```js
    const express = require('express')
    const multer  = require('multer')
    // where to upload the files. In case you omit the options object, the files will be kept in memory and never written to disk.
    const upload = multer({ dest: 'uploads/' })

    const app = express()

    app.post('/profile', upload.single('avatar'), function (req, res, next) {
      // req.file is the `avatar` file, which is the file you uploaded
      console.log(req.file)
    })
    ```

### POST and PUT
The difference between `PUT` and `POST` is that `PUT` is idempotent *(If you PUT an object twice, it has no effect)*. `PUT` implies putting a resource - completely replacing whatever is available at the given URL with a different thing. Do it as many times as you like, and the result is the same. You can PUT a resource whether it previously exists, or not. So consider like this: do you name your URL objects you create explicitly, or let the server decide? If you name them then use `PUT`. If you let the server decide then use `POST`.

### POST and GET
GET data is appended to the URL as a query string, so there is a hard limit to the amount of data you can transfer. *GET is idempotent*. POST data is included in the body of the HTTP request and isn't visible in the URL. As such, there's no limit to the amount of data you can transfer over POST.

Responses to the POST method aren’t kept by most caches; if you send information in the path or query via GET, caches can store that information for the future.

<img alt="http-post-get" src="https://raw.gitmirror.com/kexiZeroing/blog-images/main/post-get-others.png" width="460"> 

As far as security, **POST method is not more secure than GET as it also gets sent unencrypted over network**. HTTPS encrypts the data in transit and the remote server will decrypt it upon receipt; it protects against any 3rd parties in the middle being able to read or manipulate the data. A packet sniffer will show that the HTTP message sent over SSL is encrypted on the wire.

> Should data in an HTTPS request appear as encrypted in Chrome developer tools? The browser is obviously going to know what data it is sending, and the Chrome developer tools wouldn't be very helpful if they just showed the encrypted data. These tools are located in the network stack before the data gets encrypted and sent to the server.

JSONP doesn't support other methods than GET and also doesn't support custom headers. It basically use a script tag (the domain limitation is ignored) and pass a special parameter that tells the server a little bit about your page. Then the server is able to wrap up its response in a way that your page can handle.

### HEAD and GET
HEAD requests are just like GET requests, except the body of the response is empty. For example, if a URL might produce a large download, a HEAD request could read its `Content-Length` header to check the file size without actually downloading it. This kind of request can be used when you want to determine if the content has changed at all - a change in the last modified time or content length usually signifies this. HEAD is also the easiest way to determine if a site is up or down.

```js
// Test if a file exists without downloading the entire thing
const { ok } = await fetch('https://xx.com/foo.jpg', { method: 'HEAD' })
console.log(ok)  // true or false
```

## Headers
The Headers interface allows you to create your own headers object via the `Headers()` constructor. A Headers object has an associated header list, and you can add to this using methods like `append()`. For security reasons, **some headers can only be controlled by the user agent**. These headers cannot be modified programmatically, like `Accept-Charset`, `Accept-Encoding`, `Access-Control-Request-Headers`, `Access-Control-Request-Method`, `Cookie`, `Date`, `Host`, `Origin`. All of the Headers methods throw a `TypeError` if a header name is used that is not a valid HTTP Header name.

```javascript
const content = 'Hello World';

// add a new header using append()
const myHeaders = new Headers();
myHeaders.append('Content-Type', 'text/plain');
myHeaders.append('Content-Length', content.length.toString());
myHeaders.append('X-Custom-Header', 'ProcessThisImmediately');

// passing an object literal to the constructor
const myHeaders = new Headers({
  'Content-Type': 'text/plain',
  'Content-Length': content.length.toString(),
  'X-Custom-Header': 'ProcessThisImmediately'
});

console.log(myHeaders.has('Content-Type')); // true
console.log(myHeaders.has('Set-Cookie'));   // false

myHeaders.append('X-Custom-Header', 'AnotherValue');
console.log(myHeaders.get('X-Custom-Header')); // ['ProcessThisImmediately', 'AnotherValue']

myHeaders.delete('X-Custom-Header');
console.log(myHeaders.get('X-Custom-Header')); // null
```

> `Content-Length` header indicates the size of the message body, in bytes. `Buffer.byteLength()` returns the byte length of those elements (a character can take up more than one byte).

A fetch metadata request header like `Sec-Fetch-Dest`, `Sec-Fetch-Mode`, `Sec-Fetch-Site` provides additional information about the context from which the request originated. These headers are prefixed with `Sec-`, and hence have [forbidden header names](https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name). As such, they cannot be modified from JavaScript.

- `Sec-Fetch-Mode` allows a server to distinguish between: requests originating from a user navigating between HTML pages, and requests to load images and other resources. For example, this header would contain `navigate` for top level navigation requests, while `no-cors` is used for loading an image.
- `Sec-Fetch-Site` tells a server whether a request for a resource is coming from the same origin, the same site, a different site, or is a "user initiated" request.

## Response
You can create a new Response object using the `Response()` constructor, but you are more likely to encounter a Response object being returned as the result of another API.

- **Response.headers**: The Headers object associated with the response.
- **Response.ok**: A boolean indicating whether the response was successful (status in the range 200–299) or not.
- **Response.status**: The status code of the response.
- **Response.statusText**: The status message corresponding to the status code. (e.g., OK for 200).
- **Response.url**: The URL of the response. It will be the final URL obtained after any redirects.

The body of Response allows you to declare what its content type is and how it should be handled (`.json()`, `.blob()`, `.arrayBuffer()`, `.formData()`, `.text()`). For example, The `json()` method of the Response interface takes a Response stream and reads it to completion. It returns a promise which resolves with the result of parsing the body text as JSON.

An important concept is that Response bodies can only be consumed once.

```js
const response = new Response('{"message": "hello"}');

// This works
const data = await response.json();

// This fails
try {
  const data2 = await response.json();
} catch (error) {
  console.log("Error: Body already consumed");
}
```

Another important thing to note is that `Response.body` is a `ReadableStream` of the body contents.
- The `getReader()` approach gives you more fine-grained control.
- The `for await...of` syntax is more concise and uses the response body's async iterator interface internally.

```js
const response = await fetch("large-file.mp4");
const reader = response.body.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  // value is a Uint8Array chunk
  processChunk(value);
}

// You can create your own ReadableStream 
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue("First chunk");
    controller.enqueue("Second chunk");
    controller.close();
  },
});

// Bad: Loads entire file
const response = await fetch("huge-video.mp4");
const blob = await response.blob();

// Good: Process in chunks
const response = await fetch("huge-video.mp4");
for await (const chunk of response.body) {
  processVideoChunk(chunk);
}
```

```js
// An example to fetch image with progress indicator
// https://github.com/AnthumChris/fetch-progress-indicators

const elProgress = document.getElementById('progress');

fetch('https://fetch-progress.anthum.com/30kbps/images/sunrise-baseline.jpg')
.then(response => {
  const contentEncoding = response.headers.get('content-encoding');
  const contentLength = response.headers.get(contentEncoding ? 'x-file-size' : 'content-length');
  if (contentLength === null) {
    throw Error('Response size header unavailable');
  }

  const total = parseInt(contentLength, 10);
  let loaded = 0;

  return new Response(
    new ReadableStream({
      // This method is called immediately when the object is constructed
      start(controller) {
        const reader = response.body.getReader();

        read();
        function read() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return; 
            }
            loaded += value.byteLength;
            elProgress.innerHTML = Math.round(loaded / total * 100) + '%';
            controller.enqueue(value);
            read();
          }).catch(error => {
            console.error(error);               
          })
        }
      }
    })
  );
})
.then(response => response.blob())
.then(data => {
  document.getElementById('img').src = URL.createObjectURL(data);
})
```

### Understand fetch in chunks
[fetch-in-chunks](https://github.com/tomayac/fetch-in-chunks) is a utility for fetching large files in chunks with support for parallel downloads and progress tracking.

```js
const VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const video = document.querySelector('video');
const progress = document.querySelector('progress');

const blob = await fetchInChunks(VIDEO_URL, {
  progressCallback: (done, total) => {
    progress.value = done / total;
  },
});

video.src = URL.createObjectURL(blob);
video.controls = true;
video.play();
```

The key point in `fetchInChunks` is a parallel chunk-based file downloading system.

```js
let chunks = [];
let queue = [];
let downloadedBytes = 0;

async function processQueue() {
  let start = 0;
  while (start < fileSize) {
    // First Check
    if (queue.length < maxParallelRequests) {
      let end = Math.min(start + chunkSize - 1, fileSize - 1);
      let actualStart = start;

      // A. Create the promise but don't wait for it
      let promise = fetchChunk(url, start, end, signal)
        .then((chunk) => {
          // C. This runs later when chunk downloads
          chunks.push({ start: actualStart, chunk });
          downloadedBytes += chunk.byteLength;
          
          if (progressCallback) {
            progressCallback(downloadedBytes, fileSize);
          }
          // Remove this promise from queue when done
          queue = queue.filter((p) => p !== promise);
        })
      
      // B. Immediately add to queue and continue
      queue.push(promise);
      start += chunkSize;
    }

    // Second Check
    if (queue.length >= maxParallelRequests) {
      // D. Wait for any download to complete before continuing
      await Promise.race(queue);
    }
  }

  await Promise.all(queue);
}

// 1. fetchChunk() returns immediately with a Promise, not waiting for download
// 2. Multiple chunks download simultaneously
// 3. Promise.race() only blocks when queue is full
// 4. Each .then() callback executes when its chunk completes
// 5. Final Promise.all() ensures all downloads finish
```

```js
async function getFileSize(url, signal) {
  const response = await fetch(url, { method: 'HEAD', signal });
  if (!response.ok) {
    throw new Error('Failed to fetch the file size');
  }
  const contentLength = response.headers.get('content-length');
  return parseInt(contentLength, 10);
}

async function fetchChunk(url, start, end, signal) {
  const response = await fetch(url, {
    headers: { Range: `bytes=${start}-${end}` },
    signal,
  });
  if (!response.ok && response.status !== 206) {
    throw new Error('Failed to fetch chunk');
  }
  return await response.arrayBuffer();
}
```

## Cross-Origin Resource Sharing
A web application executes a cross-origin HTTP request when it requests a resource that has a different origin (domain, protocol, or port) from its own. For security reasons, browsers restrict cross-origin HTTP requests initiated from scripts. XMLHttpRequest and the Fetch API follow the same-origin policy, which means that a web application using those APIs can only request resources from the same origin unless the response from other origins includes the right CORS headers.

CORS works by adding new HTTP headers that let servers describe which origins are permitted to read that information from a web browser. Additionally, for HTTP request methods other than `GET`, or `POST` with certain MIME types, the specification mandates that browsers **"preflight"** the request, soliciting supported methods from the server with the HTTP `OPTIONS` request method, and then, upon "approval" from the server, sending the actual request. Servers can also inform clients whether "credentials" (such as Cookies and HTTP Authentication) should be sent with requests.

> If Site A requests a page from Site B, the browser will actually fetch the requested page on the network level and check if the response headers list Site A as a permitted requester domain.

<br>
<img alt="same-cross-origin" src="https://raw.gitmirror.com/kexiZeroing/blog-images/main/same-cross-origin.png" width="700">

<br>
<img alt="same-cross-site" src="https://raw.gitmirror.com/kexiZeroing/blog-images/main/same-site.png" width="700">

### Simple requests
Simple requests don’t trigger a CORS preflight. It should meet all the following conditions:
- One of the allowed methods: `GET`, `HEAD`, `POST`
- Apart from the headers automatically set by the user agent, the only headers which are allowed are those defined as a “CORS-safelisted request-header”, which are: `Accept`, `Accept-Language`, `Content-Language`, `Content-Type`, etc.
- The only allowed values for the `Content-Type` header are: `application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`

To allow the simple requests to access the resource, the `Access-Control-Allow-Origin` header should contain the value that was sent in the request's `Origin` header.

The `Origin` request header indicates the origin (scheme, hostname, and port) that caused the request. It is similar to the `Referer` header, but does not disclose the path, and may be null. Broadly speaking, **user agents add the `Origin` request header to cross origin requests or same-origin requests except for GET or HEAD requests**.

### Preflight requests
Preflight requests first send an HTTP request by the `OPTIONS` method to the resource on the other domain, to determine if the actual request is safe to send. `OPTIONS` is an HTTP/1.1 method that is used to determine further information from servers, and is a safe method, meaning that it can't be used to change the resource.

```
OPTIONS /doc HTTP/1.1
Host: bar.other
Origin: http://foo.example
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-PINGOTHER, Content-Type

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://foo.example
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: X-PINGOTHER, Content-Type
Access-Control-Max-Age: 86400
Vary: Origin

POST /doc HTTP/1.1
Host: bar.other
X-PINGOTHER: pingpong
Content-Type: text/xml; charset=UTF-8
Origin: https://foo.example

HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://foo.example
Content-Type: text/plain
```

> Preflight requests are only made for so-called non-simple requests which for historical reasons are requests that you cannot make with a HTML form. In practice what it means is that you can make CORS POST without preflight but you cannot use custom headers.

Note that along with the OPTIONS request, two other request headers are sent: `Access-Control-Request-Method` and `Access-Control-Request-Headers`. The `Access-Control-Request-Method` header notifies the server that when the actual request is sent, it will be sent with a POST request method. The `Access-Control-Request-Headers` header notifies the server that when the actual request is sent, it will be sent with a `X-PINGOTHER` and `Content-Type` custom headers. The server now has an opportunity to determine whether it wishes to accept a request under these circumstances.

In addition to `Access-Control-Allow-Origin`, the server responds with `Access-Control-Allow-Methods` and says that POST and GET are viable methods to query the resource. The server also sends `Access-Control-Allow-Headers` with a value of "X-PINGOTHER, Content-Type", confirming that these are permitted headers to be used with the actual request. Finally, `Access-Control-Max-Age` gives the value in seconds for how long the response to the preflight request can be cached without sending another preflight request. (Note that each browser has a maximum internal value that takes precedence when the `Access-Control-Max-Age` is greater).

When sending the actual request after preflight is done, the behavior is identical to how a simple request is handled. In other words, a non-simple request whose preflight is successful is treated the same as a simple request, and the server must still send `Access-Control-Allow-Origin` header again for the actual response.

If the server specifies a single origin rather than the `"*"` wildcard, then the server should also **include Origin in the `Vary` response header** — to indicate clients that server responses will differ based on the value of the Origin request header. `Vary` header is quite important when a caching proxy is looking for a cache HIT or MISS. It is a way for the web-server to tell any intermediaries (caching proxies) whether a cached response can be used. For example, `Vary: *` means each request is supposed to be treated as a unique and uncacheable one.

### Requests with credentials
By default, in cross-site XMLHttpRequest or Fetch invocations, browsers will not send credentials. A specific flag has to be set on the XMLHttpRequest object or the `Request` constructor when it is invoked. When responding to a credentialed request, the server must specify an origin in the value of the `Access-Control-Allow-Origin` header, instead of specifying the `"*"` wildcard. 

- The server must respond with the `Access-Control-Allow-Credentials: true` header to allow Cookies to be included on cross-origin requests.
- The client must set the `XMLHttpRequest.withCredentials` flag to true in order to make the invocation with Cookies.
- Cookies set in CORS responses are subject to normal third-party cookie policies.

### `integrity` and `crossorigin` in CDN links
`integrity` defines the hash value of a resource (like a checksum) that has to be matched to make the browser execute it. The hash ensures that the file was unmodified and contains expected data. *With an `integrity` set on an external origin and a missing `crossorigin` the browser will choose to 'fail-open', as if the `integrity` attribute was not set.*

The `crossorigin` attribute, valid on the `<audio>`, `<img>`, `<link>`, `<script>`, and `<video>` elements, provides support for CORS, defining how the element handles cross-origin requests. There are actually three possible values for the `crossorigin` attribute: `anonymous`, `use-credentials`, and an "missing value default" that can only be accessed by omitting the attribute. The default value causes the browser to skip CORS entirely, which is the normal behavior (`Sec-Fetch-Mode: no-cors`).

**When to use `crossorigin`?**

Developers think "this request is going to another origin, so it must need the `crossorigin` attribute". But that’s not what the attribute is for—`crossorigin` is used to define the CORS policy for the request. `crossorigin=anonymous` (or a bare `crossorigin` attribute) will never exchange any user credentials (e.g. cookies); `crossorigin=use-credentials` will always exchange credentials. Unless you know that you need it, you almost never need the latter. But when do we use the former?

If the resulting request for a file would be CORS-enabled, you would need `crossorigin` on the corresponding preconnect. In DevTools, if you look at the resource’s request headers: `Sec-Fetch-Mode: no-cors`, the preconnect doesn’t currently need a `crossorigin` attribute. It does need `crossorigin` if it’s marked `Sec-Fetch-Mode: cors`.
