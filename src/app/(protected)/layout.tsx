
export default function Layout({children}: {children: React.ReactNode}) {
      return (
        <section>
            <div className="bg-gray-800 text-white p-4 w-full">
                Header
            </div>
            {children}
        </section>
    );
}