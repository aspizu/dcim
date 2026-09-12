const {setTimeout: sleep} = require("node:timers/promises")

/** Checks the latest authentic Codex summary for completed reviews of the current commit. */
function isCompleted(comments, sha) {
  const summary = comments
    .filter(
      (comment) =>
        comment.user?.id === 199175422 &&
        comment.user?.login === "chatgpt-codex-connector[bot]" &&
        comment.user?.type === "Bot" &&
        comment.body?.startsWith("<!-- codex-pull-request-review-summary -->"),
    )
    .sort((a, b) => b.id - a.id)[0]
  const rows = (summary?.body ?? "")
    .split("<details>")[0]
    .split("\n")
    .filter((line) => line.startsWith("|"))
    .slice(2)
    .map((line) => line.split("|").map((cell) => cell.trim()))
  return (
    rows.some((row) => row[1].includes("**Code Review**")) &&
    rows.every((row) => {
      const commit = /^`([a-f0-9]{7,40})`$/.exec(row[3] ?? "")?.[1]
      return (
        /^✅\s+\*\*Completed\*\*(?:\s|$)/u.test(row[2] ?? "") &&
        commit !== undefined &&
        sha.startsWith(commit)
      )
    })
  )
}

/** Waits for the PR's current commit to receive a completed Codex review, failing closed. */
async function waitForReview({github, context, core}) {
  const pull = context.payload.pull_request
  const sha = pull.head.sha
  const deadline = Date.now() + 30 * 60 * 1000
  while (Date.now() < deadline) {
    const {data: current} = await github.rest.pulls.get({
      ...context.repo,
      pull_number: pull.number,
    })
    if (current.state !== "open" || current.head.sha !== sha) {
      core.setFailed(
        "The pull request closed or its head changed; a new run must check the latest commit.",
      )
      return
    }
    const comments = await github.paginate(github.rest.issues.listComments, {
      ...context.repo,
      issue_number: pull.number,
      per_page: 100,
    })
    if (isCompleted(comments, sha)) {
      core.info(`Codex review completed for ${sha}.`)
      return
    }
    core.info(`Waiting for Codex to complete its review of ${sha}.`)
    await sleep(30_000)
  }
  core.setFailed(
    "Codex review did not complete for this commit within 30 minutes. Request a Codex review, then rerun this job.",
  )
}

module.exports = {isCompleted, waitForReview}
