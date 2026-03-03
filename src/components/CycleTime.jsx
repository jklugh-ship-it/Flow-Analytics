// CycleTime.jsx
export default function CycleTime({ percentiles }) {
  if (!percentiles) return null;

  const { p50, p85, p95 } = percentiles;

  return (
    <div className="metric-block">
      <p>
        <strong>95%</strong> 
		<br />of items were completed in 
		<br /><strong>{p95} days or less</strong>
        <br />
		<br /><strong>85%</strong> 
		<br />of items were completed in 
		<br /><strong>{p85} days or less</strong> 
        <br />
		<br /><strong>50%</strong>
		<br />of items were completed in 
		<br /><strong>{p50} days or less</strong> 
      </p>
    </div>
  );
}