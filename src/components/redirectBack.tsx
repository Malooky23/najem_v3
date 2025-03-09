"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { MoveLeft } from 'lucide-react';
import { Button } from './ui/button';

interface BackButtonProps {
  className?: string; // Optional: Add custom class names
}

const BackButton: React.FC<BackButtonProps> = ({ className }) => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Button
      onClick={handleGoBack}
      variant={'ghost'}
      className={className}>
      <MoveLeft/>
    </Button>
  );
};

export default BackButton;