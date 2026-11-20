import {
  csv,
  feed,
  global,
  jsonPath,
  rampUsers,
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

  const feeder = csv("users-and-items.csv").queue();
  let seedScenario = scenario("Seed people");
  if (env.authToken) {
    seedScenario = seedScenario.exec((session) =>
      session.set("authToken", env.authToken),
    );
  } else {
    const domain = env.auth0Domain!.replace(/\/$/, "");
    seedScenario = seedScenario.exec(
      http("Authenticate")
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
        ),
    );
  }

  seedScenario = seedScenario
    .forever()
    .on(
      feed(feeder).exec(
        http("POST person")
          .post("/api/people")
          .header("Authorization", "Bearer #{authToken}")
          .body(
            StringBody(
              '{"name":"#{name}","email":"#{email}"}',
            ),
          )
          .check(status().is(201)),
      ),
    );

  setUp(
    seedScenario.injectOpen(
      rampUsers(env.seedUsers).during({
        amount: 15,
        unit: "seconds",
      }),
    ),
  )
    .protocols(protocol)
    .assertions(
      global().failedRequests().percent().lte(0.5),
      global().responseTime().percentile(95).lt(1000),
    );
});
