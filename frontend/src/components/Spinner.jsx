export default function Spinner({ size = "md", text }) {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin`}
      />
      {text && <p className="text-sm text-slate-400">{text}</p>}
    </div>
  );
}
