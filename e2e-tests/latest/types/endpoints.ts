export type IConfig = {
    [key: string]: IEndpoints
}

interface IEndpoints {
    path: string;
    queryParams: string[] 
}
