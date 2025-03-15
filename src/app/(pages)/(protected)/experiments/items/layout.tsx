export const metadata = {
  title: 'Item Testing',
  description: 'Testing page for item creation and management',
};

export default function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
