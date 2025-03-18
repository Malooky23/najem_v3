export const metadata = {
  title: 'Item Testing',
  description: 'Testing page for item creation and management',
};

export default function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden">
      {/* <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head> */}
      {children}
    </div>
  );
}
