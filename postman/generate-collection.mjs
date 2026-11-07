import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const routeDir = path.join(root, "src", "routes");
const mountByFile = {
  "user.routes.js": "users",
  "instructor.routes.js": "instructors",
  "class.routes.js": "classes",
  "classSession.routes.js": "class-sessions",
  "blog.routes.js": "blogs",
  "booking.routes.js": "bookings",
  "payment.routes.js": "payments",
  "admin.routes.js": "admin",
};

const folders = fs.readdirSync(routeDir)
  .filter((file) => file.endsWith(".routes.js"))
  .sort()
  .map((file) => {
    const source = fs.readFileSync(path.join(routeDir, file), "utf8");
    const requests = [...source.matchAll(/router\.(get|post|put|patch|delete)\s*\(\s*["']([^"']+)["']/gi)]
      .map(([, method, route]) => {
        const apiPath = `/api/v1/${mountByFile[file]}${route === "/" ? "" : route}`
          .replace(/:([A-Za-z][A-Za-z0-9_]*)/g, "{{$1}}");
        const name = `${method.toUpperCase()} ${apiPath}`;
        const request = {
          method: method.toUpperCase(),
          header: [],
          url: `{{baseUrl}}/${mountByFile[file]}${route === "/" ? "" : route}`
            .replace(/:([A-Za-z][A-Za-z0-9_]*)/g, "{{$1}}"),
        };
        if (["POST", "PUT", "PATCH"].includes(request.method) && !/profile-image|thumbnail/.test(route)) {
          request.header.push({ key: "Content-Type", value: "application/json" });
          request.body = { mode: "raw", raw: "{}", options: { raw: { language: "json" } } };
        }
        return { name, request, response: [] };
      });
    return { name: mountByFile[file], item: requests };
  });

const collection = {
  info: {
    name: "YogaConnect Backend API",
    description: "Generated from src/routes/*.routes.js. Set baseUrl to the backend origin and API prefix. Login requests set HTTP-only cookies in Postman's cookie jar; use the same host for subsequent authenticated requests. Replace {} with endpoint-specific payloads. For profile-image and thumbnail requests, use form-data with a file field.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    { key: "serverUrl", value: "http://localhost:5000", type: "string" },
    { key: "baseUrl", value: "http://localhost:5000/api/v1", type: "string" },
    { key: "id", value: "", type: "string" },
    { key: "classId", value: "", type: "string" },
    { key: "blogId", value: "", type: "string" },
  ],
  item: [
    {
      name: "health",
      item: [{
        name: "GET /health",
        request: { method: "GET", header: [], url: "{{serverUrl}}/health" },
        response: [],
      }],
    },
    ...folders,
  ],
};

fs.writeFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "YogaConnect Backend API.postman_collection.json"),
  `${JSON.stringify(collection, null, 2)}\n`,
);
