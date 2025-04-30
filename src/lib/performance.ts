interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

const metrics: PerformanceMetric[] = [];

export function startMetric(name: string): void {
  metrics.push({
    name,
    startTime: performance.now()
  });
}

export function endMetric(name: string): void {
  const metric = metrics.find(m => m.name === name && !m.endTime);
  if (metric) {
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    console.log(`Performance metric "${name}": ${metric.duration.toFixed(2)}ms`);
  }
}

export function getMetrics(): PerformanceMetric[] {
  return metrics;
}

export function clearMetrics(): void {
  metrics.length = 0;
}

// Example usage:
// startMetric('fetchReviews');
// const reviews = await fetchReviews();
// endMetric('fetchReviews'); 