import { randomInt } from "node:crypto";

export const BASE62_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const CODE_LENGTH = 7;

export type CodeGenerator = () => string;

export function createCodeGenerator(
  length: number = CODE_LENGTH,
): CodeGenerator {
  if (!Number.isInteger(length) || length <= 0) {
    throw new RangeError("Code length must be a positive integer");
  }
  return () => {
    let code = "";
    for (let i = 0; i < length; i++) {
      code += BASE62_ALPHABET[randomInt(BASE62_ALPHABET.length)];
    }
    return code;
  };
}

export const generateCode: CodeGenerator = createCodeGenerator();
