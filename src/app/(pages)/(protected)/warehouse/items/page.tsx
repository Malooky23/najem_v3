import { Package2 } from 'lucide-react';
import { ComingSoon } from '@/components/coming-soon';
import { ItemsClientWrapper } from './components/items-client-wrapper-';

// export default function ItemsPage() {
//   return (
//     // <div className="p-2 mx-6  h-[calc(100vh-4rem)] flex flex-col bg-purple-200">
//     <div className="p-2 mx-6  h-[calc(100vh-4rem)]  bg-purple-200">

//       {/* <div className="flex-1 flex flex-col min-h-0"> */}
//       {/* <div> */}
//         <ItemsClientWrapper />
//       {/* </div> */}
//     </div>
//   );
// }
export default function ItemsPage() {
  return (
    // <div className="p-2 mx-6 flex flex-col bg-purple-200">
        <div className="p-2 mx-6  h-[calc(100vh-4rem)] flex flex-col ">

      <ItemsClientWrapper />
    </div>
  );
}

