export const difference = <T>(test: (x: T, y: T)=> boolean) => (a: Array<T>, b: Array<T>) => a.filter(m => !b.some(n => test(m,n)))
