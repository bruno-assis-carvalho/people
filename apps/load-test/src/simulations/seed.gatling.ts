import {
  arrayFeeder,
  feed,
  global,
  rampUsers,
  scenario,
  simulation,
  StringBody,
} from "@gatling.io/core";
import { http, status } from "@gatling.io/http";
import { mockPeople } from "@people/mocks";
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

  const feeder = arrayFeeder(
    mockPeople.map(({ name, email }) => ({ name, email })),
  ).queue();
  const seedScenario = scenario("Seed people")
    .exec((session) => session.set("authToken", authToken))
    .feed(feeder)
    .exec(
      http("POST person")
        .post("/api/people")
        .header("Authorization", "Bearer #{authToken}")
        .body(
          StringBody(
            '{"name":"#{name}","email":"#{email}"}',
          ),
        )
        .check(status().is(201)),
    );

  const seedPopulation = seedScenario
    .injectOpen(
      rampUsers(mockPeople.length).during({
        amount: 15,
        unit: "seconds",
      }),
    )
    .protocols(protocol);

  setUp(seedPopulation).assertions(
      global().failedRequests().percent().lte(0.5),
      global().responseTime().percentile(95).lt(1000),
  );
});
