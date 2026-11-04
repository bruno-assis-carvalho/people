import assert from "node:assert/strict";
import test from "node:test";
import { TraceMethod } from "./trace.decorator";

class TraceTarget {
  @TraceMethod("TraceTarget.succeed")
  async succeed(): Promise<string> {
    return "result";
  }

  @TraceMethod("TraceTarget.fail")
  async fail(error: Error): Promise<never> {
    throw error;
  }
}

test("returns values from traced methods", async () => {
  assert.equal(await new TraceTarget().succeed(), "result");
});

test("rethrows the original rejection from traced methods", async () => {
  const expected = new Error("expected failure");

  await assert.rejects(new TraceTarget().fail(expected), (error) => {
    assert.equal(error, expected);
    return true;
  });
});
