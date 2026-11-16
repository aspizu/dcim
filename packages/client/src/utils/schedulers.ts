export class SequentialScheduler {
  private _tail: Promise<void> = Promise.resolve()

  schedule(task: () => Promise<void>) {
    const result = this._tail.then(task)
    this._tail = result.catch((e) => {
      console.error(e instanceof Error ? (e.stack ?? e.message) : String(e))
    })
  }
}
