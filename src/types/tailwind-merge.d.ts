declare module 'tailwind-merge' {
  export function twMerge(...classLists: Array<string | undefined | null | false>): string
  export function extendTailwindMerge<T>(
    ...createConfigArgs: Array<(config: T) => T>
  ): (...classLists: Array<string | undefined | null | false>) => string
  export function twJoin(...classLists: Array<string | undefined | null | false>): string
}
