import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="container flex flex-col items-center gap-16 px-4 py-16 ">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-primary/10 px-4 py-1.5">
            <span className="text-sm font-medium text-primary">✨ New Features Available</span>
          </div>
          <h1 className="text-center text-4xl font-bold tracking-tight sm:text-6xl">
            Logistics Reimagined <br />
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparen text-3xl">
              Najem Aleen Shipping
            </span>
          </h1>
          <p className="max-w-[42rem] text-center leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Create, manage, and track your orders with ease. Our new item management system lets you take full control of your inventory.
          </p>
        </div>

        <div className="flex flex-col items-center gap-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <div className="rounded-full bg-primary/10 p-3">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <h3 className="text-center text-sm font-medium">Create Items</h3>
              <p className="text-center text-sm text-muted-foreground">
                Add new items to your inventory with detailed information
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <div className="rounded-full bg-primary/10 p-3">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
                </svg>
              </div>
              <h3 className="text-center text-sm font-medium">Track Items</h3>
              <p className="text-center text-sm text-muted-foreground">
                Keep track of your items with our intuitive dashboard
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <div className="rounded-full bg-primary/10 p-3">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </div>
              <h3 className="text-center text-sm font-medium">Manage Items</h3>
              <p className="text-center text-sm text-muted-foreground">
                Update or remove items as needed with ease
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              Get Started
            </Link>
            <Link
              href="/about"
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
