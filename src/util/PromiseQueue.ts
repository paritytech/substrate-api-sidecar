/**
 * A PromiseQueue, enforcing that no more than `maxTasks` number of tasks
 * are running at a given time.
 */
export class PromiseQueue<T> {
	// How many tasks are allowed to run concurrently?
	#maxTasks: number;
	// How many tasks are currently running concurrently?
	#runningTasks = 0;
	// The queued tasks waiting to run
	#tasks: LinkedList<() => void>;

	constructor(maxTasks: number) {
		this.#maxTasks = maxTasks;
		this.#tasks = new LinkedList();
	}

	// Try to run the next task in the queue.
	private tryRunNextTask(): void {
		if (this.#runningTasks >= this.#maxTasks) {
			return;
		}
		const nextTask = this.#tasks.popFront();
		if (nextTask) {
			nextTask();
			this.#runningTasks += 1;
		}
	}

	// Take a task and package it up to run, triggering
	// the next task when it completes (or errors), and returning the
	// result in the returned promise.
	private submitTaskToRun(task: () => Promise<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			const onFinish = () => {
				this.#runningTasks -= 1;
				this.tryRunNextTask();
			};

			const taskToRun = () => {
				task()
					.then((item) => {
						resolve(item);
						onFinish();
					})
					.catch((err) => {
						reject(err);
						onFinish();
					});
			};

			this.#tasks.pushBack(taskToRun);
			this.tryRunNextTask();
		});
	}

	/**
	 * Push a new task onto the queue. It will run when there are fewer
	 * than `maxTasks` running.
	 */
	run(task: () => Promise<T>): Promise<T> {
		return this.submitTaskToRun(task);
	}
}

type LinkedListItem<T> = { item: T; next: null | LinkedListItem<T> };

/**
 * A quick LinkedList queue implementation; we can add items to the back
 * or remove them from the front.
 */
class LinkedList<T> {
	#first: LinkedListItem<T> | null = null;
	#last: LinkedListItem<T> | null = null;

	private init(item: T): void {
		this.#first = this.#last = { item, next: null };
	}

	pushBack(item: T) {
		if (!this.#first) return this.init(item);
		const entry = { item, next: null };
		/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
		this.#last!.next = entry;
		this.#last = entry;
	}

	popFront(): T | null {
		if (!this.#first) return null;
		const entry = this.#first;
		this.#first = this.#first.next;
		return entry.item;
	}

	clear(): void {
		this.#first = this.#last = null;
	}

	empty(): boolean {
		return this.#first === null;
	}
}
