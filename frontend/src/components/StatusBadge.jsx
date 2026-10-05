export default function StatusBadge({ status }) {
  const styles = {
    draft: "bg-gray-100 text-gray-700",
    queued: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
    sent: "bg-green-100 text-green-700",
  };

  const labels = {
    draft: "Draft",
    queued: "Queued",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
    pending: "Pending",
    sent: "Sent",
  };

  const normalizedStatus = status?.toLowerCase() || "draft";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
        styles[normalizedStatus] ||
        "bg-gray-100 text-gray-700"
      }`}
    >
      {labels[normalizedStatus] || status || "Unknown"}
    </span>
  );
}
