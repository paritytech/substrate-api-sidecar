export class MultiKeyBiMap<K extends string | number, V extends string | number> {
	private keyToValue = new Map<K, V>();
	private valueToKeys = new Map<V, Set<K>>();

	set(key: K, value: V): void {
		// Remove old value mapping if it exists
		const oldValue = this.keyToValue.get(key);
		if (oldValue !== undefined) {
			const keys = this.valueToKeys.get(oldValue);
			keys?.delete(key);
			if (keys && keys.size === 0) {
				this.valueToKeys.delete(oldValue);
			}
		}

		this.keyToValue.set(key, value);

		if (!this.valueToKeys.has(value)) {
			this.valueToKeys.set(value, new Set());
		}
		this.valueToKeys.get(value)!.add(key);
	}

	getByKey(key: K): V | undefined {
		return this.keyToValue.get(key);
	}

	getByValue(value: V): Set<K> | undefined {
		return this.valueToKeys.get(value);
	}

	get(input: K | V): V | Set<K> | undefined {
		if (this.keyToValue.has(input as K)) {
			return this.keyToValue.get(input as K);
		}
		if (this.valueToKeys.has(input as V)) {
			return this.valueToKeys.get(input as V);
		}
		return undefined;
	}
}
