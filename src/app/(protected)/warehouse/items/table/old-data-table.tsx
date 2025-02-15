"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "./pagination-controls"
import type { EnrichedCustomer } from "@/types/customer"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface DataTableProps<TValue> {
  columns: ColumnDef<EnrichedCustomer, TValue>[]
  data: EnrichedCustomer[]
}

export function DataTable<TValue>({
  columns,
  data,
}: DataTableProps<TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 100,
      },
    },
  })

  return (
    <div className="flex flex-col h-full">
      <div className="rounded-md border flex-1 relative">
        <div className="absolute inset-0 overflow-auto">
          <Table className="relative" 
          style={{
            textOverflow: 'clip',
            // tableLayout: 'fixed'
            }}>
            <TableHeader className="relative top-0 bg-white z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}
                  style={{ position: 'relative' }}
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}
                      style={{ position: 'relative' }}
                    // className="relative sticky h-full"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    className="hover:bg-green-500"
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      toast({
                        title: "Clicked on: ",
                        description: "Friday, February 10, 2023 at 5:57 PM",
                      })
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                        
                      <TableCell 
                      className={cell.column.id === 'actions' ? 'text-right' : ''} 
                      key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>

                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="border-t bg-white">
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}


// // "use client"

// // import { useRef, useEffect, useState } from "react"
// // import {
// //   type ColumnDef,
// //   flexRender,
// //   getCoreRowModel,
// //   getPaginationRowModel,
// //   useReactTable,
// // } from "@tanstack/react-table"

// // import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// // import { DataTablePagination } from "./pagination-controls"
// // import type { EnrichedCustomer } from "@/types/customer"
// // import { toast } from "@/hooks/use-toast"

// // interface DataTableProps<TValue> {
// //   columns: ColumnDef<EnrichedCustomer, TValue>[]
// //   data: EnrichedCustomer[]
// // }

// // export function DataTable<TValue>({ columns, data }: DataTableProps<TValue>) {
// //   const [tableWidth, setTableWidth] = useState<number>(0)
// //   const tableBodyRef = useRef<HTMLDivElement>(null)

// //   const table = useReactTable({
// //     data,
// //     columns,
// //     getCoreRowModel: getCoreRowModel(),
// //     getPaginationRowModel: getPaginationRowModel(),
// //     initialState: {
// //       pagination: {
// //         pageSize: 1000,
// //       },
// //     },
// //   })

// //   useEffect(() => {
// //     const updateTableWidth = () => {
// //       if (tableBodyRef.current) {
// //         setTableWidth(tableBodyRef.current.offsetWidth)
// //       }
// //     }

// //     updateTableWidth()
// //     window.addEventListener("resize", updateTableWidth)

// //     return () => window.removeEventListener("resize", updateTableWidth)
// //   }, [])

// //   return (
// //     <div className="flex flex-col h-full">
// //       <div className="rounded-md border flex-1 overflow-hidden">
// //         <div className="relative">
// //           {/* Fixed Header */}
// //           <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b">
// //             <Table style={{ width: `${tableWidth}px` }}>
// //               <TableHeader>
// //                 {table.getHeaderGroups().map((headerGroup) => (
// //                   <TableRow key={headerGroup.id}>
// //                     {headerGroup.headers.map((header) => (
// //                       <TableHead key={header.id}>
// //                         {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
// //                       </TableHead>
// //                     ))}
// //                   </TableRow>
// //                 ))}
// //               </TableHeader>
// //             </Table>
// //           </div>

// //           {/* Scrollable Body */}
// //           <div
// //             ref={tableBodyRef}
// //             className="overflow-auto max-h-[calc(100vh-200px)]"
// //             style={{ marginTop: "5px" }} // Adjust based on your header height
// //           >
// //             <Table>
// //               <TableBody>
// //                 {table.getRowModel().rows?.length ? (
// //                   table.getRowModel().rows.map((row) => (
// //                     <TableRow
// //                       className="hover:bg-green-500"
// //                       key={row.id}
// //                       data-state={row.getIsSelected() && "selected"}
// //                       onClick={() => {
// //                         toast({
// //                           title: "Clicked on: ",
// //                           description: "Friday, February 10, 2023 at 5:57 PM",
// //                         })
// //                       }}
// //                     >
// //                       {row.getVisibleCells().map((cell) => (
// //                         <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
// //                       ))}
// //                     </TableRow>
// //                   ))
// //                 ) : (
// //                   <TableRow>
// //                     <TableCell colSpan={columns.length} className="h-24 text-center">
// //                       No results.
// //                     </TableCell>
// //                   </TableRow>
// //                 )}
// //               </TableBody>
// //             </Table>
// //           </div>
// //         </div>
// //       </div>
// //       <div className="border-t bg-white">
// //         <DataTablePagination table={table} />
// //       </div>
// //     </div>
// //   )
// // }

// "use client"

// import { useRef, useEffect, useState } from "react"
// import {
//   type ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   getPaginationRowModel,
//   useReactTable,
// } from "@tanstack/react-table"

// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { DataTablePagination } from "./pagination-controls"
// import type { EnrichedCustomer } from "@/types/customer"
// import { toast } from "@/hooks/use-toast"

// interface DataTableProps<TValue> {
//   columns: ColumnDef<EnrichedCustomer, TValue>[]
//   data: EnrichedCustomer[]
// }

// export function DataTable<TValue>({ columns, data }: DataTableProps<TValue>) {
//   const [tableWidth, setTableWidth] = useState<number>(0)
//   const [headerHeight, setHeaderHeight] = useState<number>(0)
//   const tableBodyRef = useRef<HTMLDivElement>(null)
//   const tableHeaderRef = useRef<HTMLDivElement>(null)

//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     initialState: {
//       pagination: {
//         pageSize: 100,
//       },
//     },
//   })

//   useEffect(() => {
//     const updateTableDimensions = () => {
//       if (tableBodyRef.current) {
//         setTableWidth(tableBodyRef.current.offsetWidth)
//       }
//       if (tableHeaderRef.current) {
//         setHeaderHeight(tableHeaderRef.current.offsetHeight)
//       }
//     }

//     updateTableDimensions()
//     window.addEventListener("resize", updateTableDimensions)

//     return () => window.removeEventListener("resize", updateTableDimensions)
//   }, [])

//   return (
//     <div className="flex flex-col h-full border border-red-400">
//       <div className="rounded-md border border-green-400 flex-1 overflow-hidden">
//         <div className="relative">
//           {/* Fixed Header */}
//           <div ref={tableHeaderRef} className="sticky top-0 left-0 right-0 z-10 bg-white border-b shadow-sm"

//           >
//             {/* <Table> */}
//             <Table style={{ width: "100%" }}>
//               <TableHeader >

//                 {table.getHeaderGroups().map((headerGroup) => (
//                   <TableRow key={headerGroup.id}>
//                     {headerGroup.headers.map((header) => (
//                       <TableHead key={header.id}>
//                         {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
//                       </TableHead>
//                     ))}
//                   </TableRow>
//                 ))}
//               </TableHeader>
//             </Table>
//           </div>

//           {/* Scrollable Body */}
//           <div
//             ref={tableBodyRef}
//             className="overflow-auto border-amber-400 border-2"
//             style={{
//               maxHeight: `calc(100vh - ${headerHeight}px - 170px)`, // Adjust 100px as needed for pagination and any other elements
//               width: "100%",
//             }}
//           >
//             <Table>
//               <TableBody>
//                 {table.getRowModel().rows?.length ? (
//                   table.getRowModel().rows.map((row) => (
//                     <TableRow
//                       className="hover:bg-green-500"
//                       key={row.id}
//                       data-state={row.getIsSelected() && "selected"}
//                       onClick={() => {
//                         toast({
//                           title: "Clicked on: ",
//                           description: "Friday, February 10, 2023 at 5:57 PM",
//                         })
//                       }}
//                     >
//                       {row.getVisibleCells().map((cell) => (
//                         <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
//                       ))}
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={columns.length} className="h-24 text-center">
//                       No results.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//       </div>
//       <div className=" ">
//         <DataTablePagination table={table} />
//       </div>
//     </div>
//   )
// }

// "use client"

// import { useRef, useEffect, useState } from "react"
// import {
//   type ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   getPaginationRowModel,
//   useReactTable,
// } from "@tanstack/react-table"

// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { DataTablePagination } from "./pagination-controls"
// import type { EnrichedCustomer } from "@/types/customer"
// import { toast } from "@/hooks/use-toast"

// interface DataTableProps<TValue> {
//   columns: ColumnDef<EnrichedCustomer, TValue>[]
//   data: EnrichedCustomer[]
// }

// export function DataTable<TValue>({ columns, data }: DataTableProps<TValue>) {
//   const [headerHeight, setHeaderHeight] = useState<number>(0)
//   const tableBodyRef = useRef<HTMLDivElement>(null)
//   const tableHeaderRef = useRef<HTMLDivElement>(null)

//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     initialState: {
//       pagination: {
//         pageSize: 100,
//       },
//     },
//   })

//   useEffect(() => {
//     const updateTableDimensions = () => {
//       if (tableHeaderRef.current) {
//         setHeaderHeight(tableHeaderRef.current.offsetHeight)
//       }
//     }

//     const syncColumnWidths = () => {
//       const headerCells = tableHeaderRef.current?.querySelectorAll("th")
//       const bodyCells = tableBodyRef.current?.querySelectorAll("tr:first-child td")

//       if (headerCells && bodyCells && headerCells.length === bodyCells.length) {
//         const widths = Array.from(bodyCells).map((cell) => (cell as HTMLTableCellElement).offsetWidth)

//         headerCells.forEach((header, index) => {
//           (header as HTMLTableCellElement).style.width = `${widths[index]}px`
//         })

//         bodyCells.forEach((cell, index) => {
//           (cell as HTMLTableCellElement).style.width = `${widths[index]}px`
//         })
//       }
//     }

//     updateTableDimensions()
//     syncColumnWidths()

//     const handleResize = () => {
//       updateTableDimensions()
//       syncColumnWidths()
//     }

//     window.addEventListener("resize", handleResize)

//     return () => window.removeEventListener("resize", handleResize)
//   }, [data])

//   return (
//     <div className="flex flex-col h-full border border-red-400">
//       <div className="rounded-md border border-green-400 flex-1 overflow-hidden">
//         <div className="relative">
//           {/* Fixed Header */}
//           <div
//             ref={tableHeaderRef}
//             className="sticky top-0 left-0 right-0 z-10 bg-white border-b shadow-sm overflow-hidden"
//           >
//             <Table>
//               <TableHeader>
//                 {table.getHeaderGroups().map((headerGroup) => (
//                   <TableRow key={headerGroup.id}>
//                     {headerGroup.headers.map((header) => (
//                       <TableHead key={header.id} className="overflow-hidden text-nowrap truncate">
//                         {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
//                       </TableHead>
//                     ))}
//                   </TableRow>
//                 ))}
//               </TableHeader>
//             </Table>
//           </div>

//           {/* Scrollable Body */}
//           <div
//             ref={tableBodyRef}
//             className="overflow-auto border-amber-400 border-2"
//             style={{
//               maxHeight: `calc(100vh - ${headerHeight}px - 170px)`,
//               width: "100%",
//             }}
//           >
//             <Table>
//               <TableBody>
//                 {table.getRowModel().rows?.length ? (
//                   table.getRowModel().rows.map((row) => (
//                     <TableRow
//                       className="hover:bg-green-500"
//                       key={row.id}
//                       data-state={row.getIsSelected() && "selected"}
//                       onClick={() => {
//                         toast({
//                           title: "Clicked on: ",
//                           description: "Friday, February 10, 2023 at 5:57 PM",
//                         })
//                       }}
//                     >
//                       {row.getVisibleCells().map((cell) => (
//                         <TableCell key={cell.id} className="overflow-hidden text-nowrap truncate">
//                           {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                         </TableCell>
//                       ))}
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={columns.length} className="h-24 text-center">
//                       No results.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//       </div>
//       <div>
//         <DataTablePagination table={table} />
//       </div>
//     </div>
//   )
// }

