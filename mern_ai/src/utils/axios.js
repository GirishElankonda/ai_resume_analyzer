import axios from "axios";

const instance = axios.create({
    baseURL:"/",
    timeout: 120000, // 120 second timeout for long-running analysis requests
})

export default instance;