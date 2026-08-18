import assert from "node:assert/strict";
import test from "node:test";
import { getMonthlyIssue, monthKey, renderGoldenListEmail } from "../app/lib/newsletter.ts";

test("selects a stable monthly issue", () => {
  const date = new Date("2026-08-15T14:00:00Z");
  assert.equal(monthKey(date), "2026-08");
  assert.match(getMonthlyIssue(date).subject, /August/i);
});

test("renders personalized email safely", () => {
  const issue = getMonthlyIssue(new Date("2026-08-15T14:00:00Z"));
  const email = renderGoldenListEmail(issue, {
    firstName: "M<&",
    siteUrl: "https://example.com",
    unsubscribeUrl: "https://example.com/unsubscribe?token=test",
  });
  assert.match(email.html, /Hi M&lt;&amp;,/);
  assert.doesNotMatch(email.html, /Hi M<&/);
  assert.match(email.text, /Unsubscribe:/);
});

