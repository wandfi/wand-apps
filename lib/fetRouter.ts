import axios from "axios";
import { fromJson } from "./bnjson";

export async function fetRouter(path: `/${string}`, params: Record<string, any>) {
    return axios.get(path, {
        params: params,
        transformResponse: (data) => {
            try {
                return fromJson(data);
            } catch (err) {
                return data;
            }
        }
    }).then(res => res.data)
}