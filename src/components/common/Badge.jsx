export function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    delivered: "bg-blue-100 text-blue-800",
    returned: "bg-purple-100 text-purple-800",
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${variants[variant]}`}>
      {children}
    </span>
  );
}