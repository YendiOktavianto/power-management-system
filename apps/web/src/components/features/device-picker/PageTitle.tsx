function PageTitle({
  children,
  className,
}: { children: React.ReactNode; className: string }) {
  return (
    <h1 className={className}>
      {children}
    </h1>
  );
}
