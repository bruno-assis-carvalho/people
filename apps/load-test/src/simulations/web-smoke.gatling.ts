import {
  atOnceUsers,
  global,
  scenario,
  simulation,
} from "@gatling.io/core";
import { http } from "@gatling.io/http";
import { loadEnv } from "../config/env";
import { requireLoadTestToken } from "../utils/auth";

export default simulation((setUp) => {
  const env = loadEnv();
  requireLoadTestToken();
  const protocol = http
    .baseUrl(env.webUrl)
    .acceptHeader("text/html,application/xhtml+xml")
    .disableCaching();

  const smoke = scenario("Web smoke")
    .exec(http("Landing").get("/"))
    .exec(http("Login").get("/login"))
    .exec(http("Dashboard").get("/in/people"));

  setUp(
    smoke.injectOpen(atOnceUsers(20)).protocols(protocol),
  ).assertions(
    global().failedRequests().percent().is(0),
    global().responseTime().percentile(95).lt(1000),
  );
});
