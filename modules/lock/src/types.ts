export type Release = () => void

export interface Lock {
    acquire:(key:any) => Promise<Release>;
}