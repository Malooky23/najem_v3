import { Package2 } from 'lucide-react';
import { ComingSoon } from '@/components/coming-soon';
import { ItemsClientWrapper } from './components/items-client-wrapper-';


export default function ItemsPage() {
  return (
    // <div className="p-2 mx-6 flex flex-col bg-purple-200">
    // <div className="p-2 mx-6  h-[calc(100vh-4rem)] flex flex-col ">
    // {/* // <div className="p-2 mx-6 bg-red-100  flex flex-col "> */}
    <div className=" h-full flex flex-col  bg-gradient-to-tr from-orange-100/50 to-blue-200/50">
      <ItemsClientWrapper />
    </div>
  );
}

