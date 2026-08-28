import axios from "axios";
import config from "./config";

const { indexBaseURL } = config;

const api = axios.create({
  method: "post",
  baseURL: indexBaseURL,
});

api.interceptors.response.use((response) => response.data);

export default {
  async init() {
    const { data } = await api({ url: "/init" });
    return data;
  },

  async query_info(value) {
    const { data } = await api({
      url: "/query_info",
      data: { value },
    });
    return data;
  },

  async login(value) {
    return await api({
      url: "/login",
      data: value,
    });
  },

  async register(value) {
    return await api({
      url: "/register",
      data: value,
    });
  },

  async verify_token(token) {
    return await api({
      url: "/verify_token",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  async send_mail(value) {
    return await api({
      url: "/send_mail",
      data: value,
    });
  },
  async pay(type, info) {
    let data = null
    if (type == 'pay') {
      if (!info?.price) return { 'msg': '参数错误', 'code': '40004' }
      data = await api({
        url: '/pay',
        data: { type: 'pay', info }
      })
    } else if (type == 'query') {
      if (!info?.trade) return { 'msg': '参数错误', 'code': '40004' }
      data = await api({
        url: '/pay',
        data: { type: 'query', trade: info.trade, info: info.info },
      })
    } else if (type == 'add_query') {
      if (!info?.trade) return { 'msg': '参数错误', 'code': '40004' }
      data = await api({
        url: '/pay',
        data: { type: 'add_query', trade: info.trade },
      })
    } else if (type == 'demo_query') {
      if (!info?.trade) return { 'msg': '参数错误', 'code': '40004' }
      data = await api({
        url: '/pay',
        data: { type: 'demo_query', trade: info.trade },
      })
    } else if (type == 'game_query') {
      if (!info?.trade || !info?.playerKey) return { 'msg': '参数错误', 'code': '40004' }
      data = await api({
        url: '/pay',
        data: {
          type: 'game_query',
          trade: info.trade,
          info: { playerKey: info.playerKey, nickname: info.nickname },
        },
      })
    }
    return data.data
  },
};
