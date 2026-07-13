type AuthLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12 md:max-w-lg md:gap-8 md:py-16">
      {children}
    </div>
  );
}
