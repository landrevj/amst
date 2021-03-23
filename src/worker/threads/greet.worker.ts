/* eslint-disable import/prefer-default-export */
const sleep = async (time: number) => new Promise(resolve => setTimeout(resolve, time))

export async function greet(subject: string) {
  console.log('test');
  await sleep(15000);
  return `Hello, ${subject}!`;
}
