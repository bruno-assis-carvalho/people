import {
  constantUsersPerSec,
  global,
  scenario,
  simulation,
  StringBody,
} from "@gatling.io/core";
import { http, status } from "@gatling.io/http";
import { loadEnv } from "../config/env";
import { requireLoadTestToken } from "../utils/auth";

export default simulation((setUp) => {
  const env = loadEnv();
  const authToken = requireLoadTestToken();
  const protocol = http
    .baseUrl(env.apiUrl)
    .header("Accept", "application/json")
    .header("Content-Type", "application/json")
    .disableCaching();

  const reads = scenario("API reads")
    .exec((session) => session.set("authToken", authToken))
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

  const writes = scenario("API writes")
    .exec((session) => session.set("authToken", authToken))
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
