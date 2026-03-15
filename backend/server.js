const fs = require("fs");
const path = require("path");
const http = require("http");

loadEnvFile();

const {
  acceptLatestOffer,
  completeTask,
  createTask,
  leaveReview,
  openConversation,
  refreshFeed,
  sendMessage
} = require("./feed-service");

const PORT = Number(process.env.PORT || 4000);

function loadEnvFile() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const contents = fs.readFileSync(envPath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

function writeCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(response, statusCode, payload) {
  writeCorsHeaders(response);
  response.writeHead(statusCode, {
    "Content-Type": "application/json"
  });
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });

    request.on("error", reject);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (request.method === "OPTIONS") {
    writeCorsHeaders(response);
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, { ok: true, service: "taskdash-marketplace" });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/marketplace") {
      const payload = await refreshFeed(url.searchParams.get("refresh") === "1");
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/tasks") {
      const body = await readJson(request);
      createTask(body);
      sendJson(response, 201, await refreshFeed(true));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/conversations/open") {
      const body = await readJson(request);
      const conversation = openConversation(body.taskId);
      sendJson(response, 200, { conversation, marketplace: await refreshFeed(true) });
      return;
    }

    const messageMatch = url.pathname.match(/^\/api\/conversations\/([^/]+)\/messages$/);
    if (request.method === "POST" && messageMatch) {
      const body = await readJson(request);
      sendMessage(messageMatch[1], body.text, {
        kind: body.kind,
        offerAmount: body.offerAmount
      });
      sendJson(response, 200, await refreshFeed(true));
      return;
    }

    const acceptMatch = url.pathname.match(/^\/api\/conversations\/([^/]+)\/accept-offer$/);
    if (request.method === "POST" && acceptMatch) {
      acceptLatestOffer(acceptMatch[1]);
      sendJson(response, 200, await refreshFeed(true));
      return;
    }

    const completeMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/complete$/);
    if (request.method === "POST" && completeMatch) {
      completeTask(completeMatch[1]);
      sendJson(response, 200, await refreshFeed(true));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/reviews") {
      const body = await readJson(request);
      leaveReview(body);
      sendJson(response, 201, await refreshFeed(true));
      return;
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    sendJson(response, 500, {
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`TaskDash backend listening on http://0.0.0.0:${PORT}`);
});
