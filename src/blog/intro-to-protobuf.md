---
title: "Intro to Protocol Buffers (Protobuf)"
description: ""
added: "Oct 19 2025"
tags: [web]
---

## Background
Protocol Buffers (a.k.a., protobuf) are Google’s language-neutral, platform-neutral, and extensible mechanism for serializing structured data. You define your data structure once in a `.proto` file, then use generated source code to easily read and write that structured data across different languages and platforms.

For example, a Java program on one platform can serialize data according to a `.proto` definition, and a Python application on another platform can deserialize that data and access specific values.

Unlike JSON, Protobuf encodes data in a compact binary format, making it much smaller and faster to serialize and deserialize. It enforces a strict schema, providing type safety and supporting forward and backward compatibility, so you can safely evolve your data structures over time.

> Protocol Buffers is primarily a specification (or protocol) for serializing structured data, but it comes with multiple components that can make it feel like a library (`protoc` = compiler that generates code based on the spec; Language-specific runtime = library to work with messages)

## Installing Protobuf
To install protobuf, you need to install the protocol compiler (used to compile `.proto` files) and the protobuf runtime for your chosen programming language.
- The Protobuf compiler (`protoc`) is written in C++. For non-C++ users, the easiest way to install it is by downloading a prebuilt binary from the GitHub release page and adding it to your system PATH.
- Each programming language requires its runtime library to work with the generated code. Some languages may also need additional plugins for code generation, e.g., `protoc-gen-ts_proto` for TypeScript.
- The runtime library provides the functionality to serialize and deserialize messages. Without it, the generated code only defines the message structure and cannot encode or decode data. The runtime implements the actual logic for handling the Protobuf binary format.

## Understanding `.proto` files
A `.proto` file defines the structure of data (like JSON schema) and optionally RPC services (like API endpoints). It tells Protobuf how to serialize and deserialize data.

```proto
// Define a message
message Person {
  string name = 1;  // field #1
  int32 id = 2;     // field #2
  string email = 3; // field #3
}

// Define a service (for RPC calls)
service PersonService {
  rpc GetPerson(GetPersonRequest) returns (Person);
}

// Another message used by the service
message GetPersonRequest {
  int32 id = 1;
}
```

A `message` defines a structured data type. Each field has a type (`string`, `int32`, `bool`, another message, etc.), a name, and a field number (`= 1`, `= 2`). Field numbers are unique identifiers used in the binary encoding to efficiently identify each field. Once a `.proto` file is published, do not change field numbers, as they ensure backward compatibility.

> When Protobuf encodes data, it stores the field numbers rather than the field names. This allows older programs to safely ignore any new fields they don’t recognize while still processing the fields they do know.

Some keywords:
- `optional` - field may or may not be present
- `required` - field must be present (proto2 only, deprecated in proto3)
- `repeated` means an array/list of values
- `enum` - defines enumerated values
- `map` - key-value pairs (e.g., `map<string, int32>`)
- `package` - namespace for your messages

A `service` defines RPC methods. Each rpc line defines one endpoint with input and output message types. It includes a method name, request message type, and response message type. For gRPC (Google’s RPC framework), the compiler generates:
- Client stub: code that lets you call `GetUser` or `CreateUser` like local functions.
- Server interface: definitions you implement on the server to handle incoming RPC calls.

## Generating code from `.proto` files

```sh
brew install protobuf
protoc --version

# or manually install
sudo cp ~/Downloads/protoc-33.0-osx-aarch_64/bin/protoc /usr/local/bin

# --js_out=... -> Tells protoc to generate JavaScript code
# import_style=commonjs,binary -> Options controlling how JS is generated
# :./src/generated -> Output directory
# src/proto/user.proto	-> Your source .proto file
protoc --js_out=import_style=commonjs,binary:./src/generated src/proto/user.proto

# protoc-gen-js: program not found or is not executable
# https://github.com/protocolbuffers/protobuf-javascript/issues/127#issuecomment-1204202844

# Generate *.ts source files for the given *.proto types
npm install ts-proto

protoc \
    --plugin="./node_modules/.bin/protoc-gen-ts_proto" \
    --ts_proto_opt=esModuleInterop=true \
    --ts_proto_out="./src/generated" \
    src/proto/user.proto
```

Let’s build a realistic complete example that includes both messages and a service.

```proto
syntax = "proto3";

import "google/protobuf/empty.proto";
// Defines namespace "example"
package example; 

// --- Messages ---
message GetUserRequest {
  int32 id = 1;
}

message User {
  int32 id = 1;
  string name = 2;
}

message ListUsersResponse {
  repeated User users = 1;
}

// --- Service ---
service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc ListUsers(google.protobuf.Empty) returns (ListUsersResponse);
}
```

The generated code will include:
- TypeScript interfaces for all messages (`User`, `GetUserRequest`, etc.)
- A ready-to-use `UserServiceClientImpl` class (for gRPC-Web)
- Encode/decode/fromJSON/toJSON helpers

If your backend exposes protobuf over HTTP (not gRPC):

```ts
import { GetUserRequest, User } from "../generated/user";

// create a request message
const req: GetUserRequest = { id: 1 };

// serialize to binary
const bytes = GetUserRequest.encode(req).finish();

// send request
const response = await fetch("/api/user/get", {
  method: "POST",
  headers: { "Content-Type": "application/x-protobuf" },
  body: bytes,
});

// receive and decode
const buffer = new Uint8Array(await response.arrayBuffer());
const user = User.decode(buffer);

console.log(user.name);
```

If your backend exposes gRPC-Web, use it in your frontend:

```ts
import { UserServiceClientImpl, GetUserRequest } from "../generated/user";
import { GrpcWebImpl } from "../generated/grpc_web"; // generated helper

const rpc = new GrpcWebImpl("https://your-server.example.com", {
  debug: true,
});
const client = new UserServiceClientImpl(rpc);

// call the service
const user = await client.GetUser({ id: 1 });
console.log(user.name);
```

## Protobuf and gRPC
gRPC is a high-performance communication framework like REST, but more efficient and strongly typed. It allows one program (like your frontend) to call a function that actually runs on another computer (like your backend), almost as if it were a local call.

gRPC has two sides: a server side, and a client side that is able to dial a server. The server exposes RPCs (i.e. functions that you can call remotely). gRPC uses protobuf as its wire format and API contract. When you combine them, code generators produce client and server stubs that handle serialization/deserialization and network communication automatically.

For example:
```js
// looks like a local function call...
const user = await getUser({ id: 123 });
```

But behind the scenes, this does much more:
1. The frontend serializes `{ id: 123 }` into a binary protobuf message.
2. It sends that message over the network (using HTTP/2 or gRPC-Web).
3. The backend receives and deserializes it into a `GetUserRequest` object.
4. The backend executes the `GetUser` function.
5. The backend returns a serialized protobuf response (`User`) back to the client.
6. The client deserializes that binary data into a usable TypeScript object.

Normal gRPC (used by backend-to-backend communication) runs over HTTP/2. Browsers can’t fully control HTTP/2 like servers can. That means you can’t directly call a gRPC service from browser JavaScript using `fetch()` or `XMLHttpRequest`. To bridge this gap, gRPC-Web provides a browser-compatible variant of gRPC that wraps the same protobuf messages in a simplified wire format browsers can handle.
