export interface IMetric {
	name: string;
	help: string;
	type: MetricType;
	buckets?: number[];
	labels?: string[];
}

export const enum MetricType {
	Counter = 'counter',
	Gauge = 'gauge',
	Histogram = 'histogram',
	Summary = 'summary',
}
