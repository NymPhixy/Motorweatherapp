import { getRideAdvice } from "../helpers/getRideAdvice";

function RideAdvice({ weather, isLoading, error }) {
  const advice = getRideAdvice(weather, isLoading, error);

  return (
    <div className={`ride-advice ride-advice-${advice.level}`} role="status">
      <span>{advice.icon}</span>
      <strong>{advice.message}</strong>
    </div>
  );
}

export default RideAdvice;
