'use server'

export default async function testAction(value: any) {
    console.log('test action', value)
    return null;
}