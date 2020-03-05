var ranges = [
  { divider: 1e6 , suffix: 'M' },
  { divider: 1e3 , suffix: 'k' }
];

function formatNumberWithMetricPrefix(n) {
  n = n/100
  for (var i = 0; i < ranges.length; i++) {
    if (n >= ranges[i].divider) {
      return (Math.round(n / ranges[i].divider, 2)).toString() + ranges[i].suffix;
    }
  }
  return n.toString();
}