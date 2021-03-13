export interface ApplicationMetadata {
    path: string;
    routers?: Router[];
}

export interface RouterMap {
    [key: string]: Router;
}

export interface Router {
    path: string;
    routes?: Route[];
}

export interface Route {
    path: string;
    method?: "get" | "post" | "put" | "patch" | "delete";
    params?: string[];
}
