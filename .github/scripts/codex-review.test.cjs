const assert = require("node:assert/strict")
const {test} = require("node:test")
const {isCompleted, waitForReview} = require("./codex-review.cjs")

const sha = "9fb059d" + "0".repeat(33)

function summary(status = "✅ **Completed**", commit = sha.slice(0, 7)) {
  return {
    id: 1,
    user: {id: 199175422, login: "chatgpt-codex-connector[bot]", type: "Bot"},
    body: `<!-- codex-pull-request-review-summary -->\n\n| Review | Status | Commit | Review trigger |\n| --- | --- | --- | --- |\n| 📝 **Code Review** | ${status} <relative-time>now</relative-time> | \`${commit}\` | PR opened |`,
  }
}

test("accepts the authentic completed summary for the current head", () => {
  assert.equal(isCompleted([summary()], sha), true)
  assert.equal(isCompleted([summary(undefined, sha)], sha), true)
})

test("rejects missing, unfinished, failed, and stale reviews", () => {
  assert.equal(isCompleted([], sha), false)
  for (const status of [
    "🔄 **Running**",
    "❌ **Failed**",
    "✅ **Not Completed**",
    "Completed",
  ]) {
    assert.equal(isCompleted([summary(status)], sha), false)
  }
  assert.equal(isCompleted([summary(undefined, "aaaaaaa")], sha), false)
  assert.equal(isCompleted([summary(undefined, "9")], sha), false)
})

test("rejects copied comments from another identity", () => {
  const comment = summary()
  assert.equal(isCompleted([{...comment, user: {...comment.user, id: 1}}], sha), false)
  assert.equal(isCompleted([{...comment, user: {...comment.user, type: "User"}}], sha), false)
})

test("an older completed summary cannot override a newer running summary", () => {
  assert.equal(isCompleted([summary(), {...summary("🔄 **Running**"), id: 2}], sha), false)
})

test("requires all listed reviews to finish for the current commit", () => {
  const comment = summary()
  const security = `\n| 🔐 **Security Review** | 🔄 **Running** | \`${sha.slice(0, 7)}\` | Manual |`
  assert.equal(isCompleted([{...comment, body: comment.body + security}], sha), false)
  assert.equal(
    isCompleted(
      [
        {
          ...comment,
          body: comment.body + security.replace("🔄 **Running**", "✅ **Completed**"),
        },
      ],
      sha,
    ),
    true,
  )
})

test("ignores completion text outside the review table", () => {
  const comment = summary("🔄 **Running**")
  assert.equal(
    isCompleted([{...comment, body: comment.body + "\n✅ **Completed**"}], sha),
    false,
  )
})

test("the action succeeds for a completed review", async () => {
  const messages = []
  await waitForReview({
    context: {
      repo: {owner: "owner", repo: "repo"},
      payload: {pull_request: {number: 5, head: {sha}}},
    },
    github: {
      rest: {
        pulls: {get: async () => ({data: {state: "open", head: {sha}}})},
        issues: {listComments: {}},
      },
      paginate: async () => [summary()],
    },
    core: {
      info: (message) => {
        messages.push(message)
      },
      setFailed: assert.fail,
    },
  })
  assert.match(messages[0], /completed/)
})

test("a superseded head fails before accepting an old review", async () => {
  const failures = []
  await waitForReview({
    context: {
      repo: {owner: "owner", repo: "repo"},
      payload: {pull_request: {number: 5, head: {sha}}},
    },
    github: {
      rest: {pulls: {get: async () => ({data: {state: "open", head: {sha: "changed"}}})}},
    },
    core: {
      setFailed: (message) => {
        failures.push(message)
      },
    },
  })
  assert.match(failures[0], /head changed/)
})
