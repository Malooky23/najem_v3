'use client'

import Link from "next/link"
import { usePathname, useSearchParams, useRouter } from "next/navigation"

import { useCallback, useEffect, useState } from "react"
import { useDebounce } from "use-debounce"



export default function ExampleURLParams() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Get a new searchParams string by merging the current
    // searchParams with a provided key/value pair
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)

            return params.toString()
        },
        [ searchParams ]
    )
    const URLState = useSearchParams()
    const URLParams = () => {
        const URLState = useSearchParams();
        const [ params, setParams ] = useState<Record<string, string>>({});
        const [bouncedParams] = useDebounce(params, 1000)
        useEffect(() => {
            const paramsObject: Record<string, string> = {};
            URLState.forEach((value, key) => {
                paramsObject[ key ] = value;
            });
            setParams(paramsObject);
        }, [ URLState ]);

        return (
            <div>
                <h1>URL Parameters:</h1>
                <pre>{JSON.stringify(bouncedParams, null, 2)}</pre>
            </div>
        );
    };

    const Boo = () => {
        // router.push(pathname + '?' + createQueryString('OG', typed))
        // useDebounce(router.push(pathname + '?' + createQueryString('Debounced', typed)))


        return(
            <div>
                <p className="font-bold text-lg text-red-400">Debounced: {URLState.get('Debounced')}</p>
                <p className="font-bold text-lg text-green-400">ORiginal: {URLState.get("OG")}</p>
            </div>
        )

        

    }

    const [typed, setTyped] = useState( "")

    return (

        <div className="flex gap-4">

            <p>Sort By </p>

            <p>CURRENT URL = {URLState.getAll('a')}</p>

            <div className="p-4 bg-amber-300">
            <Boo />
            </div>
            <div className="p-4 bg-pink-200">
                <URLParams />
            </div>
            <button className=" p-4 bg-red-200"
                onClick={
                    () => {
                        // <pathname>?sort=asc
                        router.push(pathname + '?' + createQueryString('a', 'asc'))
                    }
                }>
                ASC
            </button>
            <button className=" p-4 bg-green-500"
                onClick={
                    () => {
                        // <pathname>?sort=asc
                        router.push(pathname)
                    }
                }>
                refresh
            </button>

            <input onChange={(e) => 
                // router.push(pathname + '?' + createQueryString('TEST', e.target.value))
                setTyped(e.target.value)
                
                }></input>

            {/* using <Link> */}
            <Link className=" p-4 bg-blue-200"
                href={
                    // <pathname>?sort=desc
                    pathname + '?' + createQueryString('sortBort', 'desc')
                }
            >
                DESC
            </Link>
        </div>
    )
}