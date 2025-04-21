'use client';

import * as React from 'react';
import { useState } from 'react';
// Import local hooks
// import {
//   useDebounce as useLocalDebounceValue,
//   useDebouncedCallback as useLocalDebouncedCallback,
// } from '@/hooks/useDebounce'; // Assuming hooks are in src/hooks
// import {
//   useDebounce as useHookFileDebounceCallback,
//   useDebouncedValue as useHookFileDebouncedValue,
// } from '@/hooks/use-debounce'; // Assuming hooks are in src/hooks
// // Import npm package hooks
import {
  useDebounce as useNpmDebounceValue,
  useDebouncedCallback as useNpmDebouncedCallback,
} from 'use-debounce';

import { Input } from '@/components/ui/input'; // Adjust import path if needed
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'; // Adjust import path if needed

const DEBOUNCE_DELAY = 500; // ms

export default function DebounceTestPage() {
  const [inputValue, setInputValue] = useState('');

  // --- Local Hook: src/hooks/useDebounce.ts ---
  // 1. useDebounce (Value)
//   const localDebouncedValue = useLocalDebounceValue(inputValue, DEBOUNCE_DELAY);

//   // 2. useDebouncedCallback
//   const [localCallbackValue, setLocalCallbackValue] = useState('');
//   const handleLocalDebouncedCallback = useLocalDebouncedCallback((value: string) => {
//     setLocalCallbackValue(value);
//   }, DEBOUNCE_DELAY);

//   // --- Local Hook: src/hooks/use-debounce.ts ---
//   // 3. useDebouncedValue
//   const hookFileDebouncedValue = useHookFileDebouncedValue(inputValue, DEBOUNCE_DELAY);

//   // 4. useDebounce (Callback)
//   const [hookFileCallbackValue, setHookFileCallbackValue] = useState('');
//   const handleHookFileDebouncedCallback = useHookFileDebounceCallback((value: string) => {
//     setHookFileCallbackValue(value);
//   }, DEBOUNCE_DELAY);

  // --- NPM Package: use-debounce ---
  // 5. useDebounce (Value)
  const npmDebouncedValue = useNpmDebounceValue(inputValue, DEBOUNCE_DELAY);

  // 6. useDebouncedCallback
  const [npmCallbackValue, setNpmCallbackValue] = useState('');
  const handleNpmDebouncedCallback = useNpmDebouncedCallback((value: string) => {
    setNpmCallbackValue(value);
  }, DEBOUNCE_DELAY);

  // --- Input Handler ---
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInputValue(value);
    // Trigger callback-based debouncers
    // handleLocalDebouncedCallback(value);
    // handleHookFileDebouncedCallback(value);
    handleNpmDebouncedCallback(value);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="mb-6 text-3xl font-bold">Debounce Hook Comparison</h1>

      <div className="mb-8">
        <label htmlFor="test-input" className="mb-2 block text-sm font-medium">
          Type here to test debouncing:
        </label>
        <Input
          id="test-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={`Input will update results after ${DEBOUNCE_DELAY}ms delay`}
          className="max-w-md"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Raw Input Value: <span className="font-mono">{inputValue || '...'}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Local useDebounce (Value) */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Local: useDebounce (Value)</CardTitle>
            <CardDescription>src/hooks/useDebounce.ts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-lg">{localDebouncedValue || '...'}</p>
          </CardContent>
        </Card> */}

        {/* Card 2: Local useDebouncedCallback */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Local: useDebouncedCallback</CardTitle>
            <CardDescription>src/hooks/useDebounce.ts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-lg">{localCallbackValue || '...'}</p>
          </CardContent>
        </Card> */}

        {/* Card 3: Local useDebouncedValue (from use-debounce.ts) */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Local: useDebouncedValue</CardTitle>
            <CardDescription>src/hooks/use-debounce.ts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-lg">{hookFileDebouncedValue || '...'}</p>
          </CardContent>
        </Card> */}

        {/* Card 4: Local useDebounce (Callback) (from use-debounce.ts) */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Local: useDebounce (Callback)</CardTitle>
            <CardDescription>src/hooks/use-debounce.ts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-lg">{hookFileCallbackValue || '...'}</p>
          </CardContent>
        </Card> */}

        {/* Card 5: NPM useDebounce (Value) */}
        <Card>
          <CardHeader>
            <CardTitle>NPM: useDebounce (Value)</CardTitle>
            <CardDescription>package: use-debounce</CardDescription>
          </CardHeader>
          <CardContent>
            {/* <p className="font-mono text-lg">{npmDebouncedValue || '...'}</p> */}
            <p className="font-mono text-lg">0: {npmDebouncedValue[0]}</p>
            <p className="font-mono text-lg">1: {npmDebouncedValue[1].toString() }</p>
          </CardContent>
        </Card>

        {/* Card 6: NPM useDebouncedCallback */}
        <Card>
          <CardHeader>
            <CardTitle>NPM: useDebouncedCallback</CardTitle>
            <CardDescription>package: use-debounce</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-lg">{npmCallbackValue || '...'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
