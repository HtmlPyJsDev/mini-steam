interface LoaderProps {
  label?: string;
}

export function Loader({ label }: LoaderProps) {
  return (
    <div className="loader">
      <div className="loader__spinner" aria-hidden />
      {label ? <span className="loader__label">{label}</span> : null}
    </div>
  );
}
