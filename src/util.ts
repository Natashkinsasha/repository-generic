export type NonFunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type Diff<T, U> = T extends U ? never : T;
export type Subtract<T, V> = Pick<T, Exclude<keyof T, keyof V>>;