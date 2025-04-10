---
title: "Notes on Model Context Protocol"
description: ""
added: "Mar 23 2025"
tags: [AI]
updatedDate: "Apr 8 2025"
---

### Historical context: The Path to MCP
Early AI assistants were limited to text generation, unable to interact with external tools or real-time data. The introduction of function calling and plugins in 2023 allowed models to execute code, browse the web, and interact with APIs, marking the shift toward AI agents. However, each integration was fragmented, requiring custom implementations for different tools, making scaling difficult.

MCP, introduced by Anthropic in late 2024, solves this problem by providing a unified protocol for AI-tool interactions. Instead of custom adapters for each tool, MCP allows developers to expose functionality once, making it accessible to any AI supporting MCP. It also eliminates the inefficiencies of tool-specific APIs by offering a structured, self-describing interface. This enables seamless, scalable AI-tool connectivity, much like how USB standardized device connections.

### MCP is not magic
MCP isn't magic — it's a standard way for AI to discover and use tools without learning every API's specific details. An MCP server is like a menu of tools. Each tool has a name, a description, a schema defining what info it needs, and the actual code that makes the API calls. AI applications (like Claude or Cline) can dynamically query these servers to execute tasks such as reading files, querying databases, or creating new integrations.

> How similar is this to tool calling? Tool calling lets LLMs invoke functions to interact with the real world, typically within the same process. MCP enables tool execution in a separate process, either locally or remotely, fully decoupling the server from the client.

### MCP server and client
MCP uses a client-server design where applications can connect to multiple resources. The system has three main parts:
- The Client Side: Making Requests
- The Communication Layer: The Standard Protocol
- The Server Side: Providing Resources

The **MCP client** is the program that's going to access the MCP servers. This might be Claude Desktop, Cursor, Windsurf, or any other application that supports MCP. This host probably uses an LLM of some kind. That LLM will be able to call tools that are defined in the MCP server.

The **MCP server** is the server that's going to be running the tools that the host wants to call. This server could be running locally, or it could be running on a remote server.

The client connects to its server using a **transport**. This transport is responsible for sending messages between the client and the server. There are currently two supported transports. You can communicate via `stdio` - in other words, via the terminal. Or you can communicate through HTTP via server-sent events. This is useful if you want to run your server on a remote machine.

The **protocol** defines JSON message formats, based on JSON-RPC 2.0, for communication between client and server.

```json
// Client sends...
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "createGitHubIssue",
    "arguments": {
      "title": "My Issue",
      "body": "This is the body of my issue",
      "labels": ["bug"]
    }
  }
}

// Server sends back...
{
  "jsonrpc": "2.0",
  "id": 2,
  "content": [
    {
      "type": "text",
      "text": "Issue 143 created successfully!"
    }
  ],
  "isError": false
}
```

### The simplest MCP server

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "Weather Service",
  version: "1.0.0",
});

server.tool(
  "getWeather",
  "Get the weather in a city",
  { city: z.string() },
  async ({ city }) => {
    // await fetch('wheather API') 

    return {
      content: [
        {
          type: "text",
          text: `The weather in ${city} is sunny!`,
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

Claude Desktop app is the easiest way to test MCP. Open your Claude Desktop App configuration at `~/Library/Application Support/Claude/claude_desktop_config.json` in a text editor. After updating your configuration file, you need to restart Claude for Desktop. See the [documentation](https://modelcontextprotocol.io/quickstart/user) for more details.

```json
{
  "mcpServers": {
    "weather-example": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/PARENT/FOLDER/weather/build/index.js"
      ]
    }
  }
}
```

For Claude Code (only supports `stdio` transport), you can run it with a single command: `claude mcp add "weather-example" npx tsx "/path-to-the-file.ts"`. This tells Claude that in order to run the file, it should call `npx tsx /path-to-the-file.ts`.

### MCP servers over HTTP
The server can be hosted on the cloud, and the client can communicate with it via an HTTP connection.

```js
// Still use the server we had in the previous example

import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const app = express();

let transport: SSEServerTransport | undefined =
  undefined;

app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  if (!transport) {
    res.status(400);
    res.json({ error: "No transport" });
    return;
  }
  await transport.handlePostMessage(req, res);
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
```

Run the server: `npx tsx ./path-to-file.ts`

### References and further reading
- https://www.aihero.dev/model-context-protocol-tutorial
- https://glama.ai/blog/2024-11-25-model-context-protocol-quickstart
- https://github.com/modelcontextprotocol/servers
- https://github.com/punkpeye/awesome-mcp-servers
- https://www.pulsemcp.com/use-cases
