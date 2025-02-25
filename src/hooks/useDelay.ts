export default async function useDelay(ms:number){
    await new Promise((resolve) => setTimeout(resolve, ms))
}