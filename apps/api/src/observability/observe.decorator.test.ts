import assert from "node:assert/strict";
import test from "node:test";
import { Observe } from "./observe.decorator";

class ObserveTarget {
  @Observe("ObserveTarget.succeed")
  async succeed(): Promise<string> {
    return "result";
  }

  @Observe("ObserveTarget.fail")
  async fail(error: Error): Promise<never> {
    throw error;
  }
}

test("returns values from observed methods", async () => {
  assert.equal(await new ObserveTarget().succeed(), "result");
});

test("rethrows the original rejection from observed methods", async () => {
  const expected = new Error("expected failure");

  await assert.rejects(new ObserveTarget().fail(expected), (error) => {
    assert.equal(error, expected);
    return true;
  });
});