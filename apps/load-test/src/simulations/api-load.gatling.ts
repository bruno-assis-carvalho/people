import {
  constantUsersPerSec,
  global,
  jsonPath,
  scenario,
  simulation,
  StringBody,
} from "@gatling.io/core";
import { http, status } from "@gatling.io/http";
import { loadEnv } from "../config/env";
import { requireAuthConfiguration } from "../utils/auth";

export default simulation((setUp) => {
  const env = loadEnv();
  requireAuthConfiguration(env);
  const protocol = http
    .baseUrl(env.apiUrl)
    .header("Accept", "application/json")
    .header("Content-Type", "application/json")
    .disableCaching();

  let reads = scenario("API reads");
  let writes = scenario("API writes");

  if (env.authToken) {
    reads = reads.exec((session) =>
      session.set("authToken", env.authToken),
    );
    writes = writes.exec((session) =>
      session.set("authToken", env.authToken),
    );
  } else {
    const domain = env.auth0Domain!.replace(/\/$/, "");
    const login = http("Authenticate")
      .post(`${domain}/oauth/token`)
      .body(
        StringBody(
          JSON.stringify({
            grant_type: "password",
            username: env.authEmail,
            password: env.authPassword,
            audience: env.auth0Audience,
            client_id: env.auth0ClientId,
            client_secret: env.auth0ClientSecret,
          }),
        ),
      )
      .check(
        status().is(200),
        jsonPath("$.access_token").saveAs("authToken"),
      );
    reads = reads.exec(login);
    writes = writes.exec(login);
  }

  reads = reads
    .exec(
      http("List people")
        .get("/api/people")
        .header("Authorization", "Bearer #{authToken}"),
    )
    .exec(
      http("List people paged")
        .get("/api/people")
        .header("Authorization", "Bearer #{authToken}")
        .queryParam("page", "1"),
    )
    .exec(
      http("Search people")
        .get("/api/people")
        .header("Authorization", "Bearer #{authToken}")
        .queryParam("search", "e2e_seed"),
    );

  writes = writes
    .exec(
      http("Create load person")
        .post("/api/people")
        .header("Authorization", "Bearer #{authToken}")
        .body(
          StringBody(
            `{"name":"Load test person","email":"load-${Date.now()}-${Math.random()}@e2e.example"}`,
          ),
        )
        .check(status().is(201)),
    );

  setUp(
    reads
      .injectOpen(
        constantUsersPerSec(8)
          .during({ amount: 2, unit: "minutes" }),
      )
      .protocols(protocol),
    writes
      .injectOpen(
        constantUsersPerSec(2)
          .during({ amount: 2, unit: "minutes" }),
      )
      .protocols(protocol),
  ).assertions(
    global().responseTime().percentile(95).lt(300),
    global().responseTime().percentile(99).lt(800),
    global().failedRequests().percent().is(0),
  );
});
