// 'use client'

// import { Button } from '@/components/ui/button'
// import { useState } from 'react'
// import { toast } from '@/hooks/use-toast'

// export default function CopyUsers() {
//     const [isLoading, setIsLoading] = useState(false)

//     const handleCopy = async () => {
//         setIsLoading(true)
//         try {
//             const response = await fetch('/api/admin/copy-users', {
//                 method: 'POST',
//             })

//             if (!response.ok) {
//                 toast({
//                     variant: "destructive",
//                     title: "FAILED",
//                     description: "You suck.",
//                 });            }

//             toast({
//                 variant: "default",
//                 title: "success",
//                 description: "Copied Users.",
//             });
//         } catch (error) {
//             console.error(error)
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     return (
//         <Button
//             onClick={handleCopy}
//             disabled={isLoading}
//         >
//             {isLoading ? 'Copying...' : 'Copy Users'}
//         </Button>
//     )
// }