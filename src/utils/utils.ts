/* eslint-disable import/prefer-default-export */
export function isNumberArray(value: unknown): value is number[]
{
  return Array.isArray(value) && value.every(item => typeof item === "number");
}
