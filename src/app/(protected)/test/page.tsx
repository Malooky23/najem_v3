import ModalWrapper from "@/components/ModalWrapper"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Modal with Server Action</h1>
      <ModalWrapper>
        <Button>Open Modal</Button>
      </ModalWrapper>
    </main>
  )
}

